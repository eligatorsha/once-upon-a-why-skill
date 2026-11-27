// ONCE UPON A WHY: CLAUDE, the mascot (bible §5.3). LOCKED v2 (redesign 2026-11-27).
// A warm orange block of soft, slightly fuzzy FELTED CLAY with well-rounded edges, four chunky rectangular legs,
// big square black eyes (one shine each), a small dash mouth and soft pink blush. No glasses, no spark, no logos.
// Emotion comes from EYE SHAPE (squashed = happy, wide = shocked, half-closed = sleepy), mouth shape and body tilt.
// No arms: it waves by lifting a front leg. One optional costume prop per episode (`prop`).
// Origin = floor under its centre. Body 0.36 × 0.30 × 0.30, ~0.40 tall with legs.
import React from "react";
import * as THREE from "three";
import { canvasTex, fade, matte, rng, roundedBlock } from "../look/mat";
import { PAL } from "../palette";
import { D, Expr, P2, curve, ellipse, roundRect, stroke } from "./face";
import { geo } from "./rig";

export const CLAUDE = {
  w: 0.36,
  h: 0.3,
  d: 0.3,
  leg: 0.09,
  felt: "#E8843E",
  feltDeep: "#D9732F",
};

// ---------- felted clay material ----------
const feltTex = () =>
  canvasTex(
    "feltClay",
    512,
    512,
    (g, w, h) => {
      const r = rng(17);
      g.fillStyle = "#808080";
      g.fillRect(0, 0, w, h);
      // soft mottling
      for (let i = 0; i < 260; i++) {
        const v = 110 + r() * 50;
        g.fillStyle = `rgba(${v},${v},${v},0.12)`;
        g.beginPath();
        g.arc(r() * w, r() * h, 10 + r() * 40, 0, Math.PI * 2);
        g.fill();
      }
      // fibres
      for (let i = 0; i < 9000; i++) {
        const v = r() < 0.5 ? 165 + r() * 60 : 60 + r() * 50;
        g.strokeStyle = `rgba(${v},${v},${v},${0.18 + r() * 0.22})`;
        g.lineWidth = 0.6 + r() * 0.8;
        const x = r() * w;
        const y = r() * h;
        const a = r() * Math.PI * 2;
        const l = 2 + r() * 6;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + Math.cos(a + 1) * l * 0.5, y + Math.sin(a + 1) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
        g.stroke();
      }
    },
    { srgb: false, repeat: [2, 2] },
  );

/** colour variation for the felt: light speckle and soft blotches around white, multiplied into the body colour */
const feltColor = () =>
  canvasTex(
    "feltClayColor",
    512,
    512,
    (g, w, h) => {
      const r = rng(23);
      g.fillStyle = "#F2F2F2";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 180; i++) {
        g.fillStyle = r() < 0.5 ? "rgba(255,236,220,0.25)" : "rgba(214,200,190,0.18)";
        g.beginPath();
        g.arc(r() * w, r() * h, 8 + r() * 36, 0, Math.PI * 2);
        g.fill();
      }
      for (let i = 0; i < 6000; i++) {
        g.fillStyle = r() < 0.6 ? "rgba(255,250,240,0.35)" : "rgba(170,150,140,0.25)";
        g.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5);
      }
    },
    { repeat: [2, 2] },
  );

const FELT = new Map<string, THREE.MeshPhysicalMaterial>();
/** soft fuzzy felt: matte, a peach sheen at grazing angles, a fine fibre bump */
export const felt = (c: string) => {
  let m = FELT.get(c);
  if (!m) {
    const t = feltTex();
    m = new THREE.MeshPhysicalMaterial({
      color: c,
      roughness: 0.95,
      metalness: 0,
      sheen: 1,
      sheenRoughness: 0.4,
      sheenColor: new THREE.Color("#FFC7A0"),
      map: feltColor(),
      bumpMap: t,
      bumpScale: 3.2,
      roughnessMap: t,
      envMapIntensity: 0.6,
    });
    FELT.set(c, m);
  }
  return m;
};

