import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { sizedInt, stringBits, toBitArray } from "../src/gleam.js";
import { bitArrayUtf8Size } from "../src/utf.js";

describe("bitArrayUtf8Size", () => {
  test("1 byte UTF-8 sequence", () => {
    const bitArray = toBitArray([stringBits("a")]);

    assert.equal(bitArrayUtf8Size(bitArray, 0), 8);
  });

  test("2 byte UTF-8 sequence", () => {
    const bitArray = toBitArray([stringBits("é")]);

    assert.equal(bitArrayUtf8Size(bitArray, 0), 16);
  });

  test("3 byte UTF-8 sequence", () => {
    const bitArray = toBitArray([stringBits("€")]);

    assert.equal(bitArrayUtf8Size(bitArray, 0), 24);
  });

  test("4 byte UTF-8 sequence", () => {
    const bitArray = toBitArray([stringBits("💜")]);

    assert.equal(bitArrayUtf8Size(bitArray, 0), 32);
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

  test("fails when there are not enough bits for the sequence", () => {
    // C3 is the lead byte of a 2-byte UTF-8 sequence.
    const bitArray = toBitArray([sizedInt(0xc3, 8, false)]);

    assert.equal(bitArrayUtf8Size(bitArray, 0), -1);
  });

  test("fails for a continuation byte used as a lead byte", () => {
    const bitArray = toBitArray([sizedInt(0x80, 8, false)]);

    assert.equal(bitArrayUtf8Size(bitArray, 0), -1);
  });

  test("fails for an invalid continuation byte", () => {
    const bitArray = toBitArray([sizedInt(0xc2, 8, false), sizedInt(0x20, 8, false)]);

    assert.equal(bitArrayUtf8Size(bitArray, 0), -1);
  });

  test("fails for an overlong UTF-8 encoding", () => {
    const bitArray = toBitArray([sizedInt(0xe0, 8, false), sizedInt(0x80, 8, false), sizedInt(0x80, 8, false)]);

    assert.equal(bitArrayUtf8Size(bitArray, 0), -1);
  });

  test("fails for UTF-8 encoding a surrogate code point", () => {
    // U+D800 encoded as ED A0 80.
    const bitArray = toBitArray([sizedInt(0xed, 8, false), sizedInt(0xa0, 8, false), sizedInt(0x80, 8, false)]);

    assert.equal(bitArrayUtf8Size(bitArray, 0), -1);
  });

  test("fails for a code point above U+10FFFF", () => {
    const bitArray = toBitArray([
      sizedInt(0xf4, 8, false),
      sizedInt(0x90, 8, false),
      sizedInt(0x80, 8, false),
      sizedInt(0x80, 8, false),
    ]);

    assert.equal(bitArrayUtf8Size(bitArray, 0), -1);
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
