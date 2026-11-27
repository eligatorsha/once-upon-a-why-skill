// ONCE UPON A WHY: the shared face and expression system (bible §5). LOCKED vocabulary:
// simple dot eyes (with one white shine), separate eyebrow shapes, a simple mouth, blush, sweat drops.
// Every feature is a flat 2D shape in "face units" (head radius = 1, +x = the character's left = screen right
// when facing camera, +y up), projected onto the head surface (sphere) or a flat front (Claude's block).
import React from "react";
import * as THREE from "three";
import { decal, matte } from "../look/mat";

export const EXPRESSIONS = ["neutral", "happy", "laughing", "shocked", "panicked", "anxious", "thinking", "smug", "sad", "proud", "embarrassed", "sleepy"] as const;
export type Expr = (typeof EXPRESSIONS)[number];

type EyeKind = "dot" | "wide" | "happy" | "closed" | "half";
type Brow = { y: number; rot: number; curve?: number };
type Mouth =
  | { kind: "line"; w: number; curve: number; asym?: number; wobble?: number; y?: number }
  | { kind: "open"; w: number; h: number; shape: "D" | "O" | "wide"; tongue?: boolean; teeth?: boolean; y?: number; asym?: number };
export type Face = {
  eyes: EyeKind;
  /** pupil offset in face units (look direction) */
  look?: [number, number];
  eyeScale?: number;
  browL: Brow;
  browR: Brow;
  mouth: Mouth;
  blush?: number;
  sweat?: number;
};

/** the expression table. Brow rot > 0 lifts the INNER end (worried); < 0 = cross. */
export const FACES: Record<Expr, Face> = {
  neutral: { eyes: "dot", browL: { y: 0, rot: 0 }, browR: { y: 0, rot: 0 }, mouth: { kind: "line", w: 0.17, curve: 0.035 } },
  happy: { eyes: "dot", browL: { y: 0.05, rot: 0.08 }, browR: { y: 0.05, rot: 0.08 }, mouth: { kind: "open", w: 0.27, h: 0.17, shape: "D", tongue: true }, blush: 0.35 },
  laughing: { eyes: "happy", browL: { y: 0.1, rot: 0.12 }, browR: { y: 0.1, rot: 0.12 }, mouth: { kind: "open", w: 0.33, h: 0.26, shape: "D", tongue: true, teeth: true }, blush: 0.55 },
  shocked: { eyes: "wide", browL: { y: 0.16, rot: 0.05, curve: 0.04 }, browR: { y: 0.16, rot: 0.05, curve: 0.04 }, mouth: { kind: "open", w: 0.12, h: 0.16, shape: "O" } },
  panicked: { eyes: "wide", eyeScale: 0.85, browL: { y: 0.14, rot: 0.4 }, browR: { y: 0.14, rot: 0.4 }, mouth: { kind: "open", w: 0.3, h: 0.13, shape: "wide", teeth: true }, sweat: 2 },
  anxious: { eyes: "dot", look: [-0.06, -0.02], browL: { y: 0.06, rot: 0.32 }, browR: { y: 0.06, rot: 0.32 }, mouth: { kind: "line", w: 0.16, curve: -0.01, wobble: 0.018 }, sweat: 1 },
  thinking: { eyes: "dot", look: [0.07, 0.07], browL: { y: -0.03, rot: -0.12 }, browR: { y: 0.11, rot: 0.05 }, mouth: { kind: "line", w: 0.1, curve: -0.015, asym: 0.05, y: -0.4 } },
  smug: { eyes: "half", look: [0.04, 0], browL: { y: -0.02, rot: -0.08 }, browR: { y: 0.12, rot: -0.1 }, mouth: { kind: "line", w: 0.18, curve: 0.02, asym: 0.07 } },
  sad: { eyes: "dot", look: [0, -0.07], browL: { y: 0.02, rot: 0.38 }, browR: { y: 0.02, rot: 0.38 }, mouth: { kind: "line", w: 0.15, curve: -0.06 } },
  proud: { eyes: "happy", browL: { y: 0.1, rot: -0.05 }, browR: { y: 0.1, rot: -0.05 }, mouth: { kind: "line", w: 0.24, curve: 0.09 }, blush: 0.3 },
  embarrassed: { eyes: "dot", look: [-0.07, -0.06], browL: { y: 0.04, rot: 0.3 }, browR: { y: 0.04, rot: 0.3 }, mouth: { kind: "line", w: 0.17, curve: 0.03, wobble: 0.02 }, blush: 1 },
  sleepy: { eyes: "half", eyeScale: 0.9, look: [0, -0.05], browL: { y: -0.05, rot: 0.1 }, browR: { y: -0.05, rot: 0.1 }, mouth: { kind: "open", w: 0.07, h: 0.08, shape: "O" } },
};

