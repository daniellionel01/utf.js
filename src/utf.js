import { BitArray, bitArraySlice, UtfCodepoint } from "./gleam.js";

/**
 * Returns the size in bits of the UTF-8 sequence starting at `start`, or -1
 * if there is no valid UTF-8 sequence at that position.
 *
 * @param {BitArray} bitArray
 * @param {number} start
 * @returns {number}
 */
export function bitArrayUtf8SequenceSize(bitArray, start) {
  if (start < 0 || start + 8 > bitArray.bitSize) {
    return -1;
  }

  const bytes = bitArraySlice(bitArray, start);
  const leadByte = bytes.byteAt(0);

  let trailingByteCount;

  if (leadByte <= 0x7f) {
    trailingByteCount = 0;
  } else if (leadByte >= 0xc2 && leadByte <= 0xdf) {
    trailingByteCount = 1;
  } else if (leadByte >= 0xe0 && leadByte <= 0xef) {
    trailingByteCount = 2;
  } else if (leadByte >= 0xf0 && leadByte <= 0xf4) {
    trailingByteCount = 3;
  } else {
    return -1;
  }

  const bitSize = (trailingByteCount + 1) * 8;

  if (bitSize > bytes.bitSize) {
    return -1;
  }

  // Check continuation bytes
  for (let i = 1; i <= trailingByteCount; i++) {
    const byte = bytes.byteAt(i);

    if ((byte & 0xc0) !== 0x80) {
      return -1;
    }
  }

  if (trailingByteCount > 0) {
    const secondByte = bytes.byteAt(1);

    // Check for overlong encodings and invalid Unicode code points
    if (
      (leadByte === 0xe0 && secondByte < 0xa0) ||
      (leadByte === 0xed && secondByte > 0x9f) ||
      (leadByte === 0xf0 && secondByte < 0x90) ||
      (leadByte === 0xf4 && secondByte > 0x8f)
    ) {
      return -1;
    }
  }

  return bitSize;
}

/**
 * Decodes a valid UTF-8 sequence starting at `start` into a UTF codepoint.
 *
 * @param {BitArray} bitArray
 * @param {number} start
 * @param {number} size
 * @returns {UtfCodepoint}
 */
export function bitArrayUtf8Codepoint(bitArray, start, size) {
  const bytes = bitArraySlice(bitArray, start);

  const first = bytes.byteAt(0);

  if (size === 8) {
    return new UtfCodepoint(first);
  }

  const second = bytes.byteAt(1);

  if (size === 16) {
    return new UtfCodepoint(((first & 0x1f) << 6) | (second & 0x3f));
  }

  const third = bytes.byteAt(2);

  if (size === 24) {
    return new UtfCodepoint(((first & 0x0f) << 12) | ((second & 0x3f) << 6) | (third & 0x3f));
  }

  const fourth = bytes.byteAt(3);

  return new UtfCodepoint(((first & 0x07) << 18) | ((second & 0x3f) << 12) | ((third & 0x3f) << 6) | (fourth & 0x3f));
}

/**
 * Returns the size in bits of the UTF-16 sequence starting at `start`, or -1
 * if there is no valid UTF-16 sequence at that position.
 *
 * @param {BitArray} bitArray
 * @param {number} start
 * @param {boolean} isBigEndian
 * @returns {number}
 */
