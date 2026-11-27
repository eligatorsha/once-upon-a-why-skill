// ONCE UPON A WHY: hologram explainers that float in any set (first used in ep 1, the carriage).
// Teal / lilac glow (emissive > 1 blooms), always readable at phone size: thick strokes, few parts.
//  - HoloClock   a floating clock with a tiny face that can yawn and doze; hands set by `hour`
//  - AlarmClock  a cartoon twin-bell alarm clock that rings (shakes) and shoots out a grabbing arm
//  - HoloMap     a small glowing map panel with two pins and a dotted flight arc
//  - TinyPlane   a toy plane with a sleeping Mika in the window (Zz)
// Origins are the object centres; everything faces +z.
import React from "react";
import * as THREE from "three";
import { canvasTex, fade, glow, matte, texMat, V3 } from "./mat";
import { PAL } from "../palette";
import { geo, tubeGeo } from "../cast/rig";

const TEAL = PAL.tealNeon;
const LILAC = PAL.lilac;

// ---------- clock ----------
/** hour: 0–12 (fractions move the minute hand too). yawn: 0..1 (eyes droop, mouth opens). doze: 0..1 (tilt, lids). */
export const HoloClock: React.FC<{ hour: number; yawn?: number; doze?: number; r?: number; t?: number; on?: number }> = ({ hour, yawn = 0, doze = 0, r = 0.2, t = 0, on = 1 }) => {
  if (on <= 0.001) return null;
  const hA = -(hour / 12) * Math.PI * 2;
  const mA = -((hour % 1) * Math.PI * 2);
  const bob = Math.sin(t * 0.06) * 0.012;
  const s = 0.6 + 0.4 * on;
  const eyeOpen = Math.max(0.12, 1 - Math.max(yawn * 0.85, doze * 0.7));
  return (
    <group position={[0, bob, 0]} rotation={[0, 0, doze * 0.28 + Math.sin(t * 0.05) * 0.03]} scale={s}>
      {/* soft disc + bright rim */}
      <mesh material={fade("#7FE8F0", 0.16 * on, { additive: true })}>
        <circleGeometry args={[r, 40]} />
      </mesh>
      <mesh material={glow(TEAL, 2.4 * on)}>
        <torusGeometry args={[r, 0.012, 6, 48]} />
      </mesh>
      {/* 12 ticks */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const big = i % 3 === 0;
        return (
          <mesh key={i} position={[Math.sin(a) * r * 0.84, Math.cos(a) * r * 0.84, 0.002]} rotation={[0, 0, -a]} material={glow(LILAC, 2.2 * on)}>
            <boxGeometry args={[big ? 0.014 : 0.008, big ? 0.04 : 0.024, 0.004]} />
          </mesh>
        );
      })}
      {/* hands, from the centre */}
      <group rotation={[0, 0, hA]} position={[0, 0, 0.006]}>
        <mesh position={[0, r * 0.26, 0]} material={glow("#FFFFFF", 2.2 * on)}>
          <boxGeometry args={[0.018, r * 0.52, 0.004]} />
        </mesh>
      </group>
      <group rotation={[0, 0, mA]} position={[0, 0, 0.008]}>
        <mesh position={[0, r * 0.36, 0]} material={glow("#FFFFFF", 2.0 * on)}>
          <boxGeometry args={[0.01, r * 0.72, 0.004]} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.01]} material={glow("#FFFFFF", 2.5 * on)}>
        <circleGeometry args={[0.014, 12]} />
      </mesh>
      {/* the tiny face, lower half: two eyes and a mouth that yawns */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * r * 0.3, -r * 0.3, 0.01]} scale={[1, eyeOpen, 1]} material={glow("#FFFFFF", 2.3 * on)}>
          <circleGeometry args={[0.018, 12]} />
        </mesh>
      ))}
      <mesh position={[0, -r * 0.55, 0.01]} scale={[1, 0.35 + yawn * 1.5, 1]} material={glow("#FFFFFF", 2.1 * on)}>
        <ringGeometry args={[0.012 + yawn * 0.004, 0.02 + yawn * 0.01, 18]} />
      </mesh>
    </group>
  );
};

