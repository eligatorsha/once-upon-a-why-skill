// ONCE UPON A WHY: the heroines' signature props (bible §5.4). All generic: no brands, no logos.
import React from "react";
import * as THREE from "three";
import { canvasTex, chrome, fade, glow, hash, matte, texMat } from "../look/mat";
import { ROUND } from "../fonts";
import { PAL } from "../palette";
import { geo } from "./rig";

// ---------- Mika ----------
const crackTex = () =>
  canvasTex("phoneCrack", 256, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, "#3A2A6E");
    gr.addColorStop(1, "#E7769F");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    // app tiles
    for (let i = 0; i < 12; i++) {
      g.fillStyle = ["#FFD08A", "#7FE3D8", "#FF9DB8", "#C9B5FF"][i % 4];
      g.globalAlpha = 0.85;
      g.beginPath();
      g.roundRect(28 + (i % 3) * 72, 70 + Math.floor(i / 3) * 80, 52, 52, 12);
      g.fill();
    }
    g.globalAlpha = 1;
    // the crack: a star from the top-right corner
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.lineWidth = 3;
    const o = [190, 120];
    for (let i = 0; i < 9; i++) {
      g.beginPath();
      g.moveTo(o[0], o[1]);
      let x = o[0];
      let y = o[1];
      const a = (i / 9) * Math.PI * 2 + 0.3;
      for (let k = 0; k < 5; k++) {
        x += Math.cos(a + (hash(i * 9 + k) - 0.5) * 0.9) * 34;
        y += Math.sin(a + (hash(i * 3 + k) - 0.5) * 0.9) * 34;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    g.lineWidth = 2;
    g.beginPath();
    g.arc(o[0], o[1], 22, 0, Math.PI * 2);
    g.stroke();
  });

/** Mika's phone with the cracked screen. Origin = centre of the phone; screen faces +z. */
export const Phone: React.FC<{ glowOn?: number }> = ({ glowOn = 1 }) => (
  <group>
    <mesh castShadow material={matte("#2B2440", 0.6)}>
      <boxGeometry args={[0.07, 0.14, 0.012]} />
    </mesh>
    <mesh position={[0, 0, 0.0065]} material={texMat("phoneScreen", crackTex(), { emissive: 0.9 * glowOn, rough: 0.3 })}>
      <planeGeometry args={[0.062, 0.128]} />
    </mesh>
  </group>
);

const tapeTex = () =>
  canvasTex("cassetteFace", 256, 160, (g, w, h) => {
    g.fillStyle = "#CDD1DA";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#2A2340";
    g.beginPath();
    g.roundRect(30, 30, w - 60, 70, 10);
    g.fill();
    g.fillStyle = "#FF8A4C";
    g.fillRect(30, 30, w - 60, 14);
    for (const x of [86, 170]) {
      g.fillStyle = "#F4E2C4";
      g.beginPath();
      g.arc(x, 70, 20, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#2A2340";
      g.beginPath();
      g.arc(x, 70, 8, 0, Math.PI * 2);
      g.fill();
    }
    // buttons
    ["#FF8A4C", "#9AA0AE", "#9AA0AE", "#D7263D"].forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.roundRect(34 + i * 50, 118, 40, 22, 5);
      g.fill();
    });
  });

/** the generic portable cassette player (no brand). Origin = centre; face towards +z. ~0.12 × 0.085 */
export const CassettePlayer: React.FC = () => (
  <group>
    <mesh castShadow material={chrome("#B9BEC9")}>
      <boxGeometry args={[0.12, 0.085, 0.032]} />
    </mesh>
    <mesh position={[0, 0, 0.0165]} material={texMat("cassetteFace", tapeTex(), { rough: 0.5 })}>
      <planeGeometry args={[0.116, 0.081]} />
    </mesh>
    <mesh position={[0.045, 0.047, 0]} material={matte("#2A2340", 0.5)}>
      <cylinderGeometry args={[0.005, 0.005, 0.012, 6]} />
    </mesh>
  </group>
);

