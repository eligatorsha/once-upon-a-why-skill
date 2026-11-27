// ONCE UPON A WHY: the shared toy body (bible §5 "Rig"). About 3 heads tall: feet at y = 0, hips 0.5,
// shoulders 0.86, head centre 1.22 (radius 0.29). The character faces +z (towards camera at rotation 0).
// Character's LEFT = +x. Poses are plain numbers (radians), so episodes can tween them.
import React from "react";
import * as THREE from "three";

export const BODY = {
  hipY: 0.5,
  hipX: 0.085,
  thigh: 0.25,
  shin: 0.21,
  shoulderY: 0.855,
  shoulderX: 0.165,
  upper: 0.19,
  fore: 0.17,
  neckY: 0.9,
  headY: 1.22,
  headR: 0.29,
};

export type Arm = {
  /** forward raise (+ = forward) */
  sx: number;
  /** out to the side (+ = away from the body) */
  sz: number;
  /** twist about the arm (rarely needed) */
  sy?: number;
  /** elbow bend (+ = forearm forward/up) */
  el: number;
  /** elbow bend sideways (hand towards the chest) */
  ez?: number;
};
export type Leg = { hip: number; knee: number; out?: number };
export type Pose = {
  /** torso forward lean (+ = forward) */
  lean: number;
  /** torso side tilt (+ = towards its left) */
  side: number;
  /** torso twist about y */
  twist: number;
  /** head rotation [nod (+ down), turn (+ to its left), tilt (+ to its left)] */
  head: [number, number, number];
  armL: Arm;
  armR: Arm;
  legL: Leg;
  legR: Leg;
  /** vertical offset of the whole body */
  bob: number;
  /** squash and stretch: 1 = rest, < 1 squashed, > 1 stretched (volume kept) */
  squash: number;
  /** hips drop (sitting / crouching), in units */
  drop?: number;
};

export const REST: Pose = {
  lean: 0,
  side: 0,
  twist: 0,
  head: [0, 0, 0],
  armL: { sx: 0.05, sz: 0.12, el: 0.18 },
  armR: { sx: 0.05, sz: 0.12, el: 0.18 },
  legL: { hip: 0, knee: 0 },
  legR: { hip: 0, knee: 0 },
  bob: 0,
  squash: 1,
};

export type PosePatch = Partial<Omit<Pose, "armL" | "armR" | "legL" | "legR">> & { armL?: Partial<Arm>; armR?: Partial<Arm>; legL?: Partial<Leg>; legR?: Partial<Leg> };
export const pose = (p: PosePatch = {}, base: Pose = REST): Pose => ({
  ...base,
  ...p,
  head: p.head ?? base.head,
  armL: { ...base.armL, ...p.armL },
  armR: { ...base.armR, ...p.armR },
  legL: { ...base.legL, ...p.legL },
  legR: { ...base.legR, ...p.legR },
});

const mixN = (a: number, b: number, t: number) => a + (b - a) * t;
const mixArm = (a: Arm, b: Arm, t: number): Arm => ({ sx: mixN(a.sx, b.sx, t), sz: mixN(a.sz, b.sz, t), sy: mixN(a.sy ?? 0, b.sy ?? 0, t), el: mixN(a.el, b.el, t), ez: mixN(a.ez ?? 0, b.ez ?? 0, t) });
const mixLeg = (a: Leg, b: Leg, t: number): Leg => ({ hip: mixN(a.hip, b.hip, t), knee: mixN(a.knee, b.knee, t), out: mixN(a.out ?? 0, b.out ?? 0, t) });
/** blend two poses (for tweening between key poses) */
export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  lean: mixN(a.lean, b.lean, t),
  side: mixN(a.side, b.side, t),
  twist: mixN(a.twist, b.twist, t),
  head: [mixN(a.head[0], b.head[0], t), mixN(a.head[1], b.head[1], t), mixN(a.head[2], b.head[2], t)],
  armL: mixArm(a.armL, b.armL, t),
  armR: mixArm(a.armR, b.armR, t),
  legL: mixLeg(a.legL, b.legL, t),
  legR: mixLeg(a.legR, b.legR, t),
  bob: mixN(a.bob, b.bob, t),
  squash: mixN(a.squash, b.squash, t),
  drop: mixN(a.drop ?? 0, b.drop ?? 0, t),
});

