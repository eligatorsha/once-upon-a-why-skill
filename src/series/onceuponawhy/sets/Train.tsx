// SET 5 — MIKA: NIGHT TRAIN PLATFORM AND CARRIAGE (bible §6.5). LOCKED.
// Platform mood: deep navy night, cool teal-white canopy tubes, the warm headlight of an arriving train, city beyond.
// Carriage mood: warm-white interior, swaying hanging straps, city lights streaking past the windows.
// Explainer surface: the split-flap departure board. Its flaps flip through letters into words and simple diagrams.
import React from "react";
import * as THREE from "three";
import { canvasTex, glow, hash, liveTex, matte, texMat, V3 } from "../look/mat";
import { ROUND } from "../fonts";
import { PAL } from "../palette";
import { Backdrop, Bx, CityBlocks, Cy, Dust, Floor, Glowbulb, KeyLight, LightCone, SetLook, floorTex } from "./common";

export const PLATFORM: SetLook = {
  cam: { pos: [0.1, 1.35, 5.3], target: [0.0, 1.15, -1.0], fov: 37 },
  lens: { aperture: 0.002, maxblur: 0.008 },
  bloom: { strength: 0.85, radius: 0.6, threshold: 1.2 },
  exposure: 1.05,
  bg: "#0B0F26",
  env: 0.2,
  fog: { color: "#121838", near: 8, far: 40 },
};
export const PLATFORM_MARKS = {
  mika: { pos: [-0.1, 0, -0.2] as V3, yaw: 0.15 },
  nora: { pos: [0.5, 0, -0.5] as V3, yaw: -0.3 },
};

// ---------- split-flap board ----------
const FLAP = { cols: 14, rows: 4 };
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:→+=?-";
/** k: 0 = `from` rows, 1 = `to` rows. Cells cycle through letters before landing (staggered by column).
 *  Optional: cols / rows (default 14 × 4), a texture id (one per board on screen), centred rows. */
const flapTex = (from: string[], to: string[], k: number, cols = FLAP.cols, rows = FLAP.rows, id = "flapBoard", center = false) => {
  const fit = (s: string) => {
    const u = s.toUpperCase().slice(0, cols);
    if (!center) return u.padEnd(cols, " ");
    const l = Math.floor((cols - u.length) / 2);
    return (" ".repeat(l) + u).padEnd(cols, " ");
  };
  const pad = (rs: string[]) => Array.from({ length: rows }, (_, r) => fit(rs[r] ?? ""));
  const A = pad(from);
  const B = pad(to);
  const steps = Math.round(k * 60);
  const FLAPc = { cols, rows };
  return liveTex(id, 1024, Math.round((1024 * 360 * rows * 14) / (1024 * 4 * cols)), `${A.join("|")}#${B.join("|")}#${steps}`, (g, w, h) => {
    g.fillStyle = "#0C0C12";
    g.fillRect(0, 0, w, h);
    const cw = (w - 40) / FLAPc.cols;
    const ch = (h - 40) / FLAPc.rows;
    for (let r = 0; r < FLAPc.rows; r++) {
      for (let c = 0; c < FLAPc.cols; c++) {
        const x = 20 + c * cw;
        const y = 20 + r * ch;
        const start = c * 1.6 + r * 3;
        const local = steps - start;
        let ch_ = A[r][c];
        let mid = false;
        if (local >= 14) ch_ = B[r][c];
        else if (local > 0) {
          ch_ = A[r][c] === B[r][c] ? A[r][c] : GLYPHS[Math.floor(hash(r * 31 + c * 7 + local) * GLYPHS.length)];
          mid = A[r][c] !== B[r][c] && local % 2 === 1;
        }
        g.fillStyle = "#1E1E28";
        g.fillRect(x + 3, y + 3, cw - 6, ch - 6);
        g.fillStyle = "#26262F";
        g.fillRect(x + 3, y + 3, cw - 6, (ch - 6) / 2);
        g.font = `700 ${ch * 0.62}px ${ROUND}`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillStyle = r === 0 ? "#FFC85A" : "#F4EEDC";
        if (ch_ !== " ") g.fillText(ch_, x + cw / 2, y + ch / 2 + 3);
        g.fillStyle = "#08080C";
        g.fillRect(x + 3, y + ch / 2 - 1.5, cw - 6, 3);
        if (mid) {
          g.fillStyle = "rgba(0,0,0,0.45)";
          g.fillRect(x + 3, y + 3, cw - 6, (ch - 6) / 2);
        }
      }
    }
  });
};

