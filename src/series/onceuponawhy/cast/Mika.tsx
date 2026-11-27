// ONCE UPON A WHY: MIKA, the chaotic one (bible §5.1). LOCKED DESIGN — never redesign.
// Brown curly hair in a messy bun with a pencil stuck through it, freckles, big open smile. Colour-block
// windbreaker (cherry red / mustard / teal), navy leggings, pink ribbed leg warmers, mismatched sneakers
// (her LEFT green, her RIGHT pink). Headphones round her neck wired to a cassette player clipped at her right hip.
// A canvas tote on her left shoulder, always spilling papers; Claude rides in it.
import React from "react";
import * as THREE from "three";
import { hash, matte, paint, painted } from "../look/mat";
import { PAL } from "../palette";
import { CFace, Claude, ClaudeProp } from "./Claude";
import { Expr, Face, FaceFeatures, SweatDrops, FACES, blinkAt } from "./face";
import { CassettePlayer, Paper, Phone } from "./props";
import { BODY, Body, Pose, REST, ballGeo, geo, limbGeo, tubeGeo } from "./rig";

export const MIKA = {
  skin: "#EDB892",
  freckles: "#A8603C",
  hair: "#6B3A22",
  hairLight: "#83492B",
  red: PAL.mika,
  mustard: "#E8B23A",
  teal: "#1FA6A0",
  leggings: "#2B2F5E",
  warmers: "#F59BC0",
  shoeL: "#43C27A",
  shoeR: "#FF7FB2",
  bag: "#EBDDBF",
};

const R = BODY.headR;

// ---------- hair ----------
type Curl = { d: THREE.Vector3; r: number; ph: number };
const CURLS: Curl[] = (() => {
  const out: Curl[] = [];
  let i = 0;
  while (out.length < 34 && i < 400) {
    i++;
    const u = hash(i * 1.7);
    const v = hash(i * 3.3);
    const th = u * Math.PI * 2;
    const y = v * 1.5 - 0.55; // -0.55..0.95
    const rr = Math.sqrt(Math.max(0, 1 - y * y));
    const d = new THREE.Vector3(Math.sin(th) * rr, y, Math.cos(th) * rr);
    // keep the face clear: no curls in front below the hairline
    if (d.z > 0.35 && d.y < 0.62) continue;
    if (d.z > 0.1 && d.y < 0.2 && Math.abs(d.x) < 0.8) continue;
    out.push({ d, r: 0.2 + hash(i * 5.1) * 0.1, ph: hash(i * 7.9) * 6.28 });
  }
  return out;
})();
// loose curls framing the face (they bounce most)
const FRAME_CURLS: { p: [number, number, number]; r: number; ph: number }[] = [
  { p: [-0.82, 0.38, 0.5], r: 0.17, ph: 0 },
  { p: [-0.92, 0.05, 0.35], r: 0.15, ph: 1.3 },
  { p: [-0.9, -0.25, 0.2], r: 0.13, ph: 2.1 },
  { p: [0.84, 0.36, 0.5], r: 0.17, ph: 0.7 },
  { p: [0.93, 0.03, 0.33], r: 0.15, ph: 2.6 },
  { p: [0.88, -0.27, 0.18], r: 0.13, ph: 3.4 },
  { p: [-0.35, 0.74, 0.62], r: 0.18, ph: 4 },
  { p: [0.2, 0.8, 0.6], r: 0.17, ph: 5 },
  { p: [-0.05, 0.83, 0.55], r: 0.15, ph: 1.9 },
];

// fly-away curls for the messy (just woke up) state: off the cap, never over the face
const MESSY_CURLS: { p: [number, number, number]; r: number; ph: number }[] = [
  { p: [-0.72, 0.92, 0.1], r: 0.2, ph: 0.4 },
  { p: [0.78, 0.86, -0.05], r: 0.19, ph: 1.7 },
  { p: [-1.08, 0.42, -0.2], r: 0.17, ph: 2.9 },
  { p: [1.1, 0.5, -0.25], r: 0.18, ph: 0.9 },
  { p: [0.35, 1.12, 0.2], r: 0.16, ph: 3.6 },
  { p: [-0.4, 1.1, -0.35], r: 0.17, ph: 5.1 },
  { p: [1.02, -0.05, -0.45], r: 0.15, ph: 4.2 },
  { p: [-1.0, 0.0, -0.5], r: 0.15, ph: 2.2 },
];

