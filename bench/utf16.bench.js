import { bench, do_not_optimize, run } from "mitata";

import { sizedInt, stringToUtf16, toBitArray } from "../src/gleam.js";
import { bitArrayUtf16SequenceSize } from "../src/utf.js";

const ascii = toBitArray(stringToUtf16("a", false));
const bmpBoundary = toBitArray(stringToUtf16("\u{ffff}", false));
const surrogatePair = toBitArray(stringToUtf16("💩", false));
const asciiBE = toBitArray(stringToUtf16("a", true));
const surrogatePairBE = toBitArray(stringToUtf16("💩", true));

const unaligned = toBitArray([sizedInt(5, 3, true), stringToUtf16("💩", false)]);

const invalidLowSurrogate = toBitArray(stringToUtf16(String.fromCodePoint(0xdfff), false));
const invalidDanglingHigh = toBitArray(stringToUtf16(String.fromCodePoint(0xd800), false));
const invalidHighHigh = toBitArray(stringToUtf16(String.fromCodePoint(0xd800, 0xdbff), false));

// Whole-string scans: measure every sequence from offset 0 using cumulative
// offsets, the way a bit array pattern matcher would consume the input.
function scanUtf16(bitArray, isBigEndian) {
  let offset = 0;

  while (offset < bitArray.bitSize) {
    const size = bitArrayUtf16SequenceSize(bitArray, offset, isBigEndian);
    if (size < 0) {
      break;
    }
    offset += size;
  }

  return offset;
}

// ASCII, BMP code points, surrogate pairs and multi-byte characters mixed
const mixed = "Hello, 世界! 👋 café 🇺🇳 — Привет, мир! こんにちは";
const mixedBits = toBitArray(stringToUtf16(mixed.repeat(10), false));
const asciiBits = toBitArray(stringToUtf16("abcdefghij".repeat(100), false));
const emojiBits = toBitArray(stringToUtf16("👋💩🇺🇳".repeat(50), false));

bench("1 code unit", () => {
  do_not_optimize(bitArrayUtf16SequenceSize(ascii, 0, false));
});

bench("1 code unit big endian", () => {
  do_not_optimize(bitArrayUtf16SequenceSize(asciiBE, 0, true));
});

bench("U+FFFF", () => {
  do_not_optimize(bitArrayUtf16SequenceSize(bmpBoundary, 0, false));
});

bench("surrogate pair", () => {
  do_not_optimize(bitArrayUtf16SequenceSize(surrogatePair, 0, false));
});

bench("surrogate pair big endian", () => {
  do_not_optimize(bitArrayUtf16SequenceSize(surrogatePairBE, 0, true));
});

bench("unaligned surrogate pair", () => {
  do_not_optimize(bitArrayUtf16SequenceSize(unaligned, 3, false));
});

bench("invalid low surrogate", () => {
  do_not_optimize(bitArrayUtf16SequenceSize(invalidLowSurrogate, 0, false));
});

bench("invalid dangling high surrogate", () => {
  do_not_optimize(bitArrayUtf16SequenceSize(invalidDanglingHigh, 0, false));
});

bench("invalid high high", () => {
  do_not_optimize(bitArrayUtf16SequenceSize(invalidHighHigh, 0, false));
});

bench("scan 1000 ascii code units", () => {
  do_not_optimize(scanUtf16(asciiBits, false));
});

bench("scan 1000 mixed code units", () => {
  do_not_optimize(scanUtf16(mixedBits, false));
});

bench("scan 300 emoji code units", () => {
  do_not_optimize(scanUtf16(emojiBits, false));
});

await run();
