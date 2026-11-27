// ONCE UPON A WHY — EPISODE 1 "Why am I so tired on Mondays?" (46.0 s, 1380 frames, 1080 × 1920, 30 fps).
// Built from the locked kit (bible) + the ep-1 additions: carriage MORNING light + in-carriage split-flap, Claude's
// neck pillow and front legs, Mika's messy hair / thumb hand / table nap, holo clock + alarm + map + tiny plane,
// café morning/late light + street door, time cards, screen clock, end pill.
// Shot list: episodes/ouaw-01-monday/shotlist.md. Scene logic: ./scene.ts. Render ONLY through ./render.sh.
import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Stage, project } from "../../look/Stage";
import { CaptionPill, EndPill, FontGate, GlitchShift, SafeGuide, ScreenClock, TimeCard, VhsGlitch } from "../../look/overlay";
import { V3 } from "../../look/mat";
import { AlarmClock, FlightTrail, HoloClock, HoloMap, TinyPlane, flightPoint } from "../../look/holo";
import { Mika } from "../../cast/Mika";
import { Claude, NeckPillow } from "../../cast/Claude";
import { Latte, SnoreBubble } from "../../cast/props";
import { CARRIAGE_MORNING, CarriageSet } from "../../sets/Train";
import { COFFEE_LATE, COFFEE_MORNING, CoffeeShopSet } from "../../sets/CoffeeShop";
import { Cy } from "../../sets/common";
import { PAL } from "../../palette";
import { ROUND } from "../../fonts";
import { TL } from "./timeline";
import {
  ALARM_POS,
  FREEZE,
  HOLO_CLOCK,
  HOLO_MAP,
  LATTE_POS,
  M_POS,
  M_YAW,
  NAP_POS,
  boardAt,
  camAt,
  capSize,
  endPillY,
  captionAt,
  claudeCarriage,
  facesAt,
  holoAt,
  lightAt,
  mikaBurst,
  mikaCarriage,
  napAt,
  shotAt,
} from "./scene";

export const OUAW01_FRAMES = TL.frames;

/** where her right hand meets the strap (Mika-local), so the strap hangs right into her grip */
const STRAP_HAND: V3 = [-0.2, 1.34, 0.12];

// ---------- carriage (shots 1–9) ----------
const Carriage: React.FC<{ f: number }> = ({ f }) => {
  const s = f / 30;
  const t = f + 40;
  const m = mikaCarriage(s, t);
  const c = claudeCarriage(s, t);
  const h = holoAt(s);
  const L = lightAt(s);
  const board = boardAt(s);
  const sh = shotAt(f);
  const cam = camAt(f);
  const mapW = 0.74;
  const plane = flightPoint(h.u, mapW);
  return (
    <Stage cam={cam} lens={{ ...CARRIAGE_MORNING.lens, aperture: sh.id === "4b" ? 0.0026 : CARRIAGE_MORNING.lens?.aperture }} bloom={CARRIAGE_MORNING.bloom} exposure={(CARRIAGE_MORNING.exposure ?? 1) + L.flash * 0.15} bg={CARRIAGE_MORNING.bg} env={CARRIAGE_MORNING.env}>
      <CarriageSet t={t} light="morning" board={board} flash={L.flash} beam={L.beam} />
      <group position={M_POS} rotation={[0, M_YAW, 0]}>
        <Mika
          p={m.p}
          expr={m.expr}
          over={m.over}
          t={t}
          bounce={m.bounce}
          messy={m.messy}
          handL={m.handL}
          papers={3}
          claudePop={c.pop}
          claudeExpr={c.expr}
          claudeWave={c.wiggle}
          claude={{ prop: "neckpillow", face: c.face, tilt: c.tilt, squash: c.squash, lift: c.lift, frontLegs: c.frontLegs }}
        />
        {/* her strap: from the rail straight down into her right hand */}
        <group position={STRAP_HAND}>
          <Cy p={[0, (2.25 - STRAP_HAND[1]) / 2 + 0.06, 0]} r={0.012} h={2.25 - STRAP_HAND[1] - 0.1} c="#E8E2F0" cast={false} />
          <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.06, 0.013, 6, 14]} />
            <meshStandardMaterial color="#FFFDF6" roughness={0.6} />
          </mesh>
        </group>
      </group>
      {h.clockOn > 0 ? (
        <group position={HOLO_CLOCK}>
          <HoloClock hour={h.hour} yawn={h.yawn} doze={h.doze} t={t} on={h.clockOn} r={0.2} />
        </group>
      ) : null}
      {h.alarmOn > 0 ? (
        <group position={ALARM_POS} scale={h.alarmOn}>
          <AlarmClock ring={h.ring} t={t} arm={h.reach > 0 ? { len: 0.32 * h.reach, dir: -0.78 } : undefined} />
        </group>
      ) : null}
      {h.mapOn > 0 ? (
        <group position={HOLO_MAP} rotation={[-0.25, 0, 0]}>
          <HoloMap w={mapW} on={h.mapOn} t={t} />
          {h.planeOn ? (
            <>
              <FlightTrail u0={h.dir < 0 ? 0 : 1} u1={h.u} w={mapW} on={h.mapOn} />
              <group position={plane} scale={[h.dir < 0 ? -1.1 : 1.1, 1.1, 1.1]} rotation={[0, 0, h.dir < 0 ? -Math.cos(h.u * Math.PI) * 0.25 : Math.cos(h.u * Math.PI) * 0.25]}>
                <TinyPlane t={t} />
              </group>
            </>
          ) : null}
        </group>
      ) : null}
    </Stage>
  );
};

