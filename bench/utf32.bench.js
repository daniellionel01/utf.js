import { bench, do_not_optimize, run } from "mitata";

import { codepointToUtf32, sizedInt, stringToUtf32, toBitArray, UtfCodepoint } from "../src/gleam.js";
import { bitArrayUtf32Size } from "../src/utf.js";

const ascii = toBitArray(codepointToUtf32(new UtfCodepoint(0x61), false));
const maxCodepoint = toBitArray(codepointToUtf32(new UtfCodepoint(0x10ffff), false));
const asciiBE = toBitArray(codepointToUtf32(new UtfCodepoint(0x61), true));
const maxCodepointBE = toBitArray(codepointToUtf32(new UtfCodepoint(0x10ffff), true));

const unaligned = toBitArray([sizedInt(5, 3, true), codepointToUtf32(new UtfCodepoint(0x10ffff), false)]);

const invalidSurrogate = toBitArray(codepointToUtf32(new UtfCodepoint(0xd800), false));

// codepointToUtf32 cannot build this because String.fromCodePoint throws
// for code points above U+10FFFF.
const invalidAboveMax = toBitArray(new Uint8Array([0x00, 0x10, 0x00, 0x00])); // 0x110000

function scanUtf32(bitArray, isBigEndian) {
  let offset = 0;

  while (offset < bitArray.bitSize) {
    const size = bitArrayUtf32Size(bitArray, offset, isBigEndian);
    if (size < 0) {
      break;
    }
    offset += size;
  }

  return offset;
}

// ASCII, BMP code points and surrogate-pair code points mixed
const mixed = "Hello, 世界! 👋 café 🇺🇳 — Привет, мир! こんにちは";
const mixedBits = toBitArray(stringToUtf32(mixed.repeat(10), false));
const asciiBits = toBitArray(stringToUtf32("abcdefghij".repeat(100), false));
const emojiBits = toBitArray(stringToUtf32("👋💩🇺🇳".repeat(50), false));

bench("ascii", () => {
  do_not_optimize(bitArrayUtf32Size(ascii, 0, false));
});

bench("ascii big endian", () => {
  do_not_optimize(bitArrayUtf32Size(asciiBE, 0, true));
});

bench("U+10FFFF", () => {
  do_not_optimize(bitArrayUtf32Size(maxCodepoint, 0, false));
});

bench("U+10FFFF big endian", () => {
  do_not_optimize(bitArrayUtf32Size(maxCodepointBE, 0, true));
});

bench("unaligned", () => {
  do_not_optimize(bitArrayUtf32Size(unaligned, 3, false));
});

bench("invalid surrogate", () => {
  do_not_optimize(bitArrayUtf32Size(invalidSurrogate, 0, false));
});

bench("invalid above max", () => {
  do_not_optimize(bitArrayUtf32Size(invalidAboveMax, 0, false));
});

bench("scan 1000 ascii code points", () => {
  do_not_optimize(scanUtf32(asciiBits, false));
});

bench("scan 1000 mixed code points", () => {
  do_not_optimize(scanUtf32(mixedBits, false));
});

bench("scan 300 emoji code points", () => {
  do_not_optimize(scanUtf32(emojiBits, false));
});

// Usage: bench/utf32.bench.js [filter-regex] [--json]
const args = process.argv.slice(2);
const options = {};

if (args.includes("--json")) {
  options.format = "json";
}

const filter = args.find((arg) => !arg.startsWith("--"));

if (filter) {
  options.filter = new RegExp(filter);
}

await run(options);
