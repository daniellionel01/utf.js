import { bench, do_not_optimize, run } from "mitata";

import { sizedInt, stringBits, toBitArray } from "../src/gleam.js";
import { bitArrayUtf8SequenceSize, bitArrayUtf8SequenceSizeBranches } from "../src/utf8.js";

const oneByte = toBitArray([stringBits("a")]);
const twoBytes = toBitArray([stringBits("é")]);
const threeBytes = toBitArray([stringBits("€")]);
const fourBytes = toBitArray([stringBits("💜")]);
const invalidLead = toBitArray([sizedInt(0x80, 8, false)]);

const invalidContinuation = toBitArray([sizedInt(0xc2, 8, false), sizedInt(0x20, 8, false)]);

const unaligned = toBitArray([sizedInt(5, 3, true), stringBits("💜")]);

bench("table / 1 byte", () => {
  do_not_optimize(bitArrayUtf8SequenceSize(oneByte, 0));
});

bench("branches / 1 byte", () => {
  do_not_optimize(bitArrayUtf8SequenceSizeBranches(oneByte, 0));
});

bench("table / 2 bytes", () => {
  do_not_optimize(bitArrayUtf8SequenceSize(twoBytes, 0));
});

bench("branches / 2 bytes", () => {
  do_not_optimize(bitArrayUtf8SequenceSizeBranches(twoBytes, 0));
});

bench("table / 3 bytes", () => {
  do_not_optimize(bitArrayUtf8SequenceSize(threeBytes, 0));
});

bench("branches / 3 bytes", () => {
  do_not_optimize(bitArrayUtf8SequenceSizeBranches(threeBytes, 0));
});

bench("table / 4 bytes", () => {
  do_not_optimize(bitArrayUtf8SequenceSize(fourBytes, 0));
});

bench("branches / 4 bytes", () => {
  do_not_optimize(bitArrayUtf8SequenceSizeBranches(fourBytes, 0));
});

bench("table / unaligned 4 bytes", () => {
  do_not_optimize(bitArrayUtf8SequenceSize(unaligned, 3));
});

bench("branches / unaligned 4 bytes", () => {
  do_not_optimize(bitArrayUtf8SequenceSizeBranches(unaligned, 3));
});

bench("table / invalid lead", () => {
  do_not_optimize(bitArrayUtf8SequenceSize(invalidLead, 0));
});

bench("branches / invalid lead", () => {
  do_not_optimize(bitArrayUtf8SequenceSizeBranches(invalidLead, 0));
});

bench("table / invalid continuation", () => {
  do_not_optimize(bitArrayUtf8SequenceSize(invalidContinuation, 0));
});

bench("branches / invalid continuation", () => {
  do_not_optimize(bitArrayUtf8SequenceSizeBranches(invalidContinuation, 0));
});

await run();