// ---------- café (shots 10, 11) ----------
const CafeBurst: React.FC<{ f: number }> = ({ f }) => {
  const s = f / 30;
  const t = f + 40;
  const m = mikaBurst(s, t);
  const cam = camAt(f);
  const pop = 1;
  return (
    <Stage cam={cam} lens={COFFEE_MORNING.lens} bloom={COFFEE_MORNING.bloom} exposure={COFFEE_MORNING.exposure} bg={COFFEE_MORNING.bg} env={COFFEE_MORNING.env}>
      <CoffeeShopSet t={t} light="morning" door={m.door} board={{ from: ["GOOD", "MORNING", "SATURDAY"], to: ["GOOD", "MORNING", "SATURDAY"] }} />
      <group position={m.pos} rotation={[0, m.yaw, 0]}>
        <Mika p={m.p} expr={m.expr} t={t} bounce={m.bounce} swing={m.swing} handR={m.handR} papers={2} claudePop={pop} claudeExpr="proud" claudeWave={f > 1166 ? 1 : 0} claude={{ prop: "neckpillow" }} />
      </group>
    </Stage>
  );
};

const CafeNap: React.FC<{ f: number }> = ({ f }) => {
  const ff = Math.min(f, FREEZE);
  const s = ff / 30;
  const t = ff + 40;
  const n = napAt(s, t);
  const cam = camAt(f);
  const frozen = f >= FREEZE;
  // snore bubble at her nose (her face is turned to camera, cheek down)
  const nose: V3 = [NAP_POS[0] + 0.14, 0.94 + n.p.bob, -0.9];
  return (
    <Stage cam={cam} lens={COFFEE_LATE.lens} bloom={COFFEE_LATE.bloom} exposure={COFFEE_LATE.exposure} bg={COFFEE_LATE.bg} env={COFFEE_LATE.env} vignette={frozen ? 0.6 : 0.45}>
      <CoffeeShopSet t={t} light="late" board={{ from: ["MENU", "SIPHON 4", "MATCHA 5", "TOAST 3"], to: ["MENU", "SIPHON 4", "MATCHA 5", "TOAST 3"] }} />
      <group position={NAP_POS}>
        <Mika p={n.p} expr={n.mExpr} over={n.mOver} t={t} bounce={0.1} papers={1} />
      </group>
      <group position={nose}>
        <SnoreBubble k={n.snore} />
      </group>
      <group position={LATTE_POS}>
        <Latte t={t} steam={1} />
      </group>
      <group position={n.claudePos} rotation={[0, n.claudeYaw, 0]}>
        <Claude t={t} expr={n.cExpr} prop={n.pillowOn ? "neckpillow" : null} squash={1 - n.sigh * 0.15 + n.hop * 0.08} tilt={[n.sigh * 0.12, 0]} />
      </group>
      {!n.pillowOn ? (
        <group position={n.pillow} rotation={[0, n.pillowYaw, 0]}>
          <NeckPillow loose />
        </group>
      ) : null}
    </Stage>
  );
};

