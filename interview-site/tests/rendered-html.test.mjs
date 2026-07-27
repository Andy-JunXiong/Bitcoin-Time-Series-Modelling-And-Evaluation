import assert from "node:assert/strict";
import test from "node:test";

import worker from "../dist/server/index.js";

async function render(pathname = "/") {
  return worker.fetch(new Request(`http://localhost:3000${pathname}`));
}

test("server-renders the interview portfolio", async () => {
  const response = await render();
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Bitcoin Forecast Lab/);
  assert.match(html, /Can machine learning/);
  assert.match(html, /296/);
  assert.match(html, /None of the ML models won/);
  assert.match(html, /MODEL LEADERBOARD/);
  assert.match(html, /Designed against hindsight/);
});

test("ships production metadata and assets", async () => {
  const response = await render();
  const html = await response.text();

  assert.doesNotMatch(html, /codex-preview/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /\/og\.png/);
  assert.match(html, /\/figures\/model-comparison\.png/);
  assert.match(html, /\/figures\/predictions\.png/);
});
