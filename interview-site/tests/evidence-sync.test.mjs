import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pairs = [
  ["../../outputs/metrics/benchmark.json", "../public/evidence/benchmark.json"],
  ["../../outputs/platform/platform_summary.json", "../public/evidence/platform-summary.json"],
];

for (const [source, siteCopy] of pairs) {
  test(`${siteCopy} matches canonical research output`, async () => {
    const canonical = JSON.parse(await readFile(new URL(source, import.meta.url), "utf8"));
    const published = JSON.parse(await readFile(new URL(siteCopy, import.meta.url), "utf8"));
    assert.deepEqual(published, canonical);
  });
}
