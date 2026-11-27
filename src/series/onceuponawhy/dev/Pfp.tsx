// ONCE UPON A WHY: Instagram profile picture options (1080 × 1080, City Pop Dusk, locked cast). `XOuawPfp` { option }.
// Rules: one big simple subject, strong silhouette, high contrast, no text, everything important inside the central
// circle with a safe margin (keep it within ~80 % of the circle's radius). Rendered at 1080 and exported at 320.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../look/Stage";
import { canvasTex, glow, matte, V3 } from "../look/mat";
import { FontGate } from "../look/overlay";
import { PAL } from "../palette";
import { Claude } from "../cast/Claude";
import { Mika } from "../cast/Mika";
import { Nora } from "../cast/Nora";
import { MIKA_POSES, NORA_POSES } from "../cast/poses";

export type PfpOption = "A" | "B" | "C" | "D";

/** smooth lilac → peach dusk gradient, unlit, far behind */
const duskTex = () =>
  canvasTex("pfpDusk", 512, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    // lilac where Claude sits (orange pops against it), peach only towards the bottom edge
    gr.addColorStop(0, "#6E55B0");
    gr.addColorStop(0.45, "#9C82D6");
    gr.addColorStop(0.7, "#C99BD0");
    gr.addColorStop(1, "#FFBF9E");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });
const glowTex = () =>
  canvasTex("pfpGlow", 512, 512, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "rgba(255,226,170,0.95)");
    gr.addColorStop(0.35, "rgba(255,196,150,0.5)");
    gr.addColorStop(1, "rgba(255,180,160,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });

const Backdrop: React.FC<{ z: number; size: number; y?: number }> = ({ z, size, y = 0 }) => (
  <mesh position={[0, y, z]}>
    <planeGeometry args={[size, size * 1.2]} />
    <meshBasicMaterial map={duskTex()} toneMapped={false} fog={false} />
  </mesh>
);
const WarmGlow: React.FC<{ p: V3; s: number; o?: number }> = ({ p, s, o = 1 }) => (
  <mesh position={p}>
    <planeGeometry args={[s, s]} />
    <meshBasicMaterial map={glowTex()} transparent opacity={o} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
  </mesh>
);

/** soft cinematic light + a strong warm-white rim from behind so the orange separates from the background */
const PfpLights: React.FC<{ rim?: number }> = ({ rim = 1.7 }) => (
  <>
    <hemisphereLight args={["#FFE6D6", "#6A4A98", 0.45]} />
    <directionalLight position={[-1.5, 2.2, 3]} intensity={1.35} color="#FFE2C8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-1} shadow-camera-right={1} shadow-camera-top={1} shadow-camera-bottom={-1} />
    <directionalLight position={[1.8, 0.6, 2]} intensity={0.45} color="#C9B6F0" />
    <directionalLight position={[0.8, 2.2, -2.5]} intensity={rim} color="#FFF0DC" />
    <directionalLight position={[-1.4, 1.2, -2]} intensity={rim * 0.6} color="#FFD0B8" />
  </>
);

// ---------- B: neon question-mark sign ----------
const NeonQuestion: React.FC<{ s?: number }> = ({ s = 1 }) => {
  const pts = [
    [-0.38, 0.42],
    [-0.3, 0.68],
    [0, 0.8],
    [0.3, 0.68],
    [0.36, 0.42],
    [0.2, 0.2],
    [0.02, 0.06],
    [0, -0.18],
  ].map(([x, y]) => new THREE.Vector3(x, y, 0));
  return (
    <group scale={s}>
      {/* backing board */}
      <mesh position={[0, 0.27, -0.05]} castShadow material={matte("#1C1638", 0.7)}>
        <boxGeometry args={[1.05, 1.3, 0.05]} />
      </mesh>
      <mesh material={glow(PAL.pinkNeon, 4.5)}>
        <tubeGeometry args={[new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4), 64, 0.055, 10, false]} />
      </mesh>
      <mesh position={[0, -0.4, 0]} material={glow(PAL.pinkNeon, 4.5)}>
        <sphereGeometry args={[0.075, 16, 12]} />
      </mesh>
      <pointLight position={[0, 0.3, 0.35]} intensity={0.5} distance={1.2} color={PAL.pinkNeon} />
    </group>
  );
};

// ---------- C: open storybook ----------
const pageTex = () =>
  canvasTex("pfpPage", 256, 320, (g, w, h) => {
    g.fillStyle = "#FFF4DE";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(120,90,60,0.22)";
    for (let i = 0; i < 9; i++) g.fillRect(28, 40 + i * 28, w - 56 - ((i * 37) % 60), 6);
  });
