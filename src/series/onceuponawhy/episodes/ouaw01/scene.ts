// OUAW 01 "Why am I so tired on Mondays?" — pure scene logic (no rendering): shots, cameras, performances, captions.
// Shared by the composition (OUAW01Monday.tsx) and the caption/face check (episodes/ouaw-01-monday/check_captions.ts).
// Times are in seconds (s = frame / 30), anchored to timeline.ts (generated from the approved voice).
import { Cam, camLerp, project } from "../../look/Stage";
import { clamp01, lerp, prog, springy, V3 } from "../../look/mat";
import { Expr, Face } from "../../cast/face";
import type { CFace } from "../../cast/Claude";
import { MIKA_POSES, MIKA_TABLE_NAP, STRAP_R } from "../../cast/poses";
import { Pose, breathe, mixPose, pose, runPose } from "../../cast/rig";
import { TL } from "./timeline";

export const FPS = 30;
export const FRAMES = TL.frames;

// ---------- shots (frames, from the approved shot list) ----------
export type ShotId = "1" | "2" | "3" | "4a" | "4b" | "5a" | "5b" | "6" | "7" | "8a" | "8b" | "8c" | "9" | "card1" | "10" | "card2" | "11";
export const SHOTS: { id: ShotId; a: number; b: number; set: "carriage" | "cafe" | "card" }[] = [
  { id: "1", a: 0, b: 159, set: "carriage" },
  { id: "2", a: 159, b: 220, set: "carriage" },
  { id: "3", a: 220, b: 292, set: "carriage" },
  { id: "4a", a: 292, b: 349, set: "carriage" },
  { id: "4b", a: 349, b: 415, set: "carriage" },
  { id: "5a", a: 415, b: 546, set: "carriage" },
  { id: "5b", a: 546, b: 628, set: "carriage" },
  { id: "6", a: 628, b: 784, set: "carriage" },
  { id: "7", a: 784, b: 846, set: "carriage" },
  { id: "8a", a: 846, b: 886, set: "carriage" },
  { id: "8b", a: 886, b: 957, set: "carriage" },
  { id: "8c", a: 957, b: 1036, set: "carriage" },
  { id: "9", a: 1036, b: 1119, set: "carriage" },
  { id: "card1", a: 1119, b: 1140, set: "card" },
  { id: "10", a: 1140, b: 1194, set: "cafe" },
  { id: "card2", a: 1194, b: 1215, set: "card" },
  { id: "11", a: 1215, b: 1380, set: "cafe" },
];
/** when Mika says "SO" in her first line (the head-throw beat is anchored to it) */
const SO_T = (() => {
  const L = TL.lines.find((l) => l.id === "m1")!;
  return L.words.find((w) => w.w.toLowerCase().startsWith("so"))!.s;
})();
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** the soft freeze at the end (frame 1320 = 44.0 s) */
export const FREEZE = 1320;

// ---------- world layout ----------
/** Mika in the carriage: turned slightly away (yaw -0.3) so the tote on her left side faces the camera (bible §14) */
export const M_POS: V3 = [-0.14, 0, 0.3];
export const M_YAW = -0.3;
const rotY = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** approximate world points (for framing and the caption check) */
export const MIKA_HEAD: V3 = add(M_POS, [0, 1.2, 0]);
export const CLAUDE_LIFT = 0.1;
export const CLAUDE_FACE: V3 = add(M_POS, rotY([0.39, 0.7 + CLAUDE_LIFT, -0.06], M_YAW));
/** holograms float to Mika's left (screen right of her), at chest-to-head height */
export const HOLO_CLOCK: V3 = [0.4, 1.3, 0.62];
/** the alarm pops in above, between her head and the clock, inside the safe column */
export const ALARM_POS: V3 = [0.12, 1.66, 0.7];
export const HOLO_MAP: V3 = [0.02, 1.74, 0.85];

// café (Saturday)
export const CAFE_RUN_FROM: V3 = [-2.05, 0, 0.15];
export const CAFE_MARK: V3 = [-0.75, 0, 0.25];
export const NAP_POS: V3 = [0.42, 0, -1.48];
export const TABLE_Y = 0.735;
export const LATTE_POS: V3 = [0.8, TABLE_Y, -1.2];
export const CLAUDE_TABLE: V3 = [1.0, TABLE_Y, -0.95];

