import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { sizedInt, stringBits, toBitArray } from "../src/gleam.js";
import { bitArrayUtf8Size } from "../src/utf.js";

/**
 * Asserts that the byte sequence is measured at its full size in bits.
 *
 * @param {number[]} bytes
 */
function testValid(bytes) {
  assert.equal(bitArrayUtf8Size(toBitArray(bytes), 0), bytes.length * 8);
}

/**
 * Asserts that the byte sequence is rejected.
 *
 * @param {number[]} bytes
 */
function testError(bytes) {
  assert.equal(bitArrayUtf8Size(toBitArray(bytes), 0), -1);
}

describe("bitArrayUtf8Size", () => {
  test("1 byte UTF-8 sequence", () => {
    testValid([...stringBits("a")]);
  });

  test("2 byte UTF-8 sequence", () => {
    testValid([...stringBits("é")]);
  });

  test("3 byte UTF-8 sequence", () => {
    testValid([...stringBits("€")]);
  });

  test("4 byte UTF-8 sequence", () => {
    testValid([...stringBits("💜")]);
  });

  test("UTF-8 sequence at a non-byte-aligned offset", () => {
    const bitArray = toBitArray([sizedInt(5, 3, true), stringBits("é")]);

    assert.equal(bitArrayUtf8Size(bitArray, 3), 16);
  });

  test("multiple UTF-8 sequences can be matched using cumulative offsets", () => {
    const bitArray = toBitArray([stringBits("aé€💜")]);

    const first = bitArrayUtf8Size(bitArray, 0);
    const second = bitArrayUtf8Size(bitArray, first);
    const third = bitArrayUtf8Size(bitArray, first + second);
    const fourth = bitArrayUtf8Size(bitArray, first + second + third);

    assert.equal(first, 8);
    assert.equal(second, 16);
    assert.equal(third, 24);
    assert.equal(fourth, 32);

    assert.equal(first + second + third + fourth, bitArray.bitSize);
  });

  test("fails when start points past the end of the bit array", () => {
    const bitArray = toBitArray([stringBits("a")]);

    assert.equal(bitArrayUtf8Size(bitArray, 8), -1);
  });

  test("only measures the sequence at the given position", () => {
    const bitArray = toBitArray([stringBits("é💜")]);

    assert.equal(bitArrayUtf8Size(bitArray, 0), 16);
    assert.equal(bitArrayUtf8Size(bitArray, 16), 32);
  });
});

// Tests ported from
// https://github.com/ziglang/zig/blob/master/lib/std/unicode.zig
//

describe("valid utf8", () => {
  test("1 byte sequences", () => {
    testValid([0x00]); // 0x0
    testValid([0x20]); // 0x20
    testValid([0x7f]); // 0x7f
  });

  test("2 byte sequences", () => {
    testValid([0xc2, 0x80]); // 0x80
    testValid([0xdf, 0xbf]); // 0x7ff
  });

  test("3 byte sequences", () => {
    testValid([0xe0, 0xa0, 0x80]); // 0x800
    testValid([0xe1, 0x80, 0x80]); // 0x1000
    testValid([0xef, 0xbf, 0xbf]); // 0xffff
  });

  test("4 byte sequences", () => {
    testValid([0xf0, 0x90, 0x80, 0x80]); // 0x10000
    testValid([0xf1, 0x80, 0x80, 0x80]); // 0x40000
    testValid([0xf3, 0xbf, 0xbf, 0xbf]); // 0xfffff
    testValid([0xf4, 0x8f, 0xbf, 0xbf]); // 0x10ffff
  });
});

describe("invalid utf8 continuation bytes", () => {
  test("unexpected continuation", () => {
    testError([0x80]);
    testError([0xbf]);
  });

  test("too many leading 1's", () => {
    testError([0xf8]);
    testError([0xff]);
  });

  test("expected continuation for 2 byte sequences", () => {
    testError([0xc2]);
    testError([0xc2, 0x00]);
    testError([0xc2, 0xc0]);
  });

  test("expected continuation for 3 byte sequences", () => {
    testError([0xe0]);
    testError([0xe0, 0x00]);
    testError([0xe0, 0xc0]);
    testError([0xe0, 0xa0]);
    testError([0xe0, 0xa0, 0x00]);
    testError([0xe0, 0xa0, 0xc0]);
  });

  test("expected continuation for 4 byte sequences", () => {
    testError([0xf0]);
    testError([0xf0, 0x00]);
    testError([0xf0, 0xc0]);
    testError([0xf0, 0x90, 0x00]);
    testError([0xf0, 0x90, 0xc0]);
    testError([0xf0, 0x90, 0x80, 0x00]);
    testError([0xf0, 0x90, 0x80, 0xc0]);
  });
});

describe("overlong utf8 codepoint", () => {
  test("overlong sequences", () => {
    testError([0xc0, 0x80]);
    testError([0xc1, 0xbf]);
    testError([0xe0, 0x80, 0x80]);
    testError([0xe0, 0x9f, 0xbf]);
    testError([0xf0, 0x80, 0x80, 0x80]);
    testError([0xf0, 0x8f, 0xbf, 0xbf]);
  });
});

describe("misc invalid utf8", () => {
  test("codepoint out of bounds", () => {
    testError([0xf4, 0x90, 0x80, 0x80]);
    testError([0xf7, 0xbf, 0xbf, 0xbf]);
  });

  test("surrogate halves", () => {
    testValid([0xed, 0x9f, 0xbf]); // 0xd7ff
    testError([0xed, 0xa0, 0x80]);
    testError([0xed, 0xbf, 0xbf]);
    testValid([0xee, 0x80, 0x80]); // 0xe000
  });
});
