// SET 3 — NORA: TINY APARTMENT AT NIGHT (bible §6.3). LOCKED.
// Mood: deep navy room, rain on the window, pink and teal neon from the sign across the street reflected on the glass,
// a cosy window desk with a warm mushroom lamp, a plaid blanket over her chair, cool laptop light on her face.
// Explainer surface: steam from her tea rises and forms shapes and words.
import React from "react";
import * as THREE from "three";
import { canvasTex, fade, glow, hash, matte, texMat, V3 } from "../look/mat";
import { ROUND } from "../fonts";
import { PAL } from "../palette";
import { Laptop, TabbedNotebook } from "../cast/props";
import { ThimbleMug } from "../cast/Claude";
import { Backdrop, BookRow, Bx, CityBlocks, Floor, Glowbulb, NeonLine, Plant, Rain, SetLook, floorTex } from "./common";

export const APARTMENT: SetLook = {
  cam: { pos: [0.1, 1.15, 4.3], target: [0.1, 0.95, -1.0], fov: 34 },
  lens: { aperture: 0.0022, maxblur: 0.007 },
  bloom: { strength: 0.85, radius: 0.65, threshold: 1.2 },
  exposure: 1.05,
  bg: "#0B0F26",
  env: 0.15,
};
/** Nora sits on her chair side-on to the window desk (use NORA_CHAIR) */
export const APARTMENT_MARKS = {
  nora: { pos: [-0.32, 0, -0.85] as V3, yaw: 1.05 },
  claude: { pos: [0.55, 0.52, -1.08] as V3, yaw: -0.45 },
  mika: { pos: [-0.75, 0, -0.1] as V3, yaw: 0.6 },
};
export const DESK_Y = 0.52;
export const CHAIR_Y = 0.3;
const DESK: V3 = [0.42, 0, -1.25];
const CUP: V3 = [0.32, DESK_Y, -1.06];

const plaidTex = () =>
  canvasTex(
    "aptPlaid",
    256,
    256,
    (g, w, h) => {
      g.fillStyle = "#E9A6B8";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) {
        g.fillStyle = "rgba(185,163,227,0.65)";
        g.fillRect(i * 64 + 10, 0, 22, h);
        g.fillRect(0, i * 64 + 10, w, 22);
        g.fillStyle = "rgba(255,241,220,0.7)";
        g.fillRect(i * 64 + 44, 0, 4, h);
        g.fillRect(0, i * 64 + 44, w, 4);
      }
    },
    { repeat: [2, 2] },
  );

const steamWord = (word: string) =>
  canvasTex(`steam-${word}`, 1024, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `600 150px ${ROUND}`;
    g.filter = "blur(10px)";
    g.fillStyle = "rgba(255,255,255,0.65)";
    g.fillText(word, w / 2, h / 2);
    g.filter = "blur(2px)";
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.fillText(word, w / 2, h / 2);
  });

export const AptPoster = () =>
  canvasTex("aptPoster", 256, 360, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#4B2E6E");
    gr.addColorStop(0.6, "#FF8A6C");
    gr.addColorStop(1, "#FFD08A");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#FFE7A0";
    g.beginPath();
    g.arc(w / 2, h * 0.62, 70, Math.PI, 0);
    g.fill();
    g.fillStyle = "#2A1A48";
    for (let i = 0; i < 6; i++) g.fillRect(0, h * 0.62 + i * 14, w, 6);
    g.fillStyle = "#14102A";
    g.fillRect(0, h * 0.8, w, h);
  });

