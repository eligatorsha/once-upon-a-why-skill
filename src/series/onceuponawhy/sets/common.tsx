// ONCE UPON A WHY: shared set kit (bible §6). Painted skylines, 3D city blocks, neon, lamps, books, plants,
// dust, rain and string lights. No real brands or logos: signs are abstract shapes or plain English words.
import React from "react";
import * as THREE from "three";
import { canvasTex, fade, glow, hash, matte, rng, texMat, V3 } from "../look/mat";
import { PAL } from "../palette";
import type { Cam, Lens, Bloom } from "../look/Stage";

/** everything a set exports so episodes can reuse it */
export type SetLook = { cam: Cam; lens?: Lens; bloom?: Bloom; exposure?: number; bg: string; fog?: { color: string; near: number; far: number }; env?: number };

// ---------- tiny primitives ----------
export const Bx: React.FC<{ p: V3; s: V3; c: string; r?: number; rot?: V3; cast?: boolean; recv?: boolean; m?: THREE.Material }> = ({ p, s, c, r = 0.85, rot, cast = true, recv = true, m }) => (
  <mesh position={p} rotation={rot} castShadow={cast} receiveShadow={recv} material={m ?? matte(c, r)}>
    <boxGeometry args={s} />
  </mesh>
);
export const Cy: React.FC<{ p: V3; r: number; r2?: number; h: number; c: string; seg?: number; rough?: number; rot?: V3; m?: THREE.Material; cast?: boolean }> = ({ p, r, r2, h, c, seg = 12, rough = 0.85, rot, m, cast = true }) => (
  <mesh position={p} rotation={rot} castShadow={cast} receiveShadow material={m ?? matte(c, rough)}>
    <cylinderGeometry args={[r, r2 ?? r, h, seg]} />
  </mesh>
);

// ---------- painted skylines ----------
export type SkyMood = "sunset" | "dusk" | "night" | "golden";
const SKY: Record<SkyMood, { stops: [number, string][]; sun?: { y: number; r: number; c: string }; far: string; mid: string; near: string; lit: number }> = {
  sunset: { stops: [[0, "#5B3A8C"], [0.32, "#B07AC2"], [0.55, "#FFB0A0"], [0.72, "#FFC796"], [1, "#FFD9B0"]], sun: { y: 0.66, r: 0.09, c: "#FFE6B8" }, far: "#C99AC8", mid: "#8A5E9E", near: "#4B2E6E", lit: 0.35 },
  golden: { stops: [[0, "#7B5BA8"], [0.35, "#E39AB0"], [0.6, "#FFB98A"], [1, "#FFE0A6"]], sun: { y: 0.7, r: 0.1, c: "#FFF0C0" }, far: "#D9A3B8", mid: "#A06A92", near: "#5A3570", lit: 0.25 },
  dusk: { stops: [[0, "#1E1A4A"], [0.4, "#4B2E6E"], [0.7, "#A35E8E"], [1, "#E98A86"]], far: "#6A4A8A", mid: "#3E2A62", near: "#221A44", lit: 0.6 },
  night: { stops: [[0, "#070A1E"], [0.5, "#141A3A"], [0.85, "#2A2050"], [1, "#3B2660"]], far: "#2A2552", mid: "#1A1838", near: "#0E0F26", lit: 0.75 },
};

