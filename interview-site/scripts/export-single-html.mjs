import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import worker from "../dist/server/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientRoot = path.join(root, "dist", "client");
const output = path.join(root, "bitcoin-forecast-intelligence.html");

const response = await worker.fetch(new Request("https://andy-junxiong.github.io/"));
if (!response.ok) throw new Error(`Static render failed: ${response.status}`);

let html = await response.text();

const stylesheet = html.match(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*\/?>/i);
if (!stylesheet) throw new Error("Rendered page did not include a stylesheet");

const cssPath = stylesheet[1].replace(/^\.?\//, "");
const css = await readFile(path.join(clientRoot, cssPath), "utf8");
html = html.replace(stylesheet[0], `<style>\n${css}\n</style>`);

html = html
  .replace(/<link\b[^>]*\brel="(?:modulepreload|preload)"[^>]*\/?>/gi, "")
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

const mimeTypes = new Map([
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
]);

async function inlineAsset(reference) {
  if (/^(?:data:|https?:|#)/i.test(reference)) return reference;
  const relative = reference.replace(/^\.?\//, "");
  const extension = path.extname(relative).toLowerCase();
  const mime = mimeTypes.get(extension);
  if (!mime) throw new Error(`Unsupported single-file asset: ${reference}`);
  const bytes = await readFile(path.join(clientRoot, relative));
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

for (const attribute of ["src", "href"]) {
  const pattern = new RegExp(`${attribute}="([^"]+\\.(?:png|svg|jpe?g|webp))"`, "gi");
  const matches = [...html.matchAll(pattern)];
  for (const match of matches) {
    const inlined = await inlineAsset(match[1]);
    html = html.replace(match[0], `${attribute}="${inlined}"`);
  }
}

html = html
  .replace("<head>", "<head>\n  <!-- Standalone portfolio artifact: styles and images are embedded. -->")
  .replace(/>\s+</g, ">\n<");

await writeFile(output, html, "utf8");
console.log(`Exported standalone HTML to ${output}`);
