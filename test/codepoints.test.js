import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { sizedInt, toBitArray } from "../src/gleam.js";

import {
  bitArrayUtf8Codepoint,
  bitArrayUtf16Codepoint,
  bitArrayUtf32Codepoint,
} from "../src/utf.js";

function bitArrayFromBytes(bytes) {
  return toBitArray(bytes.map((byte) => sizedInt(byte, 8, false)));
}

describe("bitArrayUtf8Codepoint", () => {
  test("decodes a single-byte codepoint", () => {
    // U+0061 "a"
    const bitArray = bitArrayFromBytes([0x61]);

    const codepoint = bitArrayUtf8Codepoint(bitArray, 0, 8);

    assert.equal(codepoint.value, 0x61);
  });

  test("decodes a two-byte codepoint", () => {
    // U+00E9 "é"
    const bitArray = bitArrayFromBytes([0xc3, 0xa9]);

    const codepoint = bitArrayUtf8Codepoint(bitArray, 0, 16);

    assert.equal(codepoint.value, 0xe9);
  });

  test("decodes a three-byte codepoint", () => {
    // U+20AC "€"
    const bitArray = bitArrayFromBytes([0xe2, 0x82, 0xac]);

    const codepoint = bitArrayUtf8Codepoint(bitArray, 0, 24);

    assert.equal(codepoint.value, 0x20ac);
  });

  test("decodes a four-byte codepoint", () => {
    // U+1F49C "💜"
    const bitArray = bitArrayFromBytes([0xf0, 0x9f, 0x92, 0x9c]);

    const codepoint = bitArrayUtf8Codepoint(bitArray, 0, 32);

    assert.equal(codepoint.value, 0x1f49c);
  });

  test("decodes U+10FFFF", () => {
    const bitArray = bitArrayFromBytes([0xf4, 0x8f, 0xbf, 0xbf]);

    const codepoint = bitArrayUtf8Codepoint(bitArray, 0, 32);

    assert.equal(codepoint.value, 0x10ffff);
  });

  test("decodes at an unaligned bit offset", () => {
    const bitArray = toBitArray([
      sizedInt(5, 3, true),

      // U+1F49C "💜"
      sizedInt(0xf0, 8, false),
      sizedInt(0x9f, 8, false),
      sizedInt(0x92, 8, false),
      sizedInt(0x9c, 8, false),
    ]);

    const codepoint = bitArrayUtf8Codepoint(bitArray, 3, 32);

    assert.equal(codepoint.value, 0x1f49c);
  });
});

describe("bitArrayUtf16Codepoint", () => {
  test("decodes a BMP codepoint in big-endian UTF-16", () => {
    // U+0061 "a"
    const bitArray = bitArrayFromBytes([0x00, 0x61]);

    const codepoint = bitArrayUtf16Codepoint(bitArray, 0, 16, true);

    assert.equal(codepoint.value, 0x61);
  });

  test("decodes a BMP codepoint in little-endian UTF-16", () => {
    // U+0061 "a"
    const bitArray = bitArrayFromBytes([0x61, 0x00]);

    const codepoint = bitArrayUtf16Codepoint(bitArray, 0, 16, false);

    assert.equal(codepoint.value, 0x61);
  });

  test("decodes a surrogate pair in big-endian UTF-16", () => {
    // U+1F49C "💜"
    // D83D DC9C
    const bitArray = bitArrayFromBytes([0xd8, 0x3d, 0xdc, 0x9c]);

    const codepoint = bitArrayUtf16Codepoint(bitArray, 0, 32, true);

    assert.equal(codepoint.value, 0x1f49c);
  });

  test("decodes a surrogate pair in little-endian UTF-16", () => {
    // U+1F49C "💜"
    // D83D DC9C
    const bitArray = bitArrayFromBytes([0x3d, 0xd8, 0x9c, 0xdc]);

    const codepoint = bitArrayUtf16Codepoint(bitArray, 0, 32, false);

    assert.equal(codepoint.value, 0x1f49c);
  });

  test("decodes U+10FFFF", () => {
    // Highest Unicode scalar value:
    // DBFF DFFF
    const bitArray = bitArrayFromBytes([0xdb, 0xff, 0xdf, 0xff]);

    const codepoint = bitArrayUtf16Codepoint(bitArray, 0, 32, true);

    assert.equal(codepoint.value, 0x10ffff);
  });

  test("decodes at an unaligned bit offset", () => {
    const bitArray = toBitArray([
      sizedInt(5, 3, true),

      // U+1F49C "💜", UTF-16BE
      sizedInt(0xd8, 8, false),
      sizedInt(0x3d, 8, false),
      sizedInt(0xdc, 8, false),
      sizedInt(0x9c, 8, false),
    ]);

    const codepoint = bitArrayUtf16Codepoint(bitArray, 3, 32, true);

    assert.equal(codepoint.value, 0x1f49c);
  });
});

describe("bitArrayUtf32Codepoint", () => {
  test("decodes a codepoint in big-endian UTF-32", () => {
    // U+0061 "a"
    const bitArray = bitArrayFromBytes([0x00, 0x00, 0x00, 0x61]);

    const codepoint = bitArrayUtf32Codepoint(bitArray, 0, true);

    assert.equal(codepoint.value, 0x61);
  });

  test("decodes a codepoint in little-endian UTF-32", () => {
    // U+0061 "a"
    const bitArray = bitArrayFromBytes([0x61, 0x00, 0x00, 0x00]);

    const codepoint = bitArrayUtf32Codepoint(bitArray, 0, false);

    assert.equal(codepoint.value, 0x61);
  });

  test("decodes a supplementary codepoint in big-endian UTF-32", () => {
    // U+1F49C "💜"
    const bitArray = bitArrayFromBytes([0x00, 0x01, 0xf4, 0x9c]);

    const codepoint = bitArrayUtf32Codepoint(bitArray, 0, true);

    assert.equal(codepoint.value, 0x1f49c);
  });

  test("decodes a supplementary codepoint in little-endian UTF-32", () => {
    // U+1F49C "💜"
    const bitArray = bitArrayFromBytes([0x9c, 0xf4, 0x01, 0x00]);

    const codepoint = bitArrayUtf32Codepoint(bitArray, 0, false);

    assert.equal(codepoint.value, 0x1f49c);
  });

  test("decodes U+10FFFF", () => {
    const bitArray = bitArrayFromBytes([0x00, 0x10, 0xff, 0xff]);

    const codepoint = bitArrayUtf32Codepoint(bitArray, 0, true);

    assert.equal(codepoint.value, 0x10ffff);
  });

  test("decodes at an unaligned bit offset", () => {
    const bitArray = toBitArray([
      sizedInt(5, 3, true),

      // U+1F49C "💜", UTF-32BE
      sizedInt(0x00, 8, false),
      sizedInt(0x01, 8, false),
      sizedInt(0xf4, 8, false),
      sizedInt(0x9c, 8, false),
    ]);

    const codepoint = bitArrayUtf32Codepoint(bitArray, 3, true);

    assert.equal(codepoint.value, 0x1f49c);
  });
});
