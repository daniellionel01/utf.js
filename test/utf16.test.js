import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { stringToUtf16, toBitArray } from "../src/gleam.js";
import { bitArrayUtf16Size } from "../src/utf.js";

/**
 * Returns the byte representation of UTF-16 code units. Lone surrogates are
 * permitted because String.fromCodePoint accepts them.
 *
 * @param {number[]} codeUnits
 * @param {boolean} isBigEndian
 * @returns {Uint8Array}
 */
function utf16Bytes(codeUnits, isBigEndian) {
  return stringToUtf16(String.fromCodePoint(...codeUnits), isBigEndian);
}

/**
 * Asserts that the code units are measured at their full size in bits.
 *
 * @param {number[]} codeUnits
 * @param {boolean} [isBigEndian]
 */
function testValid(codeUnits, isBigEndian = false) {
  const bytes = utf16Bytes(codeUnits, isBigEndian);

  assert.equal(bitArrayUtf16Size(toBitArray(bytes), 0, isBigEndian), codeUnits.length * 16);
}

/**
 * Asserts that the code units are rejected.
 *
 * @param {number[]} codeUnits
 * @param {boolean} [isBigEndian]
 */
function testError(codeUnits, isBigEndian = false) {
  const bytes = utf16Bytes(codeUnits, isBigEndian);

  assert.equal(bitArrayUtf16Size(toBitArray(bytes), 0, isBigEndian), -1);
}

// Tests ported from
// https://github.com/ziglang/zig/blob/master/lib/std/unicode.zig
//

describe("valid utf16", () => {
  test("single code units", () => {
    testValid([0x61]); // 'a'
    testValid([0xffff]); // 0xffff
    testValid([0xd7ff]); // 0xd7ff, largest outside the surrogate range
    testValid([0xe000]); // 0xe000, smallest outside the surrogate range
  });

  test("surrogate pairs", () => {
    testValid([0xd800, 0xdc00]); // 0x10000, smallest pair
    testValid([0xdbff, 0xdfff]); // 0x10ffff, largest pair
    testValid([0xd83d, 0xdca9]); // 0x1f4a9
  });

  test("only measures the sequence at the given position", () => {
    const bitArray = toBitArray(utf16Bytes([0x61, 0xd83d, 0xdca9], false));

    assert.equal(bitArrayUtf16Size(bitArray, 0, false), 16);
    assert.equal(bitArrayUtf16Size(bitArray, 16, false), 32);
  });

  test("big endian", () => {
    testValid([0x61], true);
    testValid([0xd83d, 0xdca9], true);
  });
});

describe("invalid utf16", () => {
  test("low surrogates cannot start a sequence", () => {
    testError([0xdfff]);
    testError([0xdcdc, 0xdcdc]);
  });

  test("dangling high surrogate", () => {
    // 0xd800 with no following code unit
    testError([0xd800]);
  });

  test("high surrogate not followed by a low surrogate", () => {
    testError([0xd800, 0xe000]);
    testError([0xd800, 0xdbff]);
  });

  test("only measures the sequence at the given position", () => {
    // 0xd7ff is valid but 0xdc00 cannot start a sequence
    const bitArray = toBitArray(utf16Bytes([0xd7ff, 0xdc00], false));

    assert.equal(bitArrayUtf16Size(bitArray, 0, false), 16);
    assert.equal(bitArrayUtf16Size(bitArray, 16, false), -1);
  });

  test("big endian", () => {
    testError([0xd800], true);
    testError([0xd800, 0xdbff], true);
  });
});
