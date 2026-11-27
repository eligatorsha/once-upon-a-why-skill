// OUAW 01 caption check: every caption frame must sit in the middle third (y 640–1280), clear of the right UI column,
// and never overlap a face (Mika's / Claude's head, projected from the shot camera with a safety radius).
//   node episodes/ouaw-01-monday/run_check.mjs      (bundles this file with esbuild and runs it)
import { FRAMES, captionAt, faceCircles, hits, pillBox, shotAt } from "../../src/series/onceuponawhy/episodes/ouaw01/scene";
import { writeFileSync } from "fs";

const bad: string[] = [];
let n = 0;
const perCap = new Map<string, { text: string; shot: string; x: number; y: number; frames: number; faceHits: number }>();
for (let f = 0; f < FRAMES; f++) {
  const c = captionAt(f);
  if (!c) continue;
  n++;
  const { w, h } = pillBox(c.text);
  const y = Math.max(700, Math.min(1220, c.y)); // CaptionPill clamps the same way
  const top = y - h / 2;
  const bottom = y + h / 2;
  const sh = shotAt(f).id;
  const key = `${c.text}|${sh}`;
  const e = perCap.get(key) ?? { text: c.text, shot: sh, x: c.x, y, frames: 0, faceHits: 0 };
  e.frames++;
  if (top < 640 || bottom > 1280) bad.push(`f${f} ${sh} "${c.text}" outside the middle third (${top.toFixed(0)}–${bottom.toFixed(0)})`);
  if (c.x + w / 2 > (bottom > 900 ? 940 : 1000) || c.x - w / 2 < 20) bad.push(`f${f} ${sh} "${c.text}" in the right UI column / off the left edge`);
  for (const fc of faceCircles(f)) {
    if (hits(fc, c.x, y, w, h)) {
      e.faceHits++;
      bad.push(`f${f} ${sh} "${c.text}" overlaps ${fc.who}'s face`);
    }
  }
  perCap.set(key, e);
}
const report = { captionFrames: n, problems: bad.length, firstProblems: bad.slice(0, 60), captions: [...perCap.values()] };
writeFileSync("episodes/ouaw-01-monday/caption-check.json", JSON.stringify(report, null, 1));
console.log(`caption frames: ${n}, problems: ${bad.length}`);
for (const b of bad.slice(0, 40)) console.log("  " + b);
const summary = new Map<string, number>();
for (const c of perCap.values()) if (c.faceHits) summary.set(`${c.shot} "${c.text}"`, c.faceHits);
if (summary.size) console.log("captions with face overlaps:", [...summary.entries()].map(([k, v]) => `${k} (${v} f)`).join("; "));
if (process.env.PROBE) for (const f of process.env.PROBE.split(",").map(Number)) console.log("probe", f, shotAt(f).id, JSON.stringify(faceCircles(f).map((c) => ({ who: c.who, x: Math.round(c.x), y: Math.round(c.y), r: Math.round(c.r) }))), JSON.stringify(captionAt(f)));
import { endPillY } from "../../src/series/onceuponawhy/episodes/ouaw01/scene";
console.log("end pill:", JSON.stringify(endPillY()));
