// ONCE UPON A WHY: 5 s look test (150 frames, 1080 × 1920, 30 fps). Not an episode.
// Mika runs into the retro coffee shop, stops too fast, her papers burst out of the tote, Claude pops out and waves.
// Shows: run cycle, squash and stretch, curls/bag/cable secondary motion, expressions, the VHS glitch in, a slow
// push-in, house caption pills (speaker-coloured accent words).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage, camLerp, project } from "../look/Stage";
import { CaptionPill, FontGate, GlitchShift, VhsGlitch } from "../look/overlay";
import { clamp01, lerp, prog, springy, V3 } from "../look/mat";
import { Mika } from "../cast/Mika";
import { Paper } from "../cast/props";
import { Expr } from "../cast/face";
import { MIKA_POSES } from "../cast/poses";
import { breathe, mixPose, pose, runPose } from "../cast/rig";
import { COFFEE, CoffeeShopSet } from "../sets/CoffeeShop";

export const TEST_CLIP_FRAMES = 150;

const START: V3 = [-2.1, 0, -0.15];
const STOP: V3 = [-0.12, 0, -0.35];
const RUN_END = 46;
const BURST = 49;
const POP = 90;

const camA = { pos: [0.05, 1.32, 5.7] as V3, target: [0.0, 1.02, -1.0] as V3, fov: 37 };
const camB = { pos: [0.02, 1.24, 4.6] as V3, target: [0.0, 1.0, -1.0] as V3, fov: 35 };

// five papers: launch offsets and spins
const PAPERS = Array.from({ length: 5 }, (_, i) => ({
  vx: [0.55, 0.95, 0.3, 1.25, 0.75][i],
  vy: [2.4, 2.9, 3.2, 2.2, 2.7][i],
  vz: [0.4, 0.1, 0.7, -0.2, 0.25][i],
  spin: [6, -8, 5, -4, 9][i],
  land: [0.25, 0.85, 0.55, 1.15, 0.4][i],
}));