const bodyGeo = () => geo("claude2Body", () => roundedBlock(CLAUDE.w, CLAUDE.h, CLAUDE.d, 0.085, 5));
const legGeo = () => geo("claude2Leg", () => roundedBlock(0.095, CLAUDE.leg + 0.03, 0.09, 0.028, 3));

// ---------- face ----------
type Eye = "square" | "happy" | "wide" | "sleepy" | "lidded" | "closed" | "squint";
type CMouth = "dash" | "smile" | "grin" | "o" | "wavy" | "frown" | "smirk" | "flat";
export type CFace = { eye: Eye; mouth: CMouth; blush: number; tilt: [number, number]; squash: number; look?: [number, number]; sweat?: boolean };
/** expression table: eyes + mouth + body tilt [forward, side] + squash */
export const CLAUDE_FACES: Record<Expr, CFace> = {
  neutral: { eye: "square", mouth: "dash", blush: 0.55, tilt: [0, 0], squash: 1 },
  happy: { eye: "happy", mouth: "smile", blush: 0.75, tilt: [0, 0.06], squash: 1.02 },
  laughing: { eye: "squint", mouth: "grin", blush: 0.9, tilt: [-0.12, 0.1], squash: 0.95 },
  shocked: { eye: "wide", mouth: "o", blush: 0.35, tilt: [-0.1, 0], squash: 1.09 },
  panicked: { eye: "wide", mouth: "wavy", blush: 0.4, tilt: [0.04, -0.08], squash: 1.05, sweat: true },
  anxious: { eye: "square", mouth: "wavy", blush: 0.5, tilt: [0.05, -0.05], squash: 0.97, look: [-0.012, -0.006], sweat: true },
  thinking: { eye: "square", mouth: "flat", blush: 0.5, tilt: [0, -0.12], squash: 1, look: [0.012, 0.01] },
  smug: { eye: "lidded", mouth: "smirk", blush: 0.6, tilt: [-0.08, 0.08], squash: 1.01 },
  sad: { eye: "square", mouth: "frown", blush: 0.4, tilt: [0.14, 0], squash: 0.93, look: [0, -0.012] },
  proud: { eye: "happy", mouth: "smile", blush: 0.8, tilt: [-0.14, 0], squash: 1.06 },
  embarrassed: { eye: "squint", mouth: "wavy", blush: 1, tilt: [0.08, 0.1], squash: 0.96 },
  sleepy: { eye: "sleepy", mouth: "o", blush: 0.5, tilt: [0.06, 0.14], squash: 0.95 },
};

const q = (n: number) => Math.round(n * 10000) / 10000;
const INK = "#16100E";