export const SplitFlap: React.FC<{ p: V3; from: string[]; to: string[]; k: number; w?: number; cols?: number; rows?: number; id?: string; center?: boolean; glowK?: number }> = ({
  p,
  from,
  to,
  k,
  w = 1.7,
  cols = FLAP.cols,
  rows = FLAP.rows,
  id = "flapBoard",
  center = false,
  glowK = 1.25,
}) => {
  // keep square-ish cells: height follows the cell grid
  const h = w * ((360 / 1024) * (rows / FLAP.rows) * (FLAP.cols / cols));
  return (
    <group position={p}>
      <Bx p={[0, 0, -0.06]} s={[w + 0.12, h + 0.12, 0.12]} c="#1A1A22" r={0.4} />
      <mesh position={[0, 0, 0.002]} material={texMat(`${id}M`, flapTex(from, to, k, cols, rows, id, center), { emissive: glowK, rough: 0.5 })}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {/* hangers */}
      {[-w * 0.4, w * 0.4].map((x) => (
        <Cy key={x} p={[x, h / 2 + 0.4, -0.06]} r={0.012} h={0.8} c="#3A3A48" />
      ))}
    </group>
  );
};

// ---------- the train ----------
const trainWin = () =>
  canvasTex(
    "trainWin",
    256,
    128,
    (g, w, h) => {
      g.fillStyle = "#000";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#FFE9C4";
      g.fillRect(16, 20, 90, 70);
      g.fillRect(140, 20, 90, 70);
      g.fillStyle = "rgba(40,30,60,0.6)";
      g.fillRect(40, 50, 20, 40);
      g.fillRect(180, 45, 22, 45);
    },
    { repeat: [6, 1] },
  );
export const Train: React.FC<{ x: number; z: number; y?: number; len?: number }> = ({ x, z, y = 0, len = 14 }) => (
  <group position={[x, y, z]}>
    <Bx p={[len / 2, 0.95, 0]} s={[len, 1.5, 1.2]} c="#D9DCE4" r={0.45} />
    <mesh position={[len / 2, 1.15, 0.605]} material={texMat("trainWinM", trainWin(), { emissive: 2.4, rough: 0.4 })}>
      <planeGeometry args={[len, 0.55]} />
    </mesh>
    <Bx p={[len / 2, 0.62, 0.606]} s={[len, 0.1, 0.01]} c={PAL.tealNeon} cast={false} />
    <Bx p={[len / 2, 0.5, 0.606]} s={[len, 0.05, 0.01]} c={PAL.pinkNeon} cast={false} />
    {/* rounded cab at the front (left end) */}
    <mesh position={[0, 0.95, 0]} rotation={[0, 0, 0]} scale={[0.6, 0.75, 0.6]} material={matte("#D9DCE4", 0.45)}>
      <sphereGeometry args={[1, 14, 10, Math.PI, Math.PI]} />
    </mesh>
    <mesh position={[-0.35, 1.2, 0.0]} rotation={[0, -Math.PI / 2, 0]} material={glow("#9FD8FF", 1.4)}>
      <planeGeometry args={[0.8, 0.3]} />
    </mesh>
    {[-0.32, 0.32].map((zz) => (
      <Glowbulb key={zz} p={[-0.52, 0.62, zz]} r={0.06} c="#FFF2C8" i={9} />
    ))}
    <pointLight position={[-1.2, 0.8, 0]} intensity={4} distance={6} color="#FFE6B0" />
    <LightCone p={[-1.6, 0.7, 0]} rot={[0, 0, -Math.PI / 2]} r={0.6} h={2.4} c="#FFF2C8" o={0.06} />
    <Bx p={[len / 2, 0.15, 0]} s={[len - 0.6, 0.3, 1.0]} c="#2A2A34" />
  </group>
);

