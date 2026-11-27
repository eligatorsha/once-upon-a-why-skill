// SET 6 — MIKA: 24-HOUR CORNER SHOP AT 2 AM (bible §6.6). LOCKED.
// Mood: an empty navy street, the shop's bright cold fluorescent interior spilling out, one glowing drink vending
// machine by the door, a sodium street lamp, wet asphalt. The shop is generic: the sign only says OPEN 24 HOURS.
// Explainer surface: a vending machine's buttons light up one by one as the steps of the answer.
import React from "react";
import * as THREE from "three";
import { canvasTex, glow, hash, liveTex, matte, texMat, V3 } from "../look/mat";
import { ROUND } from "../fonts";
import { PAL } from "../palette";
import { Backdrop, Bx, Cy, Floor, Glowbulb, KeyLight, LightCone, SetLook, floorTex, signTex } from "./common";

export const SHOP: SetLook = {
  cam: { pos: [0.15, 1.3, 5.1], target: [0.0, 1.12, -1.0], fov: 37 },
  lens: { aperture: 0.002, maxblur: 0.007 },
  bloom: { strength: 0.45, radius: 0.5, threshold: 1.7 },
  exposure: 0.9,
  bg: "#070A1E",
  env: 0.2,
};
export const SHOP_MARKS = {
  mika: { pos: [0.22, 0, -0.35] as V3, yaw: -0.35 },
  nora: { pos: [0.75, 0, -0.1] as V3, yaw: -0.6 },
};

const drinksTex = (seed: number) =>
  canvasTex(`drinks${seed}`, 256, 320, (g, w, h) => {
    g.fillStyle = "#F4FAFF";
    g.fillRect(0, 0, w, h);
    const cols = ["#D7263D", "#3FE0D0", "#FFB547", "#7FA35B", "#B9A3E3", "#FF6FB5", "#2E4E7A", "#FF8A4C"];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const x = 14 + c * 47;
        const y = 16 + r * 76;
        g.fillStyle = cols[Math.floor(hash(seed * 13 + r * 5 + c) * cols.length)];
        g.beginPath();
        g.roundRect(x, y + 8, 30, 50, 6);
        g.fill();
        g.fillStyle = "rgba(255,255,255,0.6)";
        g.fillRect(x + 5, y + 14, 5, 36);
        g.fillStyle = "#C9CDD6";
        g.fillRect(x + 6, y, 18, 10);
      }
      g.fillStyle = "#DCE4EE";
      g.fillRect(0, 16 + r * 76 + 62, w, 8);
    }
  });

/** step label panel next to the buttons (content per episode) */
const stepsTex = (steps: string[], lit: number) =>
  liveTex("vendSteps", 256, 320, `${steps.join("|")}|${lit}`, (g, w, h) => {
    g.fillStyle = "#101426";
    g.fillRect(0, 0, w, h);
    steps.forEach((s, i) => {
      const on = i < lit;
      g.fillStyle = on ? "#3FE0D0" : "#2A3050";
      g.beginPath();
      g.roundRect(10, 12 + i * 60, w - 20, 50, 10);
      g.fill();
      g.fillStyle = on ? "#0B1A22" : "#59608A";
      g.font = `700 30px ${ROUND}`;
      g.textBaseline = "middle";
      g.fillText(`${i + 1}  ${s}`, 24, 38 + i * 60);
    });
  });

