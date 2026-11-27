// review still: Nora v2, both glasses options, front and three-quarter
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../look/Stage";
import { Nora } from "../cast/Nora";
import { NORA_POSES } from "../cast/poses";
import { breathe } from "../cast/rig";
import { StudioLights } from "./CharacterSheet";

export const NoraStill: React.FC<{ close?: boolean }> = ({ close = false }) => {
  const t = useCurrentFrame() + 40;
  const cam = close ? { pos: [0, 1.25, 4.2] as [number, number, number], target: [0, 1.1, 0] as [number, number, number], fov: 13 } : { pos: [0, 1.0, 6.6] as [number, number, number], target: [0, 0.8, 0] as [number, number, number], fov: 19 };
  return (
    <Stage cam={cam} lens={{ aperture: 0 }} bg="#DCE6CC" grain={0.03} vignette={0.15}>
      <StudioLights floor="#E3EBD5" wall="#DCE6CC" />
      {[
        [-0.42, 0.5, "oval"],
        [0.42, -0.5, "cateye"],
      ].map(([x, yaw, g], i) => (
        <group key={i} position={[x as number, 0, 0]} rotation={[0, (yaw as number) * (close ? 0.5 : 1), 0]}>
          <Nora p={breathe(NORA_POSES.happy, t, 0.3)} expr={i ? "smug" : "happy"} t={t} glasses={g as "oval" | "cateye"} />
        </group>
      ))}
    </Stage>
  );
};
