// SET 2 — NORA: NIGHT LIBRARY (bible §6.2). LOCKED.
// Mood: deep navy dark, warm pools under green glass desk lamps, cool moonlight from a high window, dust in the light.
// Explainer surface: the card catalogue. Drawers slide out on their own and index cards fly up into a diagram.
import React from "react";
import * as THREE from "three";
import { canvasTex, glow, hash, matte, texMat, V3 } from "../look/mat";
import { ROUND } from "../fonts";
import { PAL } from "../palette";
import { Bookshelf, Bx, Cy, Dust, Floor, Glowbulb, KeyLight, LightCone, SetLook, floorTex, Backdrop } from "./common";

export const LIBRARY: SetLook = {
  cam: { pos: [0.05, 1.38, 5.4], target: [0.05, 1.1, -1.0], fov: 36 },
  lens: { aperture: 0.002, maxblur: 0.007 },
  bloom: { strength: 0.8, radius: 0.6, threshold: 1.2 },
  exposure: 1.05,
  bg: "#0B0F26",
  env: 0.18,
  fog: { color: "#0E1230", near: 6, far: 16 },
};
export const LIBRARY_MARKS = {
  nora: { pos: [-0.3, 0, -0.35] as V3, yaw: 0.3 },
  claude: { pos: [-0.75, 0.74, -1.15] as V3, yaw: 0.3 },
  mika: { pos: [0.5, 0, -0.1] as V3, yaw: -0.4 },
};

const DRAWER_W = 0.155;
const DRAWER_H = 0.12;
const CAT = { x: 0.62, z: -1.05, cols: 4, rows: 6, y0: 0.32 };
const drawerPos = (c: number, r: number): V3 => [CAT.x - ((CAT.cols - 1) / 2) * (DRAWER_W + 0.012) + c * (DRAWER_W + 0.012), CAT.y0 + r * (DRAWER_H + 0.012), CAT.z + 0.24];

const cardLabel = () =>
  canvasTex("libLabel", 64, 32, (g, w, h) => {
    g.fillStyle = "#F4E2C4";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#3A2A1A";
    g.fillRect(8, 13, w - 16, 5);
  });

