import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import worker from "../dist/server/index.js";

const repository = "Bitcoin-Time-Series-Modelling-And-Evaluation";
const localExport = process.argv.includes("--local");
const base = localExport ? "." : `/${repository}`;
const origin = "https://andy-junxiong.github.io";
const output = new URL(localExport ? "../html-dist/" : "../pages-dist/", import.meta.url);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(new URL("../dist/client/", import.meta.url), output, { recursive: true });

const response = await worker.fetch(new Request(`${origin}/`));
if (!response.ok) throw new Error(`Static render failed: ${response.status}`);
let html = await response.text();
html = html
  .replaceAll('href="/', `href="${base}/`)
  .replaceAll('src="/', `src="${base}/`)
  .replaceAll(`${origin}/og.png`, `${origin}${base}/og.png`)
  .replaceAll("http://localhost:3000/og.png", `${origin}${base}/og.png`);
await writeFile(new URL("index.html", output), html);
await writeFile(new URL(".nojekyll", output), "");

console.log(`Exported ${localExport ? "local HTML" : "GitHub Pages"} site to ${output.pathname}`);
