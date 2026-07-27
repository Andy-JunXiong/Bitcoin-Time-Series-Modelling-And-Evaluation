import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import worker from "../dist/server/index.js";

const repository = "Bitcoin-Time-Series-Modelling-And-Evaluation";
const base = `/${repository}`;
const origin = "https://andy-junxiong.github.io";
const output = new URL("../pages-dist/", import.meta.url);

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

console.log(`Exported GitHub Pages site to ${output.pathname}`);