export const PlatformSet: React.FC<{ t: number; explain?: number; trainX?: number; board?: { from: string[]; to: string[] } }> = ({
  t,
  explain = 0,
  trainX = 0.9,
  board = { from: ["NEXT  23:58", "HARBOR LINE", "LOCAL  PL 3", ""], to: ["INTERVIEW", "STORY = S+T", "+ ACTION", "→ RESULT"] },
}) => {
  const tiles = floorTex("platTiles", "#6A6A7A", "rgba(20,20,40,0.35)", [8, 8]);
  return (
    <>
      <hemisphereLight args={["#3A4A8A", "#101020", 0.55]} />
      <KeyLight p={[0.5, 6, 1.5]} c="#CFF6F0" i={1.3} box={4} target={[0, 0, -0.5]} />
      <pointLight position={[0, 2.6, 0.2]} intensity={1.2} distance={5} color="#D8FFF8" />
      <pointLight position={[-2, 1.5, 2]} intensity={0.5} distance={6} color={PAL.pinkNeon} />

      {/* beyond the tracks */}
      <Backdrop mood="night" p={[0, 4, -45]} w={90} h={40} seed={31} />
      <CityBlocks area={[-16, 16, -30, -9]} n={30} seed={33} base="#26244E" lit={0.5} hMin={3} hMax={16} y0={-1.5} />
      <Bx p={[0, 0.55, -5.4]} s={[30, 1.1, 0.1]} c="#2A2A40" cast={false} />

      {/* platform + edge line, track bed */}
      <Floor tex={tiles} id="platTilesM" size={[24, 4]} p={[0, 0, 0.3]} rough={0.75} />
      <Bx p={[0, 0.003, -1.25]} s={[24, 0.008, 0.16]} c="#E8C23A" r={0.7} cast={false} />
      <Bx p={[0, -0.6, -1.5]} s={[24, 1.2, 0.2]} c="#3A3A48" cast={false} />
      <Bx p={[0, -1.2, -2.8]} s={[24, 0.1, 2.6]} c="#22222C" cast={false} />
      {[-2.3, -3.3].map((z) => (
        <Bx key={z} p={[0, -1.1, z]} s={[24, 0.06, 0.08]} c="#8A8A9A" r={0.35} />
      ))}
      <Train x={trainX} z={-2.75} y={-1.15} />

      {/* canopy with tube lights and pillars */}
      <Bx p={[0, 3.15, -0.4]} s={[24, 0.12, 3.2]} c="#2E3048" cast={false} />
      {[-1.3, 1.3].map((x) => (
        <group key={x}>
          <Cy p={[x, 1.55, -0.95]} r={0.07} h={3.1} c="#4A4E6A" rough={0.5} />
          <Bx p={[x, 0.75, -0.87]} s={[0.04, 0.4, 0.01]} c="#E8C23A" cast={false} />
        </group>
      ))}
      {[-2, -0.6, 0.8, 2.2].map((x, i) => (
        <group key={x}>
          <mesh position={[x, 3.05, -0.1]} material={glow("#D8FFF8", i === 1 && hash(Math.floor(t / 4)) < 0.15 ? 1.2 : 3.2)}>
            <boxGeometry args={[0.9, 0.04, 0.06]} />
          </mesh>
          <LightCone p={[x, 2.2, -0.1]} r={0.8} h={1.7} c="#D8FFF8" o={0.025} />
        </group>
      ))}
      <SplitFlap p={[0.0, 2.45, -0.75]} from={board.from} to={board.to} k={explain} />
      {/* platform number sign and a bench */}
      <group position={[-1.3, 2.25, -0.85]}>
        <Bx p={[0, 0, 0]} s={[0.34, 0.34, 0.04]} c="#1E2A5A" />
        <mesh position={[0, 0, 0.022]} material={texMat("plat3", canvasTex("plat3", 128, 128, (g, w, h) => {
          g.fillStyle = "#1E2A5A";
          g.fillRect(0, 0, w, h);
          g.fillStyle = "#FFFFFF";
          g.font = `700 96px ${ROUND}`;
          g.textAlign = "center";
          g.textBaseline = "middle";
          g.fillText("3", w / 2, h / 2 + 6);
        }), { emissive: 0.8 })}>
          <planeGeometry args={[0.3, 0.3]} />
        </mesh>
      </group>
      <group position={[1.1, 0, -0.55]} rotation={[0, -0.2, 0]}>
        <Bx p={[0, 0.4, 0]} s={[0.9, 0.05, 0.32]} c={PAL.tealNeon} r={0.6} />
        <Bx p={[0, 0.62, -0.15]} s={[0.9, 0.36, 0.04]} c={PAL.tealNeon} r={0.6} />
        {[-0.38, 0.38].map((x) => (
          <Bx key={x} p={[x, 0.2, 0]} s={[0.04, 0.4, 0.3]} c="#3A3A48" />
        ))}
      </group>
    </>
  );
};

