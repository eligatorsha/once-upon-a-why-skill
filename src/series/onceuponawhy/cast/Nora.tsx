// ONCE UPON A WHY: NORA, the overthinker (bible §5.2). LOCKED v2 (restyle 2026-11-27).
// Sleek, glossy, straight black hair past the shoulders with soft curtain bangs (her left side tucked behind the ear),
// a softer face with bigger eyes, small lashes, light blush and a subtle lip colour. Thin glasses: GLASSES "oval"
// (gold) or "cateye" (honey tortoise with gold arms). Fitted cream blazer with clean shoulders over a black turtleneck,
// slim trousers, loafers, a small gold hoop earring and a delicate gold necklace. Same toy proportions as Mika.
// Props: the tabbed notebook, matcha thermos, a pen, the laptop. Body language: precise and still; pushes her
// glasses up when thinking; taps her pen when anxious.
import React from "react";
import * as THREE from "three";
import { canvasTex, matte, paint, painted } from "../look/mat";
import { PAL } from "../palette";
import { Expr, Face, FaceFeatures, SweatDrops, FACES, blinkAt } from "./face";
import { NotebookHeld, Pen, Thermos } from "./props";
import { BODY, Body, Pose, REST, geo, limbGeo } from "./rig";

export const NORA = {
  skin: "#F0C4A2",
  hair: "#141119",
  hairShine: "#4A4252",
  blazer: "#F3E8D6",
  blazerShade: "#E2D2B8",
  turtle: "#1C1A22",
  trousers: "#2C2A34",
  loafer: "#5C1A20",
  gold: "#D9B061",
  lip: "#B9556A",
};
export type GlassesStyle = "oval" | "cateye";

const R = BODY.headR;

// ---------- materials ----------
const strandTex = () =>
  canvasTex(
    "hairStrands",
    256,
    256,
    (g, w, h) => {
      g.fillStyle = "#808080";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        const x = (i / 260) * w;
        const v = 90 + ((i * 37) % 90);
        g.strokeStyle = `rgba(${v},${v},${v},0.55)`;
        g.lineWidth = 1 + ((i * 13) % 3);
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x + ((i * 7) % 5) - 2, h);
        g.stroke();
      }
    },
    { srgb: false, repeat: [6, 1] },
  );
let HAIR_M: THREE.MeshPhysicalMaterial | null = null;
/** glossy shaped hair: smooth normals, vertex-colour shine band, fine strand bump, a soft clearcoat */
const hairMat = () => {
  if (!HAIR_M) {
    HAIR_M = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.38,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
      bumpMap: strandTex(),
      bumpScale: 1.2,
      side: THREE.DoubleSide,
      envMapIntensity: 1.1,
    });
  }
  return HAIR_M;
};
let GOLD_M: THREE.MeshStandardMaterial | null = null;
const goldMat = () => (GOLD_M ??= new THREE.MeshStandardMaterial({ color: NORA.gold, metalness: 0.9, roughness: 0.28 }));

