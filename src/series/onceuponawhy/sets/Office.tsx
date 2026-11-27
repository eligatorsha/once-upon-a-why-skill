// SET 1 — NORA: CITY OFFICE, 26TH FLOOR, SUNSET (bible §6.1). LOCKED.
// Mood: peach and lilac sunset pouring through a floor-to-ceiling window, long warm shadows, amber desk lamp.
// Explainer surface: a hologram that rises out of a puck on the desk (teal light, scanlines).
import React from "react";
import * as THREE from "three";
import { canvasTex, fade, glow, liveTex, matte, texMat, V3 } from "../look/mat";
import { ROUND } from "../fonts";
import { PAL } from "../palette";
import { Claude } from "../cast/Claude";
import { Laptop, TabbedNotebook, Thermos, Paper } from "../cast/props";
import { Backdrop, Bx, CityBlocks, Cy, Dust, Glowbulb, KeyLight, LightCone, Plant, SetLook, floorTex, Floor } from "./common";

export const OFFICE: SetLook = {
  cam: { pos: [0.06, 1.3, 4.9], target: [0.06, 1.02, -1.0], fov: 33 },
  lens: { aperture: 0.0016, maxblur: 0.006 },
  bloom: { strength: 0.7, radius: 0.6, threshold: 1.25 },
  exposure: 1.0,
  bg: "#2A1A48",
  env: 0.3,
};
/** where characters stand / sit in this set */
export const OFFICE_MARKS = {
  nora: { pos: [-0.42, 0, -0.55] as V3, yaw: 0.25 },
  claude: { pos: [0.5, 0.64, -1.38] as V3, yaw: -0.3 },
  mika: { pos: [-1.3, 0, -0.4] as V3, yaw: 0.5 },
};
const DESK_Y = 0.62;

