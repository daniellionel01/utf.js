// From gleam_app/build/dev/javascript/app/app.mjs

import { BitArray as $BitArray, UtfCodepoint as $UtfCodepoint } from "./gleam.js";

export function echo(value, message, file) {
  const grey = "\u001b[90m";
  const reset_color = "\u001b[39m";
  const inspector = new Inspector();
  const string_value = inspector.inspect(value);
  const string_message = message === undefined ? "" : " " + message;
  const string_prefix = file === undefined ? "" : `${grey}${file}${reset_color}`;

  if (globalThis.process?.stderr?.write) {
    const string = `${string_prefix}${string_message}\n${string_value}\n`;
    globalThis.process.stderr.write(string);
  } else {
    globalThis.console.log(`${string_prefix}${string_message}\n${string_value}`);
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