/** a wide painted city skyline (no text). Far layers are pre-blurred for depth. 2048 × 1024 */
export const skylineTex = (mood: SkyMood, seed = 1) =>
  canvasTex(`sky-${mood}-${seed}`, 2048, 1024, (g, w, h) => {
    const S = SKY[mood];
    const r = rng(seed);
    const gr = g.createLinearGradient(0, 0, 0, h);
    S.stops.forEach(([o, c]) => gr.addColorStop(o, c));
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    if (mood === "night" || mood === "dusk") {
      for (let i = 0; i < 160; i++) {
        g.fillStyle = `rgba(255,240,220,${0.2 + r() * 0.6})`;
        g.fillRect(r() * w, r() * h * 0.5, 2, 2);
      }
    }
    if (S.sun) {
      const sx = w * 0.62;
      const sy = h * S.sun.y;
      const halo = g.createRadialGradient(sx, sy, 0, sx, sy, h * 0.5);
      halo.addColorStop(0, "rgba(255,230,190,0.9)");
      halo.addColorStop(0.2, "rgba(255,190,150,0.45)");
      halo.addColorStop(1, "rgba(255,170,150,0)");
      g.fillStyle = halo;
      g.fillRect(0, 0, w, h);
      g.fillStyle = S.sun.c;
      g.beginPath();
      g.arc(sx, sy, h * S.sun.r, 0, Math.PI * 2);
      g.fill();
      // long soft clouds
      for (let i = 0; i < 9; i++) {
        g.fillStyle = `rgba(255,${200 + r() * 40},${200 + r() * 30},${0.18 + r() * 0.2})`;
        g.beginPath();
        g.ellipse(r() * w, h * (0.2 + r() * 0.4), 120 + r() * 260, 10 + r() * 16, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
    const layer = (base: number, hMin: number, hMax: number, col: string, lit: number, blur: number, wMin: number, wMax: number) => {
      // draw the layer sharp on its own canvas, then composite it once (blurred) — never blur per draw call
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      const L = cv.getContext("2d")!;
      let x = -20;
      while (x < w) {
        const bw = wMin + r() * (wMax - wMin);
        const bh = hMin + r() * (hMax - hMin);
        const top = h * base - bh;
        L.fillStyle = col;
        L.fillRect(x, top, bw, h - top);
        if (r() < 0.25) L.fillRect(x + bw * 0.4, top - 30 - r() * 40, 4, 40 + r() * 30); // antenna
        for (let yy = top + 10; yy < h * base + 40; yy += 16) {
          for (let xx = x + 6; xx < x + bw - 8; xx += 13) {
            if (r() < lit * 0.55) {
              L.fillStyle = r() < 0.8 ? `rgba(255,${190 + r() * 50},${120 + r() * 60},${0.55 + r() * 0.45})` : `rgba(120,240,230,0.8)`;
              L.fillRect(xx, yy, 6, 8);
            }
          }
        }
        // abstract neon sign blocks, no text
        if (r() < 0.22) {
          L.fillStyle = r() < 0.5 ? PAL.pinkNeon : PAL.tealNeon;
          if (r() < 0.6) L.fillRect(x + bw * 0.2, top + 20, 10, 60 + r() * 60);
          else L.fillRect(x + 8, top + 18, bw * 0.6, 9);
        }
        x += bw + r() * 6;
      }
      g.save();
      if (blur) g.filter = `blur(${blur}px)`;
      g.drawImage(cv, 0, 0);
      g.restore();
    };
    layer(0.78, 90, 260, S.far, S.lit * 0.6, 5, 40, 110);
    layer(0.86, 120, 360, S.mid, S.lit * 0.8, 2, 50, 140);
    layer(0.97, 80, 300, S.near, S.lit, 0, 60, 170);
    g.fillStyle = S.near;
    g.fillRect(0, h * 0.97, w, h);
  });

/** big painted backdrop plane facing +z */
export const Backdrop: React.FC<{ mood: SkyMood; p: V3; w: number; h: number; seed?: number; bright?: number; rotY?: number }> = ({ mood, p, w, h, seed = 1, bright = 1.0, rotY = 0 }) => (
  <mesh position={p} rotation={[0, rotY, 0]}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={skylineTex(mood, seed)} color={new THREE.Color(bright, bright, bright)} toneMapped={false} fog={false} />
  </mesh>
);

const winTex = (seed: number, lit: number, warm: boolean) =>
  canvasTex(`win-${seed}-${lit}-${warm}`, 128, 256, (g, w, h) => {
    const r = rng(seed + 11);
    g.fillStyle = "#000000";
    g.fillRect(0, 0, w, h);
    for (let y = 8; y < h - 4; y += 14) {
      for (let x = 6; x < w - 6; x += 12) {
        if (r() < lit) {
          g.fillStyle = warm ? (r() < 0.85 ? `hsl(${32 + r() * 14},100%,${62 + r() * 20}%)` : "#7FF2E8") : `hsl(${180 + r() * 30},80%,${70 + r() * 15}%)`;
          g.fillRect(x, y, 7, 8);
        }
      }
    }
  });

/** low-poly 3D city blocks with lit windows (mid distance, for parallax). area = [xMin, xMax, zMin, zMax] */
export const CityBlocks: React.FC<{ area: [number, number, number, number]; n?: number; seed?: number; base?: string; lit?: number; hMin?: number; hMax?: number; y0?: number; neon?: boolean }> = ({ area, n = 18, seed = 3, base = "#3E2A62", lit = 0.45, hMin = 3, hMax = 14, y0 = 0, neon = true }) => {
  const r = rng(seed);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const x = area[0] + r() * (area[1] - area[0]);
        const z = area[2] + r() * (area[3] - area[2]);
        const w = 1.2 + r() * 2.2;
        const d = 1.2 + r() * 2;
        const hh = hMin + r() * (hMax - hMin);
        const tex = winTex(seed * 31 + (i % 5), lit, true);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        const m = texMat(`blk-${seed}-${i % 5}-${base}`, tex, { emissive: 2.2, rough: 0.9 });
        (m as THREE.MeshStandardMaterial).color = new THREE.Color(base);
        const nc = r() < 0.5 ? PAL.pinkNeon : PAL.tealNeon;
        const hasNeon = neon && r() < 0.35;
        return (
          <group key={i} position={[x, y0 + hh / 2, z]}>
            <mesh material={m}>
              <boxGeometry args={[w, hh, d]} />
            </mesh>
            <mesh position={[0, hh / 2 + 0.05, 0]} material={matte(base, 0.9)}>
              <boxGeometry args={[w * 1.04, 0.1, d * 1.04]} />
            </mesh>
            {hasNeon ? (
              <mesh position={[w * 0.3, hh * 0.15, d / 2 + 0.06]} material={glow(nc, 4)}>
                <boxGeometry args={[0.16, hh * 0.35, 0.05]} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </>
  );
};

// ---------- neon ----------
/** a neon tube along a polyline in the xy plane (abstract sign shapes, arrows, waves) */
export const NeonLine: React.FC<{ pts: [number, number][]; p: V3; c: string; r?: number; i?: number; rotY?: number; scale?: number }> = ({ pts, p, c, r = 0.025, i = 4, rotY = 0, scale = 1 }) => {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, "catmullrom", 0.1);
  return (
    <group position={p} rotation={[0, rotY, 0]} scale={scale}>
      <mesh material={glow(c, i)}>
        <tubeGeometry args={[curve, pts.length * 8, r, 6, false]} />
      </mesh>
    </group>
  );
};

// ---------- lamps ----------
/** a glowing bulb with an optional real light */
export const Glowbulb: React.FC<{ p: V3; r?: number; c?: string; i?: number; light?: number; dist?: number; shadow?: boolean }> = ({ p, r = 0.04, c = PAL.amber, i = 4, light = 0, dist = 4, shadow = false }) => (
  <group position={p}>
    <mesh material={glow(c, i)}>
      <icosahedronGeometry args={[r, 1]} />
    </mesh>
    {light > 0 ? <pointLight intensity={light} distance={dist} decay={1.6} color={c} castShadow={shadow} shadow-mapSize={[1024, 1024]} shadow-bias={-0.002} /> : null}
  </group>
);

/** string lights hung between points (catenary), bulbs warm */
export const StringLights: React.FC<{ a: V3; b: V3; sag?: number; n?: number; t?: number; c?: string[] }> = ({ a, b, sag = 0.4, n = 12, t = 0, c = [PAL.amber, "#FFD9A0", PAL.peach] }) => {
  const P = (u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - Math.sin(u * Math.PI) * sag + Math.sin(t * 0.05 + u * 3) * 0.01, a[2] + (b[2] - a[2]) * u];
  const pts = Array.from({ length: 24 }, (_, i) => new THREE.Vector3(...P(i / 23)));
  return (
    <group>
      <mesh material={matte("#2A2238", 0.8)}>
        <tubeGeometry args={[new THREE.CatmullRomCurve3(pts), 40, 0.006, 4, false]} />
      </mesh>
      {Array.from({ length: n }, (_, i) => {
        const u = (i + 0.5) / n;
        const q = P(u);
        const flick = 3.5 + Math.sin(t * 0.3 + i * 1.7) * 0.4;
        return <Glowbulb key={i} p={[q[0], q[1] - 0.04, q[2]]} r={0.03} c={c[i % c.length]} i={flick} />;
      })}
    </group>
  );
};

// ---------- props ----------
const BOOK_COLS = ["#7A2E3A", "#2E4E7A", "#C9963E", "#3E6E4A", "#E8DCC4", "#5A3A7A", "#B5543A", "#2F6B6B", "#8A6A4A"];
/** a row of books standing on a shelf (x along the row). Origin = left end at shelf top */
export const BookRow: React.FC<{ len: number; seed?: number; h?: number; cols?: string[]; lean?: boolean }> = ({ len, seed = 1, h = 0.26, cols = BOOK_COLS, lean = true }) => {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  let x = 0;
  let i = 0;
  while (x < len - 0.04) {
    const bw = 0.035 + r() * 0.035;
    const bh = h * (0.72 + r() * 0.28);
    const gap = r() < 0.06 ? 0.08 : 0;
    x += gap;
    if (x + bw > len) break;
    const tilt = lean && gap > 0 ? 0.25 : 0;
    out.push(
      <mesh key={i} position={[x + bw / 2, bh / 2, 0]} rotation={[0, 0, tilt]} castShadow receiveShadow material={matte(cols[Math.floor(r() * cols.length)], 0.85)}>
        <boxGeometry args={[bw, bh, 0.17 + r() * 0.04]} />
      </mesh>,
    );
    x += bw + 0.003;
    i++;
  }
  return <>{out}</>;
};

/** a tall bookshelf (front faces +z). Origin = bottom centre */
export const Bookshelf: React.FC<{ w: number; h: number; shelves: number; seed?: number; wood?: string }> = ({ w, h, shelves, seed = 1, wood = PAL.woodDark }) => {
  const sh = h / shelves;
  return (
    <group>
      <Bx p={[0, h / 2, -0.13]} s={[w, h, 0.02]} c="#2E1A12" />
      <Bx p={[-w / 2, h / 2, 0]} s={[0.05, h, 0.3]} c={wood} />
      <Bx p={[w / 2, h / 2, 0]} s={[0.05, h, 0.3]} c={wood} />
      {Array.from({ length: shelves + 1 }, (_, i) => (
        <Bx key={i} p={[0, i * sh + 0.015, 0]} s={[w, 0.03, 0.3]} c={wood} />
      ))}
      {Array.from({ length: shelves }, (_, i) => (
        <group key={`b${i}`} position={[-w / 2 + 0.04, i * sh + 0.03, 0]}>
          <BookRow len={w - 0.08} seed={seed * 17 + i} h={sh * 0.8} />
        </group>
      ))}
    </group>
  );
};

/** potted plant with faceted leaves. Origin = floor */
export const Plant: React.FC<{ s?: number; t?: number; pot?: string; leaf?: string }> = ({ s = 1, t = 0, pot = "#C98A5A", leaf = "#3E8A5A" }) => (
  <group scale={s}>
    <Cy p={[0, 0.12, 0]} r={0.13} r2={0.1} h={0.24} c={pot} seg={8} />
    {Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      const sway = Math.sin(t * 0.04 + i) * 0.04;
      return (
        <group key={i} position={[0, 0.24, 0]} rotation={[Math.cos(a) * (0.5 + (i % 3) * 0.15) + sway, 0, Math.sin(a) * (0.5 + (i % 3) * 0.15)]}>
          <mesh position={[0, 0.2 + (i % 3) * 0.06, 0]} scale={[0.07, 0.22 + (i % 3) * 0.05, 0.025]} castShadow material={matte(i % 2 ? leaf : "#4FA06A", 0.8)}>
            <icosahedronGeometry args={[1, 0]} />
          </mesh>
        </group>
      );
    })}
  </group>
);

/** dust motes drifting in lamp light (box = centre and half-size) */
export const Dust: React.FC<{ c: V3; half: V3; n?: number; t: number; color?: string; seed?: number }> = ({ c, half, n = 40, t, color = "#FFE2A8", seed = 5 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const x = c[0] + (hash(i * 3.1 + seed) * 2 - 1) * half[0] + Math.sin(t * 0.02 + i) * 0.05;
      const y = c[1] + (((hash(i * 7.3 + seed) + t * 0.0012 * (0.5 + hash(i))) % 1) * 2 - 1) * half[1];
      const z = c[2] + (hash(i * 5.7 + seed) * 2 - 1) * half[2];
      const tw = 0.5 + 0.5 * Math.sin(t * 0.1 + i * 2.3);
      return (
        <mesh key={i} position={[x, y, z]} material={glow(color, 1.6 + tw * 1.6)}>
          <icosahedronGeometry args={[0.006 + hash(i) * 0.006, 0]} />
        </mesh>
      );
    })}
  </>
);