export const ApartmentSet: React.FC<{ t: number; explain?: number; word?: string }> = ({ t, explain = 0, word = "one step" }) => {
  const wood = floorTex("aptFloor", "#4A3040", "rgba(0,0,0,0.3)", [3, 3], true);
  const k = explain;
  const neonPulse = 0.85 + Math.sin(t * 0.21) * 0.1 + (hash(Math.floor(t / 7)) < 0.06 ? -0.4 : 0);
  return (
    <>
      <hemisphereLight args={["#2A3570", "#140A20", 0.5]} />
      {/* neon spill from the window */}
      <pointLight position={[-0.6, 1.8, -1.2]} intensity={1.4 * neonPulse} distance={4} color={PAL.pinkNeon} />
      <pointLight position={[0.8, 1.6, -1.2]} intensity={1.6} distance={4} color={PAL.tealNeon} />
      {/* laptop light on her face (kept well away from it) */}
      <pointLight position={[0.15, 0.75, -0.95]} intensity={0.35} distance={1.2} color="#BFD8FF" />
      <directionalLight position={[1.5, 3, 4]} intensity={0.35} color="#B9A3E3" castShadow shadow-mapSize={[1024, 1024]} />

      {/* outside: city, the neon sign across the street, rain */}
      <Backdrop mood="night" p={[0, 3, -30]} w={60} h={30} seed={12} bright={0.8} />
      <CityBlocks area={[-8, 8, -16, -8]} n={14} seed={21} base="#1E1A3E" lit={0.4} hMin={3} hMax={10} y0={-3} />
      <group position={[0.35, 2.05, -5]} scale={0.8}>
        <Bx p={[0, 0, -0.1]} s={[2.4, 3.6, 0.1]} c="#1A1636" cast={false} />
        <NeonLine pts={[[-0.6, 0.6], [-0.2, 1.0], [0.2, 0.6], [0.6, 1.0]]} p={[0, 0, 0]} c={PAL.pinkNeon} r={0.04} i={2.6 * neonPulse} />
        <NeonLine pts={[[-0.5, 0.1], [0.5, 0.1], [0.5, -0.5], [-0.5, -0.5], [-0.5, 0.1]]} p={[0, 0, 0]} c={PAL.tealNeon} r={0.035} i={2.4} />
      </group>

      {/* room shell */}
      <Floor tex={wood} id="aptFloorM" size={[8, 8]} />
      <Bx p={[-1.5, 1.4, -1.6]} s={[1.6, 2.8, 0.1]} c="#2E2448" cast={false} />
      <Bx p={[1.6, 1.4, -1.6]} s={[1.4, 2.8, 0.1]} c="#2E2448" cast={false} />
      <Bx p={[0.05, 0.45, -1.6]} s={[1.6, 0.9, 0.1]} c="#2E2448" cast={false} />
      <Bx p={[0.05, 2.55, -1.6]} s={[1.6, 0.5, 0.1]} c="#2E2448" cast={false} />
      {/* window frame + glass reflection + rain */}
      <Bx p={[0.05, 0.92, -1.56]} s={[1.62, 0.06, 0.14]} c="#1C1630" />
      <Bx p={[0.05, 2.28, -1.56]} s={[1.62, 0.06, 0.1]} c="#1C1630" />
      <Bx p={[0.05, 1.6, -1.56]} s={[0.05, 1.4, 0.08]} c="#1C1630" />
      <mesh position={[0.05, 1.6, -1.58]} material={fade("#FF9AD0", 0.07, { additive: true })}>
        <planeGeometry args={[1.6, 1.4]} />
      </mesh>
      <Rain p={[0.05, 1.6, -1.55]} w={1.6} h={1.4} t={t} />
      {/* poster and a shelf */}
      <mesh position={[-1.1, 1.6, -1.54]} material={texMat("aptPosterM", AptPoster())}>
        <planeGeometry args={[0.45, 0.63]} />
      </mesh>
      <group position={[1.05, 0, -1.4]}>
        <Bx p={[0, 0.4, 0]} s={[0.7, 0.8, 0.3]} c="#5A3A4A" />
        <group position={[-0.32, 0.8, 0]}>
          <BookRow len={0.64} seed={31} h={0.26} />
        </group>
        <group position={[-0.32, 0.42, 0.02]}>
          <BookRow len={0.64} seed={33} h={0.3} />
        </group>
        <Glowbulb p={[0.18, 1.15, 0]} r={0.06} c="#FFC890" i={2.5} light={0.8} dist={2} />
        <mesh position={[0.18, 1.15, 0]} material={fade("#FFE9C8", 0.35)}>
          <cylinderGeometry args={[0.1, 0.1, 0.22, 10, 1, true]} />
        </mesh>
      </group>
      {/* book stacks on the floor */}
      {[
        [-0.95, -0.2, 6],
        [-1.15, 0.15, 4],
        [0.85, 0.2, 5],
      ].map(([x, z, n], j) => (
        <group key={j} position={[x, 0, z]}>
          {Array.from({ length: n }, (_, i) => (
            <Bx key={i} p={[(hash(i + j * 9) - 0.5) * 0.04, 0.025 + i * 0.05, 0]} s={[0.26 + hash(i * 3 + j) * 0.06, 0.045, 0.2]} rot={[0, (hash(i * 5 + j) - 0.5) * 0.4, 0]} c={["#7A2E3A", "#2E4E7A", "#C9963E", "#3E6E4A", "#E8DCC4", "#5A3A7A"][(i + j) % 6]} />
          ))}
        </group>
      ))}
      <group position={[-1.3, 0, -1.1]}>
        <Plant s={0.9} t={t} pot="#B9A3E3" />
      </group>

      {/* window desk: laptop, notebook, books, the warm lamp, her tea */}
      <group position={[DESK[0], 0, DESK[2]]}>
        <Bx p={[0, DESK_Y - 0.02, 0]} s={[1.15, 0.04, 0.5]} c={PAL.woodLight} r={0.5} />
        <Bx p={[-0.53, (DESK_Y - 0.04) / 2, 0]} s={[0.04, DESK_Y - 0.04, 0.46]} c="#8A5E3E" />
        <Bx p={[0.53, (DESK_Y - 0.04) / 2, 0]} s={[0.04, DESK_Y - 0.04, 0.46]} c="#8A5E3E" />
        <Bx p={[0.32, DESK_Y - 0.12, 0.0]} s={[0.42, 0.16, 0.44]} c="#9A6E4C" />
        <Bx p={[0.32, DESK_Y - 0.12, 0.225]} s={[0.08, 0.02, 0.01]} c={PAL.chrome} r={0.3} />
        <group position={[-0.22, DESK_Y, 0.02]} rotation={[0, -Math.PI / 2 + 0.35, 0]}>
          <Laptop screen={0.5} />
        </group>
        <group position={[0.05, DESK_Y, 0.15]} rotation={[0, 0.3, 0]}>
          <TabbedNotebook />
        </group>
        {[0, 1, 2].map((i) => (
          <Bx key={i} p={[0.4, DESK_Y + 0.025 + i * 0.05, -0.12]} s={[0.24 - i * 0.02, 0.045, 0.17]} rot={[0, i * 0.12 - 0.1, 0]} c={["#7A2E3A", "#2E4E7A", "#E8DCC4"][i]} />
        ))}
        {/* the warm lamp: a mushroom dome */}
        <group position={[0.42, DESK_Y + 0.15, -0.12]}>
          <mesh position={[0, 0.05, 0]} material={matte("#C9A04A", 0.35)}>
            <cylinderGeometry args={[0.012, 0.016, 0.1, 8]} />
          </mesh>
          <mesh position={[0, 0.12, 0]} material={matte("#F2B27A", 0.6, { side: THREE.DoubleSide })} castShadow>
            <sphereGeometry args={[0.11, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <Glowbulb p={[0, 0.1, 0]} r={0.035} c="#FFC27A" i={5} light={1.4} dist={2.6} shadow />
          <mesh position={[0, 0.115, 0]} rotation={[Math.PI / 2, 0, 0]} material={glow("#FFC27A", 2.2)}>
            <circleGeometry args={[0.105, 18]} />
          </mesh>
        </group>
      </group>
      {/* a bigger tea cup (same family as Claude's thimble mug) */}
      <group position={CUP} scale={2.1}>
        <ThimbleMug t={t} steam={k < 0.05} />
      </group>
      {/* her chair, with a soft blanket thrown over its back */}
      <group position={APARTMENT_MARKS.nora.pos} rotation={[0, APARTMENT_MARKS.nora.yaw, 0]}>
        <Bx p={[0, CHAIR_Y - 0.02, 0]} s={[0.42, 0.04, 0.4]} c="#8A5E3E" />
        {[-0.18, 0.18].map((x) => [-0.17, 0.17].map((z) => <Bx key={`${x}${z}`} p={[x, (CHAIR_Y - 0.04) / 2, z]} s={[0.035, CHAIR_Y - 0.04, 0.035]} c="#6E4A30" />))}
        <Bx p={[0, CHAIR_Y + 0.28, -0.19]} s={[0.4, 0.52, 0.035]} c="#8A5E3E" />
        <group position={[0, CHAIR_Y + 0.5, -0.19]} rotation={[0, 0, 0.08]}>
          <mesh position={[0, 0.0, 0]} rotation={[0, 0, Math.PI / 2]} material={texMat("aptPlaidM", plaidTex(), { rough: 1 })} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.46, 12, 1, false, 0, Math.PI]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, -0.17, s * 0.05]} rotation={[s * 0.06, 0, 0]} material={texMat("aptPlaidM", plaidTex(), { rough: 1 })} castShadow receiveShadow>
              <boxGeometry args={[0.46, 0.34, 0.025]} />
            </mesh>
          ))}
          {[-0.18, -0.06, 0.06, 0.18].map((x) => (
            <Bx key={x} p={[x, -0.36, 0.05]} s={[0.012, 0.04, 0.012]} c="#F2B9A0" cast={false} />
          ))}
        </group>
      </group>

      {/* explainer: steam rises, swirls and becomes a word */}
      {k > 0.02
        ? Array.from({ length: 22 }, (_, i) => {
            const ph = (i / 22) * Math.PI * 2;
            const life = (t * 0.012 + i / 22) % 1;
            const rise = 0.15 + life * (0.9 + k * 0.4);
            const swirl = Math.sin(life * 6 + ph) * 0.08 * (1 + life * 2);
            return (
              <mesh key={i} position={[CUP[0] + swirl * 0.6 - life * k * 0.12, CUP[1] + rise, CUP[2] + 0.05 + Math.cos(life * 5 + ph) * 0.04]} scale={0.025 + life * 0.05} material={fade("#D9D2EE", 0.16 * (1 - life) * Math.min(1, k * 2))}>
                <icosahedronGeometry args={[1, 1]} />
              </mesh>
            );
          })
        : null}
      {k > 0.35 ? (
        <mesh position={[0.3, 1.5 + (1 - k) * 0.2, -1.0]} rotation={[0, 0, Math.sin(t * 0.04) * 0.03]}>
          <planeGeometry args={[1.2, 0.3]} />
          <meshBasicMaterial map={steamWord(word)} transparent opacity={Math.min(1, (k - 0.35) * 2.5) * 0.95} depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}
    </>
  );
};
