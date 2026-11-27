# OUAW 01 — "Why am I so tired on Mondays?" — shot list (step 2)

**46.0 s · 1380 frames · 30 fps · 1080 × 1920.** Composition `OUAW01Monday`, final `out/ouaw-01-monday.mp4`.
Timing comes from the approved voice (`voice/lines/*.wav`, word timings `voice/words.json`). Line starts and caption groups
are in `timeline.json` (built by `make_timeline.py`). Every time below is absolute, in seconds (frame = s × 30).

**Line starts:** m1 0.70 · c1 5.30 · m2 7.35 · c2 9.75 · c3 13.85 · c4 20.95 · m3 26.15 · c5 28.20 · m4 34.55 · (no voice after 37.14).
Gaps are 0.15–0.25 s after each last word. The listener reacts while the other line is still ending.

**Look:** City Pop Dusk (bible §2). **Carriage, MORNING** (new variant): low warm sunrise from the left windows, long soft
window-frame shadows sliding across the floor, dust motes in the beams, a pale peach and lilac city passing outside, and the
sun flickering as buildings pass. **Coffee shop, 8:00**: bright clean morning sun through a new street door and window.
**9:15**: softer, higher, cosier light.
**Camera:** slow push-ins and gentle drifts only (bible §7). Cuts inside the carriage are straight cuts. VHS glitch (≤ 6 frames) is
used only for the Saturday time cards. Nothing important sits in the bottom 20 % (y ≥ 1536) or the right-hand UI column (x ≥ ~900).

**Cast today**
- **Mika (locked)**, Monday-wrecked: `messy` hair state (extra loose curls, bun knocked sideways, pencil tilted), half-closed
  eyes (`sleepy`), headphones round her neck, tote on her left shoulder. Right hand on the strap (`STRAP_R`).
- **Claude (locked)**, in the tote, with the new prop **`neckpillow`** (soft lilac travel pillow, felt-textured like Claude).
  It pops up to the chest (`claudePop`).

---

## Shots

