import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { codepointToUtf32, toBitArray, UtfCodepoint } from "../src/gleam.js";
import { bitArrayUtf32SequenceSize } from "../src/utf.js";

/**
 * @param {number} codepoint
 * @param {boolean} [isBigEndian]
 */
function testValid(codepoint, isBigEndian = false) {
  const bytes = codepointToUtf32(new UtfCodepoint(codepoint), isBigEndian);

  assert.equal(bitArrayUtf32SequenceSize(toBitArray(bytes), 0, isBigEndian), 32);
}

/**
 * @param {number} codepoint
 * @param {boolean} [isBigEndian]
 */
function testError(codepoint, isBigEndian = false) {
  const bytes = [(codepoint >>> 24) & 0xff, (codepoint >>> 16) & 0xff, (codepoint >>> 8) & 0xff, codepoint & 0xff];

  if (!isBigEndian) {
    bytes.reverse();
  }

  assert.equal(bitArrayUtf32SequenceSize(toBitArray(bytes), 0, isBigEndian), -1);
}

// Zig has no UTF-32 functions, so the tests below test a few well known
// edge cases for those sequences.

describe("valid utf32", () => {
  test("code points", () => {
    // 'e'
    testValid(0x65);
    // 'ë'
    testValid(0xeb);
    // 'は'
    testValid(0x306f);
    // 0xE000
    testValid(0xe000);
    // 0x10FFFF
    testValid(0x10ffff);
  });

  test("surrogate boundaries", () => {
    // 0xD7FF is the largest code point outside the surrogate range
    testValid(0xd7ff);
    // 0xE000 is the smallest code point outside the surrogate range
    testValid(0xe000);
  });

  test("code points encoded as surrogate pairs in UTF-16", () => {
    // 0x10000, the smallest surrogate pair
    testValid(0x10000);
    // 0x10FFFF, the largest surrogate pair
    testValid(0x10ffff);
  });

  test("big endian", () => {
    testValid(0x65, true);
    testValid(0x10ffff, true);
  });
});

describe("invalid utf32", () => {
  test("surrogate halves", () => {
    // 0xD800
    testError(0xd800);
    // 0xDFFF
    testError(0xdfff);
  });

  test("code point above the maximum", () => {
    // 0x110000
    testError(0x110000);
  });

  test("big endian", () => {
    testError(0xd800, true);
    testError(0x110000, true);
  });
});