const pageGeo = (side: 1 | -1) => {
  // a page curling up from the gutter
  const g = new THREE.PlaneGeometry(0.5, 0.62, 16, 1);
  const p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + 0.25; // 0..0.5 from the gutter
    p.setX(i, side * x);
    p.setZ(i, 0);
    p.setY(i, p.getY(i));
    // curl: rise near the gutter
    const lift = 0.12 * Math.exp(-x * 9) + 0.03 * Math.sin((x / 0.5) * Math.PI);
    (p as THREE.BufferAttribute).setZ(i, lift);
  }
  g.computeVertexNormals();
  return g;
};
const Storybook: React.FC = () => (
  <group rotation={[-Math.PI / 2 + 0.12, 0, 0]}>
    {/* covers */}
    {[-1, 1].map((s) => (
      <mesh key={`c${s}`} position={[s * 0.27, 0, -0.035]} castShadow receiveShadow material={matte("#2E5E8A", 0.7)}>
        <boxGeometry args={[0.55, 0.68, 0.03]} />
      </mesh>
    ))}
    {[-1, 1].map((s) => (
      <mesh key={`p${s}`} geometry={pageGeo(s as 1 | -1)} receiveShadow>
        <meshStandardMaterial map={pageTex()} color="#E9D8BA" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    ))}
    {/* gold corners */}
    {[-1, 1].map((sx) => [-1, 1].map((sy) => <mesh key={`g${sx}${sy}`} position={[sx * 0.5, sy * 0.31, -0.01]} material={matte("#E8B23A", 0.35, { metal: 0.5 })}><boxGeometry args={[0.07, 0.07, 0.045]} /></mesh>))}
  </group>
);
const Sparkle: React.FC<{ p: V3; s: number; r?: number }> = ({ p, s, r = 0 }) => {
  const shape = new THREE.Shape();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 2;
    const rr = i % 2 === 0 ? 1 : 0.28;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return (
    <mesh position={p} rotation={[0, 0, r]} scale={s} material={glow("#FFE9B8", 4)}>
      <shapeGeometry args={[shape]} />
    </mesh>
  );
};

export const PfpStill: React.FC<{ option: PfpOption }> = ({ option }) => {
  const t = useCurrentFrame() + 30;
  let cam = { pos: [0, 0.3, 2.0] as V3, target: [0, 0.27, 0] as V3, fov: 17 };
  let body: React.ReactNode = null;
  let bloom = { strength: 0.55, radius: 0.6, threshold: 1.3 };
  if (option === "A") {
    // close-up: the face and top of the body, tiny tilted grad cap, happy squashed eyes, blush
    cam = { pos: [0, 0.37, 1.8], target: [0, 0.31, 0], fov: 18 };
    body = (
      <>
        <Backdrop z={-3} size={3.2} y={0.3} />
        <WarmGlow p={[0, 0.3, -1.2]} s={1.4} o={0.55} />
        <PfpLights />
        <group position={[0, 0, 0]} rotation={[0, -0.12, 0]}>
          <Claude expr="happy" t={t} prop="gradcap" face={{ blush: 1 }} blinkSeed={0} />
        </group>
      </>
    );
  } else if (option === "B") {
    cam = { pos: [0.02, 0.3, 2.4], target: [0.02, 0.27, 0], fov: 19 };
    body = (
      <>
        <Backdrop z={-3} size={3.5} y={0.3} />
        <WarmGlow p={[-0.05, 0.28, -1.2]} s={1.4} o={0.45} />
        <PfpLights />
        <group position={[-0.08, 0, 0]} rotation={[0, 0.35, 0]}>
          <Claude expr="happy" t={t} face={{ eye: "wide", mouth: "smile", blush: 0.9 }} wave={0.55} tilt={[-0.06, 0.06]} blinkSeed={0} />
        </group>
        <group position={[0.21, 0.27, 0.16]} rotation={[0, -0.4, 0.1]}>
          <NeonQuestion s={0.17} />
        </group>
      </>
    );
  } else if (option === "C") {
    cam = { pos: [0, 0.62, 2.2], target: [0, 0.17, -0.05], fov: 21 };
    bloom = { strength: 0.5, radius: 0.6, threshold: 1.4 };
    body = (
      <>
        <Backdrop z={-3} size={3.8} y={0.4} />
        <PfpLights rim={2.2} />
        <group position={[0, 0.0, 0.06]} scale={0.72}>
          <Storybook />
        </group>
        {/* warm light rising from the pages onto Claude's face */}
        <pointLight position={[0, 0.1, 0.35]} intensity={0.25} distance={0.7} color="#FFC98A" />
        <group position={[0, -0.06, -0.1]}>
          <Claude expr="happy" t={t} face={{ blush: 0.9 }} legs={false} tilt={[-0.12, 0]} blinkSeed={0} />
        </group>
        <WarmGlow p={[0, 0.25, -1.4]} s={1.2} o={0.4} />
        <Sparkle p={[-0.2, 0.42, 0.0]} s={0.032} r={0.2} />
        <Sparkle p={[0.21, 0.46, 0.0]} s={0.026} r={-0.3} />
        <Sparkle p={[0.02, 0.5, -0.05]} s={0.02} />
      </>
    );
  } else {
    cam = { pos: [0, 1.1, 4.4], target: [0, 1.0, 0], fov: 18 };
    body = (
      <>
        <Backdrop z={-4} size={5} y={1} />
        <WarmGlow p={[0, 1.05, -2]} s={2.4} o={0.4} />
        <PfpLights />
        <group position={[-0.5, 0, -0.05]} rotation={[0, 0.3, 0]}>
          <Mika p={MIKA_POSES.happy} expr="happy" t={t} bounce={0.1} />
        </group>
        <group position={[0.5, 0, -0.05]} rotation={[0, -0.3, 0]}>
          <Nora p={NORA_POSES.happy} expr="happy" t={t} glasses="oval" />
        </group>
        <group position={[0, 0.72, 0.45]} scale={1.15}>
          <Claude expr="happy" t={t} legs={false} face={{ blush: 1 }} blinkSeed={0} />
        </group>
      </>
    );
  }
  return (
    <FontGate>
      <AbsoluteFill>
        <Stage cam={cam} lens={{ aperture: 0 }} bloom={bloom} exposure={0.95} bg="#B79BE0" env={0.4} grain={0.05} vignette={0}>
          {body}
        </Stage>
      </AbsoluteFill>
    </FontGate>
  );
};
