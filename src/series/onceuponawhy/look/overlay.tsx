// ONCE UPON A WHY: DOM overlays (bible §8–§10): caption pills, title card, VHS glitch transition, font gate.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useDelayRender } from "remotion";
import { DISPLAY, ROUND, fontsReady } from "../fonts";
import { PAL, SPEAKER_COLOR, Speaker } from "../palette";

// ---------- font gate: canvas textures draw with the series fonts, so hold the frame until they load ----------
let loaded = false;
fontsReady.then(() => {
  loaded = true;
});
export const FontGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ok, setOk] = useState(loaded);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => (loaded ? null : delayRender("onceuponawhy fonts")));
  useEffect(() => {
    if (ok) return;
    fontsReady.then(() => {
      setOk(true);
      if (handle !== null) continueRender(handle);
    });
  }, [ok, handle, continueRender]);
  return ok ? <>{children}</> : null;
};

// ---------- captions ----------
/**
 * House caption (bible §10): a clean rounded white pill, 1–3 words, in the middle third (y 640–1280),
 * x centred in the safe column (never under the right-hand UI). The accent word takes the speaker colour.
 * `y` is the pill's vertical centre. Pick it so the pill never covers a face (use project() on the head).
 */
export const CaptionPill: React.FC<{
  words: string[];
  accent?: number[];
  speaker: Speaker;
  y?: number;
  /** frames since the caption appeared (pop-in) */
  age?: number;
  cx?: number;
  /** font size (house 78; long 3-word captions may drop to 68 to stay inside the safe column) */
  size?: number;
}> = ({ words, accent = [], speaker, y = 1180, age = 99, cx = 520, size = 78 }) => {
  const yy = Math.max(640 + 60, Math.min(1280 - 60, y));
  const pop = interpolate(age, [0, 3, 6], [0.82, 1.06, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const op = interpolate(age, [0, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const col = SPEAKER_COLOR[speaker];
  return (
    <div
      style={{
        position: "absolute",
        left: cx,
        top: yy,
        transform: `translate(-50%, -50%) scale(${pop})`,
        opacity: op,
        background: "#FFFFFF",
        borderRadius: 999,
        padding: "18px 44px 22px",
        boxShadow: "0 10px 28px rgba(20,10,40,0.28), 0 2px 0 rgba(255,255,255,0.6) inset",
        fontFamily: ROUND,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: 0.5,
        color: PAL.ink,
        whiteSpace: "nowrap",
      }}
    >
      {words.map((w, i) => (
        <span key={i} style={{ color: accent.includes(i) ? col : PAL.ink }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};

// ---------- title card ----------
/**
 * Retro 1980s title (bible §9): chrome-to-sunset script title on a dusk gradient with a striped sun and a neon
 * grid floor. English title only. `heroine` only tints the title's glow. `t` = frames since start.
 */
export const TitleCard: React.FC<{ title: string; heroine: "mika" | "nora"; t?: number }> = ({ title, heroine, t = 60 }) => {
  const sun = interpolate(t, [0, 20], [60, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const textIn = interpolate(t, [6, 18], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const accent = heroine === "mika" ? PAL.mika : PAL.nora;
  const size = title.length > 16 ? 132 : 158;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PAL.duskDeep} 0%, ${PAL.duskPurple} 34%, #A65E8E 52%, ${PAL.peach} 64%, #FFD7A8 70%, ${PAL.navy} 70.2%, ${PAL.navyDeep} 100%)`, overflow: "hidden" }}>
      {/* striped sun */}
      <div
        style={{
          position: "absolute",
          left: 540 - 300,
          top: 1344 - 520 + sun,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `linear-gradient(180deg, #FFE7A0 0%, ${PAL.orange} 55%, ${PAL.pinkNeon} 100%)`,
          WebkitMaskImage: "repeating-linear-gradient(180deg, #000 0 34px, transparent 34px 46px)",
          maskImage: "linear-gradient(180deg, #000 0 52%, transparent 52%), repeating-linear-gradient(180deg, #000 0 30px, transparent 30px 44px)",
          maskComposite: "add",
          clipPath: "inset(0 0 13% 0)",
          filter: "drop-shadow(0 0 40px rgba(255,140,90,0.55))",
        }}
      />
      {/* neon grid floor */}
      <svg width={1080} height={580} style={{ position: "absolute", left: 0, top: 1344 }}>
        {Array.from({ length: 23 }, (_, i) => {
          const x = -1200 + i * 156;
          return <line key={`v${i}`} x1={540} y1={0} x2={x + 0} y2={580} stroke={PAL.tealNeon} strokeOpacity={0.55} strokeWidth={2.5} />;
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const yy = 580 * Math.pow((i + ((t * 0.04) % 1)) / 9, 2.1);
          return <line key={`h${i}`} x1={0} y1={yy} x2={1080} y2={yy} stroke={PAL.pinkNeon} strokeOpacity={0.5} strokeWidth={2.5} />;
        })}
      </svg>
      {/* stars */}
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: random(`ts${i}`) * 1080, top: random(`tt${i}`) * 700 + 120, width: 4, height: 4, borderRadius: 2, background: PAL.cream, opacity: 0.3 + 0.5 * random(`to${i}`) }} />
      ))}
      {/* title: centred in the middle third */}
      <div style={{ position: "absolute", left: 60, right: 120, top: 700, textAlign: "center", opacity: textIn, transform: `translateY(${(1 - textIn) * 30}px) rotate(-6deg)` }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: size,
            lineHeight: 1.0,
            background: `linear-gradient(180deg, #FFFFFF 0%, #FFE9F3 38%, ${PAL.lilac} 50%, ${PAL.pinkNeon} 62%, #FFD18A 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: `drop-shadow(0 6px 0 ${PAL.duskDeep}) drop-shadow(0 0 22px ${accent}aa)`,
            paddingBottom: 20,
          }}
        >
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- VHS glitch ----------
/**
 * Short VHS-style glitch between locations (bible §11): MAX 6 FRAMES. Put it over the cut with `t` = frames since
 * the glitch started (0..5). RGB split, tracking band, line tear and static. Outside 0..5 it draws nothing.
 */
export const VhsGlitch: React.FC<{ t: number; seed?: number }> = ({ t, seed = 1 }) => {
  if (t < 0 || t > 5) return null;
  const k = 1 - Math.abs(t - 2.5) / 3; // peaks in the middle
  const bandY = (random(`vb${seed}-${t}`) * 1500 + 200) | 0;
  const bandH = 60 + random(`vh${seed}-${t}`) * 160;
  const tears = Array.from({ length: 7 }, (_, i) => ({
    y: random(`ty${seed}-${t}-${i}`) * 1920,
    h: 6 + random(`th${seed}-${t}-${i}`) * 40,
    dx: (random(`tx${seed}-${t}-${i}`) - 0.5) * 160 * k,
  }));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(255,0,80,${0.16 * k}), rgba(0,255,230,${0.16 * k}))`, mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: bandY, height: bandH, background: `rgba(255,255,255,${0.22 * k})`, mixBlendMode: "overlay", boxShadow: `0 0 30px rgba(255,255,255,${0.3 * k})` }} />
      {tears.map((r, i) => (
        <div key={i} style={{ position: "absolute", left: r.dx, top: r.y, width: 1080, height: r.h, background: i % 2 ? `rgba(63,224,208,${0.35 * k})` : `rgba(255,111,181,${0.35 * k})`, mixBlendMode: "screen" }} />
      ))}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.55 * k, mixBlendMode: "screen" }}>
        <filter id={`vhs${seed}${t}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.02" numOctaves={1} seed={seed * 10 + t} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter={`url(#vhs${seed}${t})`} />
      </svg>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(180deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 5px)", opacity: k }} />
    </AbsoluteFill>
  );
};

/** wraps a shot so its picture tears sideways during a glitch (use with VhsGlitch, same t) */
export const GlitchShift: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  const on = t >= 0 && t <= 5;
  const k = on ? 1 - Math.abs(t - 2.5) / 3 : 0;
  const dx = on ? (random(`gs${t}`) - 0.5) * 70 * k : 0;
  return <AbsoluteFill style={{ transform: `translateX(${dx}px)`, filter: on ? `saturate(${1 + k}) contrast(${1 + 0.25 * k}) hue-rotate(${k * 12}deg)` : undefined }}>{children}</AbsoluteFill>;
};

/** safe-area guide for review stills only (never in a deliverable) */
export const SafeGuide: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, height: 640, borderTop: "2px dashed rgba(255,255,255,0.35)", borderBottom: "2px dashed rgba(255,255,255,0.35)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1536, bottom: 0, background: "rgba(255,0,60,0.12)" }} />
    <div style={{ position: "absolute", right: 0, top: 900, width: 140, height: 636, background: "rgba(255,0,60,0.12)" }} />
  </AbsoluteFill>
);

// ---------- ep 1 overlays (reusable) ----------
/** a retro day/time card ("SATURDAY" / "8:00"): dusk gradient, white Fredoka, scanlines. t = frames since the card
 *  started (pair it with VhsGlitch t for the glitch-in). The text sits in the middle third. */
export const TimeCard: React.FC<{ day: string; time: string; t: number; accent?: string }> = ({ day, time, t, accent = PAL.pinkNeon }) => {
  const k = interpolate(t, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const jitter = t < 5 ? (random(`tc${t}`) - 0.5) * 30 : 0;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PAL.duskDeep} 0%, ${PAL.duskPurple} 55%, #7A3E78 100%)` }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 6px)" }} />
      <div style={{ position: "absolute", left: 60, right: 140, top: 760, textAlign: "center", transform: `translateX(${jitter}px)`, opacity: k }}>
        <div style={{ fontFamily: ROUND, fontWeight: 700, fontSize: 112, letterSpacing: 10, color: "#FFFFFF", textShadow: `4px 0 0 rgba(255,0,90,0.55), -4px 0 0 rgba(0,255,230,0.5), 0 0 30px ${accent}88` }}>{day}</div>
        <div style={{ fontFamily: ROUND, fontWeight: 700, fontSize: 210, lineHeight: 1.05, color: "#FFFFFF", textShadow: `5px 0 0 rgba(255,0,90,0.55), -5px 0 0 rgba(0,255,230,0.5), 0 0 40px ${accent}aa` }}>{time}</div>
      </div>
    </AbsoluteFill>
  );
};

/** a small retro LCD clock pill (e.g. "MON 8:12"), top-left inside the safe area. op 0..1 */
export const ScreenClock: React.FC<{ text: string; op?: number; x?: number; y?: number; blink?: boolean }> = ({ text, op = 1, x = 70, y = 210, blink = true }) => {
  const f = useCurrentFrame();
  const colon = !blink || Math.floor(f / 15) % 2 === 0;
  const shown = colon ? text : text.replace(":", " ");
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: op, background: "rgba(20,14,40,0.82)", borderRadius: 26, padding: "14px 30px 16px", border: `3px solid ${PAL.amber}`, boxShadow: `0 0 24px ${PAL.amber}66` }}>
      <span style={{ fontFamily: ROUND, fontWeight: 700, fontSize: 64, letterSpacing: 6, color: PAL.amber, whiteSpace: "pre" }}>{shown}</span>
    </div>
  );
};

/** the end pill: two lines, accent words in a colour. lines: arrays of [text, accent?] pieces. age = frames since in */
export const EndPill: React.FC<{ lines: [string, boolean?][][]; color: string; y?: number; age: number }> = ({ lines, color, y = 1000, age }) => {
  const pop = interpolate(age, [0, 4, 8], [0.8, 1.05, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const op = interpolate(age, [0, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 520,
        top: y,
        transform: `translate(-50%, -50%) scale(${pop})`,
        opacity: op,
        background: "#FFFFFF",
        borderRadius: 64,
        padding: "30px 54px 34px",
        boxShadow: "0 12px 34px rgba(20,10,40,0.32)",
        fontFamily: ROUND,
        fontWeight: 700,
        fontSize: 72,
        lineHeight: 1.12,
        color: PAL.ink,
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      {lines.map((ln, i) => (
        <div key={i}>
          {ln.map(([txt, acc], j) => (
            <span key={j} style={{ color: acc ? color : PAL.ink }}>
              {txt}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