// ---------- carriage ----------
export const CARRIAGE: SetLook = {
  cam: { pos: [0.0, 1.4, 4.6], target: [0, 1.15, -2], fov: 38 },
  lens: { aperture: 0.0022, maxblur: 0.008 },
  bloom: { strength: 0.6, radius: 0.6, threshold: 1.4 },
  exposure: 0.82,
  bg: "#0B0F26",
  env: 0.3,
};
/** MORNING variant (ep 1): low warm sunrise through the left windows, long soft window shadows, dust in the beams */
export const CARRIAGE_MORNING: SetLook = {
  cam: { pos: [0.0, 1.4, 4.6], target: [0, 1.15, -2], fov: 38 },
  lens: { aperture: 0.0018, maxblur: 0.006 },
  bloom: { strength: 0.62, radius: 0.6, threshold: 1.3 },
  exposure: 0.98,
  bg: "#F2C9A8",
  env: 0.35,
};
export const CARRIAGE_MARKS = {
  mika: { pos: [0.05, 0, 0.0] as V3, yaw: 0 },
  nora: { pos: [-0.6, 0, -0.6] as V3, yaw: 0.4 },
};
/** where the in-carriage split-flap board hangs (centre), facing +z */
export const CARRIAGE_BOARD: V3 = [0.0, 1.98, -1.7];
const passTex = () =>
  canvasTex(
    "passing",
    1024,
    256,
    (g, w, h) => {
      g.fillStyle = "#0E1030";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 80; i++) {
        const x = hash(i * 3.3) * w;
        const y = hash(i * 7.1) * h;
        g.fillStyle = [PAL.amber, PAL.pinkNeon, PAL.tealNeon, "#FFE9C4"][i % 4];
        g.globalAlpha = 0.5 + hash(i) * 0.5;
        g.fillRect(x, y, 40 + hash(i * 9) * 160, 4 + hash(i * 2) * 6);
      }
      g.globalAlpha = 1;
    },
    { repeat: [1, 1] },
  );
/** morning city passing: peach-to-cream sunrise sky, lilac and dusk-purple blocks, a few windows catching the sun */
const passMorningTex = () =>
  canvasTex(
    "passingMorning",
    1024,
    256,
    (g, w, h) => {
      const sky = g.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#FFE3C2");
      sky.addColorStop(0.55, "#FFC59A");
      sky.addColorStop(1, "#F49A86");
      g.fillStyle = sky;
      g.fillRect(0, 0, w, h);
      // far blocks (pale lilac), near blocks (dusk purple), staggered heights
      for (const [col, n, hMin, hMax, seed] of [
        ["#E9B9A6", 26, 0.35, 0.7, 2],
        ["#C07F7A", 18, 0.2, 0.5, 5],
      ] as [string, number, number, number, number][]) {
        let x = -20;
        let i = 0;
        while (x < w) {
          const bw = 30 + hash(i * 3.7 + seed) * 70;
          const bh = h * (hMin + hash(i * 5.3 + seed) * (hMax - hMin));
          g.fillStyle = col;
          g.fillRect(x, h - bh, bw, bh);
          // windows catching the sun
          g.fillStyle = "rgba(255,236,200,0.75)";
          for (let k = 0; k < 6; k++) {
            if (hash(i * 11 + k + seed) > 0.55) g.fillRect(x + 6 + (k % 3) * (bw / 3.2), h - bh + 10 + Math.floor(k / 3) * 22, 7, 10);
          }
          x += bw + 4 + hash(i * 9.1 + seed) * 14;
          i++;
          void n;
        }
      }
      // low sun glow on the left of the strip
      const sun = g.createRadialGradient(w * 0.2, h * 0.55, 4, w * 0.2, h * 0.55, h * 0.9);
      sun.addColorStop(0, "rgba(255,250,225,0.95)");
      sun.addColorStop(0.25, "rgba(255,226,170,0.55)");
      sun.addColorStop(1, "rgba(255,200,150,0)");
      g.fillStyle = sun;
      g.fillRect(0, 0, w, h);
    },
    { repeat: [1, 1] },
  );