const ClaudeFace: React.FC<{ f: CFace; blink: number; z: number }> = ({ f, blink, z }) => {
  const proj = { kind: "plane" as const, z };
  const L = 0.0012;
  const els: React.ReactNode[] = [];
  const ex = 0.066;
  const ey = 0.025;
  const [lx, ly] = f.look ?? [0, 0];
  let eye = f.eye;
  if (blink > 0.55 && (eye === "square" || eye === "wide" || eye === "sleepy" || eye === "lidded")) eye = "closed";
  for (const s of [-1, 1]) {
    const cx = s * ex + lx;
    const cy = ey + ly;
    const k = `${eye}${s}${q(cx)}${q(cy)}`;
    if (eye === "square" || eye === "wide") {
      const w = eye === "wide" ? 0.066 : 0.054;
      const h = (eye === "wide" ? 0.078 : 0.066) * (1 - blink * 0.7);
      els.push(<D key={k} k={`cE${k}${q(h)}`} c={roundRect(cx, cy, w, h, 0.014)} proj={proj} lift={L} color={INK} />);
      const sw = eye === "wide" ? 0.022 : 0.017;
      els.push(<D key={k + "s"} k={`cS${k}${q(h)}`} c={roundRect(cx - w * 0.2, cy + h * 0.22, sw, sw, 0.005)} proj={proj} lift={L * 2} color="#FFFFFF" />);
      if (eye === "wide") els.push(<D key={k + "s2"} k={`cS2${k}`} c={ellipse(cx + w * 0.22, cy - h * 0.22, 0.006, 0.006, 8)} proj={proj} lift={L * 2} color="#FFFFFF" />);
    } else if (eye === "happy") {
      // squashed: a short, wide, slightly arched bar
      els.push(<D key={k} k={`cH${k}`} c={stroke(curve(cx - 0.03, cx + 0.03, (x) => cy - 0.006 + 0.016 * (1 - ((x - cx) / 0.03) ** 2), 10), 0.022)} proj={proj} lift={L} color={INK} />);
    } else if (eye === "squint") {
      els.push(<D key={k} k={`cQ${k}`} c={stroke([[cx - s * 0.026, cy + 0.02], [cx + s * 0.02, cy], [cx - s * 0.026, cy - 0.02]], 0.016)} proj={proj} lift={L} color={INK} />);
    } else if (eye === "sleepy") {
      // half-closed and droopy: a small half square under a lid that slopes down to the outside
      els.push(<D key={k} k={`cZ${k}`} c={roundRect(cx, cy - 0.02, 0.05, 0.026, 0.01)} proj={proj} lift={L} color={INK} />);
      els.push(<D key={k + "l"} k={`cZl${k}`} c={stroke(curve(cx - 0.03, cx + 0.03, (x) => cy - 0.006 - 0.006 * ((x - cx) / 0.03) * s + 0.004 * (1 - ((x - cx) / 0.03) ** 2), 8), 0.011)} proj={proj} lift={L * 2} color={INK} />);
    } else if (eye === "lidded") {
      // smug: level heavy lids
      els.push(<D key={k} k={`cY${k}`} c={roundRect(cx, cy - 0.016, 0.054, 0.032, 0.01)} proj={proj} lift={L} color={INK} />);
      els.push(<D key={k + "l"} k={`cYl${k}`} c={stroke([[cx - 0.032, cy + 0.002], [cx + 0.032, cy + 0.002]], 0.012)} proj={proj} lift={L * 2} color={INK} />);
    } else {
      els.push(<D key={k} k={`cC${k}`} c={stroke([[cx - 0.027, cy - 0.004], [cx + 0.027, cy - 0.004]], 0.012)} proj={proj} lift={L} color={INK} />);
    }
  }
  // mouth
  const my = -0.045;
  const m = f.mouth;
  const mk = `cM${m}`;
  if (m === "dash" || m === "flat") els.push(<D key="m" k={mk} c={stroke([[-0.016 + (m === "flat" ? 0.01 : 0), my], [0.016 + (m === "flat" ? 0.01 : 0), my]], 0.01)} proj={proj} lift={L} color={INK} />);
  else if (m === "smile") els.push(<D key="m" k={mk} c={stroke(curve(-0.02, 0.02, (x) => my + 0.008 * (x / 0.02) ** 2 - 0.002, 10), 0.01)} proj={proj} lift={L} color={INK} />);
  else if (m === "frown") els.push(<D key="m" k={mk} c={stroke(curve(-0.018, 0.018, (x) => my - 0.008 * (x / 0.018) ** 2, 10), 0.01)} proj={proj} lift={L} color={INK} />);
  else if (m === "smirk") els.push(<D key="m" k={mk} c={stroke(curve(-0.016, 0.02, (x) => my + (x > 0 ? 0.01 * (x / 0.02) ** 2 : 0), 10), 0.01)} proj={proj} lift={L} color={INK} />);
  else if (m === "wavy") els.push(<D key="m" k={mk} c={stroke(curve(-0.022, 0.022, (x) => my + 0.004 * Math.sin((x / 0.022) * Math.PI * 2), 14), 0.009)} proj={proj} lift={L} color={INK} />);
  else if (m === "o") els.push(<D key="m" k={mk} c={ellipse(0, my - 0.004, 0.011, 0.013, 14)} proj={proj} lift={L} color="#3A1410" />);
  else {
    const c: P2[] = [...curve(-0.026, 0.026, (x) => my + 0.004 * (x / 0.026) ** 2, 8), ...ellipse(0, my + 0.004, 0.026, 0.026, 12, 0, -Math.PI).slice(1, -1)];
    els.push(<D key="m" k={mk} c={c} proj={proj} lift={L} color="#3A1410" />);
    els.push(<D key="mt" k="cMt" c={ellipse(0.004, my - 0.014, 0.012, 0.007, 10)} proj={proj} lift={L * 2} color="#FF7F8E" />);
  }
  // blush
  for (const s of [-1, 1]) {
    els.push(<D key={`b${s}`} k={`cB${s}`} c={ellipse(s * 0.112, -0.025, 0.026, 0.015, 16)} proj={proj} lift={L * 0.5} color="#FF8FA0" opacity={Math.min(0.85, 0.3 + f.blush * 0.5)} />);
  }
  return <>{els}</>;
};