// ---------- cameras per shot ----------
const C = (pos: V3, target: V3, fov = 34, roll = 0): Cam => ({ pos, target, fov, roll });
export const camAt = (f: number): Cam => {
  const sh = shotAt(f);
  const k = (a: Cam, b: Cam) => camLerp(a, b, prog(f, sh.a, sh.b));
  const H = MIKA_HEAD;
  const CF = CLAUDE_FACE;
  // framing rule (from the caption check): Mika's face high, Claude's face mid-frame, the caption below both
  const TWO = (z: number, x = 0.2): Cam => C([x, 0.86, z], [0.05, 0.79, 0.3], 34);
  const BOARD = (z: number, x = 0.1): Cam => C([x, 1.0, z], [0.0, 0.95, 0.3], 37);
  switch (sh.id) {
    case "1": // CU on her face → a bit wider (the strap arm, the top of the tote)
      return k(C([H[0] + 0.12, 1.05, H[2] + 2.35], [H[0] + 0.03, 1.0, H[2]], 33), C([H[0] + 0.2, 1.02, H[2] + 3.0], [H[0] + 0.1, 0.99, H[2]], 33));
    case "2":
      return k(TWO(3.25), TWO(3.1));
    case "3":
      return k(TWO(3.1, 0.24), TWO(2.95, 0.24));
    case "4a": // wider, from a touch to the left, the board up top
      return k(BOARD(4.95, -0.12), BOARD(4.8, -0.1));
    case "4b": // the board high, Mika's whole head low in the foreground, the caption between them
      return k(C([0.1, 1.6, 4.6], [-0.05, 1.36, -1.7], 31), C([0.1, 1.6, 4.4], [-0.05, 1.36, -1.7], 31));
    case "5a":
      return k(C([0.32, 0.86, 4.25], [0.15, 0.79, 0.3], 36), C([0.3, 0.86, 4.1], [0.15, 0.79, 0.3], 36));
    case "5b":
      return k(C([0.3, 0.86, 4.1], [0.15, 0.8, 0.3], 36), C([0.28, 0.86, 3.95], [0.15, 0.8, 0.3], 36));
    case "6": // medium-wide: the map floats up in front of them
      return k(C([0.1, 0.98, 4.55], [0.02, 0.91, 0.3], 37), C([0.1, 0.98, 4.4], [0.02, 0.91, 0.3], 37));
    case "7":
      return k(TWO(3.0, 0.28), TWO(2.85, 0.28));
    case "8a": // close on Claude in the tote; Mika's head kept out of the corner
      return k(C([CF[0] + 0.04, CF[1] + 0.0, CF[2] + 1.45], [CF[0] + 0.01, CF[1] - 0.085, CF[2]], 29), C([CF[0] + 0.04, CF[1] + 0.0, CF[2] + 1.35], [CF[0] + 0.01, CF[1] - 0.085, CF[2]], 29));
    case "8b":
      return k(BOARD(4.9), BOARD(4.75));
    case "8c":
      return k(BOARD(4.75), BOARD(4.6));
    case "9": // low angle, heroic
      return k(C([0.3, 0.55, 4.6], [0.0, 0.9, 0.3], 37), C([0.28, 0.56, 4.4], [0.0, 0.9, 0.3], 37));
    case "10": // café, from the right, looking at the street door
      return k(C([0.78, 1.2, 2.9], [-0.95, 0.96, 0.1], 36), C([0.74, 1.18, 2.7], [-0.82, 0.96, 0.15], 36));
    case "11": {
      // the booth table; soft push-in that settles on the freeze
      const ff = Math.min(f, FREEZE + 12);
      return camLerp(C([0.68, 1.36, 2.4], [0.64, 0.64, -1.05], 34), C([0.68, 1.34, 2.22], [0.64, 0.65, -1.05], 34), prog(ff, sh.a, FREEZE + 12));
    }
    default:
      return C([0, 1.3, 4], [0, 1.2, 0]);
  }
};

// ---------- talking (mouth flaps from the word timings) ----------
type Who = "mika" | "claude";
/** 0..1 mouth openness for a speaker at time s (syllable flap inside each word) */
export const talk = (who: Who, s: number) => {
  for (const L of TL.lines) {
    if (L.who !== who || s < L.start - 0.05 || s > L.start + L.dur + 0.1) continue;
    for (const w of L.words) {
      if (s >= w.s - 0.02 && s <= w.e) {
        const u = (s - w.s) / Math.max(0.08, w.e - w.s);
        const syl = Math.max(1, Math.round((w.e - w.s) / 0.18));
        return 0.35 + 0.65 * Math.abs(Math.sin(Math.PI * u * syl));
      }
    }
  }
  return 0;
};
const talkMouth = (k: number, wide = false, whine = false): Face["mouth"] =>
  whine ? { kind: "open", w: 0.22, h: 0.03 + 0.1 * k, shape: "wide", teeth: true } : { kind: "open", w: wide ? 0.24 : 0.18, h: 0.04 + 0.13 * k, shape: "D", tongue: k > 0.6 };