/** a soft volumetric light cone (lamp pools, projector beams). Apex at origin, points down -y */
export const LightCone: React.FC<{ p: V3; rot?: V3; r: number; h: number; c: string; o?: number }> = ({ p, rot = [0, 0, 0], r, h, c, o = 0.08 }) => (
  <mesh position={p} rotation={rot} material={fade(c, o, { additive: true })}>
    <coneGeometry args={[r, h, 20, 1, true]} />
  </mesh>
);
export const lightConeGeoOffset = (h: number): V3 => [0, -h / 2, 0];

// rain streaks on glass (animated texture). Use on a plane just in front of a window.
export const rainTex = () =>
  canvasTex(
    "rain",
    256,
    512,
    (g, w, h) => {
      g.clearRect(0, 0, w, h);
      const r = rng(77);
      for (let i = 0; i < 90; i++) {
        const x = r() * w;
        const y = r() * h;
        const l = 20 + r() * 60;
        g.strokeStyle = `rgba(220,235,255,${0.25 + r() * 0.4})`;
        g.lineWidth = 1 + r() * 1.5;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + 2, y + l);
        g.stroke();
        if (r() < 0.4) {
          g.fillStyle = `rgba(230,240,255,${0.4 + r() * 0.4})`;
          g.beginPath();
          g.arc(x + 2, y + l, 2 + r() * 2.5, 0, Math.PI * 2);
          g.fill();
        }
      }
    },
    { repeat: [2, 1.5] },
  );