/** blink every ~3 s (staggered per character by `seed`): 0 = open … 1 = shut */
export const blinkAt = (t: number, seed = 0) => {
  const period = 92 + (seed % 3) * 11;
  const k = (t + seed * 37) % period;
  if (k < 0 || k > 5) return 0;
  return [0.5, 1, 1, 0.6, 0.2, 0][Math.floor(k)];
};

// ---------- 2D shape helpers (face units) ----------
export type P2 = [number, number];
export const ellipse = (cx: number, cy: number, rx: number, ry: number, n = 20, a0 = 0, a1 = Math.PI * 2): P2[] => {
  const out: P2[] = [];
  const full = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6;
  const steps = full ? n : n + 1;
  for (let i = 0; i < steps; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
};
/** thick round-capped stroke around a polyline → closed contour */
export const stroke = (pts: P2[], w: number): P2[] => {
  const n = pts.length;
  const nor: P2[] = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  });
  const h = w / 2;
  const left = pts.map((p, i) => [p[0] + nor[i][0] * h, p[1] + nor[i][1] * h] as P2);
  const right = pts.map((p, i) => [p[0] - nor[i][0] * h, p[1] - nor[i][1] * h] as P2).reverse();
  const cap = (p: P2, nn: P2, dir: 1 | -1): P2[] => {
    const base = Math.atan2(nn[1], nn[0]);
    const out: P2[] = [];
    for (let k = 1; k < 6; k++) {
      const a = base + (dir * Math.PI * k) / 6;
      out.push([p[0] + Math.cos(a) * h, p[1] + Math.sin(a) * h]);
    }
    return out;
  };
  return [...left, ...cap(pts[n - 1], nor[n - 1], -1), ...right, ...cap(pts[0], [-nor[0][0], -nor[0][1]], -1)];
};
export const curve = (x0: number, x1: number, y: (x: number) => number, n = 14): P2[] => Array.from({ length: n + 1 }, (_, i) => {
  const x = x0 + ((x1 - x0) * i) / n;
  return [x, y(x)] as P2;
});