// ---------- carriage: Mika ----------
export type MikaState = { p: Pose; expr: Expr; over?: Partial<Face>; bounce: number; messy: boolean; handL?: "thumb" | "fist" | null; handR?: "thumb" | "fist" | null };
const strap = (p: Pose): Pose => ({ ...p, armR: { ...STRAP_R, sz: STRAP_R.sz + Math.sin(p.bob * 50) * 0.01 } });
/** her left arm held out a little so the tote and Claude stay clear (bible §14) */
const ARM_CLEAR = { sx: -0.5, sz: 0.8, el: 0.55, ez: 0 };

export const mikaCarriage = (s: number, t: number): MikaState => {
  let p: Pose;
  let expr: Expr = "sleepy";
  let over: Partial<Face> | undefined;
  const sleepyBrows = { browL: { y: 0.0, rot: 0.32 }, browR: { y: 0.0, rot: 0.32 } };
  if (s < 0.62) {
    // dozing: two slow blinks, the head sinks
    const sink = prog(s * 30, 3, 18);
    p = pose({ lean: 0.1 + sink * 0.1, head: [0.15 + sink * 0.42, 0.05, 0.25 + sink * 0.12], side: 0.06, armL: { sx: 0, sz: 0.06, el: 0.1 } }, MIKA_POSES.sleepy);
    const shut = s < 0.12 || (s > 0.3 && s < 0.4) || s > 0.45;
    over = { eyes: shut ? "closed" : "half", ...sleepyBrows };
  } else if (s < 0.82) {
    // JERK awake: head snaps up, eyes wide for a moment
    const j = prog(s * 30, 18.6, 21);
    p = pose({ lean: lerp(0.2, -0.06, j), head: [lerp(0.57, -0.16, j), 0, lerp(0.37, 0.0, j)], armL: { sx: 0.3, sz: 0.5, el: 0.6 }, squash: lerp(0.97, 1.05, j) });
    expr = "shocked";
  } else if (s < SO_T - 0.06) {
    // whiny, wrecked, building frustration
    const w = clamp01((s - 0.82) / (SO_T - 0.9));
    p = pose({ lean: 0.08, head: [0.08 + Math.sin(s * 2.1) * 0.04, 0.06, 0.15 - w * 0.08], side: 0.04, armL: { sx: 0.2 + w * 0.4, sz: 0.4 + w * 0.3, el: 0.7 + w * 0.5 } });
    over = { eyes: "half", eyeScale: 0.95, browL: { y: 0.02, rot: 0.25 + w * 0.15 }, browR: { y: 0.02, rot: 0.25 + w * 0.15 } };
  } else if (s < 5.25) {
    // "SO TIRED?": head thrown back, eyes shut
    const b = prog(s * 30, SO_T * 30 - 2, SO_T * 30 + 5);
    p = pose({ lean: -0.08 * b, head: [lerp(0.08, -0.32, b), 0.05, 0.1], armL: { sx: 0.5, sz: 0.9, el: 0.9 } });
    over = { eyes: "half", eyeScale: 0.8, look: [0, 0.06], browL: { y: 0.04, rot: 0.5 }, browR: { y: 0.04, rot: 0.5 }, sweat: 1 };
    expr = "sad";
  } else if (s < 7.35) {
    // (between her line and the pop: still slumped from "SO TIRED") → confused squint down at the tote (Claude pops out)
    const turn = prog(s * 30, 156, 166);
    p = pose({ lean: 0.06, head: [0.2 * turn, 0.42 * turn, 0.12 * turn], armL: ARM_CLEAR });
    expr = "thinking";
    over = { eyes: "half", eyeScale: 1.0, browL: { y: -0.04, rot: -0.2 }, browR: { y: 0.12, rot: 0.08 }, look: [0.06, -0.08] };
  } else if (s < 9.75) {
    // offended + sleepy; on "bed" she flops her cheek onto her strap arm
    const flop = prog(s * 30, 276, 285);
    p = pose({ lean: 0.05 + flop * 0.05, head: [0.05 + flop * 0.12, -0.05 - flop * 0.2, lerp(-0.05, -0.42, flop)], armL: ARM_CLEAR, side: -0.04 * flop });
    over = { eyes: "half", browL: { y: -0.03, rot: -0.12 }, browR: { y: -0.03, rot: -0.12 }, mouth: { kind: "line", w: 0.12, curve: -0.04 } };
  } else if (s < 13.0) {
    // sleepy-sceptical, one eye opening a bit more on the reveal
    p = pose({ lean: 0.06, head: [0.08, 0.15, -0.08], armL: ARM_CLEAR });
    over = { eyes: "half", eyeScale: s > 11.8 ? 1.05 : 0.95, ...sleepyBrows };
  } else if (s < 13.9) {
    // SOCIAL JETLAG: eyes wide for a second
    const k2 = prog(s * 30, 390, 395);
    p = pose({ lean: -0.04 * k2, head: [-0.1 * k2, 0.1, 0], armL: ARM_CLEAR, squash: 1 + 0.03 * k2 });
    expr = "shocked";
  } else if (s < 19.05) {
    // sleepy, nodding along to the clock, head following its hands
    const nod = Math.sin((s - 13.9) * 2.4) * 0.06;
    p = pose({ lean: 0.08, head: [0.12 + nod, 0.3, 0.1 + Math.sin((s - 13.9) * 0.9) * 0.08], armL: ARM_CLEAR });
    over = { eyes: "half", look: [0.07, 0.03], ...sleepyBrows };
  } else if (s < 20.1) {
    // the alarm: FLINCH (jump, shoulders up, eyes wide)
    const j = springy((s - 19.05) * 30, 0.45, 0.18);
    p = pose({ lean: -0.08, head: [-0.12, 0.2, 0], armL: { sx: 0.6, sz: 1.2, el: 1.1 }, squash: 1 + 0.06 * Math.sin(Math.min(1, j) * Math.PI), bob: 0.04 * Math.sin(clamp01((s - 19.05) / 0.35) * Math.PI) });
    expr = "shocked";
  } else if (s < 20.95) {
    // grumpy again
    p = pose({ lean: 0.06, head: [0.1, 0.25, 0.05], armL: ARM_CLEAR });
    over = { eyes: "half", browL: { y: -0.04, rot: -0.2 }, browR: { y: -0.04, rot: -0.2 }, mouth: { kind: "line", w: 0.13, curve: -0.04 } };
  } else if (s < 26.15) {
    // tennis match: looks up at the map, head follows the plane west (her right) then back (her left)
    const west = prog(s * 30, 663, 687);
    const back = prog(s * 30, 729, 750);
    const turn = lerp(0.28, -0.32, west) + (0.6 * back);
    const dizzy = prog(s * 30, 752, 770);
    p = pose({ lean: -0.04, head: [-0.26, turn, Math.sin(dizzy * Math.PI * 2) * 0.12 * dizzy], armL: ARM_CLEAR });
    expr = s > 25.1 ? "happy" : "neutral";
    over = s > 25.1 ? undefined : { eyes: "dot", look: [turn * 0.15, 0.08], browL: { y: 0.06, rot: 0.05 }, browR: { y: 0.06, rot: 0.05 } };
  } else if (s < 28.2) {
    // waking up, eager: grabs the tote edge and leans in to Claude
    const lean = prog(s * 30, 785, 795);
    p = pose({ lean: 0.1 * lean, twist: 0.15 * lean, head: [0.18 * lean, 0.45 * lean, 0.1], armL: { sx: 0.55, sz: 0.45, el: 0.95, ez: 0.2 } });
    expr = "anxious";
    over = { eyes: "dot", eyeScale: 1.1, look: [0.05, -0.06] };
  } else if (s < 29.6) {
    // attentive (Claude's close-up)
    p = pose({ lean: 0.06, head: [0.15, 0.4, 0.05], armL: ARM_CLEAR });
    expr = "neutral";
    over = { eyes: "dot", look: [0.06, -0.06] };
  } else if (s < 31.9) {
    // the sunbeam: squints and smiles, eyes close happily
    const beam = prog(s * 30, 900, 908);
    p = pose({ lean: -0.03 * beam, head: [lerp(0.1, -0.12, beam), lerp(0.3, -0.15, beam), 0.08], armL: ARM_CLEAR });
    expr = beam > 0.4 ? "proud" : "neutral";
  } else if (s < 34.55) {
    // nodding along, more awake: two clear nods
    const n1 = Math.sin(clamp01((s - 32.6) / 0.35) * Math.PI);
    const n2 = Math.sin(clamp01((s - 33.5) / 0.35) * Math.PI);
    p = pose({ lean: 0.03, head: [0.02 + 0.2 * (n1 + n2), 0.32, 0.04], armL: ARM_CLEAR });
    expr = "happy";
    over = { look: [0.06, -0.04] };
  } else {
    // HEROIC: chin up, then a punch in the air on "EIGHT"
    const punch = prog(s * 30, 1098, 1106);
    p = pose({ lean: -0.08, head: [-0.16, 0.05, -0.05], armL: { sx: lerp(0.5, 2.85, punch), sz: lerp(0.9, 0.35, punch), el: lerp(1.2, 0.15, punch) }, squash: 1 + 0.03 * punch });
    expr = "proud";
    over = { eyes: punch > 0.5 ? "happy" : "dot", browL: { y: 0.0, rot: -0.22 }, browR: { y: 0.0, rot: -0.22 }, mouth: { kind: "open", w: 0.28, h: 0.15, shape: "D", tongue: true } };
  }
  p = strap(breathe(p, t, 0.7));
  const k = talk("mika", s);
  if (k > 0) over = { ...over, mouth: talkMouth(k, s > 34, (s > 2.8 && s < 5.3) || (s > 7.3 && s < 9.8)) };
  const fist = s >= 36.5 && s < 37.4 ? "fist" : null;
  return { p, expr, over, bounce: 0.22, messy: true, handL: fist };
};