// ---------- costume props (one per episode) ----------
/** built: bowtie, gradcap, neckpillow. Planned: briefcase, lamp (reading lamp), rose — add them here, same slot. */
export type ClaudeProp = "bowtie" | "gradcap" | "neckpillow" | null;

/** a soft lilac travel neck pillow (ep 1), felt like Claude. A thick U round the lower body, open at the back.
 *  Origin = ring centre; `w`/`d` = the body it wraps. Use on its own (e.g. lying on a table) with `loose`. */
export const NeckPillow: React.FC<{ w?: number; d?: number; loose?: boolean }> = ({ w = 0.36, d = 0.3, loose = false }) => {
  const R = w / 2 + 0.035;
  const tube = 0.048;
  return (
    <group scale={[1, loose ? 0.85 : 1, (d / w) * 1.08]}>
    {/* torus lies flat (rotate x), the opening turned to the back (-z) */}
    <group rotation={[Math.PI / 2, 0, -Math.PI * 0.31]}>
      <mesh castShadow receiveShadow material={felt("#C3ABEB")} geometry={geo(`pillowU${R}${tube}`, () => new THREE.TorusGeometry(R, tube, 14, 36, Math.PI * 1.62))} />
      {/* rounded ends */}
      {[0, Math.PI * 1.62].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * R, Math.sin(a) * R, 0]} castShadow material={felt("#C3ABEB")}>
          <sphereGeometry args={[tube, 14, 10]} />
        </mesh>
      ))}
      {/* a little piped seam */}
      <mesh material={felt("#A98FD6")} geometry={geo(`pillowSeam${R}`, () => new THREE.TorusGeometry(R + tube * 0.92, 0.006, 5, 36, Math.PI * 1.62))} />
    </group>
    </group>
  );
};

const BowTie: React.FC = () => (
  <group>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.028, 0, 0]} rotation={[0, 0, (s * Math.PI) / 2]} scale={[1, 1, 0.45]} castShadow material={matte("#2E2A6E", 0.7, { flat: false })}>
        <coneGeometry args={[0.024, 0.05, 4]} />
      </mesh>
    ))}
    <mesh scale={[1, 1, 0.7]} material={matte("#3F3A8A", 0.7, { flat: false })}>
      <sphereGeometry args={[0.013, 10, 8]} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={`d${s}`} position={[s * 0.03, 0.006, 0.008]} material={matte("#F4E2C4", 0.6)}>
        <sphereGeometry args={[0.004, 6, 4]} />
      </mesh>
    ))}
  </group>
);