// ---------- alarm clock ----------
/** ring 0..1 = shaking + bell blur; arm = { len (world units), dir angle in xy (rad), grab 0..1 closes the mitten } */
export const AlarmClock: React.FC<{ ring?: number; t?: number; arm?: { len: number; dir: number }; squash?: number }> = ({ ring = 0, t = 0, arm, squash = 1 }) => {
  const shake = ring > 0 ? Math.sin(t * 2.6) * 0.18 * ring : 0;
  const hop = ring > 0 ? Math.abs(Math.sin(t * 1.3)) * 0.02 * ring : 0;
  const body = "#E84A3C";
  const sx = 1 / Math.sqrt(squash);
  return (
    <group position={[0, hop, 0]} rotation={[0, 0, shake]} scale={[sx, squash, sx]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={matte(body, 0.6, { flat: false })}>
        <cylinderGeometry args={[0.11, 0.11, 0.07, 28]} />
      </mesh>
      <mesh position={[0, 0, 0.036]} material={matte(PAL.cream, 0.6, { flat: false })}>
        <circleGeometry args={[0.088, 28]} />
      </mesh>
      {/* hands at 8 */}
      <mesh position={[-0.02, -0.012, 0.04]} rotation={[0, 0, 1.05]} material={matte(PAL.ink, 0.6)}>
        <boxGeometry args={[0.012, 0.05, 0.004]} />
      </mesh>
      <mesh position={[0, 0.03, 0.041]} material={matte(PAL.ink, 0.6)}>
        <boxGeometry args={[0.008, 0.065, 0.004]} />
      </mesh>
      {/* bells + hammer */}
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.075, 0.105, 0]} rotation={[0, 0, -k * 0.5]}>
          <mesh castShadow material={matte("#F2C24A", 0.4, { metal: 0.4, flat: false })}>
            <sphereGeometry args={[0.045, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.125 + (ring > 0 ? Math.sin(t * 2.6) * 0.004 : 0), 0]} rotation={[0, 0, ring > 0 ? Math.sin(t * 2.6) * 0.6 : 0]} material={matte(PAL.chrome, 0.4, { metal: 0.5 })}>
        <boxGeometry args={[0.012, 0.05, 0.012]} />
      </mesh>
      {/* feet */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * 0.06, -0.115, 0]} rotation={[0, 0, k * 0.4]} material={matte(PAL.ink, 0.7)}>
          <cylinderGeometry args={[0.01, 0.014, 0.04, 8]} />
        </mesh>
      ))}
      {/* ring lines */}
      {ring > 0.05
        ? [-1, 1].map((k) =>
            [0, 1, 2].map((i) => (
              <mesh key={`${k}${i}`} position={[k * (0.17 + i * 0.035), 0.12 + i * 0.02, 0]} rotation={[0, 0, k * (0.6 + i * 0.12)]} material={glow("#FFE08A", 2.2 * ring)}>
                <boxGeometry args={[0.008, 0.05, 0.004]} />
              </mesh>
            )),
          )
        : null}
      {/* the grabbing arm: a springy stick with a white mitten */}
      {arm && arm.len > 0.01 ? (
        <group rotation={[0, 0, arm.dir]}>
          <mesh position={[0.1 + arm.len / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={matte(body, 0.6, { flat: false })}>
            <cylinderGeometry args={[0.011, 0.011, arm.len, 8]} />
          </mesh>
          <mesh position={[0.1 + arm.len + 0.022, 0, 0]} castShadow material={matte("#FFFFFF", 0.7, { flat: false })}>
            <sphereGeometry args={[0.028, 14, 10]} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

// ---------- map ----------
const mapTex = () =>
  canvasTex("holoMap", 512, 320, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(120,220,235,0.16)";
    g.fillRect(0, 0, w, h);
    // grid
    g.strokeStyle = "rgba(185,163,227,0.45)";
    g.lineWidth = 1.5;
    for (let x = 0; x <= w; x += 48) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    for (let y = 0; y <= h; y += 48) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    // two generic land masses (an ocean between them), not a real map
    g.fillStyle = "rgba(63,224,208,0.55)";
    g.strokeStyle = "rgba(220,255,250,0.95)";
    g.lineWidth = 4;
    const blob = (pts: [number, number][]) => {
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h)));
      g.closePath();
      g.fill();
      g.stroke();
    };
    blob([[0.03, 0.25], [0.18, 0.12], [0.3, 0.2], [0.33, 0.45], [0.27, 0.7], [0.15, 0.88], [0.05, 0.7]]);
    blob([[0.62, 0.18], [0.82, 0.1], [0.97, 0.22], [0.95, 0.55], [0.83, 0.82], [0.68, 0.75], [0.6, 0.45]]);
  });