// ---------- carriage: Claude in the tote ----------
export type ClaudeTote = { pop: number; expr: Expr; face?: Partial<CFace>; tilt: [number, number]; squash: number; lift: number; frontLegs?: { up: number; clap: number }; wiggle: number };
export const claudeCarriage = (s: number, t: number): ClaudeTote => {
  const f = s * 30;
  const pop = f < 153 ? 0 : Math.min(1.1, springy(f - 153, 0.36, 0.16));
  let expr: Expr = "smug";
  let tilt: [number, number] = [0, 0];
  let squash = 1;
  let lift = 0;
  let face: Partial<CFace> | undefined;
  let frontLegs: { up: number; clap: number } | undefined;
  let wiggle = 0;
  if (s < 5.5) expr = "shocked";
  else if (s < 7.35) {
    expr = "smug";
    wiggle = s > 6.6 && s < 7.2 ? 1 : 0; // a tiny wiggle on "New York"
  } else if (s < 9.75) {
    expr = "smug";
    tilt = [0.05 * Math.sin(clamp01((s - 9.0) / 0.4) * Math.PI), 0];
  } else if (s < 11.65) {
    expr = "happy";
    tilt = [0.1 + 0.08 * Math.sin(clamp01((s - 10.85) / 0.35) * Math.PI), 0];
  } else if (s < 13.85) expr = "proud";
  else if (s < 19.05) {
    expr = "happy";
    tilt = [0, -0.08];
  } else if (s < 20.0) expr = "laughing";
  else if (s < 26.15) {
    expr = "happy";
    tilt = [-0.12, 0.06];
  } else if (s < 28.2) expr = "proud";
  else if (s < 29.6) {
    expr = "proud";
    lift = 0.05 * Math.sin(clamp01((s - 28.2) / 0.35) * Math.PI);
  } else if (s < 32.2) expr = "happy";
  else if (s < 34.55) {
    expr = s < 33.0 ? "thinking" : "happy";
    tilt = [0, Math.sin(s * 5) * 0.05];
  } else if (s < 36.75) expr = "happy";
  else {
    expr = "laughing";
    const up = prog(f, 1102, 1106);
    frontLegs = { up, clap: 0.5 + 0.5 * Math.sin((f - 1104) * 1.1) };
  }
  lift += CLAUDE_LIFT;
  const k = talk("claude", s);
  if (k > 0.55) face = { mouth: "o" };
  else if (k > 0) face = { mouth: expr === "smug" ? "smirk" : "smile" };
  return { pop, expr, face, tilt, squash, lift, frontLegs, wiggle };
};