export const VendingMachine: React.FC<{ p: V3; seed?: number; c?: string; steps?: string[]; lit?: number; t: number; rotY?: number }> = ({ p, seed = 1, c = "#F2F4FA", steps, lit = 0, t, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Bx p={[0, 0.9, 0]} s={[0.78, 1.8, 0.6]} c={c} r={0.45} />
    <Bx p={[0, 1.82, 0.02]} s={[0.8, 0.06, 0.62]} c="#2A2F48" r={0.4} />
    <mesh position={[0, 1.22, 0.305]} material={texMat(`drinksM${seed}`, drinksTex(seed), { emissive: 1.4, rough: 0.3 })}>
      <planeGeometry args={[0.64, 0.8]} />
    </mesh>
    {/* buttons: a row under each shelf */}
    {Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 5 }, (_, i) => {
        const idx = r;
        const on = steps ? idx < lit && i === 2 : hash(seed * 7 + r * 5 + i + Math.floor(t / 20)) < 0.15;
        return (
          <mesh key={`${r}${i}`} position={[-0.26 + i * 0.13, 1.54 - r * 0.2, 0.31]} material={glow(on ? "#FF5A5A" : "#5A7AFF", on ? 6 : 1.3)}>
            <boxGeometry args={[0.04, 0.02, 0.012]} />
          </mesh>
        );
      }),
    )}
    {steps ? (
      <mesh position={[0, 0.58, 0.306]} material={texMat("vendStepsM", stepsTex(steps, lit), { emissive: 1.6, rough: 0.4 })}>
        <planeGeometry args={[0.5, 0.36]} />
      </mesh>
    ) : (
      <Bx p={[0, 0.58, 0.3]} s={[0.4, 0.26, 0.02]} c="#2A2F48" cast={false} />
    )}
    <Bx p={[0, 0.2, 0.31]} s={[0.56, 0.14, 0.02]} c="#1A1E30" cast={false} />
    <Bx p={[0.3, 0.8, 0.31]} s={[0.08, 0.16, 0.02]} c="#8A90A8" cast={false} />
    <pointLight position={[0, 1.2, 0.7]} intensity={0.6} distance={2.0} color="#DDF0FF" />
  </group>
);

const ShopInterior: React.FC<{ t: number }> = ({ t }) => (
  <group position={[0.9, 0, -3.1]}>
    {/* bright back room behind the glass */}
    <Bx p={[0, 1.4, -1.2]} s={[3.4, 2.8, 0.05]} c="#9FB8B2" cast={false} />
    <Bx p={[0, 0.02, -0.4]} s={[3.4, 0.04, 1.8]} c="#DDE6E4" cast={false} />
    {[-1, 0, 1].map((x) => (
      <mesh key={x} position={[x, 2.72, -0.4]} material={glow("#F4FFFB", 1.8 + (x === 0 && hash(Math.floor(t / 5)) < 0.08 ? -2 : 0))}>
        <boxGeometry args={[0.7, 0.03, 0.12]} />
      </mesh>
    ))}
    {[-0.9, 0.35].map((x, j) => (
      <group key={x} position={[x, 0, -0.6]}>
        <Bx p={[0, 0.7, 0]} s={[0.9, 1.4, 0.4]} c="#C9D2D8" cast={false} />
        {[0.35, 0.75, 1.15].map((y, r) =>
          Array.from({ length: 7 }, (_, i) => (
            <Bx key={`${r}${i}`} p={[-0.38 + i * 0.125, y + 0.08, 0.15]} s={[0.09, 0.14 + hash(i + r * 7 + j) * 0.06, 0.08]} c={["#FF8A4C", "#3FE0D0", "#FFD25A", "#FF6FB5", "#7FA35B", "#B9A3E3", "#D7263D"][(i + r * 3 + j) % 7]} cast={false} />
          )),
        )}
      </group>
    ))}
    <pointLight position={[0, 2.2, 0.6]} intensity={0.9} distance={4} color="#E8FFF6" />
  </group>
);