// ---------- sound (all original, generated by episodes/ouaw-01-monday/make_sfx.py) ----------
type Cue = { src: string; at: number; vol: number; dur?: number; loop?: boolean; fadeIn?: number; fadeOut?: number };
const SFX: Cue[] = [
  { src: "train-amb", at: 0, vol: 0.4, dur: 37.3, loop: true, fadeOut: 0.3 },
  { src: "music", at: 0, vol: 0.55, fadeIn: 0.6 },
  { src: "jerk", at: 0.62, vol: 0.45 },
  { src: "pop", at: 5.12, vol: 0.55 },
  { src: "rustle", at: 9.2, vol: 0.4 },
  { src: "flaps-long", at: 11.9, vol: 0.55 },
  { src: "holo-on", at: 13.85, vol: 0.4 },
  { src: "clock-yawn", at: 15.4, vol: 0.45 },
  { src: "pop", at: 18.3, vol: 0.4 },
  { src: "alarm", at: 19.03, vol: 0.55 },
  { src: "zip", at: 19.5, vol: 0.5 },
  { src: "holo-on", at: 20.95, vol: 0.35 },
  { src: "whoosh", at: 22.1, vol: 0.5 },
  { src: "whoosh", at: 24.3, vol: 0.5 },
  { src: "grab", at: 26.2, vol: 0.4 },
  { src: "flaps-short", at: 29.0, vol: 0.45 },
  { src: "flaps-mid", at: 29.6, vol: 0.5 },
  { src: "shimmer", at: 30.0, vol: 0.4 },
  { src: "flaps-mid", at: 32.2, vol: 0.5 },
  { src: "punch", at: 36.62, vol: 0.5 },
  { src: "claps", at: 36.8, vol: 0.45 },
  { src: "glitch", at: 37.3, vol: 0.5 },
  { src: "chime", at: 38.0, vol: 0.5 },
  { src: "birds", at: 38.0, vol: 0.4, dur: 2.5, fadeOut: 0.4 },
  { src: "cafe-amb", at: 38.0, vol: 0.4, dur: 8.0, loop: true, fadeIn: 0.3, fadeOut: 0.8 },
  { src: "glitch", at: 39.8, vol: 0.5 },
  { src: "snore", at: 40.6, vol: 0.5 },
  { src: "snore", at: 41.4, vol: 0.5 },
  { src: "sigh", at: 42.0, vol: 0.55 },
  { src: "fwump", at: 43.0, vol: 0.45 },
  { src: "clink", at: 43.1, vol: 0.4 },
  { src: "end-pop", at: 44.0, vol: 0.4 },
];

const Sound: React.FC = () => (
  <>
    {SFX.map((c, i) => {
      const from = Math.round(c.at * 30);
      const dur = c.dur ? Math.round(c.dur * 30) : undefined;
      const fi = (c.fadeIn ?? 0) * 30;
      const fo = (c.fadeOut ?? 0) * 30;
      return (
        <Sequence key={i} from={from} durationInFrames={dur} layout="none">
          <Html5Audio
            src={staticFile(`ouaw01/sfx/${c.src}.wav`)}
            loop={c.loop}
            volume={(fr) => c.vol * (fi ? Math.min(1, fr / fi) : 1) * (fo && dur ? Math.min(1, (dur - fr) / fo) : 1)}
          />
        </Sequence>
      );
    })}
    {TL.lines.map((L) => (
      <Sequence key={L.id} from={Math.round(L.start * 30)} layout="none">
        <Html5Audio src={staticFile(L.wav)} volume={1} />
      </Sequence>
    ))}
  </>
);

