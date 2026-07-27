import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const artifact = new URL("../bitcoin-forecast-intelligence.html", import.meta.url);

test("standalone showcase embeds its presentation assets", async () => {
  const html = await readFile(artifact, "utf8");

  assert.match(html, /<!doctype html>/i);
  assert.match(html, /Bitcoin Forecast Intelligence/);
  assert.match(html, /Candidate rejected/i);
  assert.match(html, /<style>/);
  assert.match(html, /data:image\/svg\+xml;base64,/);
  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /(?:src|href)="\.?\//i);
  assert.doesNotMatch(html, /modulepreload|data-rsc-css-href/i);
});