const GradCap: React.FC<{ t: number }> = ({ t }) => {
  const sw = Math.sin(t * 0.12) * 0.25;
  return (
    <group rotation={[0, 0, -0.1]}>
      <mesh position={[0, 0.02, 0]} castShadow material={matte("#1E1A2A", 0.7, { flat: false })}>
        <cylinderGeometry args={[0.07, 0.075, 0.04, 16]} />
      </mesh>
      <mesh position={[0, 0.045, 0]} rotation={[0, Math.PI / 4, 0]} castShadow material={matte("#26203A", 0.65)}>
        <boxGeometry args={[0.2, 0.012, 0.2]} />
      </mesh>
      <mesh position={[0, 0.054, 0]} material={matte("#E8B23A", 0.4, { metal: 0.3 })}>
        <sphereGeometry args={[0.008, 8, 6]} />
      </mesh>
      {/* tassel cord to a corner, then hanging and swaying */}
      <mesh position={[0.05, 0.052, 0.0]} rotation={[0, 0, Math.PI / 2]} material={matte("#E8B23A", 0.5)}>
        <cylinderGeometry args={[0.0025, 0.0025, 0.1, 5]} />
      </mesh>
      <group position={[0.1, 0.05, 0]} rotation={[sw * 0.4, 0, sw]}>
        <mesh position={[0, -0.03, 0]} material={matte("#E8B23A", 0.5)}>
          <cylinderGeometry args={[0.0025, 0.0025, 0.06, 5]} />
        </mesh>
        <mesh position={[0, -0.07, 0]} material={matte("#F2C24A", 0.6)}>
          <coneGeometry args={[0.012, 0.035, 6]} />
        </mesh>
      </group>
    </group>
  );
};

/** the thimble tea mug (tiny, cream with an orange band), with optional steam and slosh */
export const ThimbleMug: React.FC<{ t?: number; steam?: boolean; slosh?: number }> = ({ t = 0, steam = true, slosh = 0 }) => (
  <group>
    <mesh position={[0, 0.035, 0]} castShadow material={matte("#FFF1DC", 0.75)}>
      <cylinderGeometry args={[0.036, 0.03, 0.07, 10, 1, true]} />
    </mesh>
    <mesh position={[0, 0.001, 0]} material={matte("#FFF1DC", 0.75)}>
      <cylinderGeometry args={[0.03, 0.03, 0.004, 10]} />
    </mesh>
    <mesh position={[0, 0.045, 0]} material={matte(PAL.claude, 0.85)}>
      <cylinderGeometry args={[0.0365, 0.0345, 0.016, 10, 1, true]} />
    </mesh>
    <mesh position={[0, 0.062, 0]} rotation={[slosh * 0.25, 0, slosh * 0.2]} material={matte("#B9772E", 0.4)}>
      <cylinderGeometry args={[0.033, 0.033, 0.004, 10]} />
    </mesh>
    <mesh position={[0.043, 0.037, 0]} rotation={[Math.PI / 2, 0, 0]} material={matte("#FFF1DC", 0.75)}>
      <torusGeometry args={[0.017, 0.006, 5, 10]} />
    </mesh>
    {steam
      ? [0, 1, 2].map((i) => {
          const k = (t * 0.018 + i / 3) % 1;
          return (
            <mesh key={i} position={[Math.sin(t * 0.06 + i * 2) * 0.012, 0.08 + k * 0.12, 0]} scale={0.012 + k * 0.02} material={fade("#FFFFFF", 0.35 * (1 - k))}>
              <icosahedronGeometry args={[1, 1]} />
            </mesh>
          );
        })
      : null}
  </group>
);

export type ClaudeProps = {
  expr?: Expr;
  t?: number;
  /** lift the front-left leg to wave: 0..1, waving oscillates on its own while > 0 */
  wave?: number;
  /** extra squash and stretch on top of the expression's (1 = none) */
  squash?: number;
  /** extra body tilt [forward, side] on top of the expression's */
  tilt?: [number, number];
  /** show the thimble mug beside it */
  mug?: boolean;
  /** hide legs (when it rides in the tote bag) */
  legs?: boolean;
  /** the episode's costume prop */
  prop?: ClaudeProp;
  blinkSeed?: number;
  /** one-off face tweak on top of the expression (e.g. surprised-happy: { eye: "wide", mouth: "smile" }) */
  face?: Partial<CFace>;
  /** front legs used like little arms (works with legs=false, e.g. in the tote): up 0..1 raises them, clap 0..1 brings
   *  the tips together (drive clap with a fast oscillation to clap) */
  frontLegs?: { up: number; clap: number };
};

