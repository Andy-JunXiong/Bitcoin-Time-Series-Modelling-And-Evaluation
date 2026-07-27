import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import worker from "../dist/server/index.js";

async function render(pathname = "/") {
  return worker.fetch(new Request(`http://localhost:3000${pathname}`));
}

test("server-renders the governed platform case study", async () => {
  const response = await render();
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Bitcoin Forecast Intelligence/);
  assert.match(html, /3,261/);
  assert.match(html, /Candidate rejected/i);
  assert.match(html, /Cross-regime release evidence/);
  assert.match(html, /Methodology \/ control log/);
  assert.match(html, /REGIMES &gt; BASELINE/);
  assert.match(html, /ML MODELS &gt; NAIVE/);
  assert.match(html, /Bitcoin forecast benchmark report/);
  assert.match(html, /2021 bull market/);
  assert.doesNotMatch(html, /2021_BULL|2018_BEAR/);
});

test("ships production metadata and generated evidence", async () => {
  const response = await render();
  const html = await response.text();

  assert.doesNotMatch(html, /codex-preview/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /\/og\.png/);
  assert.match(html, /Not financial advice/);
  assert.doesNotMatch(html, /\bBUY\b|\bSELL\b|\bHOLD\b/);
});

test("enforces the reviewed typography and color semantics", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const remSizes = [...css.matchAll(/font-size:\s*([0-9.]+)rem/g)].map(
    (match) => Number(match[1]),
  );

  assert.ok(remSizes.length > 0);
  assert.ok(remSizes.every((size) => size >= 0.75));
  assert.match(css, /--muted:\s*#8b949e/);
  assert.match(css, /--candidate:\s*#58a6ff/);
  assert.match(css, /td\s*\{\s*font-size:\s*0\.875rem/);
  assert.match(css, /\.verdict\s*\{\s*color:\s*var\(--verdict\)/);
  assert.doesNotMatch(css, /color:\s*var\(--baseline\)/);
  assert.doesNotMatch(css, /font-size:\s*(?:[0-9]|1[01])px/);
});