const MikaHair: React.FC<{ t: number; bounce: number; messy?: boolean }> = ({ t, bounce, messy = false }) => {
  const wob = (ph: number, k = 1) => Math.sin(t * 0.55 + ph) * 0.035 * bounce * k;
  return (
    <group>
      {/* cap: offset sphere gives a natural hairline at the front */}
      <mesh position={[0, 0.06, -0.1]} scale={1.05} geometry={ballGeo(1, 3)} material={matte(MIKA.hair, 0.88)} castShadow />
      {CURLS.map((c, i) => {
        const p = c.d.clone().multiplyScalar(1.02).add(new THREE.Vector3(0, 0.06, -0.1));
        return <mesh key={i} position={[p.x, p.y + wob(c.ph, 0.4), p.z]} scale={c.r} geometry={ballGeo(1, 1)} material={matte(i % 3 === 0 ? MIKA.hairLight : MIKA.hair, 0.9)} castShadow />;
      })}
      {FRAME_CURLS.map((c, i) => (
        <mesh key={`f${i}`} position={[c.p[0] + wob(c.ph, 0.5), c.p[1] + wob(c.ph + 1, 1.4), c.p[2]]} scale={c.r} geometry={ballGeo(1, 1)} material={matte(i % 2 ? MIKA.hairLight : MIKA.hair, 0.9)} castShadow />
      ))}
      {messy
        ? MESSY_CURLS.map((c, i) => (
            <mesh key={`m${i}`} position={[c.p[0] + wob(c.ph, 0.6), c.p[1] + wob(c.ph + 1, 1.2), c.p[2]]} scale={c.r} geometry={ballGeo(1, 1)} material={matte(i % 2 ? MIKA.hairLight : MIKA.hair, 0.9)} castShadow />
          ))
        : null}
      {/* messy bun, top-back, with a pencil through it (knocked sideways when she's just woken up) */}
      <group position={[0.05 + (messy ? 0.28 : 0), 1.0 + wob(0.5, 1.2) - (messy ? 0.1 : 0), -0.32]} rotation={[0.3, 0, wob(2, 2) + (messy ? -0.55 : 0)]}>
        {[
          [0, 0, 0, 0.36],
          [0.22, 0.08, 0.05, 0.24],
          [-0.2, 0.1, 0.06, 0.25],
          [0.05, 0.28, -0.02, 0.24],
          [-0.08, 0.12, 0.24, 0.2],
          [0.12, -0.05, -0.22, 0.22],
          [0.3, 0.3, 0.1, 0.14],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} scale={r} geometry={ballGeo(1, 1)} material={matte(i % 2 ? MIKA.hairLight : MIKA.hair, 0.9)} castShadow />
        ))}
        {/* the pencil */}
        <group rotation={[0.25, 0.2, -0.95]}>
          <mesh material={matte("#F6C343", 0.7)}>
            <cylinderGeometry args={[0.055, 0.055, 1.15, 6]} />
          </mesh>
          <mesh position={[0, 0.6, 0]} material={matte("#C9CDD6", 0.4, { metal: 0.6 })}>
            <cylinderGeometry args={[0.058, 0.058, 0.08, 6]} />
          </mesh>
          <mesh position={[0, 0.69, 0]} material={matte("#FF8FA8", 0.85)}>
            <cylinderGeometry args={[0.055, 0.055, 0.12, 6]} />
          </mesh>
          <mesh position={[0, -0.645, 0]} rotation={[Math.PI, 0, 0]} material={matte("#E9C79A", 0.85)}>
            <coneGeometry args={[0.055, 0.14, 6]} />
          </mesh>
          <mesh position={[0, -0.73, 0]} rotation={[Math.PI, 0, 0]} material={matte("#2A2430", 0.6)}>
            <coneGeometry args={[0.02, 0.05, 6]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// ---------- body geometry ----------
const jacketGeo = () =>
  geo("mikaJacket", () =>
    paint(
      new THREE.LatheGeometry(
        [
          [0.001, -0.06],
          [0.175, -0.06],
          [0.2, -0.02],
          [0.205, 0.08],
          [0.2, 0.2],
          [0.19, 0.29],
          [0.16, 0.35],
          [0.1, 0.395],
          [0.05, 0.41],
          [0.001, 0.41],
        ].map(([r, y]) => new THREE.Vector2(r, y)),
        12,
      ),
      (x, y, z) => {
        // diagonal colour blocks: red shoulders, mustard band, teal hem
        const d = y + x * 0.35;
        if (y < -0.02) return MIKA.teal;
        if (d > 0.2) return MIKA.red;
        if (d > 0.11) return MIKA.mustard;
        void z;
        return MIKA.teal;
      },
    ),
  );

const warmerGeo = () =>
  geo("mikaWarmer", () =>
    paint(new THREE.CylinderGeometry(0.075, 0.07, 0.17, 10, 6), (x, y) => (Math.floor((y + 0.2) * 40) % 2 ? MIKA.warmers : "#E9879F")),
  );

const shoeGeo = () =>
  geo("mikaShoe", () => {
    const g = new THREE.CapsuleGeometry(0.06, 0.09, 3, 8);
    g.rotateX(Math.PI / 2);
    g.scale(1, 0.75, 1);
    g.translate(0, 0.0, 0.035);
    return g;
  });

export type MikaProps = {
  p?: Pose;
  expr?: Expr;
  over?: Partial<Face>;
  t?: number;
  /** secondary motion amount: curls, bag, cable (0 still … 1 running) */
  bounce?: number;
  /** extra bag swing angle (radians) */
  swing?: number;
  /** Claude in the tote: 0 hidden … 1 fully popped out */
  claudePop?: number;
  claudeExpr?: Expr;
  claudeWave?: number;
  /** how many papers still poke out of the tote (0–5) */
  papers?: number;
  holdR?: "phone" | null;
  /** headphones on her ears instead of round her neck */
  headphonesOn?: boolean;
  /** just-woken-up hair: fly-away curls, bun knocked sideways (same locked design) */
  messy?: boolean;
  /** hand shapes: "thumb" = fist with the thumb up, "fist" */
  handL?: "thumb" | "fist" | null;
  handR?: "thumb" | "fist" | null;
  /** Claude in the tote: extra controls */
  claude?: { prop?: ClaudeProp; squash?: number; tilt?: [number, number]; face?: Partial<CFace>; frontLegs?: { up: number; clap: number }; lift?: number };
};

export const Mika: React.FC<MikaProps> = ({ p = REST, expr = "happy", over, t = 0, bounce = 0.3, swing = 0, claudePop = 0, claudeExpr = "happy", claudeWave = 0, papers = 4, holdR = null, headphonesOn = false, messy = false, handL = null, handR = null, claude }) => {
  const blink = blinkAt(t, 1);
  const F = { ...FACES[expr], ...over };
  const sw = swing + Math.sin(t * 0.45) * 0.06 * bounce;
  const cableSway = Math.sin(t * 0.3) * 0.03 + sw * 0.1;

  const skin = matte(MIKA.skin, 0.78);
  const head = (
    <group>
      <group scale={[R * 1.04, R * 0.97, R]}>
        <mesh geometry={ballGeo(1, 5)} material={skin} castShadow receiveShadow />
        {/* nose bump */}
        <mesh position={[0, -0.16, 0.97]} scale={[0.1, 0.08, 0.07]} geometry={ballGeo(1, 1)} material={skin} />
        <FaceFeatures expr={expr} over={over} blink={blink} freckles={MIKA.freckles} L={{ brow: "#4A2616" }} blushColor="#FF7F8A" />
        <MikaHair t={t} bounce={bounce} messy={messy} />
        {headphonesOn ? (
          <>
            <mesh position={[0, 0.25, -0.05]} rotation={[0, Math.PI / 2, 0]} material={matte("#C9CDD6", 0.4, { metal: 0.5 })}>
              <torusGeometry args={[1.18, 0.05, 5, 20, Math.PI]} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 1.12, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={matte("#FF8A4C", 0.9)}>
                <cylinderGeometry args={[0.3, 0.3, 0.16, 10]} />
              </mesh>
            ))}
          </>
        ) : null}
      </group>
      <SweatDrops n={F.sweat ?? 0} t={t} R={R} />
    </group>
  );

  const parts = {
    torso: <mesh geometry={jacketGeo()} material={painted(0.85)} castShadow receiveShadow />,
    neck: (
      <>
        <mesh position={[0, 0.43, 0]} material={skin}>
          <cylinderGeometry args={[0.05, 0.055, 0.08, 8]} />
        </mesh>
        {/* collar */}
        <mesh position={[0, 0.395, 0]} rotation={[Math.PI / 2, 0, 0]} material={matte(MIKA.red, 0.85)}>
          <torusGeometry args={[0.075, 0.026, 6, 12]} />
        </mesh>
        {/* zip */}
        <mesh position={[0, 0.17, 0.2]} rotation={[0.05, 0, 0]} material={matte("#F4E2C4", 0.6)}>
          <boxGeometry args={[0.012, 0.36, 0.01]} />
        </mesh>
      </>
    ),
    onTorso: (
      <>
        {/* headphones round the neck */}
        {!headphonesOn ? (
          <group position={[0, 0.37, 0.01]}>
            <mesh rotation={[Math.PI / 2 + 0.35, 0, 0]} material={matte("#C9CDD6", 0.4, { metal: 0.5 })}>
              <torusGeometry args={[0.13, 0.012, 5, 16, Math.PI]} />
            </mesh>
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 0.125, -0.035, 0.06]} rotation={[0.3, s * 0.5, s * 0.2]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={matte("#FF8A4C", 0.95)}>
                  <cylinderGeometry args={[0.052, 0.052, 0.03, 10]} />
                </mesh>
                <mesh position={[0, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]} material={matte("#C9CDD6", 0.4, { metal: 0.5 })}>
                  <cylinderGeometry args={[0.045, 0.045, 0.014, 10]} />
                </mesh>
              </group>
            ))}
          </group>
        ) : null}
        {/* headphone cable: left cup → down the front → player at her right hip */}
        <mesh
          geometry={tubeGeo(
            [
              new THREE.Vector3(0.12, 0.31, 0.1),
              new THREE.Vector3(0.06 + cableSway, 0.2, 0.22),
              new THREE.Vector3(-0.04 + cableSway * 1.5, 0.08, 0.225),
              new THREE.Vector3(-0.12 + cableSway, 0.0, 0.2),
              new THREE.Vector3(-0.17, -0.02, 0.16),
            ],
            0.006,
            20,
          )}
          material={matte("#2A2340", 0.6)}
        />
        <group position={[-0.19, -0.04, 0.13]} rotation={[0, -0.7, 0.05]}>
          <CassettePlayer />
        </group>
        {/* tote on her left shoulder */}
        <group position={[0.2, 0.36, -0.02]} rotation={[0, 0, sw * 0.6]}>
          <mesh geometry={tubeGeo([new THREE.Vector3(-0.03, 0.01, 0.08), new THREE.Vector3(0.04, 0.02, 0.06), new THREE.Vector3(0.1, -0.1, 0.06), new THREE.Vector3(0.12, -0.32, 0.07)], 0.014, 14, "mikaStrapF")} material={matte(MIKA.bag, 0.9)} />
          <mesh geometry={tubeGeo([new THREE.Vector3(-0.03, 0.01, -0.08), new THREE.Vector3(0.04, 0.02, -0.08), new THREE.Vector3(0.1, -0.1, -0.08), new THREE.Vector3(0.12, -0.32, -0.08)], 0.014, 14, "mikaStrapB")} material={matte(MIKA.bag, 0.9)} />
          <group position={[0.19, -0.5, -0.07]} rotation={[0, -0.12, 0]}>
            <Tote papers={papers} t={t} claudePop={claudePop} claudeExpr={claudeExpr} claudeWave={claudeWave} claude={claude} />
          </group>
        </group>
      </>
    ),
    upperArm: () => <mesh geometry={limbGeo(0.058, BODY.upper)} material={matte(MIKA.red, 0.85)} castShadow />,
    foreArm: () => (
      <>
        <mesh geometry={limbGeo(0.052, BODY.fore)} material={matte(MIKA.mustard, 0.85)} castShadow />
        <mesh position={[0, -BODY.fore + 0.02, 0]} material={matte(MIKA.teal, 0.85)}>
          <cylinderGeometry args={[0.055, 0.055, 0.04, 9]} />
        </mesh>
      </>
    ),
    hand: (side: 1 | -1) => {
      const shape = side === 1 ? handL : handR;
      return (
        <group>
          <mesh position={[0, -0.045, 0]} scale={shape ? [1, 0.92, 0.95] : 1} geometry={ballGeo(0.055, 1)} material={skin} castShadow />
          {shape === "thumb" ? (
            // the thumb sticks up from the fist (the fist's top faces the camera when the forearm points up)
            <mesh position={[side * 0.01, -0.1, 0.012]} material={skin} castShadow>
              <capsuleGeometry args={[0.022, 0.05, 3, 8]} />
            </mesh>
          ) : null}
        </group>
      );
    },
    holdR:
      holdR === "phone" ? (
        <group position={[0, -0.07, 0.04]} rotation={[-0.4, 0, 0]}>
          <Phone />
        </group>
      ) : null,
    thigh: () => <mesh geometry={limbGeo(0.07, BODY.thigh)} material={matte(MIKA.leggings, 0.85)} castShadow />,
    shin: () => (
      <>
        <mesh geometry={limbGeo(0.06, BODY.shin)} material={matte(MIKA.leggings, 0.85)} castShadow />
        <mesh position={[0, -0.12, 0]} geometry={warmerGeo()} material={painted(0.95)} castShadow />
      </>
    ),
    foot: (side: 1 | -1) => (
      <group position={[0, -0.02, 0]}>
        <mesh geometry={shoeGeo()} material={matte(side === 1 ? MIKA.shoeL : MIKA.shoeR, 0.75)} castShadow />
        <mesh position={[0, -0.04, 0.035]} scale={[1.05, 0.25, 1.02]} geometry={shoeGeo()} material={matte("#FFF6EA", 0.8)} />
      </group>
    ),
    head,
  };
  return <Body p={p} parts={parts} />;
};

