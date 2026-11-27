// review still: Claude v2 close-ups (expressions + costume props)
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../look/Stage";
import { Claude, ClaudeProp } from "../cast/Claude";
import { Expr } from "../cast/face";
import { StudioLights } from "./CharacterSheet";

const ROW: [Expr, ClaudeProp][] = [["neutral", null], ["happy", "bowtie"], ["shocked", null], ["sleepy", "gradcap"]];
export const ClaudeStill: React.FC = () => {
  const t = useCurrentFrame() + 40;
  return (
    <Stage cam={{ pos: [0, 0.8, 4.2], target: [0, 0.2, -0.1], fov: 22 }} lens={{ aperture: 0 }} bg="#F3D3C2" grain={0.03} vignette={0.15}>
      <StudioLights floor="#F6DCCD" wall="#F3D3C2" />
      {ROW.map(([e, p], i) => (
        <group key={e} position={[(i % 2 ? 0.27 : -0.27), 0, i < 2 ? -0.5 : 0.25]} rotation={[0, (i % 2 ? -0.35 : 0.35), 0]}>
          <Claude expr={e} prop={p} t={t + i * 13} />
        </group>
      ))}
    </Stage>
  );
};
