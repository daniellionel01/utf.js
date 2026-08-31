// Hand-simplified version of Gleam's generated `echo` (originally copied from
// `gleam_app/build/dev/javascript/app/app.mjs`). Only the inspector branches
// for values that actually flow through this codebase are kept: numbers,
// strings, tuples (plain arrays), BitArrays and UtfCodepoints.
//
// Unlike the Gleam original there are no `file`/`line` parameters — the call
// sites here are hand-written, so hardcoded line numbers would drift.

import { BitArray as $BitArray, UtfCodepoint as $UtfCodepoint } from "./gleam.js";

export function echo(value, message) {
  const inspector = new Inspector();
  const string_value = inspector.inspect(value);
  const string_message = message === undefined ? "" : " " + message;

  if (globalThis.process?.stderr?.write) {
    globalThis.process.stderr.write(string_message + "\n" + string_value + "\n");
  } else {
    globalThis.console.log(string_message + "\n" + string_value);
  }

  return value;
}

class Inspector {
  #float(float) {
    const string = float.toString().replace("+", "");
    if (string.indexOf(".") >= 0) {
      return string;
    } else {
      const index = string.indexOf("e");
      if (index >= 0) {
        return string.slice(0, index) + ".0" + string.slice(index);
      } else {
        return string + ".0";
      }
    }
  }

  inspect(v) {
    const t = typeof v;
    if (v === true) return "True";
    if (v === false) return "False";
    if (v === null) return "//js(null)";
    if (v === undefined) return "Nil";
    if (t === "string") return this.#string(v);
    if (t === "bigint" || globalThis.Number.isInteger(v)) return v.toString();
    if (t === "number") return this.#float(v);
    if (v instanceof $UtfCodepoint) {
      return `//utfcodepoint(${globalThis.String.fromCodePoint(v.value)})`;
    }
    if (v instanceof $BitArray) return this.#bitArray(v);
    if (globalThis.Array.isArray(v)) {
      return `#(${v.map((v) => this.inspect(v)).join(", ")})`;
    }
    return this.#object(v);
  }

  #object(v) {
    const props = [];
    for (const k of globalThis.Object.keys(v)) {
      props.push(`${this.inspect(k)}: ${this.inspect(v[k])}`);
    }
    const body = props.length ? " " + props.join(", ") + " " : "";
    return `//js({${body}})`;
  }

  #string(str) {
    let new_str = '"';
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      switch (char) {
        case "\n":
          new_str += "\\n";
          break;
        case "\r":
          new_str += "\\r";
          break;
        case "\t":
          new_str += "\\t";
          break;
        case "\f":
          new_str += "\\f";
          break;
        case "\\":
          new_str += "\\\\";
          break;
        case '"':
          new_str += '\\"';
          break;
        default:
          if (char < " " || (char > "~" && char < "\u{00A0}")) {
            new_str += "\\u{" + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0") + "}";
          } else {
            new_str += char;
          }
      }
    }
    new_str += '"';
    return new_str;
  }

  #bitArray(bits) {
    if (bits.bitSize === 0) {
      return "<<>>";
    }

    let acc = "<<";

    for (let i = 0; i < bits.byteSize - 1; i++) {
      acc += bits.byteAt(i).toString();
      acc += ", ";
    }

    if (bits.byteSize * 8 === bits.bitSize) {
      acc += bits.byteAt(bits.byteSize - 1).toString();
    } else {
      const trailingBitsCount = bits.bitSize % 8;
      acc += bits.byteAt(bits.byteSize - 1) >> (8 - trailingBitsCount);
      acc += `:size(${trailingBitsCount})`;
    }

    acc += ">>";
    return acc;
  }
}