// ---------- carriage: board, holograms, light ----------
const B0 = ["CITY LINE", "NEXT  CENTRAL", "", ""];
const B1 = ["", "SOCIAL", "JETLAG", ""];
const B2 = ["TWO THINGS", "", "", ""];
const B3 = ["TWO THINGS", "1 MORNING LIGHT", "", ""];
const B4 = ["TWO THINGS", "1 MORNING LIGHT", "2 SAME-ISH WAKE UP", ""];
/** [start s, end s, from, to] */
export const FLIPS: [number, number, string[], string[]][] = [
  [11.9, 13.3, B0, B1],
  [29.0, 29.5, B1, B2],
  [29.6, 30.4, B2, B3],
  [32.2, 33.1, B3, B4],
];
export const boardAt = (s: number) => {
  let last = { from: B0, to: B0, k: 1 };
  for (const [a, b, from, to] of FLIPS) {
    if (s < a) break;
    last = { from, to, k: clamp01((s - a) / (b - a)) };
  }
  return last;
};

export const holoAt = (s: number) => {
  const f = s * 30;
  // body clock (5a/5b)
  const clockOn = s >= 13.85 && s < 20.95 ? Math.min(1, springy(f - 416, 0.35, 0.18)) : 0;
  let hour = 8;
  if (s >= 14.0) hour = lerp(8, 11, prog(f, 420, 489));
  if (s >= 19.5) hour = lerp(11, 8, Math.min(1.08, springy(f - 585, 0.3, 0.17)));
  const yawn = Math.sin(clamp01((s - 15.4) / 0.8) * Math.PI);
  const doze = s > 17.2 && s < 19.0 ? prog(f, 516, 528) : 0;
  const alarmOn = s >= 18.3 && s < 20.95 ? Math.min(1.1, springy(f - 549, 0.4, 0.16)) : 0;
  const ring = s >= 19.03 && s < 19.5 ? 1 : 0;
  const reach = s >= 19.45 && s < 20.6 ? Math.sin(clamp01((s - 19.45) / 1.1) * Math.PI) : 0;
  // map + plane (6)
  const mapOn = s >= 20.95 && s < 26.15 ? Math.min(1, springy(f - 629, 0.35, 0.18)) : 0;
  let u = 0;
  let dir = -1; // flying west = screen left
  if (s >= 22.1 && s < 24.3) u = prog(f, 663, 687);
  if (s >= 22.9 && s < 24.3) u = 1;
  if (s >= 24.3) {
    u = 1 - prog(f, 729, 750);
    dir = 1;
  }
  const planeOn = s >= 21.8 && s < 26.15 ? 1 : 0;
  return { clockOn, hour, yawn, doze, alarmOn, ring, reach, mapOn, u, dir, planeOn };
};

