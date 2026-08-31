import { bench, do_not_optimize, run } from "mitata";

import { sizedInt, stringBits, toBitArray } from "../src/gleam.js";
import { bitArrayUtf8Size } from "../src/utf.js";

const oneByte = toBitArray([stringBits("a")]);
const twoBytes = toBitArray([stringBits("é")]);
const threeBytes = toBitArray([stringBits("€")]);
const fourBytes = toBitArray([stringBits("💜")]);
const invalidLead = toBitArray([sizedInt(0x80, 8, false)]);

const invalidContinuation = toBitArray([sizedInt(0xc2, 8, false), sizedInt(0x20, 8, false)]);

const unaligned = toBitArray([sizedInt(5, 3, true), stringBits("💜")]);

bench("1 byte", () => {
  do_not_optimize(bitArrayUtf8Size(oneByte, 0));
});

bench("2 bytes", () => {
  do_not_optimize(bitArrayUtf8Size(twoBytes, 0));
});

bench("3 bytes", () => {
  do_not_optimize(bitArrayUtf8Size(threeBytes, 0));
});

bench("4 bytes", () => {
  do_not_optimize(bitArrayUtf8Size(fourBytes, 0));
});

bench("unaligned 4 bytes", () => {
  do_not_optimize(bitArrayUtf8Size(unaligned, 3));
});

bench("invalid lead", () => {
  do_not_optimize(bitArrayUtf8Size(invalidLead, 0));
});

bench("invalid continuation", () => {
  do_not_optimize(bitArrayUtf8Size(invalidContinuation, 0));
});

// Usage: bench/utf8.bench.js [filter-regex] [--json]
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
