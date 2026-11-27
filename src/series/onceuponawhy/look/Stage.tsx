// ONCE UPON A WHY: the stage (bible §2 "Look"). One three.js canvas per shot with a real post chain:
//   RenderPass → BokehPass (gentle depth of field, rack focus) → UnrealBloomPass (lamps and neon) → OutputPass (ACES)
// then DOM layers on top: light film grain and a soft vignette. Sets bring their own lights, fog and background.
import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { V3 } from "./mat";

export type Cam = { pos: V3; target: V3; fov: number; roll?: number };
export type Lens = {
  /** distance from the camera that is sharp. Default: distance to target */
  focus?: number;
  /** BokehPass aperture. 0 = no DOF. House default 0.0025 */
  aperture?: number;
  maxblur?: number;
};
export type Bloom = { strength?: number; radius?: number; threshold?: number };

const Rig: React.FC<{ cam: Cam; env: number }> = ({ cam, env }) => {
  const { camera, scene } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos);
  c.up.set(0, 1, 0);
  c.lookAt(...cam.target);
  if (cam.roll) c.rotateZ(cam.roll);
  c.fov = cam.fov;
  c.near = 0.1;
  c.far = 250;
  c.updateProjectionMatrix();
  scene.environmentIntensity = env;
  return null;
};

const Post: React.FC<{ cam: Cam; lens: Lens; bloom: Bloom; w: number; h: number }> = ({ cam, lens, bloom, w, h }) => {
  const { gl, scene, camera } = useThree();
  const chain = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(gl, rt);
    composer.setPixelRatio(1);
    composer.setSize(w, h);
    composer.addPass(new RenderPass(scene, camera));
    const bokeh = new BokehPass(scene, camera, { focus: 5, aperture: 0.0025, maxblur: 0.008 });
    composer.addPass(bokeh);
    const bl = new UnrealBloomPass(new THREE.Vector2(w, h), 0.6, 0.55, 0.9);
    composer.addPass(bl);
    composer.addPass(new OutputPass());
    return { composer, bokeh, bl };
  }, [gl, scene, camera, w, h]);

  useLayoutEffect(() => () => chain.composer.dispose(), [chain]);

  useFrame(() => {
    const dist = Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2]);
    const u = chain.bokeh.uniforms as Record<string, THREE.IUniform>;
    const ap = lens.aperture ?? 0.0025;
    chain.bokeh.enabled = ap > 0;
    u.focus.value = lens.focus ?? dist;
    u.aperture.value = ap;
    u.maxblur.value = lens.maxblur ?? 0.008;
    chain.bl.strength = bloom.strength ?? 0.6;
    chain.bl.radius = bloom.radius ?? 0.55;
    chain.bl.threshold = bloom.threshold ?? 1.35;
    chain.composer.render();
  }, 1);
  return null;
};

export const Stage: React.FC<{
  cam: Cam;
  lens?: Lens;
  bloom?: Bloom;
  exposure?: number;
  /** scene background colour (sets usually paint their own backdrop planes too) */
  bg?: string;
  fog?: { color: string; near: number; far: number };
  /** room-environment reflection strength (keeps matte shapes from going flat in the shadows) */
  env?: number;
  grain?: number;
  vignette?: number;
  children: React.ReactNode;
  /** DOM on top of the picture (captions, titles) */
  overlay?: React.ReactNode;
  width?: number;
  height?: number;
}> = ({ cam, lens = {}, bloom = {}, exposure = 1, bg = "#141A3A", fog, env = 0.35, grain = 0.07, vignette = 0.45, children, overlay, width, height }) => {
  const cfg = useVideoConfig();
  const w = width ?? cfg.width;
  const h = height ?? cfg.height;
  return (
    <AbsoluteFill style={{ background: bg, width: w, height: h, overflow: "hidden" }}>
      <ThreeCanvas
        width={w}
        height={h}
        shadows
        dpr={1}
        gl={{ antialias: false, preserveDrawingBuffer: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl, scene }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = exposure;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          const pm = new THREE.PMREMGenerator(gl);
          scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
          pm.dispose();
        }}
      >
        <color attach="background" args={[bg]} />
        {fog ? <fog attach="fog" args={[fog.color, fog.near, fog.far]} /> : null}
        <Rig cam={cam} env={env} />
        <Exposure v={exposure} />
        {children}
        <Post cam={cam} lens={lens} bloom={bloom} w={w} h={h} />
      </ThreeCanvas>
      <Finish grain={grain} vignette={vignette} w={w} h={h} />
      {overlay}
    </AbsoluteFill>
  );
};

const Exposure: React.FC<{ v: number }> = ({ v }) => {
  const { gl } = useThree();
  gl.toneMappingExposure = v;
  return null;
};

/** light film grain + soft vignette (DOM, so it never blooms) */
export const Finish: React.FC<{ grain: number; vignette: number; w: number; h: number }> = ({ grain, vignette, w, h }) => {
  const f = useCurrentFrame();
  const seed = (f * 7) % 97;
  return (
    <>
      {vignette > 0 ? (
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 62% at 50% 46%, rgba(10,6,30,0) 55%, rgba(10,6,30,${vignette}) 100%)`, pointerEvents: "none" }} />
      ) : null}
      {grain > 0 ? (
        <svg width={w} height={h} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: grain * 4, pointerEvents: "none" }}>
          <filter id={`grain${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width={w} height={h} filter={`url(#grain${seed})`} opacity={0.5} />
        </svg>
      ) : null}
    </>
  );
};

/** world → screen pixels (for placing captions clear of faces) */
export const project = (cam: Cam, p: V3, w = 1080, h = 1920): [number, number] => {
  const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.1, 250);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  if (cam.roll) c.rotateZ(cam.roll);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * h];
};

/** linear camera move between two framings (house style: slow push-ins) */
export const camLerp = (a: Cam, b: Cam, t: number): Cam => {
  const L = (x: number, y: number) => x + (y - x) * t;
  return {
    pos: [L(a.pos[0], b.pos[0]), L(a.pos[1], b.pos[1]), L(a.pos[2], b.pos[2])],
    target: [L(a.target[0], b.target[0]), L(a.target[1], b.target[1]), L(a.target[2], b.target[2])],
    fov: L(a.fov, b.fov),
    roll: L(a.roll ?? 0, b.roll ?? 0),
  };
};