const labelTex = () =>
  canvasTex("officeLabels", 256, 64, (g, w, h) => {
    g.fillStyle = "#FFF6E6";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#4B2E6E";
    g.font = `600 34px ${ROUND}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("2025 · A–M", w / 2, h / 2 + 2);
  });

const clockFace = () =>
  canvasTex("officeClock", 256, 256, (g, w) => {
    g.fillStyle = "#FFF6E6";
    g.beginPath();
    g.arc(w / 2, w / 2, w / 2 - 4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#4B2E6E";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.fillRect(w / 2 + Math.cos(a) * 100 - 4, w / 2 + Math.sin(a) * 100 - 4, 8, 8);
    }
  });

/** the hologram panel: a simple chart and steps (content swaps per episode via `lines`) */
const holoTex = (lines: string[], k: number) =>
  liveTex("officeHolo", 512, 640, `${lines.join("|")}|${Math.round(k * 20)}`, (g, w, h) => {
    g.strokeStyle = "rgba(120,255,240,0.9)";
    g.lineWidth = 4;
    g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = "rgba(63,224,208,0.12)";
    g.fillRect(10, 10, w - 20, h - 20);
    g.font = `700 54px ${ROUND}`;
    g.fillStyle = "#B8FFF6";
    g.fillText(lines[0] ?? "", 36, 80);
    // bars grow with k
    const vals = [0.55, 0.8, 0.95];
    vals.forEach((v, i) => {
      const y = 150 + i * 120;
      g.fillStyle = "rgba(120,255,240,0.25)";
      g.fillRect(36, y + 40, w - 72, 34);
      g.fillStyle = i === 2 ? "rgba(255,190,140,0.95)" : "rgba(120,255,240,0.9)";
      g.fillRect(36, y + 40, (w - 72) * v * Math.min(1, k * 1.4 - i * 0.15), 34);
      g.font = `600 34px ${ROUND}`;
      g.fillStyle = "#DFFFFB";
      g.fillText(lines[i + 1] ?? "", 36, y + 28);
    });
    g.font = `700 40px ${ROUND}`;
    g.fillStyle = "#FFD9A0";
    if (k > 0.8) g.fillText(lines[4] ?? "", 36, h - 50);
    // scanlines
    g.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = 0; y < h; y += 6) g.fillRect(0, y, w, 2);
  });

const RetroLamp: React.FC<{ p: V3; on?: number }> = ({ p, on = 1 }) => (
  <group position={p} rotation={[0, -0.6, 0]}>
    <Cy p={[0, 0.015, 0]} r={0.08} r2={0.09} h={0.03} c={PAL.mika} seg={10} rough={0.6} />
    <mesh position={[0, 0.18, -0.02]} rotation={[-0.25, 0, 0]} material={matte("#E8B23A", 0.5)}>
      <cylinderGeometry args={[0.012, 0.012, 0.34, 6]} />
    </mesh>
    <mesh position={[0, 0.34, 0.05]} rotation={[1.15, 0, 0]} material={matte("#E8B23A", 0.5)}>
      <cylinderGeometry args={[0.012, 0.012, 0.22, 6]} />
    </mesh>
    <group position={[0, 0.38, 0.17]} rotation={[0.9, 0, 0]}>
      <mesh material={matte(PAL.mika, 0.55, { side: THREE.DoubleSide })} castShadow>
        <coneGeometry args={[0.09, 0.14, 12, 1, true]} />
      </mesh>
      <Glowbulb p={[0, -0.05, 0]} r={0.035} c="#FFD08A" i={6 * on} light={2.2 * on} dist={3.5} />
    </group>
  </group>
);

const FilingCabinet: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <Bx p={[0, 0.65, 0]} s={[0.5, 1.3, 0.55]} c="#8C7AA8" r={0.55} />
    {[0, 1, 2, 3].map((i) => (
      <group key={i} position={[0, 0.17 + i * 0.31, 0.28]}>
        <Bx p={[0, 0, 0]} s={[0.44, 0.27, 0.02]} c="#9D8BB9" r={0.5} />
        <mesh position={[0, 0.06, 0.012]} material={texMat("officeLabelM", labelTex())}>
          <planeGeometry args={[0.16, 0.04]} />
        </mesh>
        <Bx p={[0, -0.04, 0.02]} s={[0.12, 0.02, 0.02]} c={PAL.chrome} r={0.3} />
      </group>
    ))}
  </group>
);

export const OfficeSet: React.FC<{ t: number; explain?: number; holo?: string[]; claude?: boolean }> = ({ t, explain = 0, holo = ["YOUR CV", "Skills", "Impact", "Fit", "→ lead with impact"], claude = true }) => {
  const carpet = floorTex("officeCarpet", "#6A5088", "rgba(40,20,60,0.08)", [6, 6]);
  const k = explain;
  return (
    <>
      {/* light */}
      <hemisphereLight args={["#FFC9B0", "#4B2E6E", 0.75]} />
      <KeyLight p={[-5, 3.6, -9]} c="#FF9E6A" i={3.4} box={4} target={[0, 0.5, -0.5]} />
      <directionalLight position={[2.5, 3, 6]} intensity={0.55} color="#C8B6F0" />
      <pointLight position={[0.5, 2.8, 1.5]} intensity={0.6} distance={6} color="#FFD9C2" />

      {/* the city outside */}
      <Backdrop mood="sunset" p={[0, 9, -70]} w={150} h={42} seed={4} />
      <CityBlocks area={[-22, 22, -40, -12]} n={34} seed={7} base="#7A5A98" lit={0.25} hMin={5} hMax={18} y0={-16} />
      <CityBlocks area={[-14, 14, -12, -6]} n={8} seed={9} base="#5A3E7E" lit={0.3} hMin={8} hMax={13} y0={-15} neon={false} />

      {/* room */}
      <Floor tex={carpet} id="officeCarpetM" size={[12, 8]} p={[0, 0, 0]} rough={0.95} />
      <Bx p={[0, 3.25, -0.5]} s={[12, 0.1, 6]} c="#3A2A55" cast={false} />
      {/* window wall: sill, mullions, glass */}
      <Bx p={[0, 0.08, -2.65]} s={[12, 0.16, 0.25]} c="#3A2A55" />
      <Bx p={[0, 3.12, -2.65]} s={[12, 0.18, 0.2]} c="#3A2A55" />
      {[-3.6, -1.9, 0.6, 2.9].map((x, i) => (
        <Bx key={i} p={[x, 1.6, -2.65]} s={[i === 1 ? 0.5 : 0.07, 3.2, i === 1 ? 0.4 : 0.1]} c={i === 1 ? "#4A3768" : "#2E2246"} r={0.5} />
      ))}
      <Bx p={[0, 1.05, -2.66]} s={[12, 0.05, 0.06]} c="#2E2246" r={0.5} />
      <mesh position={[0, 1.6, -2.62]} material={fade("#FFD9E8", 0.05)}>
        <planeGeometry args={[12, 3.2]} />
      </mesh>
      {/* wall clock on the pillar */}
      <group position={[-1.9, 2.35, -2.44]}>
        <Cy p={[0, 0, 0]} r={0.2} h={0.05} c="#E8B23A" rot={[Math.PI / 2, 0, 0]} seg={16} rough={0.5} />
        <mesh position={[0, 0, 0.03]} material={texMat("officeClockM", clockFace())}>
          <circleGeometry args={[0.17, 24]} />
        </mesh>
        <Bx p={[0, 0.05, 0.04]} s={[0.015, 0.1, 0.01]} c="#2A1A48" rot={[0, 0, -t * 0.002]} cast={false} />
        <Bx p={[0, 0.0, 0.045]} s={[0.01, 0.14, 0.01]} c={PAL.mika} rot={[0, 0, -t * 0.03 - 1]} cast={false} />
      </group>

      {/* filing cabinets */}
      <FilingCabinet p={[-2.5, 0, -2.1]} />
      <FilingCabinet p={[-1.95, 0, -2.1]} />
      <group position={[-2.2, 1.3, -2.1]}>
        <Plant s={0.6} t={t} />
      </group>
      {/* paper stack on the cabinets */}
      <group position={[-1.95, 1.31, -2.05]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <Paper i={1} bend={0} />
      </group>

      {/* desk */}
      <group position={[0.3, 0, -1.55]}>
        <Bx p={[0, DESK_Y - 0.02, 0]} s={[1.8, 0.04, 0.8]} c={PAL.woodWarm} r={0.6} />
        <Bx p={[-0.7, (DESK_Y - 0.04) / 2, 0]} s={[0.4, DESK_Y - 0.04, 0.7]} c="#6E4A30" />
        {[0, 1, 2].map((i) => (
          <Bx key={i} p={[-0.7, 0.12 + i * 0.18, 0.355]} s={[0.36, 0.15, 0.02]} c="#7E5638" />
        ))}
        <Bx p={[0.84, (DESK_Y - 0.04) / 2, 0]} s={[0.05, DESK_Y - 0.04, 0.7]} c="#6E4A30" />
        {/* desk things */}
        <group position={[-0.32, DESK_Y, -0.05]} rotation={[0, 0.35, 0]}>
          <Laptop screen={0.55} />
        </group>
        <group position={[-0.62, DESK_Y, 0.18]} rotation={[0, -0.3, 0]}>
          <TabbedNotebook />
        </group>
        <group position={[-0.62, DESK_Y + 0.03, 0.18]} rotation={[0, 0.1, 0]}>
          <TabbedNotebook />
        </group>
        <group position={[-0.38, DESK_Y, -0.2]}>
          <Thermos />
        </group>
        <RetroLamp p={[0.66, DESK_Y, -0.22]} />
        {/* hologram puck */}
        <Cy p={[-0.08, DESK_Y + 0.015, 0.22]} r={0.09} h={0.03} c="#2A2240" rough={0.4} />
        <mesh position={[-0.08, DESK_Y + 0.032, 0.22]} rotation={[-Math.PI / 2, 0, 0]} material={glow(PAL.tealNeon, 3 * (0.3 + k))}>
          <ringGeometry args={[0.04, 0.07, 20]} />
        </mesh>
      </group>
      {claude ? (
        <group position={OFFICE_MARKS.claude.pos} rotation={[0, OFFICE_MARKS.claude.yaw, 0]}>
          <Claude t={t} expr="happy" mug />
        </group>
      ) : null}

      {/* hologram */}
      {k > 0.01 ? (
        <group position={[0.22, DESK_Y + 0.06, -1.33]}>
          <LightCone p={[0, 0.35 * k, 0]} rot={[Math.PI, 0, 0]} r={0.3} h={0.7 * k} c={PAL.tealNeon} o={0.09} />
          <mesh position={[0, 0.72 * k + 0.08, 0]} scale={[1, k, 1]} rotation={[0, -0.25, 0]}>
            <planeGeometry args={[0.62, 0.78]} />
            <meshBasicMaterial map={holoTex(holo, k)} transparent opacity={0.92 * Math.min(1, k * 1.5) * (0.92 + Math.sin(t * 0.9) * 0.05)} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      ) : null}

      {/* tall plant on the right, dust in the sun */}
      <group position={[1.35, 0, -2.0]}>
        <Plant s={1.6} t={t} pot="#E8B23A" />
      </group>
      <Dust c={[0.4, 1.2, -1.4]} half={[0.9, 0.6, 0.5]} n={26} t={t} color="#FFD2A8" />
    </>
  );
};