// ---------- hair geometry (head units: head radius 1, +x = her left, +z = face) ----------
/** a parametric shell around the head: phi (0 = front, + towards her left), v from the top edge to the bottom edge */
const shell = (key: string, o: { phi0: number; phi1: number; nP: number; nV: number; top: (p: number) => number; bottom: (p: number) => number; r: (y: number, p: number) => number }) =>
  geo(`norahair-${key}`, () => {
    const pos: number[] = [];
    const col: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    const c = new THREE.Color();
    for (let i = 0; i <= o.nP; i++) {
      const p = o.phi0 + ((o.phi1 - o.phi0) * i) / o.nP;
      const y0 = o.top(p);
      const y1 = o.bottom(p);
      for (let j = 0; j <= o.nV; j++) {
        const v = j / o.nV;
        const y = y0 + (y1 - y0) * v;
        const r = o.r(y, p);
        pos.push(r * Math.sin(p), y, r * Math.cos(p));
        // glossy shine band across the crown, a softer second band lower down
        const band = Math.exp(-(((y - 0.62) / 0.13) ** 2)) * 0.9 + Math.exp(-(((y + 0.9) / 0.25) ** 2)) * 0.25;
        c.set(NORA.hair).lerp(new THREE.Color(NORA.hairShine), Math.min(1, band));
        c.convertSRGBToLinear();
        col.push(c.r, c.g, c.b);
        uv.push(i / o.nP, v);
      }
    }
    const row = o.nV + 1;
    for (let i = 0; i < o.nP; i++)
      for (let j = 0; j < o.nV; j++) {
        const a = i * row + j;
        idx.push(a, a + 1, a + row, a + 1, a + row + 1, a + row);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  });

/** head-hugging radius that becomes a straight, slightly flared fall below the jaw */
const fallR = (y: number) => {
  if (y > 0) return Math.sqrt(Math.max(0.0004, 1.13 * 1.13 - y * y * 0.98)) + 0.0;
  if (y > -0.75) return 1.125 - 0.02 * (-y);
  const k = (-y - 0.75) / 1.1;
  return 1.11 + 0.16 * Math.min(1, k) + 0.04 * k * k;
};
const TUCK = 1.55; // her left side starts further back: tucked behind the ear
const mainHair = () =>
  shell("main", {
    phi0: TUCK,
    phi1: Math.PI * 2 - 0.92,
    nP: 48,
    nV: 40,
    top: () => 1.14,
    // longest at the back, a little shorter at the front edges; past the shoulders
    bottom: (p) => -1.95 + 0.18 * Math.max(0, Math.cos(p)),
    r: (y) => fallR(y),
  });
/** the tucked side above the ear (covers the top of her left side) */
const tuckHair = () =>
  shell("tuck", {
    phi0: 0.92,
    phi1: TUCK + 0.02,
    nP: 10,
    nV: 18,
    top: () => 1.14,
    bottom: (p) => 0.18 - (p - 0.92) * 0.25,
    r: (y) => fallR(y) + 0.005,
  });
/** soft curtain bangs: parted in the middle, sweeping down to the temples */
const bangs = (side: 1 | -1) =>
  shell(`bang${side}`, {
    phi0: side > 0 ? 0.05 : -1.08,
    phi1: side > 0 ? 1.08 : -0.05,
    nP: 18,
    nV: 16,
    top: () => 1.12,
    bottom: (p) => {
      const u = Math.min(1, Math.abs(p) / 1.08);
      // full curtain: high at the part, sweeping past the brows' outer ends down to the cheekbones
      return 0.56 - 0.62 * Math.pow(u, 1.5) + 0.04 * Math.sin(u * Math.PI);
    },
    r: (y, p) => fallR(y) + 0.035 + 0.03 * Math.sin(Math.min(1, Math.abs(p) / 1.08) * Math.PI) * (y < 0.6 ? 1 : 0.4),
  });

// ---------- head shape: a softer oval (narrower towards the chin) ----------
const softHeadGeo = () =>
  geo("noraHead", () => {
    const g = new THREE.SphereGeometry(1, 56, 40);
    const p = g.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      if (y < 0) {
        const k = 1 - 0.1 * Math.pow(-y, 1.6);
        p.setX(i, p.getX(i) * k);
        p.setZ(i, p.getZ(i) * (1 - 0.04 * Math.pow(-y, 1.6)));
      }
    }
    g.computeVertexNormals();
    return g;
  });

// ---------- glasses ----------
const catEyeGeo = () =>
  geo("noraCatEye", () => {
    // outer rim of one lens (her left lens; mirrored for the right): rounded bottom, outer top corner lifted
    const s = new THREE.Shape();
    const pts: [number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      let x = Math.cos(a) * 0.19;
      let y = Math.sin(a) * 0.13;
      if (y > 0 && x > 0) {
        y += 0.11 * Math.pow(x / 0.19, 2.5) * (y / 0.13);
        x += 0.05 * Math.pow(y / 0.15, 2);
      }
      if (y < 0) y *= 1.05;
      pts.push([x, y]);
    }
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    const hole = new THREE.Path();
    pts.map(([x, y]) => [x * 0.84, y * 0.8] as [number, number]).reverse().forEach(([x, y], i) => (i ? hole.lineTo(x, y) : hole.moveTo(x, y)));
    s.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 2, curveSegments: 8 });
    g.translate(0, 0, -0.015);
    return g;
  });

const Glasses: React.FC<{ style: GlassesStyle }> = ({ style }) => {
  const ex = 0.36;
  const ey = -0.02;
  const z = Math.sqrt(1 - ex * ex - ey * ey) + 0.1;
  const frame = style === "oval" ? goldMat() : matte("#3A1D12", 0.3, { flat: false });
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * ex, ey, z]} rotation={[0, s * 0.3, 0]} scale={[s, 1, 1]}>
          {style === "oval" ? (
            <mesh scale={[1, 0.74, 1]} material={goldMat()}>
              <torusGeometry args={[0.18, 0.016, 8, 40]} />
            </mesh>
          ) : (
            <mesh geometry={catEyeGeo()} material={frame} />
          )}
          {/* a faint lens */}
          <mesh scale={[1, style === "oval" ? 0.74 : 0.75, 1]}>
            <circleGeometry args={[0.17, 28]} />
            <meshPhysicalMaterial color="#FFFFFF" transparent opacity={0.08} roughness={0.05} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {/* bridge */}
      <mesh position={[0, 0.03, z + 0.025]} rotation={[0, 0, 0]} material={goldMat()}>
        <torusGeometry args={[0.08, 0.012, 6, 16, Math.PI]} />
      </mesh>
      {/* arms back to the ears */}
      {[-1, 1].map((s) => (
        <mesh key={`a${s}`} position={[s * 0.66, 0.03, 0.42]} rotation={[0, s * 0.95, 0]} material={goldMat()}>
          <boxGeometry args={[0.022, 0.025, 0.72]} />
        </mesh>
      ))}
    </group>
  );
};