export const Claude: React.FC<ClaudeProps> = ({ expr = "happy", t = 0, wave = 0, squash = 1, tilt = [0, 0], mug = false, legs = true, prop = null, blinkSeed = 2, face, frontLegs }) => {
  const { w, h, d, leg } = CLAUDE;
  const F = { ...CLAUDE_FACES[expr], ...face };
  const sq = squash * F.squash * (1 + Math.sin(t * 0.09) * 0.008);
  const sx = 1 / Math.sqrt(sq);
  const waveA = wave > 0 ? wave * (0.9 + Math.sin(t * 0.5) * 0.3) : 0;
  const period = 96 + (blinkSeed % 3) * 9;
  const bk = (t + blinkSeed * 41) % period;
  const blink = bk >= 0 && bk <= 5 ? [0.5, 1, 1, 0.6, 0.2, 0][Math.floor(bk)] : 0;
  const tx = F.tilt[0] + tilt[0];
  const tz = F.tilt[1] + tilt[1];
  const legPos: [number, number][] = [
    [w * 0.3, d * 0.27],
    [-w * 0.3, d * 0.27],
    [w * 0.3, -d * 0.27],
    [-w * 0.3, -d * 0.27],
  ];
  const lift = legs ? leg : 0;
  return (
    <group>
      {legs
        ? legPos.map(([x, z], i) => (
            <group key={i} position={[x, leg + 0.01, z]} rotation={i === 0 ? [-waveA, 0, -waveA * 0.6] : [0, 0, 0]}>
              <mesh position={[0, -leg / 2 + 0.005, 0]} geometry={legGeo()} material={felt(CLAUDE.feltDeep)} castShadow receiveShadow />
            </group>
          ))
        : null}
      {/* the body pivots on its bottom so tilts read as body language */}
      <group position={[0, lift + 0.01, 0]} rotation={[tx, 0, tz]} scale={[sx, sq, sx]}>
        <group position={[0, h / 2, 0]}>
          <mesh geometry={bodyGeo()} material={felt(CLAUDE.felt)} castShadow receiveShadow />
          <ClaudeFace f={F} blink={blink} z={d / 2} />
          {F.sweat ? (
            <group position={[w * 0.44, h * 0.32, d * 0.3]} scale={0.035}>
              <mesh material={matte("#9FE3FF", 0.3, { flat: false })}>
                <sphereGeometry args={[0.5, 12, 10]} />
              </mesh>
              <mesh position={[0, 0.55, 0]} material={matte("#9FE3FF", 0.3, { flat: false })}>
                <coneGeometry args={[0.43, 0.75, 12]} />
              </mesh>
            </group>
          ) : null}
          {prop === "bowtie" ? (
            <group position={[0, -h * 0.36, d / 2 + 0.008]}>
              <BowTie />
            </group>
          ) : null}
          {frontLegs && frontLegs.up > 0.001
            ? [1, -1].map((s) => (
                <group key={`fl${s}`} position={[s * w * 0.34, -h * 0.2, d * 0.36]} rotation={[-0.2 - frontLegs.up * 1.35, -s * frontLegs.clap * 0.95, s * (0.25 - frontLegs.clap * 0.2)]}>
                  <mesh position={[0, -leg / 2 - 0.01, 0]} geometry={legGeo()} material={felt(CLAUDE.feltDeep)} castShadow />
                </group>
              ))
            : null}
          {prop === "neckpillow" ? (
            <group position={[0, -h * 0.34, 0]}>
              <NeckPillow w={w} d={d} />
            </group>
          ) : null}
          {prop === "gradcap" ? (
            <group position={[0.02, h / 2 - 0.006, 0]}>
              <GradCap t={t} />
            </group>
          ) : null}
        </group>
      </group>
      {mug ? (
        <group position={[w * 0.75, 0, d * 0.25]}>
          <ThimbleMug t={t} />
        </group>
      ) : null}
    </group>
  );
};