export const lightAt = (s: number) => ({
  flash: Math.sin(clamp01((s - 36.7) / 0.6) * Math.PI),
  beam: s >= 30.0 && s < 31.9 ? prog(s * 30, 900, 906) * (1 - prog(s * 30, 950, 957)) : 0,
});

// ---------- café, 8:00: the burst in + thumbs up ----------
export const mikaBurst = (s: number, t: number) => {
  const f = s * 30;
  const run = clamp01((f - 1141) / (1161 - 1141));
  const e = 1 - Math.pow(1 - run, 1.5);
  const x = lerp(CAFE_RUN_FROM[0], CAFE_MARK[0], e);
  const z = lerp(CAFE_RUN_FROM[2], CAFE_MARK[2], e);
  const yaw = lerp(Math.PI / 2, -0.15, prog(f, 1157, 1166));
  let p = runPose((x - CAFE_RUN_FROM[0]) / 0.55, 1);
  let expr: Expr = "happy";
  let handR: "thumb" | null = null;
  if (f >= 1158) {
    const skid = pose({ lean: -0.22, head: [-0.12, 0, 0], armL: { sx: 0.5, sz: 0.9, el: 0.5 }, armR: { sx: 0.5, sz: 0.9, el: 0.5 }, legL: { hip: 0.3, knee: 0.3 }, legR: { hip: -0.12, knee: 0.1 }, squash: 0.88 });
    p = mixPose(p, skid, prog(f, 1158, 1163));
  }
  if (f >= 1164) {
    // proud thumbs up to camera: right forearm up, fist, thumb up
    const k = prog(f, 1165, 1171);
    const thumbs = pose({ lean: -0.08, head: [-0.14, -0.05, 0.08], armR: { sx: 1.25, sz: 0.35, el: 1.55, ez: 0.0, sy: 0 }, armL: { sx: -0.1, sz: 0.55, el: 1.7, ez: -0.3 }, squash: 1.03 });
    p = mixPose(p, thumbs, k);
    p = { ...p, squash: lerp(0.88, 1.03, Math.min(1, springy(f - 1164, 0.45, 0.2))) };
    expr = "proud";
    handR = k > 0.3 ? "thumb" : null;
  }
  if (f > 1166) p = breathe(p, t, 0.6);
  const bounce = f < 1161 ? 1 : Math.max(0.25, 1 - (f - 1161) / 20);
  const swing = f < 1161 ? Math.sin(((x - CAFE_RUN_FROM[0]) / 0.55) * Math.PI * 2) * 0.25 : Math.sin((f - 1161) * 0.35) * 0.3 * Math.exp(-(f - 1161) / 14);
  const door = f < 1140 ? 0 : f < 1148 ? prog(f, 1140, 1147) : 1 - 0.25 * Math.min(1, springy(f - 1148, 0.3, 0.12));
  return { pos: [x, 0, z] as V3, yaw, p, expr, handR, bounce, swing, door };
};