/** one sheet of paper (CVs, forms, applications). Origin = centre, lies in the xy plane. */
const paperTex = (i: number) =>
  canvasTex(`paper${i % 4}`, 128, 180, (g, w, h) => {
    g.fillStyle = "#FFFDF6";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#3A3350";
    g.globalAlpha = 0.55;
    g.fillRect(14, 16, 60 + (i % 3) * 10, 8);
    g.globalAlpha = 0.28;
    for (let k = 0; k < 11; k++) g.fillRect(14, 36 + k * 12, w - 28 - ((k * 7 + i * 13) % 34), 4);
    g.globalAlpha = 1;
    if (i % 4 === 1) {
      g.fillStyle = "#D7263D";
      g.globalAlpha = 0.7;
      g.beginPath();
      g.arc(w - 26, 24, 10, 0, Math.PI * 2);
      g.fill();
    }
  });
export const Paper: React.FC<{ i?: number; bend?: number }> = ({ i = 0, bend = 0.15 }) => {
  const g = geo(`paperGeo${Math.round(bend * 100)}`, () => {
    const p = new THREE.PlaneGeometry(0.15, 0.21, 6, 1);
    const pos = p.getAttribute("position");
    for (let k = 0; k < pos.count; k++) {
      const x = pos.getX(k);
      pos.setZ(k, Math.cos((x / 0.075) * 1.2) * bend * 0.04);
    }
    p.computeVertexNormals();
    return p;
  });
  return <mesh geometry={g} castShadow material={texMat(`paperM${i % 4}`, paperTex(i), { rough: 0.9, side: THREE.DoubleSide })} />;
};