export function bitArrayUtf16SequenceSize(bitArray, start, isBigEndian) {
  if (start < 0 || start + 16 > bitArray.bitSize) {
    return -1;
  }

  const bytes = bitArraySlice(bitArray, start);

  const firstByte = bytes.byteAt(0);
  const secondByte = bytes.byteAt(1);

  const firstCodeUnit = isBigEndian ? (firstByte << 8) | secondByte : firstByte | (secondByte << 8);

  // A low surrogate cannot start a UTF-16 sequence
  if (firstCodeUnit >= 0xdc00 && firstCodeUnit <= 0xdfff) {
    return -1;
  }

  // A non-surrogate code unit represents one code point
  if (firstCodeUnit < 0xd800 || firstCodeUnit > 0xdbff) {
    return 16;
  }

  // A high surrogate must be followed by a low surrogate
  if (bytes.bitSize < 32) {
    return -1;
  }

  const thirdByte = bytes.byteAt(2);
  const fourthByte = bytes.byteAt(3);

  const secondCodeUnit = isBigEndian ? (thirdByte << 8) | fourthByte : thirdByte | (fourthByte << 8);

  if (secondCodeUnit < 0xdc00 || secondCodeUnit > 0xdfff) {
    return -1;
  }

  return 32;
}

/**
 * Decodes a valid UTF-16 sequence starting at `start` into a UTF codepoint.
 *
 * @param {BitArray} bitArray
 * @param {number} start
 * @param {number} size
 * @param {boolean} isBigEndian
 * @returns {UtfCodepoint}
 */
export function bitArrayUtf16Codepoint(bitArray, start, size, isBigEndian) {
  const bytes = bitArraySlice(bitArray, start);

  const firstByte = bytes.byteAt(0);
  const secondByte = bytes.byteAt(1);

  const firstCodeUnit = isBigEndian ? (firstByte << 8) | secondByte : firstByte | (secondByte << 8);

  if (size === 16) {
    return new UtfCodepoint(firstCodeUnit);
  }

  const thirdByte = bytes.byteAt(2);
  const fourthByte = bytes.byteAt(3);

  const secondCodeUnit = isBigEndian ? (thirdByte << 8) | fourthByte : thirdByte | (fourthByte << 8);

  const codepoint = 0x10000 + ((firstCodeUnit - 0xd800) << 10) + (secondCodeUnit - 0xdc00);

  return new UtfCodepoint(codepoint);
}

/**
 * Returns the size in bits of the UTF-32 sequence starting at `start`, or -1
 * if there is no valid UTF-32 sequence at that position.
 *
 * @param {BitArray} bitArray
 * @param {number} start
 * @param {boolean} isBigEndian
 * @returns {number}
 */
export function bitArrayUtf32SequenceSize(bitArray, start, isBigEndian) {
  if (start < 0 || start + 32 > bitArray.bitSize) {
    return -1;
  }

  const bytes = bitArraySlice(bitArray, start);

  const firstByte = bytes.byteAt(0);
  const secondByte = bytes.byteAt(1);
  const thirdByte = bytes.byteAt(2);
  const fourthByte = bytes.byteAt(3);

  const codepoint = isBigEndian
    ? firstByte * 0x1000000 + secondByte * 0x10000 + thirdByte * 0x100 + fourthByte
    : fourthByte * 0x1000000 + thirdByte * 0x10000 + secondByte * 0x100 + firstByte;

  if (codepoint > 0x10ffff || (codepoint >= 0xd800 && codepoint <= 0xdfff)) {
    return -1;
  }

  return 32;
}

/**
 * Decodes a valid UTF-32 sequence starting at `start` into a UTF codepoint.
 *
 * @param {BitArray} bitArray
 * @param {number} start
 * @param {boolean} isBigEndian
 * @returns {UtfCodepoint}
 */
export function bitArrayUtf32Codepoint(bitArray, start, isBigEndian) {
  const bytes = bitArraySlice(bitArray, start);

  const firstByte = bytes.byteAt(0);
  const secondByte = bytes.byteAt(1);
  const thirdByte = bytes.byteAt(2);
  const fourthByte = bytes.byteAt(3);

  const codepoint = isBigEndian
    ? firstByte * 0x1000000 + secondByte * 0x10000 + thirdByte * 0x100 + fourthByte
    : fourthByte * 0x1000000 + thirdByte * 0x10000 + secondByte * 0x100 + firstByte;

  return new UtfCodepoint(codepoint);
}
