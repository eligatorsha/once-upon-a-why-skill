// SET 4 — MIKA: RETRO COFFEE SHOP (bible §6.4). LOCKED.
// Mood: amber and honey, velvet booth, wood panels, a siphon brewer bubbling, a record turning, pendant globes.
// Explainer surface: the felt menu board. Its white plastic letters lift off and rearrange into the answer.
import React from "react";
import { canvasTex, fade, glow, hash, matte, texMat, V3 } from "../look/mat";
import { ROUND } from "../fonts";
import { PAL } from "../palette";
import { Bx, Cy, Dust, Floor, Glowbulb, KeyLight, LightCone, Plant, SetLook, floorTex, signTex } from "./common";

export const COFFEE: SetLook = {
  cam: { pos: [0, 1.3, 5.3], target: [0, 1.02, -1.0], fov: 36 },
  lens: { aperture: 0.0018, maxblur: 0.006 },
  bloom: { strength: 0.75, radius: 0.6, threshold: 1.25 },
  exposure: 1.0,
  bg: "#2A140E",
  env: 0.25,
};
/** SATURDAY MORNING (ep 1): bright clean sun through the street door, 8:00 */
export const COFFEE_MORNING: SetLook = { ...COFFEE, exposure: 1.08, bg: "#3A2014", bloom: { strength: 0.7, radius: 0.6, threshold: 1.3 } };
/** LATE MORNING (ep 1): softer, higher, cosier light, 9:15 */
export const COFFEE_LATE: SetLook = { ...COFFEE, exposure: 1.0, bloom: { strength: 0.72, radius: 0.6, threshold: 1.28 } };

export const COFFEE_MARKS = {
  mika: { pos: [-0.08, 0, -0.35] as V3, yaw: -0.3 },
  nora: { pos: [0.55, 0, -0.9] as V3, yaw: -0.3 },
  /** Mika runs in from here (off frame left) */
  mikaEnter: { pos: [-1.9, 0, -0.1] as V3, yaw: Math.PI / 2 },
};

const panelTex = () =>
  canvasTex(
    "cafePanels",
    256,
    256,
    (g, w, h) => {
      g.fillStyle = "#7A4528";
      g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 32) {
        g.fillStyle = `rgba(0,0,0,${0.12 + hash(x) * 0.12})`;
        g.fillRect(x, 0, 32, h);
        g.fillStyle = "rgba(0,0,0,0.45)";
        g.fillRect(x, 0, 3, h);
        g.fillStyle = "rgba(255,200,150,0.08)";
        g.fillRect(x + 4, 0, 3, h);
      }
    },
    { repeat: [8, 2] },
  );