/** the canvas tote: open top, papers spilling, Claude can pop out of it. Origin = bag centre. */
export const Tote: React.FC<{ papers: number; t: number; claudePop: number; claudeExpr: Expr; claudeWave: number; claude?: MikaProps["claude"] }> = ({ papers, t, claudePop, claudeExpr, claudeWave, claude }) => {
  const W = 0.32;
  const H = 0.3;
  const pp: [number, number, number, number, number][] = [
    [-0.08, 0.17, 0.03, 0.25, 0.1],
    [0.06, 0.19, -0.02, -0.2, -0.05],
    [0.1, 0.15, 0.04, 0.45, 0.2],
    [-0.02, 0.21, -0.04, 0.05, -0.15],
    [-0.12, 0.13, -0.03, -0.5, 0.1],
  ];
  const pop = claudePop;
  return (
    <group>
      {/* bag body: open box, slightly tapered */}
      <mesh position={[0, 0, 0]} scale={[1, 1, 0.78]} castShadow receiveShadow material={matte(MIKA.bag, 0.95, { side: THREE.DoubleSide })}>
        <cylinderGeometry args={[W * 0.72, W * 0.66, H, 4, 1, true, Math.PI / 4]} />
      </mesh>
      <mesh position={[0, -H / 2, 0]} scale={[1, 1, 0.78]} rotation={[0, Math.PI / 4, 0]} material={matte("#D8C7A4", 0.95)}>
        <cylinderGeometry args={[W * 0.66, W * 0.66, 0.006, 4]} />
      </mesh>
      {/* a red stripe and a little patch */}
      <mesh position={[0, -0.04, 0.129]} material={matte(MIKA.red, 0.9)}>
        <boxGeometry args={[W * 0.98, 0.04, 0.004]} />
      </mesh>
      <mesh position={[0.07, 0.04, 0.132]} rotation={[0, 0, 0.2]} material={matte(MIKA.teal, 0.9)}>
        <circleGeometry args={[0.03, 6]} />
      </mesh>
      {pp.slice(0, papers).map(([x, y, z, rz, rx], i) => (
        <group key={i} position={[x, y - 0.06, z]} rotation={[rx, 0.1 * i, rz]}>
          <Paper i={i} />
        </group>
      ))}
      {pop > 0.001 ? (
        <group position={[0, -0.2 + pop * 0.4 + (claude?.lift ?? 0), 0.03]} rotation={[0.12 * pop, 0.35 * pop, 0]} scale={0.82}>
          <Claude
            t={t}
            expr={claudeExpr}
            wave={0}
            legs={false}
            prop={claude?.prop ?? null}
            face={claude?.face}
            frontLegs={claude?.frontLegs}
            tilt={[claude?.tilt?.[0] ?? 0, (claude?.tilt?.[1] ?? 0) + (claudeWave ? Math.sin(t * 0.5) * 0.18 : 0)]}
            squash={(1 + Math.sin(Math.min(1, pop) * Math.PI) * 0.12) * (claude?.squash ?? 1)}
          />
        </group>
      ) : null}
    </group>
  );
};