/** sun flicker as buildings pass the low sun (0.35 … 1): smooth bands, deterministic in t (frames) */
export const sunFlicker = (t: number) => {
  const x = t * 0.045;
  const i = Math.floor(x);
  const f = x - i;
  const a = hash(i * 2.3 + 1) > 0.42 ? 1 : 0.38;
  const b = hash((i + 1) * 2.3 + 1) > 0.42 ? 1 : 0.38;
  const e = f < 0.75 ? 0 : (f - 0.75) / 0.25;
  return a + (b - a) * e * e * (3 - 2 * e);
};

export type CarriageBoard = { from: string[]; to: string[]; k: number };

export const CarriageSet: React.FC<{
  t: number;
  explain?: number;
  /** "night" (default, locked look) or "morning" (sunrise variant) */
  light?: "night" | "morning";
  /** optional split-flap board hanging in the carriage (18 × 4, centred rows) */
  board?: CarriageBoard;
  /** extra brightness for a beat (0 … 1), e.g. a triumphant moment */
  flash?: number;
  /** extra sun on the subject's face (0 … 1): a warm beam through the window */
  beam?: number;
}> = ({ t, light = "night", board, flash = 0, beam = 0 }) => {
  const morning = light === "morning";
  const floor = floorTex("carFloor", "#5A5068", "rgba(0,0,0,0.15)", [2, 10]);
  const L = 9;
  const tex = morning ? passMorningTex() : passTex();
  tex.wrapS = THREE.RepeatWrapping;
  tex.offset.set((t * (morning ? 0.012 : 0.02)) % 1, 0);
  const rock = Math.sin(t * 0.08) * 0.012;
  const sun = morning ? sunFlicker(t) : 0;
  return (
    <group rotation={[0, 0, rock]}>
      {morning ? (
        <>
          <hemisphereLight args={["#FFC994", "#7A4A50", 0.7 + flash * 0.35]} />
          <pointLight position={[-0.9, 1.1, 1.2]} intensity={0.55} distance={3.5} color="#FF9F5C" />
          {/* the low sun through the left windows: long soft window-frame shadows across the floor and the cast */}
          <KeyLight p={[-5.5, 2.15, 1.9]} c="#FFB673" i={(3.6 + beam * 2.2) * sun + flash * 1.0} box={3.2} target={[0.2, 1.0, -0.4]} />
          <pointLight position={[0, 2.2, 1]} intensity={0.3 + flash * 0.9} distance={5} color="#FFE6CC" />
          <pointLight position={[0, 2.2, -2.5]} intensity={0.35} distance={5} color="#FFF0DC" />
          <Dust c={[-0.2, 1.4, 0.2]} half={[0.8, 0.8, 1.6]} n={46} t={t} color="#FFE2B0" seed={11} />
          <LightCone p={[-0.95, 1.95, 0.4]} rot={[0, 0, -1.05]} r={0.5} h={2.2} c="#FFD6A0" o={0.035 * sun + beam * 0.04} />
          <LightCone p={[-0.95, 1.95, -1.4]} rot={[0, 0, -1.05]} r={0.5} h={2.2} c="#FFD6A0" o={0.03 * sun} />
        </>
      ) : (
        <>
          <hemisphereLight args={["#FFE6D0", "#3A2850", 0.55]} />
          <pointLight position={[0, 2.2, 1]} intensity={1.6} distance={5} color="#FFF4E0" castShadow shadow-mapSize={[1024, 1024]} />
          <pointLight position={[0, 2.2, -2.5]} intensity={1.2} distance={5} color="#FFF4E0" />
        </>
      )}
      <Floor tex={floor} id="carFloorM" size={[2.2, L]} p={[0, 0, -L / 2 + 2]} rough={0.7} />
      {/* walls, ceiling */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Bx p={[s * 1.1, 0.45, -L / 2 + 2]} s={[0.05, 0.9, L]} c="#B9B4C8" cast={morning && s < 0} />
          <Bx p={[s * 1.1, 2.15, -L / 2 + 2]} s={[0.05, 0.6, L]} c="#C9C4D8" cast={morning && s < 0} />
          {/* window posts: in the morning they throw the long shadow bars */}
          {morning && s < 0
            ? Array.from({ length: 9 }, (_, i) => <Bx key={i} p={[s * 1.1, 1.32, 2.2 - i * 1.0]} s={[0.06, 0.86, 0.09]} c="#B9B4C8" />)
            : null}
          {/* windows with the city passing */}
          <mesh position={[s * 1.08, 1.32, -L / 2 + 2]} rotation={[0, -s * Math.PI / 2, 0]} material={texMat(morning ? "passMorningM" : "passM", tex, { basic: true })}>
            <planeGeometry args={[L, 0.8]} />
          </mesh>
          {/* benches */}
          <Bx p={[s * 0.88, 0.42, -L / 2 + 2]} s={[0.4, 0.12, L - 1]} c="#2F6B6B" r={0.95} />
          <Bx p={[s * 1.04, 0.7, -L / 2 + 2]} s={[0.1, 0.45, L - 1]} c="#2F6B6B" r={0.95} />
          {/* ad panels (abstract colour blocks, no text) */}
          {[0, 1, 2, 3].map((i) => (
            <Bx key={i} p={[s * 1.06, 2.15, 1 - i * 2]} s={[0.02, 0.32, 0.8]} c={[PAL.peach, PAL.lilac, PAL.tealNeon, "#FFD25A"][(i + (s > 0 ? 1 : 0)) % 4]} cast={false} />
          ))}
          {/* the strap rail and hanging straps */}
          <Cy p={[s * 0.6, 2.25, -L / 2 + 2]} r={0.015} h={L} c={PAL.chrome} rot={[Math.PI / 2, 0, 0]} rough={0.3} />
          {Array.from({ length: 9 }, (_, i) => {
            const z = 2 - i * 0.9;
            const sw = Math.sin(t * 0.09 + i * 0.6) * 0.12 + rock * 4;
            return (
              <group key={i} position={[s * 0.6, 2.25, z]} rotation={[sw * 0.3, 0, sw]}>
                <Bx p={[0, -0.12, 0]} s={[0.02, 0.24, 0.035]} c="#E8E2F0" cast={false} />
                <mesh position={[0, -0.3, 0]} material={matte("#FFFDF6", 0.6)}>
                  <torusGeometry args={[0.065, 0.014, 6, 14]} />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}
      <Bx p={[0, 2.5, -L / 2 + 2]} s={[2.3, 0.06, L]} c="#E8E4F0" cast={false} />
      {[1.5, -0.5, -2.5, -4.5].map((z) => (
        <mesh key={z} position={[0, 2.45, z]} material={glow("#FFEFD8", morning ? 0.9 + flash * 1.2 : 1.8)}>
          <boxGeometry args={[0.5, 0.03, 1.2]} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((x) => [0.2, -2.6].map((z) => <Cy key={`${x}${z}`} p={[x, 1.25, z]} r={0.02} h={2.5} c={PAL.chrome} rough={0.3} />))}
      {board ? <SplitFlap p={CARRIAGE_BOARD} from={board.from} to={board.to} k={board.k} w={1.8} cols={18} rows={4} id="carriageFlap" center glowK={1.15} /> : null}
      {/* end door */}
      <Bx p={[0, 1.25, -L + 2]} s={[2.2, 2.5, 0.05]} c="#B9B4C8" cast={false} />
      <mesh position={[0, 1.35, -L + 2.03]} material={texMat(morning ? "passMorningM2" : "passM2", tex, { basic: true })}>
        <planeGeometry args={[0.5, 0.8]} />
      </mesh>
    </group>
  );
};