// ---------- letter board ----------
const BOARD = { x: -0.42, y: 2.02, z: -1.93, w: 1.0, h: 0.72, cols: 11, rows: 5, cw: 0.08, ch: 0.12 };
const letterTex = (c: string) =>
  canvasTex(`plastic-${c}`, 64, 96, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.font = `700 80px ${ROUND}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.fillText(c, w / 2 + 2, h / 2 + 6);
    g.fillStyle = "#FFFDF4";
    g.fillText(c, w / 2, h / 2 + 4);
  });
type Slot = { c: string; col: number; row: number };
const layout = (lines: string[]): Slot[] => {
  const out: Slot[] = [];
  lines.forEach((ln, row) => {
    const start = Math.floor((BOARD.cols - ln.length) / 2);
    [...ln].forEach((c, i) => {
      if (c !== " ") out.push({ c: c.toUpperCase(), col: start + i, row });
    });
  });
  return out;
};
const slotPos = (s: Slot): V3 => [BOARD.x - BOARD.w / 2 + 0.06 + s.col * BOARD.cw + BOARD.cw / 2, BOARD.y + BOARD.h / 2 - 0.1 - s.row * BOARD.ch, BOARD.z + 0.03];

export const LetterBoard: React.FC<{ from: string[]; to: string[]; k: number; t: number }> = ({ from, to, k, t }) => {
  const A = layout(from);
  const B = layout(to);
  // pair letters: each B letter takes an unused A letter of the same character if there is one
  const used = new Set<number>();
  const moves: { c: string; a: V3 | null; b: V3 | null; i: number }[] = [];
  B.forEach((b, i) => {
    const j = A.findIndex((a, jj) => !used.has(jj) && a.c === b.c);
    if (j >= 0) {
      used.add(j);
      moves.push({ c: b.c, a: slotPos(A[j]), b: slotPos(b), i });
    } else moves.push({ c: b.c, a: null, b: slotPos(b), i });
  });
  A.forEach((a, j) => {
    if (!used.has(j)) moves.push({ c: a.c, a: slotPos(a), b: null, i: j + 40 });
  });
  return (
    <group>
      {/* felt board with grooves and a wooden frame */}
      <Bx p={[BOARD.x, BOARD.y, BOARD.z]} s={[BOARD.w + 0.08, BOARD.h + 0.08, 0.04]} c={PAL.woodDark} r={0.6} />
      <mesh position={[BOARD.x, BOARD.y, BOARD.z + 0.021]} material={texMat("feltM", canvasTex("felt", 128, 128, (g, w, h) => {
        g.fillStyle = "#1E1A22";
        g.fillRect(0, 0, w, h);
        g.fillStyle = "rgba(255,255,255,0.05)";
        for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 2);
      }, { repeat: [1, 6] }), { rough: 1 })}>
        <planeGeometry args={[BOARD.w, BOARD.h]} />
      </mesh>
      {moves.map((m, n) => {
        const d = Math.min(1, Math.max(0, k * 1.5 - (n % 17) * 0.03));
        const e = d * d * (3 - 2 * d);
        let p: V3;
        let o = 1;
        if (m.a && m.b) {
          const lift = Math.sin(e * Math.PI) * 0.12;
          p = [m.a[0] + (m.b[0] - m.a[0]) * e, m.a[1] + (m.b[1] - m.a[1]) * e, m.a[2] + lift];
        } else if (m.a) {
          p = [m.a[0], m.a[1] - e * 0.6, m.a[2] + e * 0.25];
          o = 1 - e;
        } else {
          p = [m.b![0], m.b![1] + (1 - e) * 0.5, m.b![2] + (1 - e) * 0.2];
          o = e;
        }
        if (o <= 0.02) return null;
        const wob = d > 0 && d < 1 ? Math.sin(t * 0.6 + n) * 0.3 : 0;
        return (
          <mesh key={`${m.c}${m.i}`} position={p} rotation={[0, 0, wob]} scale={0.4 + 0.6 * o}>
            <planeGeometry args={[BOARD.cw * 0.95, BOARD.ch * 0.9]} />
            <meshStandardMaterial map={letterTex(m.c)} transparent opacity={o} roughness={0.5} depthWrite={false} emissive="#FFF2D8" emissiveIntensity={0.25} emissiveMap={letterTex(m.c)} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------- siphon brewer ----------
const Siphon: React.FC<{ p: V3; t: number }> = ({ p, t }) => (
  <group position={p}>
    <Cy p={[0, 0.02, 0]} r={0.1} h={0.04} c="#2A1A14" rough={0.4} />
    <Cy p={[0.08, 0.2, 0]} r={0.012} h={0.36} c={PAL.chrome} rough={0.3} />
    {/* burner + flame */}
    <Cy p={[0, 0.07, 0]} r={0.035} h={0.05} c="#C9A04A" rough={0.35} />
    <mesh position={[0, 0.115, 0]} scale={[1, 1.4 + Math.sin(t * 0.9) * 0.2, 1]} material={glow("#7FB8FF", 3)}>
      <coneGeometry args={[0.018, 0.04, 8]} />
    </mesh>
    {/* lower globe with coffee */}
    <mesh position={[0, 0.21, 0]} material={fade("#E8F4FF", 0.22)}>
      <sphereGeometry args={[0.075, 16, 12]} />
    </mesh>
    <mesh position={[0, 0.195, 0]} material={matte("#3A1A0C", 0.25)}>
      <sphereGeometry args={[0.062, 14, 10, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65]} />
    </mesh>
    {Array.from({ length: 6 }, (_, i) => {
      const life = (t * 0.05 + i / 6) % 1;
      return (
        <mesh key={i} position={[Math.sin(i * 2.3) * 0.03, 0.17 + life * 0.08, Math.cos(i * 1.7) * 0.03]} scale={0.006 + life * 0.006} material={fade("#FFE9D0", 0.6 * (1 - life))}>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      );
    })}
    {/* neck + upper bowl */}
    <mesh position={[0, 0.32, 0]} material={fade("#E8F4FF", 0.25)}>
      <cylinderGeometry args={[0.014, 0.014, 0.12, 8]} />
    </mesh>
    <mesh position={[0, 0.43, 0]} material={fade("#E8F4FF", 0.22)}>
      <cylinderGeometry args={[0.06, 0.04, 0.12, 14, 1, true]} />
    </mesh>
    <mesh position={[0, 0.41, 0]} material={matte("#5A2A12", 0.3)}>
      <cylinderGeometry args={[0.048, 0.038, 0.06, 14]} />
    </mesh>
  </group>
);

const RecordPlayer: React.FC<{ p: V3; t: number }> = ({ p, t }) => (
  <group position={p}>
    <Bx p={[0, 0.05, 0]} s={[0.4, 0.1, 0.32]} c="#8A5634" r={0.5} />
    <Bx p={[0, 0.101, 0]} s={[0.38, 0.004, 0.3]} c="#C9CDD6" r={0.4} cast={false} />
    <group position={[-0.04, 0.11, 0]} rotation={[0, -t * 0.12, 0]}>
      <Cy p={[0, 0, 0]} r={0.13} h={0.008} c="#141018" seg={24} rough={0.35} />
      <Cy p={[0, 0.005, 0]} r={0.045} h={0.004} c={PAL.mika} seg={16} />
      <Bx p={[0.025, 0.008, 0]} s={[0.02, 0.003, 0.01]} c={PAL.cream} cast={false} />
    </group>
    <group position={[0.15, 0.12, -0.1]} rotation={[0, 0.5, 0]}>
      <Cy p={[0, 0, 0]} r={0.02} h={0.03} c={PAL.chrome} />
      <Bx p={[-0.08, 0.02, 0.0]} s={[0.17, 0.008, 0.01]} c={PAL.chrome} r={0.3} />
    </group>
  </group>
);

const Pendant: React.FC<{ p: V3; len: number; t: number; light?: number; shadow?: boolean }> = ({ p, len, t, light = 1.6, shadow = false }) => {
  const sway = Math.sin(t * 0.035 + p[0] * 3) * 0.02;
  return (
    <group position={[p[0], p[1] + len, p[2]]} rotation={[sway, 0, sway * 0.7]}>
      <Cy p={[0, -len / 2, 0]} r={0.005} h={len} c="#1A1010" />
      <Cy p={[0, -len + 0.03, 0]} r={0.03} r2={0.05} h={0.05} c="#C9A04A" rough={0.35} />
      <group position={[0, -len - 0.07, 0]}>
        <Glowbulb p={[0, 0, 0]} r={0.085} c="#FFB866" i={3.2} light={light} dist={4} shadow={shadow} />
        <LightCone p={[0, -0.45, 0]} r={0.55} h={0.9} c="#FFB866" o={0.045} />
      </group>
    </group>
  );
};

const Booth: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <Bx p={[0, 0.22, 0]} s={[1.3, 0.12, 0.5]} c={PAL.velvet} r={0.95} />
    <Bx p={[0, 0.08, 0]} s={[1.28, 0.16, 0.46]} c="#4E2D1C" />
    {/* tufted back: rounded cushions with buttons */}
    {[-0.48, -0.16, 0.16, 0.48].map((x) => (
      <group key={x} position={[x, 0.62, -0.2]}>
        <mesh scale={[0.15, 0.32, 0.08]} castShadow receiveShadow material={matte(PAL.velvet, 0.95, { flat: true })}>
          <icosahedronGeometry args={[1, 2]} />
        </mesh>
        {[0.12, -0.08].map((y) => (
          <mesh key={y} position={[0, y, 0.075]} material={matte(PAL.velvetDeep, 0.8)}>
            <icosahedronGeometry args={[0.012, 0]} />
          </mesh>
        ))}
      </group>
    ))}
    <Bx p={[0, 0.99, -0.22]} s={[1.32, 0.05, 0.14]} c={PAL.woodDark} />
  </group>
);

/** the street door in the left wall (ep 1): hinge side, centre z, size */
export const CAFE_DOOR = { x: -2.19, z: 0.15, w: 0.86, h: 2.0 };

export const CoffeeShopSet: React.FC<{
  t: number;
  explain?: number;
  board?: { from: string[]; to: string[] };
  /** "evening" (default, locked look), "morning" (bright 8:00 sun through the door), "late" (softer 9:15) */
  light?: "evening" | "morning" | "late";
  /** show the street door: 0 shut … 1 wide open (swings inwards). Undefined = no door (the locked look) */
  door?: number;
}> = ({ t, explain = 0, board = { from: ["MENU", "SIPHON 4", "MATCHA 5", "TOAST 3"], to: ["COVER", "LETTER =", "YOU + THEM"] }, light = "evening", door }) => {
  const floor = floorTex("cafeFloor", "#B9824E", "rgba(60,30,10,0.4)", [5, 5], false);
  const day = light !== "evening";
  const pend = light === "morning" ? 0.35 : light === "late" ? 0.75 : 1;
  return (
    <>
      {light === "evening" ? (
        <>
          <hemisphereLight args={["#FFC890", "#3A1A14", 0.55]} />
          <KeyLight p={[2.5, 4, 3]} c="#FFD2A0" i={0.9} box={3.5} target={[0, 0.6, -0.6]} />
          <pointLight position={[-1.4, 1.5, 1.5]} intensity={0.7} distance={5} color="#FF9A6C" />
        </>
      ) : light === "morning" ? (
        <>
          <hemisphereLight args={["#FFF0DC", "#5A3424", 0.85]} />
          {/* low clean sun through the open door and the street window */}
          <KeyLight p={[-6.5, 2.6, 1.2]} c="#FFE9C8" i={2.6} box={3.5} target={[0, 0.7, -0.6]} />
          <KeyLight p={[2.5, 4, 3]} c="#FFE2C0" i={0.5} box={3.5} target={[0, 0.6, -0.6]} />
          <LightCone p={[-2.0, 1.75, 0.15]} rot={[0, 0, 1.2]} r={0.7} h={2.6} c="#FFE6B8" o={0.05} />
        </>
      ) : (
        <>
          <hemisphereLight args={["#FFE2C4", "#4A2A1C", 0.7]} />
          {/* the sun higher now: soft and warm from above the door */}
          <KeyLight p={[-3.2, 6.5, 2.2]} c="#FFDDB0" i={1.35} box={3.5} target={[0.4, 0.7, -1.0]} />
          <pointLight position={[1.4, 1.6, 1.2]} intensity={0.5} distance={5} color="#FFB98A" />
        </>
      )}
      {day ? <Dust c={[-0.8, 1.3, 0]} half={[1.0, 0.8, 0.9]} n={36} t={t} color="#FFEBC2" seed={21} /> : null}
      {/* room */}
      <Floor tex={floor} id="cafeFloorM" size={[8, 8]} rough={0.6} />
      <mesh position={[0, 1.6, -2.0]} receiveShadow material={texMat("cafePanelsM", panelTex(), { rough: 0.75 })}>
        <planeGeometry args={[6, 3.2]} />
      </mesh>
      <Bx p={[0, 0.55, -1.98]} s={[6, 0.05, 0.04]} c="#4E2D1C" cast={false} />
      <Bx p={[0, 3.2, -0.8]} s={[6, 0.08, 3]} c="#3A2014" cast={false} />
      <mesh position={[-2.2, 1.6, -0.8]} rotation={[0, Math.PI / 2, 0]} receiveShadow material={texMat("cafePanelsM", panelTex(), { rough: 0.75 })}>
        <planeGeometry args={[3, 3.2]} />
      </mesh>

      <LetterBoard from={board.from} to={board.to} k={explain} t={t} />

      {/* booth + table */}
      <Booth p={[0.75, 0, -1.68]} />
      <group position={[0.75, 0, -1.05]}>
        <Cy p={[0, 0.35, 0]} r={0.03} h={0.7} c="#2A1A14" />
        <Cy p={[0, 0.02, 0]} r={0.18} h={0.03} c="#2A1A14" />
        <Bx p={[0, 0.71, 0]} s={[0.9, 0.035, 0.5]} c="#C9A06A" r={0.4} />
        <Cy p={[-0.25, 0.76, 0.05]} r={0.035} r2={0.03} h={0.07} c={PAL.cream} rough={0.6} />
        <Cy p={[0.2, 0.76, -0.05]} r={0.035} r2={0.03} h={0.07} c={PAL.cream} rough={0.6} />
        <Cy p={[0.02, 0.8, -0.12]} r={0.015} h={0.16} c="#C9A04A" rough={0.3} />
        <Glowbulb p={[0.02, 0.92, -0.12]} r={0.04} c="#FFB866" i={3} />
      </group>
      {/* shelf with the record player and records */}
      <group position={[0.75, 1.42, -1.85]}>
        <Bx p={[0, 0, 0]} s={[1.3, 0.04, 0.3]} c={PAL.woodDark} />
        <RecordPlayer p={[-0.25, 0.02, 0]} t={t} />
        {["#3FE0D0", "#FF6FB5", "#FFB547", "#B9A3E3", "#D7263D"].map((c, i) => (
          <Bx key={i} p={[0.2 + i * 0.022, 0.17, 0]} s={[0.012, 0.3, 0.3]} c={c} rot={[0, 0, i === 4 ? 0.2 : 0]} />
        ))}
      </group>
      {/* counter with the siphon */}
      <group position={[-1.05, 0, -1.0]}>
        <Bx p={[0, 0.48, 0]} s={[0.9, 0.96, 0.55]} c="#6E3E22" />
        <Bx p={[0, 0.98, 0]} s={[0.98, 0.05, 0.62]} c={PAL.cream} r={0.45} />
        {[-0.3, 0, 0.3].map((x) => (
          <Bx key={x} p={[x, 0.48, 0.28]} s={[0.22, 0.8, 0.02]} c="#7E4A2A" />
        ))}
        <Siphon p={[0.22, 1.005, 0.1]} t={t} />
        <Siphon p={[-0.12, 1.005, -0.05]} t={t + 40} />
        <Cy p={[-0.32, 1.06, 0.15]} r={0.05} r2={0.04} h={0.12} c="#E8B23A" rough={0.5} />
      </group>
      <Pendant p={[-0.75, 2.05, -0.95]} len={1.0} t={t} light={1.4 * pend} shadow={!day} />
      <Pendant p={[0.75, 1.95, -1.05]} len={1.1} t={t} light={1.2 * pend} />
      <Pendant p={[0.05, 2.35, -1.6]} len={0.7} t={t} light={0.6 * pend} />
      {door !== undefined ? <StreetDoor open={door} t={t} day={day} /> : null}
      <group position={[1.6, 0, -1.4]}>
        <Plant s={1.3} t={t} pot="#C9A04A" />
      </group>
    </>
  );
};

// ---------- the street door (ep 1) ----------
/** a sunny street seen through the doorway: pale sidewalk, a cream building opposite, blue-peach morning sky */
const streetTex = () =>
  canvasTex("cafeStreet", 256, 512, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * 0.5);
    sky.addColorStop(0, "#BFE3F2");
    sky.addColorStop(1, "#FFE7C8");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#FFF1DC";
    g.fillRect(0, h * 0.18, w, h * 0.55);
    g.fillStyle = "rgba(185,163,227,0.55)";
    for (let i = 0; i < 6; i++) g.fillRect(20 + (i % 3) * 78, h * 0.24 + Math.floor(i / 3) * 90, 46, 60);
    g.fillStyle = "#E9D6BA";
    g.fillRect(0, h * 0.73, w, h * 0.27);
    g.fillStyle = "rgba(255,255,255,0.55)";
    g.fillRect(0, h * 0.73, w, 6);
  });

const StreetDoor: React.FC<{ open: number; t: number; day: boolean }> = ({ open, t, day }) => {
  const { x, z, w, h } = CAFE_DOOR;
  const ang = open * 1.45; // swings inwards, hinge at the back edge
  const sway = Math.sin(t * 0.06) * 0.06;
  return (
    <group>
      {/* the bright street behind the doorway (emissive so it reads as daylight) */}
      <mesh position={[x + 0.005, h / 2, z]} rotation={[0, Math.PI / 2, 0]} material={texMat("cafeStreetM", streetTex(), { emissive: day ? 1.15 : 0.25, rough: 1 })}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {/* frame */}
      <Bx p={[x + 0.03, h + 0.05, z]} s={[0.08, 0.1, w + 0.16]} c={PAL.woodDark} />
      {[-1, 1].map((k) => (
        <Bx key={k} p={[x + 0.03, h / 2, z + k * (w / 2 + 0.04)]} s={[0.08, h + 0.1, 0.08]} c={PAL.woodDark} />
      ))}
      {/* the door leaf: wood frame + glass, a round brass knob */}
      <group position={[x + 0.04, 0, z - w / 2]} rotation={[0, ang, 0]}>
        <group position={[0, 0, w / 2]}>
          <Bx p={[0.02, h / 2, 0]} s={[0.04, h, w]} c="#8A5634" />
          <mesh position={[0.045, h * 0.58, 0]} rotation={[0, Math.PI / 2, 0]} material={fade("#DFF2FF", 0.35)}>
            <planeGeometry args={[w * 0.72, h * 0.55]} />
          </mesh>
          <mesh position={[0.06, h * 0.45, w * 0.36]} material={matte("#E8B23A", 0.35, { metal: 0.6, flat: false })}>
            <sphereGeometry args={[0.03, 12, 10]} />
          </mesh>
        </group>
      </group>
      {/* OPEN sign hanging inside, beside the door */}
      <group position={[x + 0.12, 1.62, z + w / 2 + 0.34]} rotation={[0, Math.PI / 2, sway]}>
        <Cy p={[0, 0.2, 0]} r={0.004} h={0.22} c="#2A1A14" />
        <mesh position={[0, 0, 0]} material={texMat("openSignM", signTex("open", "OPEN", { w: 256, h: 112, fg: "#FFF6E8", bg: PAL.mika, size: 78 }), { emissive: day ? 0.9 : 1.4 })}>
          <planeGeometry args={[0.36, 0.16]} />
        </mesh>
      </group>
    </group>
  );
};