// ---------- outfit ----------
const turtleGeo = () =>
  geo("noraTurtle2", () =>
    new THREE.LatheGeometry(
      [
        [0.001, -0.04],
        [0.15, -0.04],
        [0.155, 0.06],
        [0.145, 0.13],
        [0.16, 0.24],
        [0.16, 0.3],
        [0.12, 0.36],
        [0.06, 0.4],
        [0.001, 0.4],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      16,
    ),
  );
/** fitted blazer: nipped waist, clean squared shoulders, open front showing the turtleneck */
const blazerGeo = () =>
  geo("noraBlazer2", () =>
    paint(
      new THREE.LatheGeometry(
        [
          [0.172, -0.07],
          [0.17, -0.02],
          [0.163, 0.08],
          [0.168, 0.15],
          [0.182, 0.23],
          [0.192, 0.3],
          [0.194, 0.33],
          [0.15, 0.362],
          [0.088, 0.38],
        ].map(([r, y]) => new THREE.Vector2(r, y)),
        24,
        0.36,
        Math.PI * 2 - 0.72,
      ),
      (x, y) => (y < -0.055 ? NORA.blazerShade : NORA.blazer),
    ),
  );
const lapelGeo = () =>
  geo("noraLapel", () => {
    // a notched lapel, flat; her left (mirrored for the right)
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.045, 0.0);
    s.lineTo(0.06, 0.12);
    s.lineTo(0.035, 0.15);
    s.lineTo(0.05, 0.17);
    s.lineTo(0.03, 0.2);
    s.lineTo(0.0, 0.2);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: false });
    return g;
  });
const loaferGeo = () =>
  geo("noraLoafer", () => {
    const g = new THREE.CapsuleGeometry(0.05, 0.09, 3, 8);
    g.rotateX(Math.PI / 2);
    g.scale(1, 0.55, 1);
    g.translate(0, 0, 0.035);
    return g;
  });

export type NoraProps = {
  p?: Pose;
  expr?: Expr;
  over?: Partial<Face>;
  t?: number;
  /** secondary motion (hair sway, thermos slosh) */
  bounce?: number;
  glasses?: GlassesStyle;
  holdL?: "notebook" | "thermos" | null;
  holdR?: "pen" | "thermos" | null;
  /** pen tapping (anxious tic): 0 off … 1 tapping */
  tap?: number;
};