const indexCard = (text: string, i: number) =>
  canvasTex(`libCard-${text}`, 256, 160, (g, w, h) => {
    g.fillStyle = "#FFF8EA";
    g.fillRect(0, 0, w, h);
    g.fillStyle = i === 0 ? "#D9534F" : "#7BA7D9";
    g.fillRect(0, 26, w, 3);
    g.fillStyle = "rgba(120,150,200,0.35)";
    for (let y = 52; y < h; y += 22) g.fillRect(0, y, w, 1.5);
    g.fillStyle = "#2A2238";
    g.font = `700 ${text.length > 9 ? 38 : 46}px ${ROUND}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, w / 2, h / 2 + 12);
  });

/** banker's lamp: brass stand, green glass shade, warm pool of light */
export const BankerLamp: React.FC<{ p: V3; rotY?: number; light?: number; shadow?: boolean }> = ({ p, rotY = 0, light = 2.4, shadow = false }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Cy p={[0, 0.012, 0]} r={0.07} r2={0.08} h={0.024} c="#B8893A" rough={0.35} />
    <Cy p={[0, 0.13, 0]} r={0.01} h={0.23} c="#B8893A" rough={0.35} />
    <mesh position={[0, 0.25, 0.02]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.55]} material={glow("#2FA46A", 1.4)}>
      <cylinderGeometry args={[0.07, 0.07, 0.26, 12, 1, false, 0, Math.PI]} />
    </mesh>
    <mesh position={[0, 0.25, 0.02]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.55]} material={matte("#1D6E46", 0.4, { side: THREE.BackSide })}>
      <cylinderGeometry args={[0.072, 0.072, 0.26, 12, 1, false, 0, Math.PI]} />
    </mesh>
    <Glowbulb p={[0, 0.215, 0.02]} r={0.022} c="#FFD9A0" i={7} light={light} dist={3.2} shadow={shadow} />
    <LightCone p={[0, 0.0, 0.02]} r={0.45} h={0.45} c="#FFD08A" o={0.06} />
  </group>
);

export const LibrarySet: React.FC<{ t: number; explain?: number; cards?: string[] }> = ({ t, explain = 0, cards = ["PhD?", "Topic", "Supervisor", "Funding"] }) => {
  const planks = floorTex("libPlanks", "#3B2416", "rgba(0,0,0,0.35)", [4, 6], true);
  const k = explain;
  // which drawers slide out (col,row) and the card each one sends up
  const fly = [
    { c: 1, r: 4, to: [0.08, 2.62, -0.9] as V3 },
    { c: 0, r: 2, to: [-0.48, 2.12, -0.9] as V3 },
    { c: 2, r: 3, to: [0.08, 2.12, -0.9] as V3 },
    { c: 3, r: 1, to: [0.64, 2.12, -0.9] as V3 },
  ];
  return (
    <>
      <hemisphereLight args={["#2E3A78", "#120C1E", 0.45]} />
      <KeyLight p={[-4, 6, 1]} c="#8FA8FF" i={0.9} box={4} target={[0, 0.5, -1]} />
      <pointLight position={[0.4, 2.2, 2.6]} intensity={0.5} distance={6} color="#FFC890" />

      {/* high window with moon behind the shelves */}
      <Backdrop mood="night" p={[0, 6, -20]} w={40} h={20} seed={8} bright={0.9} />
      <mesh position={[-2.2, 6.5, -19.9]} material={glow("#FFF4D8", 2.2)}>
        <circleGeometry args={[0.9, 24]} />
      </mesh>
      {/* back wall with a tall arched window cut between two shelf banks */}
      <Bx p={[-1.75, 2.2, -2.6]} s={[1.6, 4.4, 0.1]} c="#2A1A20" cast={false} />
      <Bx p={[1.75, 2.2, -2.6]} s={[1.6, 4.4, 0.1]} c="#2A1A20" cast={false} />
      <Bx p={[0, 3.95, -2.6]} s={[1.9, 0.9, 0.1]} c="#2A1A20" cast={false} />
      <Bx p={[0, 0.55, -2.6]} s={[1.9, 1.1, 0.1]} c="#2A1A20" cast={false} />
      {[-0.32, 0.32].map((x) => (
        <Bx key={x} p={[x, 2.3, -2.58]} s={[0.04, 2.3, 0.05]} c="#1A1018" />
      ))}
      <Bx p={[0, 2.3, -2.58]} s={[1.9, 0.04, 0.05]} c="#1A1018" />
      <LightCone p={[-0.25, 2.1, -1.6]} rot={[0.35, 0, -0.55]} r={0.9} h={3.0} c="#8FA8FF" o={0.045} />

      {/* shelves */}
      <group position={[-1.35, 0, -2.35]}>
        <Bookshelf w={1.3} h={3.8} shelves={8} seed={3} />
      </group>
      <group position={[1.35, 0, -2.35]}>
        <Bookshelf w={1.3} h={3.8} shelves={8} seed={5} />
      </group>
      <group position={[0, 0, -2.35]}>
        <Bookshelf w={1.9} h={1.05} shelves={2} seed={9} />
      </group>
      {/* rolling ladder on its rail */}
      <Bx p={[0, 3.5, -2.1]} s={[5, 0.03, 0.03]} c="#B8893A" r={0.35} />
      <group position={[-1.05, 0, -1.95]} rotation={[-0.16, 0, 0]}>
        {[-0.22, 0.22].map((x) => (
          <Bx key={x} p={[x, 1.78, 0]} s={[0.04, 3.6, 0.05]} c={PAL.woodLight} />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <Bx key={i} p={[0, 0.25 + i * 0.3, 0]} s={[0.44, 0.03, 0.06]} c={PAL.woodLight} />
        ))}
        {[-0.22, 0.22].map((x) => (
          <Cy key={`w${x}`} p={[x, 0.04, 0.02]} r={0.035} h={0.03} c="#1A1018" rot={[0, 0, Math.PI / 2]} />
        ))}
      </group>

      {/* floor + rug */}
      <Floor tex={planks} id="libPlanksM" size={[10, 10]} />
      <Bx p={[0, 0.006, -0.4]} s={[2.4, 0.012, 1.6]} c="#5A1E2A" r={1} cast={false} />
      <Bx p={[0, 0.008, -0.4]} s={[2.1, 0.012, 1.3]} c="#7A2C38" r={1} cast={false} />

      {/* reading desk with a banker's lamp and an open book */}
      <group position={[-0.72, 0, -1.25]}>
        <Bx p={[0, 0.72, 0]} s={[1.0, 0.04, 0.6]} c={PAL.woodDark} r={0.55} />
        {[-0.45, 0.45].map((x) => [-0.25, 0.25].map((z) => <Bx key={`${x}${z}`} p={[x, 0.35, z]} s={[0.05, 0.7, 0.05]} c="#3A2216" />))}
        <BankerLamp p={[-0.25, 0.74, -0.12]} rotY={0.2} light={2.6} shadow />
        <group position={[0.15, 0.745, 0.05]} rotation={[0, -0.2, 0]}>
          <Bx p={[-0.08, 0, 0]} s={[0.16, 0.012, 0.22]} c="#FFF6E2" rot={[0, 0, 0.08]} />
          <Bx p={[0.08, 0, 0]} s={[0.16, 0.012, 0.22]} c="#FFF6E2" rot={[0, 0, -0.08]} />
        </group>
      </group>

      {/* the card catalogue */}
      <group>
        <Bx p={[CAT.x, CAT.y0 + 0.36, CAT.z]} s={[0.72, 0.95, 0.46]} c="#6E4A2C" r={0.55} />
        <Bx p={[CAT.x, CAT.y0 + 0.86, CAT.z]} s={[0.78, 0.05, 0.5]} c="#4E2D1C" r={0.5} />
        {[-0.3, 0.3].map((x) => [-0.18, 0.18].map((z) => <Bx key={`${x}${z}`} p={[CAT.x + x, CAT.y0 / 2 - 0.02, CAT.z + z]} s={[0.05, CAT.y0 - 0.04, 0.05]} c="#3A2216" />))}
        {Array.from({ length: CAT.cols * CAT.rows }, (_, i) => {
          const c = i % CAT.cols;
          const r = Math.floor(i / CAT.cols);
          const f = fly.findIndex((q) => q.c === c && q.r === r);
          const out = f >= 0 ? Math.min(1, Math.max(0, k * 4 - f * 0.5)) * 0.2 : Math.max(0, Math.sin(t * 0.07 + i * 1.7) - 0.97) * 0.6 * k;
          const p = drawerPos(c, r);
          return (
            <group key={i} position={[p[0], p[1], p[2] + out]}>
              <Bx p={[0, 0, -0.1]} s={[DRAWER_W, DRAWER_H, 0.24]} c={hash(i) < 0.5 ? "#8A5E3A" : "#82573A"} r={0.6} />
              <mesh position={[0, 0.02, 0.022]} material={texMat("libLabelM", cardLabel())}>
                <planeGeometry args={[0.06, 0.03]} />
              </mesh>
              <Bx p={[0, -0.025, 0.03]} s={[0.05, 0.016, 0.02]} c="#C9A04A" r={0.3} cast={false} />
            </group>
          );
        })}
        <BankerLamp p={[CAT.x - 0.15, CAT.y0 + 0.885, CAT.z]} rotY={-0.3} light={1.6} />
      </group>

      {/* the diagram: cards fly from their drawers into a tree, with glowing links */}
      {fly.map((q, i) => {
        const a = Math.min(1, Math.max(0, k * 1.6 - i * 0.18));
        if (a <= 0) return null;
        const from = drawerPos(q.c, q.r);
        const e = 1 - Math.pow(1 - a, 3);
        const x = from[0] + (q.to[0] - from[0]) * e;
        const y = from[1] + (q.to[1] - from[1]) * e + Math.sin(e * Math.PI) * 0.5;
        const z = from[2] + (q.to[2] - from[2]) * e;
        const spin = (1 - e) * 6 + i;
        return (
          <mesh key={i} position={[x, y, z]} rotation={[(1 - e) * 1.2, (1 - e) * spin, Math.sin(t * 0.05 + i) * 0.04 * e]} castShadow>
            <planeGeometry args={[0.42, 0.26]} />
            <meshStandardMaterial map={indexCard(cards[i] ?? "", i)} roughness={0.9} side={THREE.DoubleSide} emissive="#FFF4DE" emissiveIntensity={0.35} emissiveMap={indexCard(cards[i] ?? "", i)} />
          </mesh>
        );
      })}
      {k > 0.75
        ? [1, 2, 3].map((i) => {
            const a = fly[0].to;
            const b = fly[i].to;
            const mx = (a[0] + b[0]) / 2;
            const my = (a[1] + b[1]) / 2;
            const len = Math.hypot(b[0] - a[0], b[1] - a[1]) - 0.3;
            const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
            return (
              <mesh key={i} position={[mx, my, -0.92]} rotation={[0, 0, ang]} scale={[Math.min(1, (k - 0.75) * 4), 1, 1]} material={glow("#FFD08A", 3)}>
                <boxGeometry args={[len, 0.012, 0.01]} />
              </mesh>
            );
          })
        : null}

      <Dust c={[-0.7, 1.1, -1.2]} half={[0.6, 0.6, 0.4]} n={34} t={t} />
      <Dust c={[0.5, 1.6, -1.0]} half={[0.5, 0.5, 0.4]} n={18} t={t} seed={9} />
    </>
  );
};
