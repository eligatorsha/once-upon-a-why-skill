// ONCE UPON A WHY: the character sheet (review still, 2160 × 4400). Front row, three-quarter row, then six key
// expressions for each of Mika, Nora and Claude. Rendered with `XOuawCharacterSheet`.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage, project } from "../look/Stage";
import { matte } from "../look/mat";
import { FontGate } from "../look/overlay";
import { DISPLAY, ROUND } from "../fonts";
import { PAL } from "../palette";
import { Mika } from "../cast/Mika";
import { Nora } from "../cast/Nora";
import { Claude } from "../cast/Claude";
import { MIKA_POSES, NORA_POSES } from "../cast/poses";
import { Expr } from "../cast/face";
import { breathe } from "../cast/rig";

export const SHEET_W = 2160;
export const SHEET_H = 4560;

/** soft studio: warm key, lilac fill, peach rim, a floor that only takes the colour and shadow */
export const StudioLights: React.FC<{ floor?: string; wall?: string; shadowBox?: number }> = ({ floor = "#E9DDF5", wall = "#D9C9EE", shadowBox = 4 }) => (
  <>
    <hemisphereLight args={["#FFE9D6", "#7E62A8", 1.0]} />
    <directionalLight
      position={[-2.5, 4.5, 4]}
      intensity={2.0}
      color="#FFE3C8"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-shadowBox}
      shadow-camera-right={shadowBox}
      shadow-camera-top={shadowBox}
      shadow-camera-bottom={-shadowBox}
      shadow-radius={6}
      shadow-bias={-0.0005}
    />
    <directionalLight position={[3.5, 2.5, -2.5]} intensity={1.6} color="#FFB894" />
    <directionalLight position={[2.5, 1.5, 4]} intensity={0.5} color="#B9A3E3" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={matte(floor, 0.95)}>
      <planeGeometry args={[60, 60]} />
    </mesh>
    <mesh position={[0, 6, -6]} material={matte(wall, 1)}>
      <planeGeometry args={[80, 30]} />
    </mesh>
  </>
);

const Card: React.FC<{ x: number; y: number; w: number; h: number; children: React.ReactNode }> = ({ x, y, w, h, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 36, overflow: "hidden", boxShadow: "0 18px 50px rgba(40,20,70,0.35)" }}>{children}</div>
);

const Label: React.FC<{ x: number; y: number; title: string; sub: string; color: string }> = ({ x, y, title, sub, color }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translateX(-50%)", textAlign: "center", fontFamily: ROUND, color: PAL.cream }}>
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: 18, background: "rgba(255,255,255,0.92)", borderRadius: 999, padding: "10px 34px 14px", color: PAL.ink, fontWeight: 700, fontSize: 46 }}>
      <span style={{ color }}>{title}</span>
    </div>
    <div style={{ marginTop: 10, fontSize: 30, fontWeight: 500, color: "#FFFFFF", textShadow: "0 2px 6px rgba(30,10,50,0.5)" }}>{sub}</div>
  </div>
);

const Chip: React.FC<{ x: number; y: number; text: string; color: string }> = ({ x, y, text, color }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translateX(-50%)", background: "#FFFFFF", borderRadius: 999, padding: "6px 22px 9px", fontFamily: ROUND, fontWeight: 600, fontSize: 30, color, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(30,10,50,0.25)" }}>{text}</div>
);

const MIKA_SIX: Expr[] = ["happy", "laughing", "shocked", "panicked", "embarrassed", "sleepy"];
const NORA_SIX: Expr[] = ["neutral", "thinking", "anxious", "smug", "sad", "proud"];
const CLAUDE_SIX: Expr[] = ["happy", "laughing", "shocked", "sleepy", "proud", "smug"];

