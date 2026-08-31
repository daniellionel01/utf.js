import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import os from "node:os";

const benchFiles = ["utf8", "utf16", "utf32"];

function formatNs(ns) {
  if (ns >= 1e6) {
    return (ns / 1e6).toFixed(2) + " ms";
  } else if (ns >= 1e3) {
    return (ns / 1e3).toFixed(2) + " µs";
  } else {
    return ns.toFixed(2) + " ns";
  }
}

function runBench(name) {
  const out = execSync(`node --expose-gc bench/${name}.bench.js --json`, {
    encoding: "utf8",
    maxBuffer: 1 << 26,
  });

  return JSON.parse(out).benchmarks.map((benchmark) => {
    const { avg, min, max } = benchmark.runs[benchmark.runs.length - 1].stats;

    return { name: benchmark.alias, avg, min, max };
  });
}

function table(rows) {
  return [
    "| benchmark | avg | min | max |",
    "| --- | --- | --- | --- |",
    ...rows.map((row) => `| ${row.name} | ${formatNs(row.avg)} | ${formatNs(row.min)} | ${formatNs(row.max)} |`),
  ].join("\n");
}

const readmePath = new URL("../README.md", import.meta.url);
const readme = readFileSync(readmePath, "utf8");

const startMarker = "<!-- bench-results:start -->";
const endMarker = "<!-- bench-results:end -->";

if (!readme.includes(startMarker) || !readme.includes(endMarker)) {
  console.error(`README.md is missing the ${startMarker} / ${endMarker} markers`);
  process.exit(1);
}

const sections = benchFiles
  .map((name) => {
    const rows = runBench(name);

    return `### ${name}\n\n${table(rows)}`;
  })
  .join("\n\n");

const summary =
  `Results from ${os.cpus()[0].model.trim()}, Node ${process.version}, ` + `${new Date().toISOString().slice(0, 10)}.`;

const replacement = `${startMarker}\n\n${summary}\n\n${sections}\n\n${endMarker}`;

const start = readme.indexOf(startMarker);
const end = readme.indexOf(endMarker) + endMarker.length;

writeFileSync(readmePath, readme.slice(0, start) + replacement + readme.slice(end));
console.log("README.md benchmark results updated");