/** run cycle (Mika's default way to arrive). phase in cycles; one stride ≈ 0.5 units */
export const runPose = (phase: number, k = 1): Pose => {
  const a = phase * Math.PI * 2;
  const s = Math.sin(a);
  const c = Math.cos(a);
  return pose({
    lean: 0.22 * k,
    head: [-0.12 * k, 0, 0.04 * s * k],
    armL: { sx: -0.9 * s * k, sz: 0.2, el: 1.35 },
    armR: { sx: 0.9 * s * k, sz: 0.2, el: 1.35 },
    legL: { hip: 0.85 * s * k, knee: (0.35 + 0.75 * Math.max(0, -c)) * k },
    legR: { hip: -0.85 * s * k, knee: (0.35 + 0.75 * Math.max(0, c)) * k },
    bob: 0.05 * Math.abs(Math.sin(a)) * k,
    squash: 1 + 0.04 * Math.cos(a * 2) * k,
  });
};

/** walk cycle */
export const walkPose = (phase: number, k = 1): Pose => {
  const a = phase * Math.PI * 2;
  const s = Math.sin(a);
  return pose({
    lean: 0.05,
    armL: { sx: -0.35 * s * k, sz: 0.12, el: 0.3 },
    armR: { sx: 0.35 * s * k, sz: 0.12, el: 0.3 },
    legL: { hip: 0.42 * s * k, knee: 0.25 * Math.max(0, -Math.cos(a)) * k + 0.05 },
    legR: { hip: -0.42 * s * k, knee: 0.25 * Math.max(0, Math.cos(a)) * k + 0.05 },
    bob: 0.018 * Math.abs(Math.sin(a)),
  });
};

/** idle breathing on top of any pose (t in frames) */
export const breathe = (p: Pose, t: number, amt = 1): Pose => ({
  ...p,
  bob: p.bob + Math.sin(t * 0.09) * 0.004 * amt,
  head: [p.head[0] + Math.sin(t * 0.07 + 1) * 0.015 * amt, p.head[1] + Math.sin(t * 0.045) * 0.02 * amt, p.head[2]],
  armL: { ...p.armL, sz: p.armL.sz + Math.sin(t * 0.09) * 0.012 * amt },
  armR: { ...p.armR, sz: p.armR.sz + Math.sin(t * 0.09) * 0.012 * amt },
});

/** body part renderers each character provides */
export type Parts = {
  torso: React.ReactNode;
  /** rendered inside the head group (origin = head centre, unscaled) */
  head: React.ReactNode;
  neck?: React.ReactNode;
  upperArm: (side: 1 | -1) => React.ReactNode;
  foreArm: (side: 1 | -1) => React.ReactNode;
  hand: (side: 1 | -1) => React.ReactNode;
  thigh: (side: 1 | -1) => React.ReactNode;
  shin: (side: 1 | -1) => React.ReactNode;
  foot: (side: 1 | -1) => React.ReactNode;
  /** things on the torso that move with it (bag strap, headphones, lapels) */
  onTorso?: React.ReactNode;
  /** props held in the hands (origin = palm centre) */
  holdL?: React.ReactNode;
  holdR?: React.ReactNode;
  /** things hanging from the hips (cassette player, bag) */
  onHips?: React.ReactNode;
};

