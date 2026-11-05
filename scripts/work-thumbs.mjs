// Runs on GitHub Actions (.github/workflows/work-thumbs.yml).
// Reads the work list out of assets/site/work.js and writes a poster frame for
// every motion piece that has none, to assets/work/<id>.jpg — a representative
// frame from the first four seconds, so a fade-in never yields black.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const src = readFileSync("assets/site/work.js", "utf8");
const m = src.match(/var WORK = (\[[\s\S]*?\n  \]);/);
if (!m) { console.error("WORK block not found"); process.exit(1); }
const B = 'https://ogpmpr3qmyfpwkqr.public.blob.vercel-storage.com/';
const KUZ = B + 'Aurora%20V1%20-%20KUZ/';
const WORK = new Function("B", "KUZ", "return " + m[1])(B, KUZ);
const OUT = "assets/work";
mkdirSync(OUT, { recursive: true });

let n = 0, failed = 0;
for (const p of WORK) {
  if (!p.video || p.poster) continue;
  n++;
  const out = `${OUT}/${p.id}.jpg`;
  if (existsSync(out)) { console.log(`skip  ${out} (exists)`); continue; }
  const res = await fetch(p.video);
  if (!res.ok) { console.error(`download failed (${res.status}): ${p.video}`); failed++; continue; }
  const tmp = `/tmp/${p.id}.mp4`;
  writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
  try {
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-t", "4", "-i", tmp,
      "-vf", "thumbnail=96,scale='min(1600,iw)':-2", "-frames:v", "1", "-q:v", "3", out]);
    console.log(`wrote ${out}`);
  } catch (e) { console.error(`ffmpeg failed for ${p.id}: ${e.message}`); failed++; }
}
if (failed) process.exitCode = 1;
console.log(`${n - failed}/${n} posters written`);
