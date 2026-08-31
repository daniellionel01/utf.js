import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import os from "node:os";

// Regenerates the benchmark results section in README.md. Each bench file is
// run in its own process with --json, and the results are spliced in between
// the bench-results markers.
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

// Draws a horizontal bar per benchmark. Bar length is log-scaled within the
// section because the benchmarks span several orders of magnitude. Partial
// blocks use the Unicode eighth-block characters.
function chart(rows) {
  const barWidth = 20;
  const nameWidth = Math.max(...rows.map((row) => row.name.length));
  const avgs = rows.map((row) => row.avg);
  const logMin = Math.log(Math.min(...avgs));
  const logMax = Math.log(Math.max(...avgs));
  const partials = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉"];

  const bars = rows.map((row) => {
    const t = logMin === logMax ? 1 : (Math.log(row.avg) - logMin) / (logMax - logMin);
    const exact = t * barWidth;
    const full = Math.floor(exact);
    const partialIndex = Math.min(8, Math.round((exact - full) * 8));
    const bar = "█".repeat(full) + (partialIndex === 8 ? "█" : partials[partialIndex]);

    return row.name.padEnd(nameWidth) + "  " + bar.padEnd(barWidth) + "  " + formatNs(row.avg).padStart(9);
  });

  return ["benchmark".padEnd(nameWidth) + "  " + " ".repeat(barWidth) + "        avg", "-".repeat(nameWidth + barWidth + 13), ...bars].join("\n");
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

    return `### ${name}\n\n${table(rows)}\n\nBar length is log-scaled relative to the fastest benchmark in the section.\n\n\`\`\`\n${chart(rows)}\n\`\`\``;
  })
  .join("\n\n");

const summary =
  `Results from ${os.cpus()[0].model.trim()}, Node ${process.version}, ` +
  `${new Date().toISOString().slice(0, 10)}. Benchmark results are machine-dependent; ` +
  `regenerate them with \`mise bench-readme\`.`;

const replacement = `${startMarker}\n\n${summary}\n\n${sections}\n\n${endMarker}`;

const start = readme.indexOf(startMarker);
const end = readme.indexOf(endMarker) + endMarker.length;

writeFileSync(readmePath, readme.slice(0, start) + replacement + readme.slice(end));
console.log("README.md benchmark results updated");