// ---------- the episode ----------
export const OUAW01Monday: React.FC<{ __audioOnly?: boolean; debugFaces?: boolean }> = ({ __audioOnly, debugFaces }) => {
  // debugFaces (review stills only): face circles + the safe-area guide
  const f = useCurrentFrame();
  if (__audioOnly) return <Sound />;
  const sh = shotAt(f);
  const local = f - sh.a;
  const cap = captionAt(f);
  const cam = camAt(f);
  return (
    <FontGate>
      <AbsoluteFill style={{ background: PAL.navyDeep }}>
        <GlitchShift t={sh.set === "card" ? local : -1}>
          {sh.set === "carriage" ? <Carriage f={f} /> : null}
          {sh.id === "card1" ? <TimeCard day="SATURDAY" time="8:00" t={local} accent={PAL.amber} /> : null}
          {sh.id === "10" ? <CafeBurst f={f} /> : null}
          {sh.id === "card2" ? <TimeCard day="SATURDAY" time="9:15" t={local} accent={PAL.pinkNeon} /> : null}
          {sh.id === "11" ? <CafeNap f={f} /> : null}
        </GlitchShift>
        {sh.set === "card" ? <VhsGlitch t={local} seed={sh.id === "card1" ? 4 : 7} /> : null}
        {f < 156 ? <ScreenClock text="MON 8:12" op={Math.min(1, (150 - f) / 6)} /> : null}
        {cap ? <CaptionPill key={cap.text + cap.s} words={cap.text.split(" ")} accent={cap.text.split(" ").map((w, i) => (cap.accent.some((a) => w.replace(/[^A-Za-z']/g, "") === a) ? i : -1)).filter((i) => i >= 0)} speaker={cap.who as "mika" | "claude"} y={cap.y} cx={cap.x} age={cap.age} size={capSize(cap.text)} /> : null}
        {f >= FREEZE ? (
          <EndPill
            age={f - FREEZE}
            color={PAL.mika}
            y={endPillY().y}
            lines={[
              [["Send this to your"]],
              [["MONDAY ZOMBIE", true], [" friend"]],
            ]}
          />
        ) : null}
        {debugFaces ? <SafeGuide /> : null}
        {debugFaces
          ? facesAt(f).map((fc, i) => {
              const [x, y] = project(cam, fc.p);
              const [, y2] = project(cam, [fc.p[0], fc.p[1] + fc.r, fc.p[2]]);
              const rr = Math.abs(y - y2);
              return <div key={i} style={{ position: "absolute", left: x - rr, top: y - rr, width: rr * 2, height: rr * 2, border: "4px solid #00FF88", borderRadius: "50%" }} />;
            })
          : null}
      </AbsoluteFill>
      <Sound />
    </FontGate>
  );
};

// ---------- cover still (1080 × 1920): Mika asleep on the strap, SOCIAL JETLAG on the board behind her ----------
export const OUAW01Cover: React.FC = () => {
  const t = 52; // a frame where nobody blinks
  const m = mikaCarriage(0.36, t); // dozing: head half sunk, eyes shut
  const cam = { pos: [0.1, 1.36, 4.15] as V3, target: [-0.06, 1.44, -1.7] as V3, fov: 34 };
  return (
    <FontGate>
      <AbsoluteFill>
        <Stage cam={cam} lens={CARRIAGE_MORNING.lens} bloom={CARRIAGE_MORNING.bloom} exposure={CARRIAGE_MORNING.exposure} bg={CARRIAGE_MORNING.bg} env={CARRIAGE_MORNING.env}>
          <CarriageSet t={t} light="morning" board={{ from: ["", "SOCIAL", "JETLAG", ""], to: ["", "SOCIAL", "JETLAG", ""], k: 1 }} beam={0.6} />
          <group position={M_POS} rotation={[0, M_YAW, 0]}>
            <Mika p={m.p} expr="sleepy" over={{ eyes: "closed", browL: { y: 0, rot: 0.32 }, browR: { y: 0, rot: 0.32 } }} t={t} bounce={0.2} messy papers={3} claudePop={1} claudeExpr="sleepy" claude={{ prop: "neckpillow", lift: 0.1 }} />
            <group position={STRAP_HAND}>
              <Cy p={[0, (2.25 - STRAP_HAND[1]) / 2 + 0.06, 0]} r={0.012} h={2.25 - STRAP_HAND[1] - 0.1} c="#E8E2F0" cast={false} />
              <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.06, 0.013, 6, 14]} />
                <meshStandardMaterial color="#FFFDF6" roughness={0.6} />
              </mesh>
            </group>
          </group>
        </Stage>
        <CoverHeadline lines={[[["WHY SO TIRED"]], [["ON "], ["MONDAYS?", true]]]} />
      </AbsoluteFill>
    </FontGate>
  );
};

/** big cover headline: white Fredoka with a thick ink outline, accent words in Mika red; sits at the top inside the
 *  3:4 grid crop (y ≥ 240) and clear of the right UI column (x ≤ 940) */
const CoverHeadline: React.FC<{ lines: [string, boolean?][][]; top?: number; size?: number }> = ({ lines, top = 250, size = 118 }) => (
  <div style={{ position: "absolute", left: 70, width: 870, top, textAlign: "center", transform: "rotate(-4deg)" }}>
    {lines.map((ln, i) => (
      <div key={i} style={{ fontFamily: ROUND, fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: 1, whiteSpace: "nowrap" }}>
        {ln.map(([txt, acc], j) => (
          <span key={j} style={{ color: acc ? PAL.mika : "#FFFFFF", WebkitTextStroke: `16px ${PAL.ink}`, paintOrder: "stroke fill", textShadow: `0 10px 0 ${PAL.ink}, 0 14px 28px rgba(20,10,40,0.45)` }}>
            {txt}
          </span>
        ))}
      </div>
    ))}
  </div>
);