/** rounded rectangle contour centred on (cx, cy) */
export const roundRect = (cx: number, cy: number, w: number, h: number, r: number, n = 4): P2[] => {
  const rr = Math.min(r, w / 2, h / 2);
  const out: P2[] = [];
  const corners: [number, number, number][] = [
    [cx + w / 2 - rr, cy + h / 2 - rr, 0],
    [cx - w / 2 + rr, cy + h / 2 - rr, Math.PI / 2],
    [cx - w / 2 + rr, cy - h / 2 + rr, Math.PI],
    [cx + w / 2 - rr, cy - h / 2 + rr, (3 * Math.PI) / 2],
  ];
  for (const [x, y, a0] of corners) for (let i = 0; i <= n; i++) {
    const a = a0 + ((Math.PI / 2) * i) / n;
    out.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  return out;
};

export type Proj = { kind: "sphere" } | { kind: "plane"; z: number; sx?: number; sy?: number };

const GEO = new Map<string, THREE.BufferGeometry>();
const shapeGeo = (key: string, contour: P2[], proj: Proj, lift: number) => {
  const k = `${key}|${JSON.stringify(proj)}|${lift}`;
  let g = GEO.get(k);
  if (g) return g;
  const v2 = contour.map((p) => new THREE.Vector2(p[0], p[1]));
  if (THREE.ShapeUtils.isClockWise(v2)) v2.reverse();
  const tris = THREE.ShapeUtils.triangulateShape(v2, []);
  const pos: number[] = [];
  const to3 = (p: THREE.Vector2) => {
    if (proj.kind === "sphere") {
      const z = Math.sqrt(Math.max(0.02, 1 - p.x * p.x - p.y * p.y));
      const v = new THREE.Vector3(p.x, p.y, z).normalize().multiplyScalar(1 + lift);
      return v;
    }
    return new THREE.Vector3(p.x * (proj.sx ?? 1), p.y * (proj.sy ?? 1), proj.z + lift);
  };
  for (const t of tris) for (const i of t) {
    const v = to3(v2[i]);
    pos.push(v.x, v.y, v.z);
  }
  g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  GEO.set(k, g);
  return g;
};

export const D: React.FC<{ k: string; c: P2[]; proj: Proj; lift: number; color: string; opacity?: number }> = ({ k, c, proj, lift, color, opacity = 1 }) => (
  <mesh geometry={shapeGeo(k, c, proj, lift)} material={decal(color, opacity)} renderOrder={2} />
);

export type FaceLayout = {
  eyeX: number;
  eyeY: number;
  browY: number;
  mouthY: number;
  /** overall feature scale */
  s: number;
  ink: string;
  brow: string;
  blushX?: number;
  blushY?: number;
  /** eye size multiplier on top of the expression (Nora 1.17) */
  eyeScale?: number;
  /** small upper lashes on the outer corners (Nora) */
  lashes?: string;
  /** line-mouth colour (a subtle lip colour instead of ink) */
  lip?: string;
};
export const SPHERE_LAYOUT: FaceLayout = { eyeX: 0.34, eyeY: -0.02, browY: 0.27, mouthY: -0.38, s: 1, ink: "#1B1420", brow: "#2A1A14" };

const q = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Draw a face. `expr` picks from FACES; `blink` (0..1) closes dot eyes; `over` tweaks the face for one shot
 * (look direction etc.). Lift: features sit just above the surface (sphere radius 1 + lift).
 */
export const FaceFeatures: React.FC<{
  expr: Expr;
  blink?: number;
  over?: Partial<Face>;
  proj?: Proj;
  L?: Partial<FaceLayout>;
  /** cheek extras: freckles (Mika) */
  freckles?: string;
  blushColor?: string;
  skin?: string;
}> = ({ expr, blink = 0, over, proj = { kind: "sphere" }, L: Lp, freckles, blushColor = "#FF7F9A", skin = "#F2CBB0" }) => {
  const F: Face = { ...FACES[expr], ...over };
  const L = { ...SPHERE_LAYOUT, ...Lp };
  const s = L.s;
  const lift = proj.kind === "sphere" ? 0.012 : 0.004;
  const lift2 = lift * 2;
  const lift3 = lift * 3;
  const els: React.ReactNode[] = [];
  const look = F.look ?? [0, 0];
  const es = (F.eyeScale ?? 1) * s * (L.eyeScale ?? 1);

  // ----- eyes -----
  for (const side of [-1, 1]) {
    const cx = side * L.eyeX;
    const cy = L.eyeY;
    const id = `e${side}`;
    let kind = F.eyes;
    if (blink > 0.55 && (kind === "dot" || kind === "wide" || kind === "half")) kind = "closed";
    if (kind === "dot") {
      const ry = 0.105 * es * (1 - blink * 0.8);
      const lx = cx + look[0];
      const ly = cy + look[1];
      els.push(<D key={id} k={`dot${q(lx)}${q(ly)}${q(ry)}${q(es)}`} c={ellipse(lx, ly, 0.082 * es, ry)} proj={proj} lift={lift} color={L.ink} />);
      els.push(<D key={id + "s"} k={`shine${q(lx)}${q(ly)}${q(es)}`} c={ellipse(lx + 0.03 * es, ly + 0.045 * es, 0.026 * es, 0.028 * es, 12)} proj={proj} lift={lift2} color="#FFFFFF" />);
      if (L.lashes) {
        els.push(<D key={id + "s2"} k={`shine2${q(lx)}${q(ly)}${q(es)}`} c={ellipse(lx - 0.025 * es, ly - 0.045 * es, 0.012 * es, 0.012 * es, 8)} proj={proj} lift={lift2} color="#FFFFFF" />);
        for (let j = 0; j < 2; j++) {
          const ax = lx + side * (0.06 + j * 0.022) * es;
          const ay = ly + (0.08 - j * 0.035) * es * (1 - blink * 0.8);
          els.push(<D key={id + "la" + j} k={`lash${q(ax)}${q(ay)}${j}${side}`} c={stroke([[ax, ay], [ax + side * 0.035 * es, ay + 0.03 * es]], 0.016 * es)} proj={proj} lift={lift} color={L.lashes} />);
        }
      }
    } else if (kind === "wide") {
      els.push(<D key={id + "w"} k={`white${q(cx)}${q(cy)}${q(es)}`} c={ellipse(cx, cy + 0.01, 0.14 * es, 0.165 * es, 24)} proj={proj} lift={lift} color="#FFFDF6" />);
      els.push(<D key={id + "r"} k={`ring${q(cx)}${q(cy)}${q(es)}`} c={stroke(ellipse(cx, cy + 0.01, 0.14 * es, 0.165 * es, 24).concat([[cx + 0.14 * es, cy + 0.01]]), 0.022 * es)} proj={proj} lift={lift2} color={L.ink} />);
      const px = cx + look[0] * 0.6;
      const py = cy + look[1] * 0.6;
      els.push(<D key={id} k={`pup${q(px)}${q(py)}${q(es)}`} c={ellipse(px, py, 0.055 * es, 0.065 * es, 16)} proj={proj} lift={lift2} color={L.ink} />);
      els.push(<D key={id + "s"} k={`wsh${q(px)}${q(py)}${q(es)}`} c={ellipse(px + 0.02 * es, py + 0.03 * es, 0.018 * es, 0.018 * es, 10)} proj={proj} lift={lift3} color="#FFFFFF" />);
    } else if (kind === "happy") {
      const pts = curve(cx - 0.085 * es, cx + 0.085 * es, (x) => cy - 0.02 + 0.075 * es * (1 - ((x - cx) / (0.085 * es)) ** 2));
      els.push(<D key={id} k={`hap${q(cx)}${q(cy)}${q(es)}`} c={stroke(pts, 0.042 * es)} proj={proj} lift={lift} color={L.ink} />);
      if (L.lashes) els.push(<D key={id + "la"} k={`hlash${q(cx)}${q(cy)}${side}`} c={stroke([[cx + side * 0.08 * es, cy - 0.005], [cx + side * 0.115 * es, cy + 0.025]], 0.016 * es)} proj={proj} lift={lift} color={L.lashes} />);
    } else if (kind === "closed") {
      const pts = curve(cx - 0.08 * es, cx + 0.08 * es, (x) => cy - 0.015 - 0.03 * es * (1 - ((x - cx) / (0.08 * es)) ** 2));
      els.push(<D key={id} k={`cls${q(cx)}${q(cy)}${q(es)}`} c={stroke(pts, 0.036 * es)} proj={proj} lift={lift} color={L.ink} />);
      if (L.lashes) els.push(<D key={id + "la"} k={`clash${q(cx)}${q(cy)}${side}`} c={stroke([[cx + side * 0.075 * es, cy - 0.02], [cx + side * 0.11 * es, cy - 0.005]], 0.016 * es)} proj={proj} lift={lift} color={L.lashes} />);
    } else if (kind === "half") {
      const lx = cx + look[0];
      const ly = cy + look[1] - 0.02;
      els.push(<D key={id} k={`half${q(lx)}${q(ly)}${q(es)}`} c={ellipse(lx, ly, 0.085 * es, 0.07 * es, 16, Math.PI, Math.PI * 2)} proj={proj} lift={lift} color={L.ink} />);
      els.push(<D key={id + "l"} k={`lid${q(lx)}${q(ly)}${q(es)}`} c={stroke([[lx - 0.1 * es, ly + 0.005], [lx + 0.1 * es, ly + 0.005]], 0.034 * es)} proj={proj} lift={lift2} color={L.ink} />);
    }
  }

  // ----- brows -----
  for (const side of [-1, 1]) {
    const b = side < 0 ? F.browL : F.browR;
    const cx = side * L.eyeX;
    const cy = L.browY + b.y;
    const half = 0.1 * s;
    // inner end is towards the centre (x→0)
    const pts = curve(cx - half, cx + half, (x) => {
      const u = (x - cx) / half; // -1..1
      const inner = -side * u; // +1 at the inner end
      return cy + inner * b.rot * half * 0.9 + (b.curve ?? 0.02) * (1 - u * u);
    }, 10);
    els.push(<D key={`b${side}`} k={`brow${q(cx)}${q(cy)}${q(b.rot)}${q(b.curve ?? 0.02)}${q(s)}`} c={stroke(pts, 0.045 * s)} proj={proj} lift={lift} color={L.brow} />);
  }

  // ----- mouth -----
  const m = F.mouth;
  const my = L.mouthY + (m.y !== undefined ? m.y - SPHERE_LAYOUT.mouthY : 0);
  if (m.kind === "line") {
    const w = m.w * s;
    // curve > 0 lifts the corners (smile), < 0 drops them (frown)
    const pts2 = curve(-w, w, (x) => {
      const u = x / w;
      return my + m.curve * s * u * u + (m.asym ?? 0) * u * s * 0.6 + (m.wobble ?? 0) * Math.sin(u * Math.PI * 2.5);
    }, 16).map(([x, y]) => [x + (m.asym ?? 0) * 0.25, y] as P2);
    els.push(<D key="m" k={`ml${q(w)}${q(my)}${q(m.curve)}${q(m.asym ?? 0)}${q(m.wobble ?? 0)}`} c={stroke(pts2, 0.04 * s)} proj={proj} lift={lift} color={L.lip ?? L.ink} />);
  } else {
    const w = m.w * s;
    const h = m.h * s;
    const ox = (m.asym ?? 0) * s;
    let c: P2[];
    if (m.shape === "D") {
      // flat-ish top edge left→right, then the round bottom right→left
      c = [...curve(-w, w, (x) => my + 0.03 * s * (x / w) ** 2, 10).map(([x, y]) => [x + ox, y] as P2), ...ellipse(ox, my + 0.03 * s, w, h + 0.03 * s, 18, 0, -Math.PI).slice(1, -1)];
    } else if (m.shape === "O") {
      c = ellipse(ox, my, w, h, 20);
    } else {
      // wide, wobbly panic mouth
      const top = curve(-w, w, (x) => my + h * 0.5 + 0.015 * Math.sin((x / w) * Math.PI * 3), 14);
      const bot = curve(w, -w, (x) => my - h * 0.5 + 0.02 * Math.sin((x / w) * Math.PI * 3 + 1), 14);
      c = [...top, ...bot];
    }
    els.push(<D key="mo" k={`mo${m.shape}${q(w)}${q(h)}${q(my)}${q(ox)}`} c={c} proj={proj} lift={lift} color="#4A1626" />);
    if (m.tongue) {
      const ty = m.shape === "D" ? my - h * 0.62 : my - h * 0.45;
      els.push(<D key="tg" k={`tg${q(w)}${q(h)}${q(ty)}${q(ox)}`} c={ellipse(ox + w * 0.12, ty, w * 0.42, h * 0.3, 16)} proj={proj} lift={lift2} color="#FF6F86" />);
    }
    if (m.teeth) {
      const ty = m.shape === "D" ? my + 0.005 : my + h * 0.5 - 0.035 * s;
      els.push(<D key="th" k={`th${m.shape}${q(w)}${q(ty)}${q(ox)}`} c={[[ox - w * 0.62, ty], [ox + w * 0.62, ty], [ox + w * 0.55, ty - 0.05 * s], [ox - w * 0.55, ty - 0.05 * s]]} proj={proj} lift={lift2} color="#FFFFFF" />);
    }
  }

  // ----- blush -----
  const bl = F.blush ?? 0.18;
  if (bl > 0) {
    for (const side of [-1, 1]) {
      const bx = side * (L.blushX ?? 0.56);
      const by = L.blushY ?? -0.22;
      els.push(<D key={`bl${side}`} k={`bl${q(bx)}${q(by)}${q(s)}`} c={ellipse(bx, by, 0.13 * s, 0.07 * s, 18)} proj={proj} lift={lift * 0.6} color={blushColor} opacity={Math.min(0.85, 0.25 + bl * 0.55)} />);
      if (bl > 0.8) {
        for (let i = 0; i < 3; i++) {
          const x0 = bx - 0.07 * s + i * 0.055 * s;
          els.push(<D key={`bll${side}${i}`} k={`bll${q(x0)}${q(by)}${q(s)}`} c={stroke([[x0, by - 0.035 * s], [x0 + 0.03 * s, by + 0.035 * s]], 0.018 * s)} proj={proj} lift={lift2} color="#D9476A" />);
        }
      }
    }
  }

  // ----- freckles -----
  if (freckles) {
    const spots: P2[] = [[-0.5, -0.12], [-0.42, -0.2], [-0.58, -0.25], [-0.36, -0.13], [0.5, -0.12], [0.42, -0.2], [0.58, -0.25], [0.36, -0.13], [-0.08, -0.16], [0.08, -0.17]];
    spots.forEach(([x, y], i) => els.push(<D key={`fr${i}`} k={`fr${i}${q(s)}`} c={ellipse(x * s, y * s, 0.018 * s, 0.017 * s, 8)} proj={proj} lift={lift2} color={freckles} opacity={0.85} />));
  }
  void skin;

  return <>{els}</>;
};

/** a 3D sweat drop (light blue, glossy-ish), anchored in head space */
export const SweatDrops: React.FC<{ n: number; t: number; R: number }> = ({ n, t, R }) => {
  if (!n) return null;
  const spots: [number, number, number][] = [
    [0.86, 0.42, 0.42],
    [-0.88, 0.3, 0.42],
  ];
  return (
    <>
      {spots.slice(0, n).map((s, i) => {
        const slide = ((t * 0.02 + i * 0.4) % 1) * 0.12;
        return (
          <group key={i} position={[s[0] * R, (s[1] - slide) * R, s[2] * R]} scale={R * 0.13}>
            <mesh material={matte("#9FE3FF", 0.3, { flat: false })}>
              <sphereGeometry args={[0.5, 12, 10]} />
            </mesh>
            <mesh position={[0, 0.55, 0]} material={matte("#9FE3FF", 0.3, { flat: false })}>
              <coneGeometry args={[0.43, 0.75, 12]} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};