export const Rain: React.FC<{ p: V3; w: number; h: number; t: number }> = ({ p, w, h, t }) => {
  const tex = rainTex();
  tex.offset.set(0, (t * 0.012) % 1);
  return (
    <mesh position={p}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent opacity={0.75} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/** canvas sign with plain English text (no brands). Glows. */
export const signTex = (id: string, text: string, opts: { w?: number; h?: number; fg?: string; bg?: string; font?: string; size?: number; glowC?: string }) =>
  canvasTex(`sign-${id}`, opts.w ?? 512, opts.h ?? 128, (g, w, h) => {
    g.fillStyle = opts.bg ?? "rgba(0,0,0,0)";
    g.fillRect(0, 0, w, h);
    g.font = `700 ${opts.size ?? 72}px ${opts.font ?? "Fredoka"}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    if (opts.glowC) {
      g.shadowColor = opts.glowC;
      g.shadowBlur = 16;
    }
    g.fillStyle = opts.fg ?? "#FFFFFF";
    g.fillText(text, w / 2, h / 2 + 4);
  });

export const floorTex = (id: string, base: string, line: string, tiles: [number, number], plank = false) =>
  canvasTex(
    `floor-${id}`,
    512,
    512,
    (g, w, h) => {
      g.fillStyle = base;
      g.fillRect(0, 0, w, h);
      const r = rng(id.length * 13);
      if (plank) {
        for (let y = 0; y < h; y += 64) {
          const off = r() * 300;
          g.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.08})`;
          g.fillRect(0, y, w, 64);
          g.fillStyle = line;
          g.fillRect(0, y, w, 3);
          g.fillRect(off, y, 3, 64);
          g.fillRect((off + 256) % w, y, 3, 64);
          for (let k = 0; k < 6; k++) {
            g.fillStyle = `rgba(0,0,0,${0.05})`;
            g.fillRect(0, y + 8 + k * 9 + r() * 4, w, 1.5);
          }
        }
      } else {
        g.strokeStyle = line;
        g.lineWidth = 3;
        for (let x = 0; x <= w; x += w / 4) {
          g.beginPath();
          g.moveTo(x, 0);
          g.lineTo(x, h);
          g.stroke();
        }
        for (let y = 0; y <= h; y += h / 4) {
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(w, y);
          g.stroke();
        }
        for (let i = 0; i < 200; i++) {
          g.fillStyle = `rgba(0,0,0,${r() * 0.06})`;
          g.fillRect(r() * w, r() * h, 6, 6);
        }
      }
    },
    { repeat: tiles },
  );

export const Floor: React.FC<{ tex: THREE.Texture; id: string; size?: [number, number]; p?: V3; rough?: number }> = ({ tex, id, size = [30, 30], p = [0, 0, 0], rough = 0.85 }) => (
  <mesh position={p} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={texMat(id, tex, { rough })}>
    <planeGeometry args={size} />
  </mesh>
);

/** sun / moon key light with a wide soft shadow box around the action */
export const KeyLight: React.FC<{ p: V3; c: string; i: number; box?: number; target?: V3 }> = ({ p, c, i, box = 4, target = [0, 0.8, 0] }) => {
  const ref = React.useRef<THREE.DirectionalLight>(null);
  React.useLayoutEffect(() => {
    if (ref.current) {
      ref.current.target.position.set(...target);
      ref.current.target.updateMatrixWorld();
    }
  });
  return (
    <directionalLight
      ref={ref}
      position={p}
      intensity={i}
      color={c}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-box}
      shadow-camera-right={box}
      shadow-camera-top={box}
      shadow-camera-bottom={-box}
      shadow-camera-near={0.5}
      shadow-camera-far={60}
      shadow-bias={-0.0006}
      shadow-normalBias={0.02}
      shadow-radius={5}
    />
  );
};