| # | Time (s) | Frames | Anchor words | Camera | Emotions (speaker / listener) | Background reactions | FX | SFX | Caption placement |
|---|---|---|---|---|---|---|---|---|---|
| **1 HOOK** | 0.00–5.30 | 0–159 | (frame 0, no voice) → groan 0.70 → "SO tired" 4.36 | **CU on Mika's face** at the strap (head at y ≈ 620–980), slow pull-back to a medium close-up by 3.9 that shows the strap arm and the tote top | Mika: **sleepy**, slow blinks (0.0, 0.35), head sinks forward 0.10–0.60, **jerks awake 0.62–0.78** (eyes snap wide for 4 frames, then back to half), groan on the jerk, then whiny frustration that builds; on "SO tired" 4.36 she throws her head back, eyes shut (`sad` brows) | the carriage sways; straps swing; passing city in the window behind | **morning sun flicker**: a warm light band sweeps across her face every ~0.7 s (buildings passing); dust in the beam. **On-screen clock** top-left (x ≈ 90–330, y ≈ 230): retro LCD pill **"MON 8:12"**, there from frame 0, fades at 5.0 | train ambience (rails, gentle rattle) from frame 0; a soft head-jerk "bonk" whoosh at 0.62; music bed fades in under the voice | y ≈ 1180 (on her jacket, below the chin) |
| **2 CLAUDE POP** | 5.30–7.35 | 159–220 | "Because" 5.30 · "NEW YORK" 6.68–7.12 | **medium close two-shot**: Mika's head top-left of centre, the tote at frame centre (Mika yawed −0.3, left arm held out so the tote is clear, bible §14) | Claude: pops out at **5.10–5.45** with squash and stretch (`claudePop` 0 → 1.1 → 1), neck pillow on, **smug** grin, tiny wiggle on "New York". Mika: **confused squint** looking down at it (`thinking` brows, one eye smaller) | strap sway; light flicker continues | squash and stretch on the pop; papers in the tote jostle | soft felt "pomf" pop at 5.12 | y ≈ 1240, below the tote (never over Claude's face) |
| **3 "I WAS IN BED"** | 7.35–9.75 | 220–292 | "anywhere" 7.93 · "bed" 9.25–9.47 | same two-shot, slight push-in | Mika: **offended + sleepy**: half-lidded, pout, eyebrows down; on "bed" she **flops her cheek onto her strap arm** (9.20–9.50). Claude: **smug**, eyes level, one slow blink, tiny nod | — | — | small fabric rustle at the flop | y ≈ 1240 |
| **4a "YOUR BODY THINKS YOU DID"** | 9.75–11.65 | 292–349 | "body" 9.89 · "did" 10.91–11.21 | **wider two-shot**, the split-flap board visible top-centre (board at y ≈ 360–560, still blank / "MON 8:12 · CITY LINE") | Claude: **gentle, happy**, leans forward, little nod on "did". Mika: **sleepy-sceptical**, one eye opening | — | — | — | y ≈ 1200 |
| **4b SOCIAL JETLAG** | 11.65–13.85 | 349–415 | "It's called" 11.77 · "SOCIAL" 12.31 · "JETLAG" 12.87–13.61 | **push up to the board**: the board fills the upper middle (y ≈ 650–1000); Mika's head in the foreground bottom-left (y ≈ 1100–1380) | Mika: eyes go **wide (`shocked`) 13.00–13.90**, then settle. Claude (in the foreground, by her shoulder): **proud** | the board's other rows flicker as it flips | **split-flap flips letter by letter** 11.90–13.30 into **SOCIAL / JETLAG** (2 rows, amber first row) | **loud split-flap clacks** 11.90–13.30 (one per letter, 0.5) | y ≈ 1040, between the board and Mika's head (never over her face; board text is above) |
| **5a BODY CLOCK** | 13.85–18.20 | 415–546 | "weekends" 13.97 · "later" 15.71 · "shifts" 17.19–17.61 | **medium**: Mika left, Claude in the tote, a **hologram clock** (teal/lilac glow, ~0.5 units) floating between them at head height | Claude: **friendly teacher** (`happy`), looks at the clock then at Mika. Mika: **sleepy, nodding along**, head tilts as the hands move | — | on "weekends" the clock's hands **slide forward** 14.0–16.3 (8 → 11) and the clock **yawns** (little face: eyes droop, mouth O) 15.4–16.2; on "shifts" it **settles, tilted and drowsy** | soft hologram hum; a stretched cartoon yawn "mwaah" from the clock (synthesised, 0.5) | y ≈ 1230 |
| **5b ALARM** | 18.20–20.95 | 546–628 | "Then" 18.27 · "alarm" 19.03 · "drags" 19.37 · "back" 20.35–20.67 | same frame, slight push-in | Mika: **flinch**: jumps (squash 0.92 → 1.06), eyes wide, both shoulders up, at **19.05**; back to grumpy by 20.1. Claude: **laughing** (> < eyes) at her jump, then happy | the straps jolt with her jump | a **cartoon alarm clock** pops in beside the holo clock at 18.30 (squash and stretch), **rings** 19.03–19.50 (shaking), then a little arm **yanks the holo clock's hands back** 19.50–20.50 (11 → 8, with a spring overshoot) | **alarm ring** 19.03–19.50 (0.55); rubber-band yank "zip" at 19.50 | y ≈ 1230 |
| **6 THE FLIGHT** | 20.95–26.15 | 628–784 | "flying west" 22.11–22.87 · "flying back" 24.29–24.95 · "Sunday" 25.41 | **medium-wide**: a small **hologram map** (glowing outline coasts, two dots: home, far west) floats between them; Mika right of centre watching | Claude: **storyteller** (`happy`, light tilt). Mika: **tennis match**: her head turns left following the plane (22.1–22.9), then right (24.3–25.0), eyes tracking; slight dizzy wobble at the end (`embarrassed` swirl brows → happy) | — | a **tiny plane** with a **sleeping Mika in its window** (Zz) flies west in an arc 22.10–22.90 (dotted trail), then back east 24.30–25.00 | **plane whoosh** ×2 (0.45) | y ≈ 1250 |
| **7 "HOW DO I FIX IT?"** | 26.15–28.20 | 784–846 | "Okay" 26.15 · "fix it" 27.59–27.99 | **medium close on Mika**, Claude in frame at the tote | Mika: **waking up, eager, a bit desperate** (`anxious` brows + open smile): grabs the tote edge with her left hand and leans in to Claude, eyes fully open. Claude: **proud**, pleased to be asked | — | — | a quick cloth grab | y ≈ 1230 |
| **8a "TWO THINGS"** | 28.20–29.55 | 846–886 | "Two things" 28.20–28.84 | **close on Claude** in the tote (board soft in the background) | Claude: **confident, kind** (`proud`), a little hop up in the tote on "Two". Mika (soft, left edge): attentive | — | the board clears with a quick flutter 29.0–29.5 | short clack flutter (0.4) | y ≈ 1230, below Claude |
| **8b MORNING LIGHT** | 29.55–31.90 | 886–957 | "MORNING LIGHT" 29.72–30.40 | **two-shot with the board** top-centre | Mika: **squints and smiles** as a warm **sunbeam hits her face** on "light" (30.02), eyes close happily (`happy` ^^), shoulders relax. Claude: **happy** | dust sparkles in the beam | board flips to **1 MORNING LIGHT** 29.60–30.40; window sunbeam brightens across her face 30.00–31.80 | clacks (0.5); a soft warm "shimmer" swell on the beam (0.4) | y ≈ 1240 |
| **8c SLEEP IN** | 31.90–34.55 | 957–1036 | "And don't" 32.24 · "SLEEP IN" 32.66–33.10 · "weekends" 33.88 | same, slight push-in | Mika: **nodding along, more awake** (`happy`, eyes open now), two clear nods (32.7, 33.6). Claude: **thinking → happy**, a small wag | — | board flips to **2 SAME-ISH WAKE UP** 32.20–33.10 (row 1 stays as **1 MORNING LIGHT**, so both tips are on the board) | clacks (0.5) | y ≈ 1240 |
| **9 DETERMINATION** | 34.55–37.30 | 1036–1119 | "Fine" 34.55 · "Saturday" 35.77 · "EIGHT" 36.69–36.89 | **low-angle medium close** on Mika, heroic; Claude in the tote | Mika: **heroic, determined** (`proud`, eyebrows down, big grin): chin up on "Fine", **punches the air** with her free (left) arm on "EIGHT" 36.60–36.90. Claude: **claps its front legs** 36.8–37.3 (`laughing`) | the **carriage light brightens** 36.70–37.20 (warm flash, exposure +15 %) | — | punch whoosh at 36.62; little felt claps ×3 | y ≈ 1230 |
| **CARD 1** | 37.30–38.00 | 1119–1140 | — | full-frame retro time card: deep dusk gradient, white Fredoka **SATURDAY / 8:00**, VHS glitch **in** (5 frames) | — | — | `VhsGlitch` + `GlitchShift` on 1119–1124 | tape-glitch zap; music lifts (brighter chord) | **no captions** |
| **10 SATURDAY 8:00** | 38.00–39.80 | 1140–1194 | (no voice) | **wide-medium in the coffee shop**, the new street door frame left, bright sun streaming in; Mika's mark centre | Mika: **bursts in** from frame left (`runPose`) 38.00–38.70, skids to her mark, then **proud**, gives a **thumbs up to camera** 38.85–39.80, sparkly grin. Claude (in the tote): **proud**, wiggle | the door swings and settles; the OPEN sign sways | bright sun rays + dust in the doorway | **door chime** at 38.00 (generic two-tone), morning **birds** outside, café ambience starts | no captions |
| **CARD 2** | 39.80–40.50 | 1194–1215 | — | same card style: **SATURDAY / 9:15** | — | — | glitch in on 1194–1199 | tape-glitch zap | no captions |
| **11 SATURDAY 9:15** | 40.50–46.00 | 1215–1380 | (no voice) | **medium on the booth table**: Mika sitting at the booth facing camera, **cheek down on the table** (face turned to camera, ~y 900–1150), a latte beside her; Claude on the table to her right (from the viewer: left of the right UI column) | **40.50–42.00 — the joke reads:** Mika **fast asleep** (`sleepy`, eyes shut, mouth open, drool-free), a **snore bubble** grows and shrinks from her nose (2 cycles). Claude: watching her, **sad / unimpressed** (level lids). **42.00–42.50 — sigh:** Claude's whole body sinks (squash 0.85) and rises. **42.50–43.00 — pillow off:** a little hop, the neck pillow pops off over its head and lands on the table. **43.00–43.80 — slide:** Claude nudges the pillow under her cheek; Mika snuggles in, **happy sleepy smile**. **43.80–44.00:** Claude looks at camera, **smug**. **44.00 soft freeze** (slight zoom-in settles, light warm vignette) | latte steam curls; the record keeps turning until the freeze | snore bubble (squash and stretch) | **snore** ×2, **sigh** (felt-soft, synthesised breath) at 42.00, pillow "fwump", soft **cup clink** when the table nudges at 43.1, café ambience; music resolves | **End text** 44.00–46.00, see below |
| **END TEXT** | 44.00–46.00 | 1320–1380 | — | over the soft freeze | — | — | clean white pill, **"Send this to your Monday zombie friend"** (2 lines: "Send this to your" / "MONDAY ZOMBIE friend"), **MONDAY ZOMBIE in Mika red #D7263D** (user, step 3: no call to comment), centred at y ≈ 1000, scale-in 6 frames, holds 2.0 s | soft pop on the pill | middle third, clear of her face (her head sits low at y ≈ 1150–1350 in the freeze) |