// ---------- café, 9:15: the nap ----------
export const napAt = (s: number, t: number) => {
  const f = Math.min(s * 30, FREEZE);
  // snore bubble: two in/out cycles (40.6–41.3, 41.4–42.1)
  const cyc = (a: number, b: number) => (f >= a && f < b ? Math.sin(((f - a) / (b - a)) * Math.PI) : 0);
  const snore = Math.max(cyc(1218, 1239), cyc(1242, 1263));
  // Claude: unimpressed → sigh (42.0) → hop out of the pillow (42.5) → nudge it under her cheek (43.0–43.8) → smug
  const sigh = Math.sin(clamp01((f - 1260) / 15) * Math.PI);
  const hop = Math.sin(clamp01((f - 1275) / 12) * Math.PI);
  const push = prog(f, 1290, 1314);
  const claudePos: V3 = [lerp(CLAUDE_TABLE[0], 0.74, push), TABLE_Y + hop * 0.07, lerp(CLAUDE_TABLE[2], -0.98, push)];
  const claudeYaw = f < 1314 ? -1.25 : lerp(-1.25, -0.35, prog(f, 1314, 1320));
  const cExpr: Expr = f < 1260 ? "sad" : f < 1275 ? "sleepy" : f < 1314 ? "happy" : "smug";
  // the pillow: on Claude until the hop, arcs off onto the table, then gets pushed under her cheek
  const pillowOn = f < 1277;
  const fly = clamp01((f - 1277) / 9);
  const onTable: V3 = [0.8, TABLE_Y + 0.03, -0.96];
  const underCheek: V3 = [0.48, TABLE_Y + 0.03, -1.02];
  let pillow: V3 = [lerp(CLAUDE_TABLE[0], onTable[0], fly), TABLE_Y + 0.12 + Math.sin(fly * Math.PI) * 0.12 - fly * 0.09, lerp(CLAUDE_TABLE[2], onTable[2], fly)];
  if (f >= 1290) pillow = [lerp(onTable[0], underCheek[0], push), onTable[1], lerp(onTable[2], underCheek[2], push)];
  // Mika: the cheek lifts a touch while the pillow slides in, then settles on it, smiling
  const settle = prog(f, 1306, 1316);
  const lift = Math.sin(clamp01((f - 1296) / 16) * Math.PI) * 0.04 + settle * 0.045;
  const p = breathe({ ...MIKA_TABLE_NAP, bob: MIKA_TABLE_NAP.bob + lift + Math.sin(t * 0.08) * 0.004 }, t, 0.5);
  const mExpr: Expr = settle > 0.5 ? "happy" : "sleepy";
  const mOver: Partial<Face> = settle > 0.5 ? { eyes: "closed", mouth: { kind: "line", w: 0.16, curve: 0.06 } } : { eyes: "closed", mouth: { kind: "open", w: 0.07, h: 0.06 + snore * 0.04, shape: "O" } };
  return { snore, claudePos, claudeYaw, cExpr, sigh, hop, pillowOn, pillow, pillowYaw: lerp(-1.25, -0.2, fly), p, mExpr, mOver };
};