export const CornerShopSet: React.FC<{ t: number; explain?: number; steps?: string[] }> = ({ t, explain = 0, steps = ["Breathe", "Re-read it", "Ask one Q", "Send"] }) => {
  const asphalt = floorTex("asphalt", "#1C1E2C", "rgba(0,0,0,0)", [6, 6]);
  const lit = Math.floor(explain * (steps.length + 0.99));
  return (
    <>
      <hemisphereLight args={["#24306A", "#0A0A14", 0.5]} />
      <KeyLight p={[-3, 5, 2]} c="#FFB866" i={0.7} box={4} target={[0, 0, -1]} />
      <Backdrop mood="night" p={[0, 6, -30]} w={60} h={30} seed={41} bright={0.7} />

      {/* street, kerb, wet patches */}
      <Floor tex={asphalt} id="asphaltM" size={[14, 10]} p={[0, 0, 1]} rough={0.55} />
      <Bx p={[0, 0.06, -1.05]} s={[14, 0.12, 0.25]} c="#4A4C5E" />
      <Bx p={[0, 0.07, -1.8]} s={[14, 0.14, 1.3]} c="#3A3C4E" cast={false} />
      {[
        [-0.5, 0.4, 0.5],
        [0.8, 1.2, 0.35],
        [-1.1, 1.6, 0.3],
      ].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.003, z]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.55, 1]} material={matte("#2A3050", 0.08, { metal: 0.6 })}>
          <circleGeometry args={[r, 18]} />
        </mesh>
      ))}

      {/* shop facade: frame, sign band, glass, door */}
      <group position={[0, 0, -2.5]}>
        <Bx p={[-1.75, 1.6, 0]} s={[1.2, 3.2, 0.2]} c="#2A2F48" />
        <Bx p={[2.6, 1.6, 0]} s={[0.4, 3.2, 0.2]} c="#2A2F48" />
        <Bx p={[0.5, 3.05, 0]} s={[4.4, 0.5, 0.25]} c="#2A2F48" />
        <mesh position={[0.6, 2.55, 0.13]} material={texMat("shopSignM", signTex("shop", "OPEN 24 HOURS", { w: 1024, h: 160, fg: "#FFFFFF", bg: "#2E7FA8", size: 96 }), { emissive: 1.5 })}>
          <planeGeometry args={[2.6, 0.4]} />
        </mesh>
        <Bx p={[0.6, 2.3, 0.12]} s={[3.6, 0.06, 0.06]} c={PAL.tealNeon} cast={false} m={glow(PAL.tealNeon, 3)} />
        <Bx p={[0.6, 2.22, 0.12]} s={[3.6, 0.04, 0.06]} c={PAL.pinkNeon} cast={false} m={glow(PAL.pinkNeon, 3)} />
        {/* glass panes */}
        {[-0.5, 0.9, 2.1].map((x, i) => (
          <group key={x}>
            <Bx p={[x, 1.1, 0.02]} s={[0.05, 2.2, 0.08]} c="#3A4060" />
            {i < 2 ? (
              <mesh position={[x + 0.7, 1.15, 0.0]}>
                <planeGeometry args={[1.3, 2.1]} />
                <meshStandardMaterial color="#CFF4F8" transparent opacity={0.12} roughness={0.05} depthWrite={false} />
              </mesh>
            ) : null}
          </group>
        ))}
        <Bx p={[0.6, 0.05, 0.03]} s={[3.6, 0.1, 0.1]} c="#3A4060" />
        {/* light spilling onto the pavement */}
        <mesh position={[0.6, 0.15, 0.9]} rotation={[-Math.PI / 2, 0, 0]} material={glow("#CFFFF2", 0.06)}>
          <planeGeometry args={[3.2, 1.4]} />
        </mesh>
      </group>
      <ShopInterior t={t} />
      {/* bright glass light on the kerb, cold */}
      <pointLight position={[0.7, 1.4, -1.6]} intensity={0.8} distance={3.5} color="#D8FFF4" />

      {/* vending machines outside, left of the shop */}
      <VendingMachine p={[-0.62, 0.14, -1.9]} seed={2} t={t} steps={steps} lit={lit} rotY={0.12} />

      {/* utility pole + street lamp on the right, wires */}
      <group position={[1.55, 0, -0.9]}>
        <Cy p={[0, 2.2, 0]} r={0.08} r2={0.1} h={4.4} c="#5A5A6A" seg={8} />
        <Bx p={[0, 3.9, 0]} s={[1.0, 0.07, 0.07]} c="#4A4A5A" />
        <Bx p={[-0.4, 3.4, 0.05]} s={[0.7, 0.05, 0.05]} c="#4A4A5A" />
        <group position={[-0.72, 3.38, 0.05]}>
          <Bx p={[0, 0, 0]} s={[0.24, 0.07, 0.14]} c="#3A3A48" />
          <Glowbulb p={[0, -0.05, 0]} r={0.05} c="#FFB866" i={6} light={2.4} dist={6} />
          <LightCone p={[0, -1.6, 0]} r={1.1} h={3.2} c="#FFB866" o={0.04} />
        </group>
      </group>
      {[3.85, 3.7].map((y, i) => (
        <mesh key={i} material={matte("#141420", 0.8)}>
          <tubeGeometry args={[new THREE.CatmullRomCurve3([new THREE.Vector3(-4, y + 0.5, -3), new THREE.Vector3(0, y - 0.25 - i * 0.1, -2), new THREE.Vector3(1.55, y, -0.9), new THREE.Vector3(4, y + 0.3, 1)]), 30, 0.008, 4, false]} />
        </mesh>
      ))}
    </>
  );
};
