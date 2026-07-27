import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(siteRoot, "..");
const targets = [
  ["outputs/metrics/benchmark.json", "public/evidence/benchmark.json"],
  ["outputs/platform/platform_summary.json", "public/evidence/platform-summary.json"],
];

await mkdir(path.join(siteRoot, "public", "evidence"), { recursive: true });

for (const [sourceRelative, targetRelative] of targets) {
  const source = path.join(repositoryRoot, sourceRelative);
  const target = path.join(siteRoot, targetRelative);
  try {
    await access(source);
    await copyFile(source, target);
    console.log(`Synced ${sourceRelative}`);
  } catch {
    await access(target);
    console.log(`Using committed ${targetRelative}`);
  }
}