/** a floating map panel. w = width (units), pins in panel coords (-0.5..0.5 of w). */
export const HoloMap: React.FC<{ w?: number; on?: number; t?: number }> = ({ w = 0.9, on = 1, t = 0 }) => {
  if (on <= 0.001) return null;
  const h = w * (320 / 512);
  return (
    <group scale={0.7 + 0.3 * on} position={[0, Math.sin(t * 0.05) * 0.01, 0]}>
      <mesh material={texMat("holoMapM", mapTex(), { basic: true, transparent: true, opacity: 0.95 * on, side: THREE.DoubleSide })}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh material={glow(TEAL, 2.0 * on)} geometry={geo(`mapFrame${w}`, () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)))} />
      {/* pins: home (east, right) and the far west (left) */}
      {[
        [MAP_HOME[0] * w, MAP_HOME[1] * h, PAL.pinkNeon],
        [MAP_WEST[0] * w, MAP_WEST[1] * h, PAL.amber],
      ].map(([x, y, c], i) => (
        <group key={i} position={[x as number, y as number, 0.01]}>
          <mesh material={glow(c as string, 2.6 * on)}>
            <circleGeometry args={[0.022, 16]} />
          </mesh>
          <mesh material={glow("#FFFFFF", 1.4 * on)}>
            <ringGeometry args={[0.03, 0.036, 20]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
/** pin positions as fractions of the map (x of w, y of h) */
export const MAP_HOME: [number, number] = [0.3, -0.05];
export const MAP_WEST: [number, number] = [-0.33, 0.06];

/** point along the flight arc (u 0 = home, 1 = west), lifted towards the camera so the plane reads over the map */
export const flightPoint = (u: number, w = 0.9): V3 => {
  const h = w * (320 / 512);
  const x = (MAP_HOME[0] + (MAP_WEST[0] - MAP_HOME[0]) * u) * w;
  const y = (MAP_HOME[1] + (MAP_WEST[1] - MAP_HOME[1]) * u) * h + Math.sin(u * Math.PI) * h * 0.32;
  return [x, y, 0.06 + Math.sin(u * Math.PI) * 0.03];
};

/** dotted trail behind the plane from u0 to u1 */
export const FlightTrail: React.FC<{ u0: number; u1: number; w?: number; on?: number }> = ({ u0, u1, w = 0.9, on = 1 }) => {
  const n = 14;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const u = u0 + ((u1 - u0) * i) / (n - 1);
        const p = flightPoint(u, w);
        return (
          <mesh key={i} position={[p[0], p[1], p[2] - 0.02]} material={glow("#FFFFFF", 1.8 * on)}>
            <circleGeometry args={[0.007, 8]} />
          </mesh>
        );
      })}
    </>
  );
};

// ---------- plane ----------
/** a toy plane pointing +x (flip with scale x = -1 to fly the other way) with sleeping Mika in the round window */
export const TinyPlane: React.FC<{ t?: number; bank?: number }> = ({ t = 0, bank = 0 }) => {
  const white = matte("#F8F4EE", 0.6, { flat: false });
  const zz = 0.5 + 0.5 * Math.sin(t * 0.2);
  return (
    <group rotation={[bank, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow material={white} geometry={geo("planeBody", () => new THREE.CapsuleGeometry(0.035, 0.15, 6, 14))} />
      <mesh position={[0.11, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={matte(PAL.mika, 0.6, { flat: false })}>
        <coneGeometry args={[0.028, 0.04, 14]} />
      </mesh>
      {/* wings, tail */}
      <mesh position={[0.0, -0.005, 0]} material={matte(PAL.lilac, 0.65)}>
        <boxGeometry args={[0.07, 0.008, 0.26]} />
      </mesh>
      <mesh position={[-0.1, 0.035, 0]} rotation={[0, 0, -0.35]} material={matte(PAL.lilac, 0.65)}>
        <boxGeometry args={[0.04, 0.05, 0.008]} />
      </mesh>
      <mesh position={[-0.1, 0.005, 0]} material={matte(PAL.lilac, 0.65)}>
        <boxGeometry args={[0.03, 0.006, 0.09]} />
      </mesh>
      {/* window with sleeping Mika: tiny head, brown curls, closed eyes */}
      <group position={[0.03, 0.008, 0.034]}>
        <mesh material={matte("#2A2340", 0.6)}>
          <circleGeometry args={[0.024, 18]} />
        </mesh>
        <mesh position={[0, -0.002, 0.002]} material={matte("#EDB892", 0.8)}>
          <circleGeometry args={[0.016, 16]} />
        </mesh>
        <mesh position={[0, 0.011, 0.003]} material={matte("#6B3A22", 0.9)}>
          <circleGeometry args={[0.017, 16, 0, Math.PI]} />
        </mesh>
        {[-1, 1].map((k) => (
          <mesh key={k} position={[k * 0.006, -0.002, 0.004]} material={matte(PAL.ink, 0.8)}>
            <boxGeometry args={[0.007, 0.0016, 0.001]} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.005]} material={matte(PAL.chrome, 0.4)} geometry={geo("planeWinRim", () => new THREE.RingGeometry(0.023, 0.028, 20))} />
      </group>
      {/* Zz */}
      {[0, 1].map((i) => (
        <mesh key={i} position={[0.03 + i * 0.03, 0.07 + i * 0.035 + zz * 0.01, 0.03]} scale={0.6 + i * 0.4} material={glow("#FFFFFF", 1.6 + zz)} geometry={zGeo()} />
      ))}
    </group>
  );
};
const zGeo = () =>
  geo("zzGlyph", () => {
    const pts = [new THREE.Vector3(-0.012, 0.012, 0), new THREE.Vector3(0.012, 0.012, 0), new THREE.Vector3(-0.012, -0.012, 0), new THREE.Vector3(0.012, -0.012, 0)];
    return tubeGeo(pts, 0.0028, 18, "zzTube");
  });