## Captions
House style (bible §10): Fredoka 700, white rounded pill, **1–3 words**, centred at x ≈ 520, y clamped to 640–1280,
never over a face. **Accent words** in the speaker colour (Mika red `#D7263D`, Claude terracotta `#C9764F`):
**SO TIRED**, **NEW YORK**, **SOCIAL JETLAG**, **MONDAY('S)**, **MORNING LIGHT**, **SLEEP IN**, **EIGHT**.
46 groups in `timeline.json` (each starts on its first word and ends on the next group's start or 0.35 s after its last word;
the shortest is 0.34 s, "it's like"). Mika's groan has no caption. **No captions from 37.30 on** (cards, Saturday shots, end text).
Step 3 will check every caption frame: pill inside y 640–1280 and no overlap with any projected face box.

## Sound
All original. Mixed under the voice (voice at volume 1, SFX at 0.4–0.6).
- **Train ambience** 0.00–37.30: low rail rumble, a rhythmic clack every ~1.1 s, gentle rattle (synthesised noise, 0.35).
- **Music**: a soft original lo-fi city-pop bed (warm Rhodes chords, mellow bass, light brushed beat, ~92 BPM), at about −24 LUFS
  under the voice. It gets a little brighter from CARD 1 (an added chime arpeggio), then resolves on the freeze.
- **One-shots**: head-jerk whoosh 0.62, felt pop 5.12, clacks 11.90–13.30 / 29.0–30.4 / 32.2–33.1, holo hum and clock yawn
  14–16, alarm ring 19.03, yank zip 19.50, plane whoosh 22.1 / 24.3, punch whoosh 36.62, claps 36.8, glitch zaps 37.30 /
  39.80, door chime 38.00, birds 38.0–40.5, café ambience 38.0–46.0, snore ×2 40.6 / 41.4, sigh 42.00, pillow fwump 43.0,
  cup clink 43.1, end pop 44.0.

## New builds (reusable, beside the locked kit; nothing locked is redesigned)
1. `CarriageSet` **`light="morning"`** variant (+ the existing night look as the default): low warm sun key through the left
   windows with moving window-frame shadows, a sun-flicker helper (`sunFlicker(t)`), dust motes in the beams, a pale morning
   city texture. Also a **split-flap board mounted inside the carriage** (reusing `SplitFlap`), optional prop `board`.
2. `ClaudeProp` **`"neckpillow"`**: a soft lilac felt U-pillow round its neck, which can pop off (`pillowOff` 0 → 1) and lie on a surface.
3. **Tote:** Claude's **front legs out** (`claudeLegs="front"`) so it can clap and gesture from the bag.
4. **Mika:** `messy` hair state (locked design, just dishevelled), `handR`/`handL` **"thumb"** (fist + thumb), a **booth
   sitting / head-on-table pose** (`MIKA_TABLE_NAP`).
5. `HoloClock` (with a tiny face that can yawn), `AlarmClock` (cartoon, rings and yanks), `HoloMap` + `TinyPlane` (sleeping
   Mika in the window). These go in `cast/props.tsx` or a new `look/holo.tsx`.
6. `CoffeeShopSet` **`light="morning" | "late"`** + an **entrance door with a glass window and a plain-English OPEN sign**,
   and a **latte** prop (cup + saucer + foam heart).
7. Overlays: `TimeCard` (retro day/time card with the VHS glitch in), `ScreenClock` ("MON 8:12" LCD pill), `SnoreBubble`,
   `EndPill` (two-line pill with an accent word).

## Cut or changed from the brief (and why)
- **The written yawn** before Mika's first line: cut at your request. Her groan on the head-jerk stays.
- **Claude "sliding the pillow under her head"**: Claude has no hands, so it **nudges the pillow with its body** after
  it hops out of it. That's one clean action, not a fake grab.
- **"Mika is asleep face down"**: her **cheek** is on the table, with her face turned to camera, so her sleeping face (and the snore
  bubble) reads on a phone. Fully face down would hide every emotion (rule 1).
- **Board tip 2** reads **2 SAME-ISH WAKE UP** as you wrote it, while Claude says "don't sleep in too much on weekends".
  The caption shows the spoken words, so they differ on purpose.
- **The on-screen clock** is a small overlay (top-left, inside the safe area), not on the board, so the board stays clean
  for SOCIAL JETLAG.
- **Thumbs up**: needs the new thumb hand (build 4). If it doesn't read cleanly at phone size, I'll swap it for a two-fist "yes!"
  and tell you.
