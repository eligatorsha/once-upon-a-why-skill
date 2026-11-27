// SET 7 — SHARED: CITY ROOFTOP AT SUNSET (bible §6.7). LOCKED. Where Mika and Nora argue.
// Mood: golden hour, the low sun behind them (warm rims, long shadows towards camera), string lights coming on,
// plants along the parapet, a train crossing far away.
// Explainer surface: a projection on the blank billboard on the roof across the street.
import React from "react";
import * as THREE from "three";
import { glow, liveTex, matte, V3 } from "../look/mat";
import { ROUND } from "../fonts";
import { PAL } from "../palette";
import { Backdrop, Bx, CityBlocks, Cy, Floor, KeyLight, LightCone, Plant, SetLook, StringLights, floorTex } from "./common";
import { Train } from "./Train";

export const ROOFTOP: SetLook = {
  cam: { pos: [0.0, 1.3, 5.4], target: [0.0, 1.2, -1.0], fov: 38 },
  lens: { aperture: 0.0018, maxblur: 0.007 },
  bloom: { strength: 0.8, radius: 0.65, threshold: 1.2 },
  exposure: 1.0,
  bg: "#4B2E6E",
  env: 0.3,
};
export const ROOFTOP_MARKS = {
  mika: { pos: [-0.5, 0, -0.35] as V3, yaw: 0.65 },
  nora: { pos: [0.5, 0, -0.45] as V3, yaw: -0.65 },
  claude: { pos: [0.02, 0.5, -1.2] as V3, yaw: 0 },
};

/** billboard projection content: two columns (e.g. PROS / CONS, JOB / PhD) */
const boardTex = (left: string[], right: string[], k: number) =>
  liveTex("roofBoard", 1024, 576, `${left.join("|")}#${right.join("|")}#${Math.round(k * 24)}`, (g, w, h) => {
    g.fillStyle = "#FFF6E6";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,180,140,0.25)";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#4B2E6E";
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(w / 2, 40);
    g.lineTo(w / 2, h - 40);
    g.stroke();
    const col = (items: string[], x: number, c: string) => {
      items.forEach((s, i) => {
        if (i / items.length > k * 1.1) return;
        g.font = i === 0 ? `700 74px ${ROUND}` : `600 54px ${ROUND}`;
        g.fillStyle = i === 0 ? c : "#2A1A48";
        g.textAlign = "center";
        g.fillText(s, x, 110 + i * 108);
      });
    };
    col(left, w * 0.25, PAL.mika);
    col(right, w * 0.75, PAL.nora);
  });

const FoldingChair: React.FC<{ p: V3; rotY: number; c: string }> = ({ p, rotY, c }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Bx p={[0, 0.42, 0]} s={[0.4, 0.04, 0.38]} c={c} r={0.7} />
    <Bx p={[0, 0.72, -0.19]} s={[0.4, 0.3, 0.03]} c={c} r={0.7} rot={[-0.12, 0, 0]} />
    {[-0.18, 0.18].map((x) => (
      <group key={x}>
        <Bx p={[x, 0.21, 0.12]} s={[0.025, 0.44, 0.025]} c="#7A7A8A" r={0.4} rot={[0.25, 0, 0]} />
        <Bx p={[x, 0.45, -0.12]} s={[0.025, 0.9, 0.025]} c="#7A7A8A" r={0.4} rot={[-0.2, 0, 0]} />
      </group>
    ))}
  </group>
);

