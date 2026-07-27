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
  assert.match(html, /RESEARCH QUESTIONS/);
  assert.match(html, /EVALUATION SYSTEM/);
  assert.match(html, /0 OF 7 REGIMES WON/);
  assert.match(html, /0 \/ 4 ML MODELS BEAT PERSISTENCE/);
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
