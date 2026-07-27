import assert from "node:assert/strict";
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
  assert.match(html, /CROSS-REGIME RELEASE EVIDENCE/);
  assert.match(html, /METHODOLOGY \/ CONTROL LOG/);
  assert.match(html, /REGIMES &gt; BASELINE/);
  assert.match(html, /ML MODELS &gt; NAIVE/);
});

test("ships production metadata and generated evidence", async () => {
  const response = await render();
  const html = await response.text();

  assert.doesNotMatch(html, /codex-preview/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /\/og\.png/);
  assert.match(html, /NOT FINANCIAL ADVICE/);
  assert.doesNotMatch(html, /\bBUY\b|\bSELL\b|\bHOLD\b/);
});