const ArmChain: React.FC<{ side: 1 | -1; a: Arm; parts: Parts }> = ({ side, a, parts }) => (
  <group position={[side * BODY.shoulderX, BODY.shoulderY - BODY.hipY, 0]} rotation={new THREE.Euler(-a.sx, side * (a.sy ?? 0), side * a.sz, "XYZ")}>
    {parts.upperArm(side)}
    <group position={[0, -BODY.upper, 0]} rotation={new THREE.Euler(-a.el, 0, -side * (a.ez ?? 0), "XYZ")}>
      {parts.foreArm(side)}
      <group position={[0, -BODY.fore, 0]}>
        {parts.hand(side)}
        {side === 1 ? parts.holdL : parts.holdR}
      </group>
    </group>
  </group>
);

const LegChain: React.FC<{ side: 1 | -1; l: Leg; parts: Parts }> = ({ side, l, parts }) => (
  <group position={[side * BODY.hipX, 0, 0]} rotation={[-l.hip, 0, side * (l.out ?? 0)]}>
    {parts.thigh(side)}
    <group position={[0, -BODY.thigh, 0]} rotation={[l.knee, 0, 0]}>
      {parts.shin(side)}
      <group position={[0, -BODY.shin, 0]} rotation={[-l.knee * 0.35 + l.hip * 0.25, 0, 0]}>
        {parts.foot(side)}
      </group>
    </group>
  </group>
);

/** the toy body. Put it in a group positioned on the floor; rotate that group to face the camera or not. */
export const Body: React.FC<{ p: Pose; parts: Parts; shadow?: boolean }> = ({ p, parts }) => {
  const sq = p.squash;
  const sx = 1 / Math.sqrt(sq);
  const drop = p.drop ?? 0;
  return (
    <group scale={[sx, sq, sx]}>
      <group position={[0, BODY.hipY + p.bob - drop, 0]}>
        <LegChain side={1} l={p.legL} parts={parts} />
        <LegChain side={-1} l={p.legR} parts={parts} />
        {parts.onHips}
        {/* torso pivots at the hips */}
        <group rotation={new THREE.Euler(p.lean, p.twist, -p.side, "YXZ")}>
          {parts.torso}
          {parts.onTorso}
          <ArmChain side={1} a={p.armL} parts={parts} />
          <ArmChain side={-1} a={p.armR} parts={parts} />
          {parts.neck}
          <group position={[0, BODY.headY - BODY.hipY, 0]} rotation={new THREE.Euler(p.head[0], p.head[1], -p.head[2], "YXZ")}>
            {parts.head}
          </group>
        </group>
      </group>
    </group>
  );
};

// ---------- shared low-poly part geometry ----------
const G = new Map<string, THREE.BufferGeometry>();
export const geo = <T extends THREE.BufferGeometry>(key: string, make: () => T): T => {
  let g = G.get(key);
  if (!g) {
    g = make();
    G.set(key, g);
  }
  return g as T;
};

/** a limb segment hanging down from its pivot: capsule of radius r and length len */
export const limbGeo = (r: number, len: number, r2 = r) =>
  geo(`limb${r}|${len}|${r2}`, () => {
    if (r2 === r) {
      const g = new THREE.CapsuleGeometry(r, Math.max(0.001, len - r * 0.4), 3, 9);
      g.translate(0, -len / 2, 0);
      return g;
    }
    const g = new THREE.CylinderGeometry(r, r2, len, 9, 1);
    g.translate(0, -len / 2, 0);
    return g;
  });

/** low-poly sphere with gentle facets */
export const ballGeo = (r: number, detail = 2) => geo(`ball${r}|${detail}`, () => new THREE.IcosahedronGeometry(r, detail));

/** lathe from a profile of [radius, y] points */
export const latheGeo = (key: string, prof: [number, number][], seg = 14, phiStart = 0, phiLen = Math.PI * 2) =>
  geo(`lathe${key}`, () => new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), seg, phiStart, phiLen));

/** a tube along points (straps, cables) — NOT cached (it moves) unless key given */
export const tubeGeo = (pts: THREE.Vector3[], r: number, seg = 24, key?: string) => {
  const make = () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 6, false);
  return key ? geo(`tube${key}`, make) : make();
};
