// Runs on GitHub Actions (.github/workflows/aurora-thumbs.yml).
// Reads the CLIPS list straight out of aurora.html, downloads each outtake from
// its public Blob URL, and writes one poster frame per clip to
// assets/aurora/thumbs/NN-title.jpg — a representative frame from the first
// two seconds (ffmpeg's thumbnail filter), so a fade-in never yields black.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const html = readFileSync("aurora.html", "utf8");
const m = html.match(/var CLIPS = (\[[\s\S]*?\]);/);
if (!m) { console.error("CLIPS block not found in aurora.html"); process.exit(1); }
const CLIPS = new Function("return " + m[1])();
const OUT = "assets/aurora/thumbs";
mkdirSync(OUT, { recursive: true });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

let i = 0, failed = 0;
for (const c of CLIPS) {
  i++;
  if (!c.src) continue;
  const out = `${OUT}/${String(i).padStart(2, "0")}-${slug(c.title)}.jpg`;
  if (existsSync(out)) { console.log(`skip  ${out} (exists)`); continue; }
  const res = await fetch(c.src);
  if (!res.ok) { console.error(`download failed (${res.status}): ${c.src}`); failed++; continue; }
  const tmp = `/tmp/clip-${i}.mp4`;
  writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
  try {
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-t", "2", "-i", tmp,
      "-vf", "thumbnail=48,scale=640:-2", "-frames:v", "1", "-q:v", "4", out]);
    console.log(`wrote ${out}`);
  } catch (e) { console.error(`ffmpeg failed for ${c.title}: ${e.message}`); failed++; }
}
if (failed) process.exitCode = 1;
console.log(`${i - failed}/${i} thumbnails written`);
