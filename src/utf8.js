import { BitArray, bitArraySlice } from "./gleam.js";

/**
 * The number of trailing bytes for each UTF-8 lead byte.
 */
const utf8TrailingBytes = new Uint8Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
  9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 9, 9, 9, 9, 9, 9, 9, 9,
]);

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

  const slice = bitArraySlice(bitArray, start);

  const leadByte = slice.byteAt(0);
  const trailingByteCount = utf8TrailingBytes[leadByte];

  if (trailingByteCount === 9) {
    return -1;
  }

  const bitSize = (trailingByteCount + 1) * 8;

  if (bitSize > slice.bitSize) {
    return -1;
  }

  for (let i = 1; i <= trailingByteCount; i++) {
    const byte = slice.byteAt(i);

    if ((byte & 0xc0) !== 0x80) {
      return -1;
    }
  }

  if (trailingByteCount > 0) {
    const secondByte = slice.byteAt(1);

    if (
      (leadByte === 0xe0 && secondByte < 0xa0) ||
      (leadByte === 0xed && secondByte > 0x9f) ||
      (leadByte === 0xf0 && secondByte < 0x90) ||
      (leadByte === 0xf4 && secondByte > 0x8f) ||
      leadByte > 0xf4
    ) {
      return -1;
    }
  }

  return bitSize;
}
/**
 * Returns the size in bits of the UTF-8 sequence starting at `start`, or -1
 * if there is no valid UTF-8 sequence at that position.
 *
 * @param {BitArray} bitArray
 * @param {number} start
 * @returns {number}
 */
export function bitArrayUtf8SequenceSizeBranches(bitArray, start) {
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