export const Nora: React.FC<NoraProps> = ({ p = REST, expr = "neutral", over, t = 0, bounce = 0.15, glasses = "oval", holdL = null, holdR = null, tap = 0 }) => {
  const blink = blinkAt(t, 4);
  const F = { ...FACES[expr], ...over };
  const sway = Math.sin(t * 0.18) * 0.015 * bounce;
  const skin = matte(NORA.skin, 0.72, { flat: false });
  const head = (
    <group>
      <group scale={[R * 1.02, R * 1.0, R * 0.98]}>
        <mesh geometry={softHeadGeo()} material={skin} castShadow receiveShadow />
        <mesh position={[0, -0.15, 0.96]} scale={[0.075, 0.065, 0.06]} material={skin}>
          <sphereGeometry args={[1, 12, 10]} />
        </mesh>
        {/* her left ear (the tucked side) with a small gold hoop */}
        <mesh position={[0.95, -0.08, 0.02]} scale={[0.1, 0.19, 0.12]} material={skin}>
          <sphereGeometry args={[1, 12, 10]} />
        </mesh>
        <mesh position={[0.99, -0.36, 0.06]} rotation={[0, Math.PI / 2 - 0.2, 0]} material={goldMat()}>
          <torusGeometry args={[0.085, 0.018, 8, 24]} />
        </mesh>
        <FaceFeatures
          expr={expr}
          over={over}
          blink={blink}
          L={{ eyeX: 0.36, eyeY: -0.02, browY: 0.3, brow: "#1A1418", s: 1, lashes: "#1B1420", lip: NORA.lip, eyeScale: 1.17 }}
          blushColor="#FF8FA0"
        />
        <group rotation={[0, 0, sway]}>
          <mesh geometry={mainHair()} material={hairMat()} castShadow />
          <mesh geometry={tuckHair()} material={hairMat()} castShadow />
          <mesh geometry={bangs(1)} material={hairMat()} castShadow />
          <mesh geometry={bangs(-1)} material={hairMat()} castShadow />
        </group>
        <Glasses style={glasses} />
      </group>
      <SweatDrops n={F.sweat ?? 0} t={t} R={R} />
    </group>
  );
  const tapA = tap > 0 ? Math.max(0, Math.sin(t * 1.3)) * 0.35 * tap : 0;
  const parts = {
    torso: (
      <>
        <mesh geometry={turtleGeo()} material={matte(NORA.turtle, 0.9, { flat: false })} castShadow />
        <mesh geometry={blazerGeo()} material={painted(0.8, THREE.DoubleSide)} castShadow receiveShadow />
        {/* clean squared shoulders */}
        {[-1, 1].map((s) => (
          <mesh key={`sh${s}`} position={[s * 0.155, 0.325, 0]} scale={[0.055, 0.022, 0.08]} material={matte(NORA.blazer, 0.8, { flat: false })} castShadow>
            <sphereGeometry args={[1, 14, 10]} />
          </mesh>
        ))}
        {/* notched lapels along the opening */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.06, 0.15, 0.168]} rotation={[-0.12, s * 0.25, 0]} scale={[s, 1, 1]}>
            <mesh geometry={lapelGeo()} material={matte(NORA.blazerShade, 0.8)} />
          </group>
        ))}
        {/* delicate necklace with a tiny pendant */}
        <mesh material={goldMat()}>
          <tubeGeometry args={[new THREE.CatmullRomCurve3([new THREE.Vector3(-0.075, 0.385, 0.03), new THREE.Vector3(-0.05, 0.33, 0.135), new THREE.Vector3(0, 0.3, 0.16), new THREE.Vector3(0.05, 0.33, 0.135), new THREE.Vector3(0.075, 0.385, 0.03)]), 24, 0.0028, 4, false]} />
        </mesh>
        <mesh position={[0, 0.29, 0.162]} rotation={[0.15, 0, 0]} material={goldMat()}>
          <cylinderGeometry args={[0.011, 0.011, 0.004, 12]} />
        </mesh>
      </>
    ),
    neck: (
      <mesh position={[0, 0.43, 0]} material={matte(NORA.turtle, 0.9, { flat: false })}>
        <cylinderGeometry args={[0.062, 0.07, 0.09, 14]} />
      </mesh>
    ),
    upperArm: () => <mesh geometry={limbGeo(0.052, BODY.upper)} material={matte(NORA.blazer, 0.8)} castShadow />,
    foreArm: () => (
      <>
        <mesh geometry={limbGeo(0.047, BODY.fore)} material={matte(NORA.blazer, 0.8)} castShadow />
        <mesh position={[0, -BODY.fore + 0.012, 0]} material={matte(NORA.turtle, 0.9)}>
          <cylinderGeometry args={[0.042, 0.042, 0.03, 9]} />
        </mesh>
      </>
    ),
    hand: () => (
      <mesh position={[0, -0.04, 0]} scale={[0.9, 1.05, 0.8]} material={skin} castShadow>
        <sphereGeometry args={[0.05, 12, 10]} />
      </mesh>
    ),
    holdL:
      holdL === "notebook" ? (
        <group position={[0.0, -0.06, 0.07]} rotation={[0.2, -0.25, 0.15]}>
          <NotebookHeld />
        </group>
      ) : holdL === "thermos" ? (
        <group position={[0, -0.13, 0.03]}>
          <Thermos slosh={Math.sin(t * 0.3) * bounce} />
        </group>
      ) : null,
    holdR:
      holdR === "pen" ? (
        <group position={[0, -0.06, 0.05]} rotation={[1.2 + tapA, 0, 0.2]}>
          <Pen />
        </group>
      ) : holdR === "thermos" ? (
        <group position={[0, -0.13, 0.03]}>
          <Thermos slosh={Math.sin(t * 0.3) * bounce} />
        </group>
      ) : null,
    thigh: () => <mesh geometry={limbGeo(0.064, BODY.thigh, 0.056)} material={matte(NORA.trousers, 0.85)} castShadow />,
    shin: () => <mesh geometry={limbGeo(0.052, BODY.shin, 0.046)} material={matte(NORA.trousers, 0.85)} castShadow />,
    foot: () => (
      <group position={[0, -0.03, 0]}>
        <mesh geometry={loaferGeo()} material={matte(NORA.loafer, 0.5)} castShadow />
        <mesh position={[0, 0.02, 0.07]} material={goldMat()}>
          <boxGeometry args={[0.05, 0.008, 0.012]} />
        </mesh>
        <mesh position={[0, -0.025, 0.035]} scale={[1.04, 0.2, 1.02]} geometry={loaferGeo()} material={matte("#2A1A14", 0.8)} />
      </group>
    ),
    head,
  };
  return <Body p={p} parts={parts} />;
};

export { PAL };