// ---------- captions: placed clear of every face, inside the middle third (bible §10) ----------
/** pill size estimate (Fredoka 700, 78 px, padding 44/18) */
export const capSize = (text: string) => (text.length > 16 ? 68 : 78);
export const pillBox = (text: string) => ({ w: text.length * capSize(text) * 0.53 + 92, h: capSize(text) + 44 });
const Y_TRY = [1215, 1185, 1150, 1115, 1080, 1045, 1010, 975, 940, 905, 870, 835, 800, 765, 730, 700];
const X_TRY = [520, 460, 580, 400, 620, 350];
/** screen circles of the faces at frame f */
export const faceCircles = (f: number) => {
  const cam = camAt(f);
  return facesAt(f).map((fc) => {
    const [x, y] = project(cam, fc.p);
    const [, y2] = project(cam, [fc.p[0], fc.p[1] + fc.r, fc.p[2]]);
    return { who: fc.who, x, y, r: Math.abs(y - y2) };
  });
};
export const hits = (c: { x: number; y: number; r: number }, x: number, y: number, w: number, h: number) => {
  const nx = Math.max(x - w / 2, Math.min(c.x, x + w / 2));
  const ny = Math.max(y - h / 2, Math.min(c.y, y + h / 2));
  return (nx - c.x) ** 2 + (ny - c.y) ** 2 < c.r * c.r;
};
/** right edge allowed: the UI column starts at x ≈ 940 from y 900 down */
const rightOk = (x: number, y: number, w: number) => x + w / 2 <= (y + 61 > 900 ? 930 : 980) && x - w / 2 >= 30;
const PLACE = new Map<string, { x: number; y: number; ok: boolean }>();
/** one position per caption and shot, checked on every 2nd frame it is on screen */
export const placeCaption = (text: string, a: number, b: number) => {
  const key = `${text}|${a}|${b}`;
  const hit = PLACE.get(key);
  if (hit) return hit;
  const { w, h } = pillBox(text);
  const frames: number[] = [];
  for (let f = a; f <= b; f += 2) frames.push(f);
  const circles = frames.map(faceCircles);
  let out = { x: 520, y: 1215, ok: false };
  search: for (const y of Y_TRY)
    for (const x of X_TRY) {
      if (!rightOk(x, y, w)) continue;
      if (circles.every((cs) => cs.every((c) => !hits(c, x, y, w, h)))) {
        out = { x, y, ok: true };
        break search;
      }
    }
  PLACE.set(key, out);
  return out;
};
export const captionAt = (f: number) => {
  const s = f / FPS;
  if (s >= 37.3) return null;
  const c = TL.captions.find((x) => s >= x.s && s < x.e);
  if (!c) return null;
  const sh = shotAt(f);
  const a = Math.max(sh.a, Math.round(c.s * FPS));
  const b = Math.min(sh.b - 1, Math.round(c.e * FPS));
  const pos = placeCaption(c.text, a, b);
  return { ...c, x: pos.x, y: pos.y, ok: pos.ok, age: f - Math.round(c.s * FPS) };
};

/** world points + radii of every face per frame (for the caption check and debug overlays) */
export const facesAt = (f: number): { who: string; p: V3; r: number }[] => {
  const sh = shotAt(f);
  if (sh.set === "card") return [];
  const s = f / FPS;
  if (sh.set === "carriage") {
    const c = claudeCarriage(s, f);
    return [
      { who: "mika", p: MIKA_HEAD, r: 0.34 },
      ...(c.pop > 0.3 ? [{ who: "claude", p: add(CLAUDE_FACE, [0, c.lift - CLAUDE_LIFT, 0]) as V3, r: 0.13 }] : []),
    ];
  }
  if (sh.id === "10") {
    const m = mikaBurst(s, f);
    return [{ who: "mika", p: add(m.pos, [0, 1.2, 0]), r: 0.34 }];
  }
  const n = napAt(s, f);
  return [
    { who: "mika", p: [NAP_POS[0] + 0.04, TABLE_Y + 0.25, -1.08], r: 0.32 },
    { who: "claude", p: add(n.claudePos, [0, 0.22, 0]), r: 0.17 },
  ];
};

/** the end pill (two lines) at the freeze: highest-priority spot in the middle third clear of both faces */
export const endPillY = () => {
  const w = 760;
  const h = 200;
  const cs = [FREEZE, FREEZE + 12, FREEZE + 59].map(faceCircles).flat();
  for (const y of [1170, 1120, 1070, 1020, 970, 920, 870, 820, 770, 740])
    if (cs.every((c) => !hits(c, 520, y, w, h))) return { y, ok: true };
  return { y: 740, ok: false };
};