export const RooftopSet: React.FC<{ t: number; explain?: number; board?: { left: string[]; right: string[] }; trainX?: number }> = ({
  t,
  explain = 0,
  board = { left: ["JOB", "money now", "routine", "learn fast"], right: ["PhD", "deep topic", "freedom", "4+ years"] },
  trainX,
}) => {
  const tiles = floorTex("roofTiles", "#B98A7A", "rgba(80,40,40,0.25)", [6, 6]);
  const tx = trainX ?? 14 - ((t * 0.12) % 40);
  return (
    <>
      <hemisphereLight args={["#FFC9B0", "#4B2E6E", 0.7]} />
      {/* low sun behind, slightly right: warm rims, shadows towards camera */}
      <KeyLight p={[3.5, 3.2, -9]} c="#FFA36C" i={3.0} box={4} target={[0, 0.5, 0]} />
      <directionalLight position={[-2, 3, 6]} intensity={0.55} color="#D9C8F0" />

      <Backdrop mood="golden" p={[0, 9, -70]} w={150} h={46} seed={51} />
      <CityBlocks area={[-24, 24, -50, -16]} n={34} seed={53} base="#9A6A92" lit={0.15} hMin={3} hMax={18} y0={-8} />
      {/* the far elevated line and the passing train */}
      <Bx p={[0, -0.2, -22]} s={[80, 0.3, 1.2]} c="#7A5A8A" cast={false} />
      <group scale={0.9}>
        <Train x={tx} z={-24.4} y={-0.1} len={10} />
      </group>

      {/* the building across the street with the billboard */}
      <group position={[0.4, 0, -8.5]}>
        <Bx p={[0, -1.5, 0]} s={[6, 4.5, 3]} c="#7A4E7E" cast={false} />
        {[-1.1, 1.1].map((x) => (
          <Bx key={x} p={[x, 1.2, 0]} s={[0.1, 1.4, 0.1]} c="#3A2A4A" cast={false} />
        ))}
        <Bx p={[0, 2.85, -0.05]} s={[3.9, 2.25, 0.1]} c="#3A2A4A" cast={false} />
        <mesh position={[0, 2.85, 0.01]}>
          <planeGeometry args={[3.7, 2.08]} />
          <meshBasicMaterial map={boardTex(board.left, board.right, explain)} color={new THREE.Color(0.55 + explain * 0.5, 0.5 + explain * 0.5, 0.55 + explain * 0.45)} toneMapped={false} />
        </mesh>
        {/* projector beam from our rooftop's corner */}
        {explain > 0.02 ? <LightCone p={[0, 2.85, 3.2]} rot={[-Math.PI / 2, 0, 0]} r={1.9} h={6.4} c="#FFF2D8" o={0.05 * Math.min(1, explain * 3)} /> : null}
        {[-1.4, 0, 1.4].map((x) => (
          <mesh key={x} position={[x, 4.05, 0.3]} material={glow("#FFF2D8", 2.5)}>
            <boxGeometry args={[0.25, 0.06, 0.15]} />
          </mesh>
        ))}
      </group>

      {/* our roof: tiles, parapet, water tank, AC unit */}
      <Floor tex={tiles} id="roofTilesM" size={[10, 8]} p={[0, 0, 0.5]} rough={0.9} />
      <Bx p={[0, 0.3, -2.2]} s={[10, 0.6, 0.25]} c="#C99A8A" />
      <Bx p={[0, 0.62, -2.2]} s={[10, 0.05, 0.3]} c="#E0B8A8" />
      {Array.from({ length: 14 }, (_, i) => (
        <Bx key={i} p={[-3.25 + i * 0.5, 0.95, -2.15]} s={[0.03, 0.6, 0.03]} c="#5A4A6A" cast={false} />
      ))}
      <Bx p={[0, 1.25, -2.15]} s={[10, 0.04, 0.04]} c="#5A4A6A" cast={false} />
      <group position={[-1.45, 0, -1.6]}>
        {[-0.35, 0.35].map((x) => [-0.35, 0.35].map((z) => <Bx key={`${x}${z}`} p={[x, 0.75, z]} s={[0.06, 1.5, 0.06]} c="#6A5A7A" />))}
        <Bx p={[0, 1.5, 0]} s={[0.9, 0.06, 0.9]} c="#6A5A7A" />
        <Cy p={[0, 2.05, 0]} r={0.48} h={1.05} c="#E0D2E8" seg={14} rough={0.7} />
        <mesh position={[0, 2.62, 0]} material={matte("#C9B8D8", 0.7)}>
          <coneGeometry args={[0.5, 0.22, 14]} />
        </mesh>
        {[1.75, 2.15].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={matte("#B9A8C8", 0.6)}>
            <torusGeometry args={[0.485, 0.012, 4, 24]} />
          </mesh>
        ))}
      </group>
      <group position={[1.5, 0, -1.6]}>
        <Bx p={[0, 0.3, 0]} s={[0.7, 0.6, 0.45]} c="#D8D2E0" r={0.6} />
        <Cy p={[0, 0.3, 0.23]} r={0.2} h={0.02} c="#8A8498" rot={[Math.PI / 2, 0, 0]} seg={16} />
        <group position={[0, 0.3, 0.245]} rotation={[0, 0, t * 0.4]}>
          {[0, 1, 2].map((i) => (
            <Bx key={i} p={[0, 0, 0]} s={[0.34, 0.04, 0.01]} rot={[0, 0, (i * Math.PI) / 3]} c="#5A5468" cast={false} />
          ))}
        </group>
      </group>
      <group position={[1.05, 0, -1.7]}>
        <Plant s={0.8} t={t} pot="#C9764F" />
      </group>
      <group position={[-0.85, 0, -1.75]}>
        <Plant s={0.6} t={t} pot={PAL.lilac} />
      </group>

      {/* rooftop garden: planter boxes and pots along the parapet */}
      {[-1.9, 1.9].map((x) => (
        <group key={x} position={[x, 0, -1.85]}>
          <Bx p={[0, 0.17, 0]} s={[0.9, 0.34, 0.3]} c="#B97A5A" />
          <Bx p={[0, 0.33, 0]} s={[0.84, 0.03, 0.26]} c="#4A3020" cast={false} />
          {[-0.3, 0, 0.3].map((dx, i) => (
            <group key={dx} position={[dx, 0.32, 0]} scale={0.55 + (i % 2) * 0.15}>
              <Plant s={1} t={t + i * 9} pot="#B97A5A" leaf={i % 2 ? "#4F9A5E" : "#3E8A5A"} />
            </group>
          ))}
        </group>
      ))}
      <group position={[-0.55, 0, -1.55]}>
        <Plant s={1.1} t={t} pot="#E8B23A" />
      </group>
      <group position={[0.6, 0, -1.6]}>
        <Plant s={0.9} t={t + 20} pot={PAL.peach} leaf="#4F9A5E" />
      </group>
      <group position={[1.35, 0, -0.9]}>
        <Plant s={0.7} t={t + 7} pot={PAL.lilac} />
      </group>
      {/* string lights and two old chairs */}
      <StringLights a={[-2.4, 2.75, -0.6]} b={[2.4, 2.8, -1.0]} sag={0.4} n={16} t={t} />
      <FoldingChair p={[-0.95, 0, -0.95]} rotY={0.5} c={PAL.tealNeon} />
      <FoldingChair p={[0.95, 0, -1.0]} rotY={-0.45} c="#E8B23A" />
      <Bx p={[0.02, 0.25, -1.2]} s={[0.36, 0.5, 0.3]} c={PAL.woodLight} />
    </>
  );
};