// ---------- Nora ----------
/** the notebook bursting with colour-coded tabs. Origin = centre, closed, lying flat (cover up). */
export const TabbedNotebook: React.FC<{ open?: number }> = ({ open = 0 }) => {
  const tabs = ["#FF8FB1", "#3FE0D0", "#FFD25A", "#B9A3E3", "#FF8A4C", "#7FA35B", "#FF8FB1", "#3FE0D0", "#FFD25A"];
  return (
    <group>
      <mesh position={[0, 0.012, 0]} castShadow material={matte("#F6EEDD", 0.85)}>
        <boxGeometry args={[0.2, 0.024, 0.26]} />
      </mesh>
      <group position={[-0.1, 0.026, 0]} rotation={[0, 0, -open * 2.6]}>
        <mesh position={[0.1, 0.0, 0]} castShadow material={matte(PAL.nora, 0.8)}>
          <boxGeometry args={[0.205, 0.006, 0.265]} />
        </mesh>
        <mesh position={[0.1, 0.004, 0.08]} material={matte("#F4E2C4", 0.8)}>
          <boxGeometry args={[0.12, 0.002, 0.035]} />
        </mesh>
      </group>
      <mesh position={[0.1, 0.012, 0]} material={matte("#3B4B2C", 0.8)}>
        <boxGeometry args={[0.012, 0.03, 0.265]} />
      </mesh>
      {tabs.map((c, i) => {
        const side = i < 5 ? "r" : "t";
        const k = side === "r" ? i : i - 5;
        return side === "r" ? (
          <mesh key={i} position={[0.11 + 0.012, 0.004 + (k % 3) * 0.007, -0.1 + k * 0.05]} rotation={[0, (hash(i) - 0.5) * 0.15, 0]} material={matte(c, 0.7)}>
            <boxGeometry args={[0.035, 0.003, 0.03]} />
          </mesh>
        ) : (
          <mesh key={i} position={[-0.06 + k * 0.045, 0.006 + (k % 2) * 0.007, -0.13 - 0.012]} material={matte(c, 0.7)}>
            <boxGeometry args={[0.028, 0.003, 0.035]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** the notebook held upright against the chest (cover faces +z) */
export const NotebookHeld: React.FC = () => (
  <group rotation={[Math.PI / 2, 0, 0]}>
    <TabbedNotebook />
  </group>
);

/** matcha thermos. Origin = bottom centre. ~0.2 tall */
export const Thermos: React.FC<{ slosh?: number }> = ({ slosh = 0 }) => (
  <group rotation={[slosh * 0.05, 0, slosh * 0.08]}>
    <mesh position={[0, 0.085, 0]} castShadow material={matte(PAL.nora, 0.7)}>
      <cylinderGeometry args={[0.032, 0.034, 0.17, 12]} />
    </mesh>
    <mesh position={[0, 0.06, 0]} material={matte("#F4E2C4", 0.75)}>
      <cylinderGeometry args={[0.0345, 0.0345, 0.022, 12]} />
    </mesh>
    <mesh position={[0, 0.185, 0]} castShadow material={matte("#F4E2C4", 0.75)}>
      <cylinderGeometry args={[0.03, 0.033, 0.035, 12]} />
    </mesh>
  </group>
);

/** a pen (Nora taps it when anxious). Origin = middle, along y */
export const Pen: React.FC<{ color?: string }> = ({ color = "#1B1420" }) => (
  <group>
    <mesh material={matte(color, 0.5)}>
      <cylinderGeometry args={[0.006, 0.006, 0.13, 6]} />
    </mesh>
    <mesh position={[0, -0.072, 0]} material={chrome()}>
      <coneGeometry args={[0.006, 0.016, 6]} />
    </mesh>
    <mesh position={[0.007, 0.04, 0]} material={chrome()}>
      <boxGeometry args={[0.003, 0.045, 0.004]} />
    </mesh>
  </group>
);

const tabsTex = () =>
  canvasTex("laptopTabs", 512, 320, (g, w, h) => {
    g.fillStyle = "#F4F1FA";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#DCD4EE";
    g.fillRect(0, 0, w, 40);
    // too many tabs
    for (let i = 0; i < 26; i++) {
      g.fillStyle = i === 7 ? "#F4F1FA" : ["#C9BDE6", "#BFB2DF"][i % 2];
      g.fillRect(4 + i * 19.4, 8, 18, 32);
      g.fillStyle = ["#FF8FB1", "#3FE0D0", "#FFD25A", "#7FA35B", "#FF8A4C"][i % 5];
      g.fillRect(8 + i * 19.4, 16, 8, 8);
    }
    g.fillStyle = "#3A3350";
    g.font = `600 26px ${ROUND}`;
    g.fillText("application_final_v7.doc", 26, 86);
    g.globalAlpha = 0.25;
    for (let k = 0; k < 10; k++) g.fillRect(26, 108 + k * 18, w - 60 - ((k * 37) % 120), 7);
    g.globalAlpha = 1;
  });

/** Nora's laptop with too many tabs. Origin = bottom centre of the base; screen opens towards -z (faces +z) */
export const Laptop: React.FC<{ open?: number; screen?: number }> = ({ open = 1, screen = 1 }) => (
  <group>
    <mesh position={[0, 0.008, 0]} castShadow material={matte("#BFC3CE", 0.5, { metal: 0.3 })}>
      <boxGeometry args={[0.34, 0.016, 0.23]} />
    </mesh>
    <mesh position={[0, 0.0165, 0.02]} material={matte("#3A3A46", 0.8)}>
      <planeGeometry args={[0.3, 0.12]} />
    </mesh>
    {/* lid hinged at the back edge; closed = lying on the base, open ≈ 110° */}
    <group position={[0, 0.016, -0.115]} rotation={[-open * 1.9, 0, 0]}>
      <mesh position={[0, 0.006, 0.115]} castShadow material={matte("#BFC3CE", 0.5, { metal: 0.3 })}>
        <boxGeometry args={[0.34, 0.012, 0.23]} />
      </mesh>
      <mesh position={[0, -0.0005, 0.115]} rotation={[Math.PI / 2, 0, 0]} material={texMat("laptopScreen", tabsTex(), { emissive: 1.1 * screen, rough: 0.4 })}>
        <planeGeometry args={[0.31, 0.2]} />
      </mesh>
    </group>
  </group>
);

/** a warm glowing bulb (lamps, string lights) */
export const Bulb: React.FC<{ r?: number; c?: string; i?: number }> = ({ r = 0.03, c = PAL.amber, i = 3 }) => (
  <mesh material={glow(c, i)}>
    <icosahedronGeometry args={[r, 1]} />
  </mesh>
);

// ---------- ep 1: coffee shop table props ----------
/** a latte: cream cup on a saucer, coffee with a foam heart. Origin = table surface under the saucer. */
const latteTop = () =>
  canvasTex("latteTop", 128, 128, (g, w, h) => {
    g.fillStyle = "#B97A4A";
    g.beginPath();
    g.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#F6E7D2";
    g.beginPath();
    const cx = w / 2;
    const cy = h / 2 + 6;
    g.moveTo(cx, cy + 26);
    g.bezierCurveTo(cx - 44, cy - 4, cx - 22, cy - 40, cx, cy - 16);
    g.bezierCurveTo(cx + 22, cy - 40, cx + 44, cy - 4, cx, cy + 26);
    g.fill();
  });
export const Latte: React.FC<{ steam?: number; t?: number }> = ({ steam = 1, t = 0 }) => (
  <group>
    <mesh position={[0, 0.006, 0]} castShadow receiveShadow material={matte(PAL.cream, 0.6, { flat: false })}>
      <cylinderGeometry args={[0.085, 0.07, 0.012, 28]} />
    </mesh>
    <mesh position={[0, 0.05, 0]} castShadow material={matte(PAL.cream, 0.6, { flat: false })}>
      <cylinderGeometry args={[0.055, 0.04, 0.08, 24, 1, true]} />
    </mesh>
    <mesh position={[0, 0.011, 0]} material={matte(PAL.cream, 0.6, { flat: false })}>
      <cylinderGeometry args={[0.04, 0.04, 0.004, 20]} />
    </mesh>
    <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]} material={texMat("latteTopM", latteTop(), { rough: 0.7 })}>
      <circleGeometry args={[0.052, 24]} />
    </mesh>
    <mesh position={[0.062, 0.055, 0]} rotation={[0, 0, Math.PI / 2]} material={matte(PAL.cream, 0.6, { flat: false })}>
      <torusGeometry args={[0.02, 0.007, 6, 12, Math.PI]} />
    </mesh>
    {steam > 0
      ? [0, 1, 2].map((i) => {
          const ph = ((t * 0.012 + i / 3) % 1);
          return (
            <mesh key={i} position={[Math.sin(t * 0.04 + i * 2) * 0.012, 0.1 + ph * 0.16, 0]} scale={0.6 + ph * 0.9} material={fade("#FFFFFF", 0.22 * steam * (1 - ph))}>
              <sphereGeometry args={[0.02, 8, 6]} />
            </mesh>
          );
        })
      : null}
  </group>
);

/** a snore bubble: k 0..1 = size (drive with a slow in/out), grows from its base (origin) outwards along +x */
export const SnoreBubble: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0.02) return null;
  const r = 0.012 + 0.075 * k;
  return (
    <group position={[r * 0.9, r * 0.25, 0]}>
      <mesh material={fade("#CFEFFF", 0.38, { emissive: 0.25 })}>
        <sphereGeometry args={[r, 18, 14]} />
      </mesh>
      <mesh position={[-r * 0.35, r * 0.4, r * 0.75]} material={glow("#FFFFFF", 1.6)}>
        <sphereGeometry args={[r * 0.16, 10, 8]} />
      </mesh>
    </group>
  );
};