export const TestClip: React.FC = () => {
  const f = useCurrentFrame();
  const t = f + 20;

  // ---- Mika's travel and facing ----
  const run = clamp01(f / RUN_END);
  const runE = 1 - Math.pow(1 - run, 1.6);
  const x = lerp(START[0], STOP[0], runE);
  const z = lerp(START[2], STOP[2], runE);
  const yaw = lerp(Math.PI / 2, -0.28, prog(f, RUN_END - 6, RUN_END + 8));
  const distance = (x - START[0]) / 0.55; // strides

  // ---- body: run → skid stop (squash) → panic → embarrassed → laughing ----
  let p = runPose(distance, 1);
  if (f >= RUN_END - 4) {
    const skid = pose({ lean: -0.28, head: [-0.15, 0, 0], armL: { sx: 0.6, sz: 0.9, el: 0.5 }, armR: { sx: 0.6, sz: 0.9, el: 0.5 }, legL: { hip: 0.35, knee: 0.3 }, legR: { hip: -0.15, knee: 0.1 }, squash: 0.86 });
    p = mixPose(p, skid, prog(f, RUN_END - 4, RUN_END + 2));
  }
  if (f >= RUN_END + 2) {
    const s = springy(f - (RUN_END + 2), 0.45, 0.16);
    p = { ...p, squash: lerp(0.86, 1, s) };
    p = mixPose(p, pose({ squash: p.squash }, MIKA_POSES.shocked), prog(f, RUN_END + 2, BURST + 4));
  }
  if (f >= BURST + 8) p = mixPose(p, MIKA_POSES.panicked, prog(f, BURST + 8, BURST + 16));
  if (f >= 84) p = mixPose(p, MIKA_POSES.embarrassed, prog(f, 84, 94));
  if (f >= 104) {
    // laughing, the left arm held out of the way so Claude in the tote stays visible
    const laugh = pose({ armL: { sx: 0.25, sz: 2.4, el: 0.5 }, head: [-0.15, 0.2, 0.12] }, MIKA_POSES.laughing);
    p = mixPose(p, laugh, prog(f, 104, 114));
    p = { ...p, bob: p.bob + Math.abs(Math.sin((f - 104) * 0.45)) * 0.02 * clamp01((f - 104) / 6) };
  }
  if (f > RUN_END + 10) p = breathe(p, t, 0.6);

  const expr: Expr = f < BURST - 1 ? "happy" : f < BURST + 8 ? "shocked" : f < 84 ? "panicked" : f < 104 ? "embarrassed" : "laughing";
  const bounce = f < RUN_END ? 1 : Math.max(0.25, 1 - (f - RUN_END) / 25);
  const swing = f < RUN_END ? Math.sin(distance * Math.PI * 2) * 0.25 : Math.sin((f - RUN_END) * 0.35) * 0.35 * Math.exp(-(f - RUN_END) / 18);

  // ---- Claude pops out of the tote ----
  const pop = f < POP ? 0 : Math.min(1.08, springy(f - POP, 0.32, 0.14));
  const claudeExpr: Expr = f < POP + 10 ? "shocked" : "happy";
  const claudeWave = f >= POP + 14 ? 1 : 0;

  // ---- papers: burst out of the tote at BURST, flutter down and settle ----
  const bagLocal: V3 = [0.39, 0.42, -0.07];
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const bag: V3 = [x + bagLocal[0] * cy + bagLocal[2] * sy, bagLocal[1], z - bagLocal[0] * sy + bagLocal[2] * cy];

  const cam = camLerp(camA, camB, prog(f, 0, TEST_CLIP_FRAMES));
  const head = project(cam, [x, 1.25, z]);

  return (
    <FontGate>
      <AbsoluteFill>
        <GlitchShift t={f}>
          <Stage cam={cam} lens={COFFEE.lens} bloom={COFFEE.bloom} exposure={COFFEE.exposure} bg={COFFEE.bg} env={COFFEE.env}>
            <CoffeeShopSet t={t} explain={0} />
            <group position={[x, 0, z]} rotation={[0, yaw, 0]}>
              <Mika p={p} expr={expr} t={t} bounce={bounce} swing={swing} papers={f < BURST ? 4 : 0} claudePop={pop} claudeExpr={claudeExpr} claudeWave={claudeWave} />
            </group>
            {f >= BURST
              ? PAPERS.map((q, i) => {
                  const s = (f - BURST) / 30;
                  const tLand = q.land;
                  const air = Math.min(s, tLand + 0.6);
                  // fast burst up, then drag-limited flutter down
                  const up = q.vy * air * Math.exp(-air * 2.2);
                  const yy = Math.max(0.004 + i * 0.002, bag[1] + up - 0.75 * air * air);
                  const landed = yy <= 0.006 + i * 0.002;
                  const px = bag[0] + q.vx * (1 - Math.exp(-air * 2)) * 0.55 + Math.sin(air * 9 + i) * 0.06 * (landed ? 0 : 1);
                  const pz = bag[2] + q.vz * (1 - Math.exp(-air * 2)) * 0.5;
                  const rot: V3 = landed ? [-Math.PI / 2, q.spin * 0.1, 0] : [Math.sin(air * q.spin) * 1.2 - 0.6, air * q.spin, Math.cos(air * q.spin * 0.7) * 0.8];
                  return (
                    <group key={i} position={[px, yy, pz]} rotation={rot}>
                      <Paper i={i} bend={landed ? 0 : 0.3} />
                    </group>
                  );
                })
              : null}
          </Stage>
        </GlitchShift>
        <VhsGlitch t={f} seed={3} />
        {f >= BURST + 6 && f < 92 ? <CaptionPill words={["My", "papers!"]} accent={[1]} speaker="mika" y={Math.max(head[1] + 330, 1120)} age={f - (BURST + 6)} /> : null}
        {f >= POP + 16 ? <CaptionPill words={["Hi,", "Mika!"]} accent={[0]} speaker="claude" y={1200} cx={330} age={f - (POP + 16)} /> : null}
      </AbsoluteFill>
    </FontGate>
  );
};