export const CharacterSheet: React.FC = () => {
  const t = useCurrentFrame() + 40;
  const W = SHEET_W;
  const pad = 60;
  const cw = W - pad * 2;
  const fullH = 1000;
  const exH = 700;
  const y0 = 230;
  const y1 = y0 + fullH + 40;
  const y2 = y1 + fullH + 40;
  const y3 = y2 + exH + 40;
  const y4 = y3 + exH + 40;
  // the trio, full body. Claude stands on a little wooden crate so it reads at sheet scale.
  const trio = (yaw: number) => (
    <>
      <StudioLights />
      <group position={[-1.35, 0, 0]} rotation={[0, yaw, 0]}>
        <Mika p={breathe(MIKA_POSES.happy, t)} expr="happy" t={t} claudePop={0} />
      </group>
      <group position={[-0.42, 0, 0.3]}>
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow material={matte(PAL.woodLight, 0.85)}>
          <boxGeometry args={[0.5, 0.32, 0.42]} />
        </mesh>
        <group position={[0, 0.32, 0]} rotation={[0, yaw, 0]} scale={1.25}>
          <Claude expr="happy" t={t} prop="bowtie" />
        </group>
      </group>
      <group position={[0.5, 0, 0]} rotation={[0, yaw, 0]}>
        <Nora p={breathe(NORA_POSES.neutral, t, 0.4)} expr="neutral" t={t} glasses="oval" holdL="notebook" />
      </group>
      <group position={[1.38, 0, 0]} rotation={[0, yaw, 0]}>
        <Nora p={breathe(NORA_POSES.smug, t + 20, 0.4)} expr="smug" t={t + 20} glasses="cateye" />
      </group>
    </>
  );
  const fullCam = { pos: [0, 0.95, 7.4] as [number, number, number], target: [0, 0.78, 0] as [number, number, number], fov: 16.5 };
  const exCam = (yT: number, dist: number, fov: number) => ({ pos: [0, yT + 0.08, dist] as [number, number, number], target: [0, yT, 0] as [number, number, number], fov });
  const xs = (n: number, gap: number) => Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * gap);

  return (
    <FontGate>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PAL.duskDeep} 0%, ${PAL.duskPurple} 45%, #8E5A8E 80%, ${PAL.peach} 100%)` }}>
        {/* header */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 120, color: PAL.cream, textShadow: `0 0 28px ${PAL.pinkNeon}`, lineHeight: 1 }}>Once Upon a Why</div>
          <div style={{ fontFamily: ROUND, fontWeight: 600, fontSize: 40, color: PAL.lilacSoft, marginTop: 6, letterSpacing: 6 }}>CAST SHEET · CITY POP DUSK · v2 FOR APPROVAL</div>
        </div>

        <Card x={pad} y={y0} w={cw} h={fullH}>
          <Stage cam={fullCam} width={cw} height={fullH} bg="#D9C9EE" lens={{ aperture: 0 }} grain={0.04} vignette={0.2}>
            {trio(0)}
          </Stage>
          <Label x={project(fullCam, [-1.35, 0, 0], cw, fullH)[0]} y={fullH - 150} title="MIKA" sub="the chaotic one · cherry red" color={PAL.mika} />
          <Label x={project(fullCam, [-0.42, 0, 0.3], cw, fullH)[0]} y={fullH - 150} title="CLAUDE" sub="felted clay · warm orange" color={PAL.claude} />
          <Label x={project(fullCam, [0.5, 0, 0], cw, fullH)[0]} y={fullH - 150} title="NORA · A" sub="thin gold oval" color={PAL.nora} />
          <Label x={project(fullCam, [1.38, 0, 0], cw, fullH)[0]} y={fullH - 150} title="NORA · B" sub="soft cat-eye" color={PAL.nora} />
          <Chip x={140} y={30} text="FRONT" color={PAL.duskPurple} />
        </Card>

        <Card x={pad} y={y1} w={cw} h={fullH}>
          <Stage cam={fullCam} width={cw} height={fullH} bg="#D9C9EE" lens={{ aperture: 0 }} grain={0.04} vignette={0.2}>
            {trio(-0.62)}
          </Stage>
          <Chip x={200} y={30} text="THREE-QUARTER" color={PAL.duskPurple} />
        </Card>

        {/* expressions: Mika */}
        <Card x={pad} y={y2} w={cw} h={exH}>
          <Stage cam={exCam(1.02, 7.2, 13.5)} width={cw} height={exH} bg="#F4D7CF" lens={{ aperture: 0 }} grain={0.04} vignette={0.15}>
            <StudioLights floor="#F6DDD3" wall="#F4D7CF" />
            {MIKA_SIX.map((e, i) => (
              <group key={e} position={[xs(6, 0.82)[i], 0, 0]} rotation={[0, -0.12, 0]}>
                <Mika p={MIKA_POSES[e]} expr={e} t={t + i * 13} bounce={0.2} />
              </group>
            ))}
          </Stage>
          {MIKA_SIX.map((e, i) => (
            <Chip key={e} x={project(exCam(1.02, 7.2, 13.5), [xs(6, 0.82)[i], 1.0, 0], cw, exH)[0]} y={exH - 74} text={e} color={PAL.mika} />
          ))}
        </Card>

        {/* expressions: Nora */}
        <Card x={pad} y={y3} w={cw} h={exH}>
          <Stage cam={exCam(1.02, 7.2, 13.5)} width={cw} height={exH} bg="#DCE6CC" lens={{ aperture: 0 }} grain={0.04} vignette={0.15}>
            <StudioLights floor="#E3EBD5" wall="#DCE6CC" />
            {NORA_SIX.map((e, i) => (
              <group key={e} position={[xs(6, 0.82)[i], 0, 0]} rotation={[0, 0.12, 0]}>
                <Nora p={NORA_POSES[e]} expr={e} t={t + i * 17} glasses={i % 2 ? "cateye" : "oval"} holdL={e === "anxious" ? null : e === "proud" ? "notebook" : null} holdR={e === "anxious" ? "pen" : null} tap={e === "anxious" ? 1 : 0} />
              </group>
            ))}
          </Stage>
          {NORA_SIX.map((e, i) => (
            <Chip key={e} x={project(exCam(1.02, 7.2, 13.5), [xs(6, 0.82)[i], 1.0, 0], cw, exH)[0]} y={exH - 74} text={e === "thinking" ? "thinking (glasses push)" : e === "anxious" ? "anxious (pen tap)" : e} color={PAL.nora} />
          ))}
        </Card>

        {/* expressions: Claude */}
        <Card x={pad} y={y4} w={cw} h={exH}>
          <Stage cam={{ pos: [0, 0.36, 6.2], target: [0, 0.22, 0], fov: 8 }} width={cw} height={exH} bg="#F3D3C2" lens={{ aperture: 0 }} grain={0.04} vignette={0.15}>
            <StudioLights floor="#F6DCCD" wall="#F3D3C2" />
            {CLAUDE_SIX.map((e, i) => (
              <group key={e} position={[xs(6, 0.4)[i], 0, 0]} rotation={[0, (i - 2.5) * -0.06, 0]} scale={0.82}>
                <Claude expr={e} t={t + i * 11} wave={e === "happy" ? 1 : 0} prop={e === "proud" ? "gradcap" : e === "smug" ? "bowtie" : null} />
              </group>
            ))}
          </Stage>
          {CLAUDE_SIX.map((e, i) => (
            <Chip key={e} x={project({ pos: [0, 0.36, 6.2], target: [0, 0.22, 0], fov: 8 }, [xs(6, 0.4)[i], 0.22, 0], cw, exH)[0]} y={exH - 74} text={e === "happy" ? "happy (wave)" : e === "proud" ? "proud + grad cap" : e === "smug" ? "smug + bow tie" : e} color={PAL.claude} />
          ))}
        </Card>
      </AbsoluteFill>
    </FontGate>
  );
};

