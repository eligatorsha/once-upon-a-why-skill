# ONCE UPON A WHY — series bible (v2, 2026-11-27, AWAITING APPROVAL)

v2 changes (user notes on v1): Claude redesigned (felted orange clay, square eyes, costume props); style renamed **City Pop Dusk** and made international (no Japanese text anywhere); Nora restyled (long sleek hair, softer face, thin glasses in two options, fitted blazer, gold hoop and necklace); apartment window desk, one vending machine, rooftop plants instead of laundry; voice samples.

The single source of truth for the rebranded channel series. Two heroines in their 20s solve real problems (applications, PhD, CV, interviews, work, awkward situations) with the help of Claude. **Reuse the components in `src/series/onceuponawhy/`. Never redesign a locked character or set; add new pieces beside them.**

Global rules from `CLAUDE.md` still apply: 1080 × 1920, 30 fps, 60–90 s, Kokoro voice, mlx-whisper word timings, captions in the middle third, bottom 20 % and right-hand UI column kept clear, every deliverable through `./render.sh`.

> Status: the world (cast, sets, look) is built. **No episode exists yet. Don't render one until the look is approved.**

---

## 1. Files

| Path | What |
|---|---|
| `palette.ts` | locked colours (`PAL`), speaker colours (`SPEAKER_COLOR`) |
| `fonts.ts` | Yellowtail (titles), Fredoka (captions, signage). No Japanese font |
| `look/Stage.tsx` | the stage: three.js canvas + post chain + grain/vignette. `camLerp`, `project` |
| `look/mat.ts` | matte/glow/decal materials, `paint()` facet colouring, canvas textures, easing helpers |
| `look/overlay.tsx` | `CaptionPill`, `TitleCard`, `VhsGlitch` + `GlitchShift`, `FontGate`, `SafeGuide` (review only) |
| `cast/rig.tsx` | shared toy body, `Pose`, `pose()`, `mixPose()`, `runPose()`, `walkPose()`, `breathe()` |
| `cast/face.tsx` | expression system (`EXPRESSIONS`, `FACES`, `FaceFeatures`, `blinkAt`, `SweatDrops`) |
| `cast/poses.ts` | body language per expression (`MIKA_POSES`, `NORA_POSES`), `waveArm`, `NORA_SIT`, `STRAP_R`, `MIKA_ARGUE`, `NORA_CROSSED` |
| `cast/Mika.tsx`, `cast/Nora.tsx`, `cast/Claude.tsx` | the three locked characters (+ `Tote`, `ThimbleMug`) |
| `cast/props.tsx` | phone, cassette player, papers, tabbed notebook, thermos, pen, laptop, bulb |
| `sets/*.tsx` | the 7 sets (+ carriage). Each exports `XSet`, its look (`OFFICE`, …) and `X_MARKS` |
| `sets/common.tsx` | shared set kit: painted skylines, `CityBlocks`, neon, lamps, books, plants, dust, rain, string lights |
| `dev/` | review compositions: `XOuawCharacterSheet`, `XOuawLoc`, `XOuawTitle`, `XOuawClaude`, `XOuawNora`, `OuawTestClip` |
| `series/onceuponawhy/voice-tests/` | voice sample script, takes and the settings table (§13) |

Registered in `src/Root.tsx` through `<OnceUponAWhyCompositions />`.

---

## 2. Look: "City Pop Dusk" (LOCKED)

- **Soft stylised 3D toy world** with a retro 1980s city-pop mood: neon, peach and lilac sunsets, amber lamps, velvet, wood, chrome, cassette-era objects. **The city is international**: any big city at dusk, never a specific country.
- **Materials: matte** (`matte()`, roughness 0.7–0.95, no clearcoat) and **flat-shaded** so rounded shapes show a very slight low-poly faceting. Heads use icosahedron detail 5 (barely faceted), curls and props detail 1–2 (visibly faceted).
- **Glow** (`glow()`) is emissive > 1. Only emissive things bloom.
- **Post chain (`Stage`)**: RenderPass → BokehPass (gentle DOF; aperture 0.0016–0.0022, maxblur ≤ 0.008) → UnrealBloomPass (strength 0.6–0.85, radius 0.6, **threshold 1.2–1.35** so lit cream clothes never bloom) → OutputPass (ACES, exposure ~1.0). Then DOM film grain (0.07) and a soft vignette.
- **Lighting signature times:** golden hour, dusk, late-night neon. Warm key, soft PCF shadows, a cool or lilac fill, practical lamps as glowing bulbs + point lights.

### Palette (`PAL`)
lilac `#B9A3E3` · dusk purple `#4B2E6E` · peach `#FFB894` · warm orange `#FF8A4C` · cream `#FFF1DC` · teal neon `#3FE0D0` · pink neon `#FF6FB5` · amber `#FFB547` · navy `#141A3A` / `#0B0F26`.
Speakers (caption accents): **Mika cherry red `#D7263D`**, **Nora matcha green `#7FA35B`**, **Claude terracotta `#C9764F`** (Claude's body is felt orange `#E8843E`).

### Hard content rules
- Original designs only. No existing creator's characters, mascots or artwork.
- **No real brand names or logos anywhere** (no real convenience-store chains, rail companies, coffee brands, laptop/phone makers). Signs are abstract neon shapes or plain English ("OPEN 24 HOURS", "MENU").
- Claude has no spark, no logo, no glasses.
- **No Japanese (or other non-English) text anywhere**, title cards included. Signs, boards and screens are plain English or abstract shapes.

---

## 3. Cast scale and rig

About 3 heads tall (toy proportions): feet y = 0, hips 0.5, shoulders 0.855, head centre 1.22, head radius 0.29. The character faces +z. Character's LEFT = +x. Animate with `Pose` values (radians) and `mixPose`; add `breathe()` on every held pose. Squash and stretch through `pose.squash` (volume kept).

## 4. Expression system (all three characters)

12 expressions: `neutral, happy, laughing, shocked, panicked, anxious, thinking, smug, sad, proud, embarrassed, sleepy` (`FACES` in `cast/face.tsx`).
Vocabulary: **dot eyes with one white shine**, wide eyes (white + small pupil) for shock and panic, ^ arcs for laughing and proud, half-lidded for smug and sleepy; **separate brow shapes** (inner end up = worried, down = cross); a simple line or open mouth (D, O, wide); blush; sweat drops. Features are flat decals projected onto the head surface. Blinks every ~3 s (`blinkAt`, per-character seed). New expressions must reuse this vocabulary.

---

## 5. The characters (LOCKED — never redesign)

### 5.1 MIKA — the chaotic one · cherry red — `cast/Mika.tsx`
- Brown curly hair (`#6B3A22`): faceted curl balls, loose face-framing curls, a **messy bun top-back with a yellow pencil stuck through it** (pink eraser up). Freckles, big open smile.
- Colour-block windbreaker: **cherry red shoulders, mustard diagonal band, teal hem**; red upper sleeves, mustard forearms, teal cuffs; cream zip line.
- Navy leggings, **pink ribbed leg warmers**, **mismatched sneakers: her LEFT green `#43C27A`, her RIGHT pink `#FF7FB2`**.
- Props: wired headphones round her neck (orange pads) → cable → generic chrome **cassette player** clipped at her right hip; **canvas tote on her left shoulder always spilling papers** (`papers` 0–5); phone with a **cracked screen** (`holdR="phone"`).
- Claude rides in the tote: `claudePop` 0 → 1 (springy), `claudeExpr`, `claudeWave`.
- Body language: fast, bouncy, big gestures, always slightly late, **runs into frame** (`runPose`). Secondary motion via `bounce` (curls) and `swing` (tote, cable).

### 5.2 NORA — the overthinker · matcha green — `cast/Nora.tsx` (v2)
- **Hair:** sleek, straight, glossy black, **past the shoulders**, with **soft curtain bangs** parted in the middle. Her left side is tucked behind the ear. Built as smooth parametric shells (not a helmet): glossy clearcoat, a shine band across the crown, a fine strand bump.
- **Face:** a softer oval head (smooth, narrows towards the chin), **bigger eyes** (`eyeScale` 1.17) with two highlights and **small lashes**, light blush, a **subtle lip colour** `#B9556A`.
- **Glasses — LOCKED 2026-11-27: option A, `"oval"`**: thin gold ovals, gold bridge, faint lenses. This is the default (`glasses="oval"`). Option B `"cateye"` (soft cat-eye, dark tortoise) stays in the code for reference only; never use it in an episode.
- **Outfit:** **fitted cream blazer** (nipped waist, clean squared shoulders, notched lapels, open front) over a **black turtleneck**, slim tapered charcoal trousers, oxblood loafers with a gold bar. **A small gold hoop earring** (on the tucked side) and **a delicate gold necklace** with a tiny disc.
- Same toy proportions as Mika (same rig). Mika is unchanged.
- Props: **notebook bursting with colour-coded tabs** (`holdL="notebook"`), **matcha thermos**, **pen** (`holdR="pen"`, `tap` 0–1), **laptop with too many tabs**.
- Body language: precise, still, effortlessly confident (`bounce` 0.15). **Pushes her glasses up when thinking** (`NORA_POSES.thinking`). Taps her pen when anxious. Sits at her desk with `NORA_CHAIR`.

### 5.3 CLAUDE — the felted clay helper — `cast/Claude.tsx` (v2)
- A **warm orange block** (`#E8843E`, 0.36 × 0.30 × 0.30) of **soft, slightly fuzzy felted clay** with well-rounded edges: smooth shading, a peach sheen at grazing angles, a fine fibre bump and light speckle (`felt()` material).
- **Big square black eyes** with a white shine, a **small dash mouth**, **soft pink blush** on both cheeks.
- **Four chunky rectangular legs** (rounded, a shade deeper). **No glasses, no spark, no logo.**
- **Expressions** (`CLAUDE_FACES`, all 12): from **eye shape** (square = neutral, squashed bar = happy/proud, wide with two shines = shocked/panicked, half-closed and droopy = sleepy, level heavy lids = smug, > < = laughing/embarrassed), **mouth shape** (dash, smile, grin, o, wavy, frown, smirk) and **body tilt and squash**. Blinks.
- **Waves** by lifting a front leg (`wave`). In Mika's tote its legs are hidden and it pops up to the chest (it wiggles side to side instead of waving).
- **Costume prop slot** (`prop`), one small prop per episode, generic shapes only: **built: `"bowtie"`, `"gradcap"`**. Planned: tiny briefcase, reading lamp, a rose (add them to `ClaudeProp`).
- The thimble tea mug stays (`mug`).

---

## 6. Sets (LOCKED). One explainer surface each

Each set file exports `<XSet t explain />` (`explain` 0 → 1 drives the explainer), a `SetLook` (camera, lens, bloom, exposure, background) and `X_MARKS` (where characters stand). All framed for 9:16: keep action within about ±1 unit of centre at the subject, the right edge clear.

| # | Set (file) | Heroine | Mood (recognisable in one frame) | Explainer surface |
|---|---|---|---|---|
| 1 | City office, 26th floor, sunset (`Office.tsx`) | Nora | peach/lilac sunset through a floor-to-ceiling window, mullion shadows, retro red desk lamp, filing cabinets with paper labels, wall clock, plant, city below | **hologram** rising from a puck on the desk (`holo` lines) |
| 2 | Night library (`Library.tsx`) | Nora | navy dark, green-glass banker's lamps, card catalogue, tall shelves, rolling ladder, moonlit window, dust in the light | **catalogue drawers slide out; index cards fly into a tree diagram** (`cards`) |
| 3 | Nora's tiny apartment at night (`Apartment.tsx`) | Nora | rain on the window, pink and teal neon across the street, a **cosy window desk** with a warm mushroom lamp, laptop, books, her tea, a **plaid blanket over her chair** | **tea steam rises and forms a word** (`word`) |
| 4 | Retro coffee shop (`CoffeeShop.tsx`) | Mika | amber pendant globes, wood panels, velvet booth, siphon brewers bubbling, record player turning | **felt menu board: plastic letters rearrange** (`board.from` → `board.to`) |
| 5 | Night train platform + carriage (`Train.tsx`) | Mika | platform: navy night, cool canopy tubes, arriving train's headlight. Carriage: swaying straps, city streaking past | **split-flap board flips into words** (`board`) |
| 6 | 24-hour corner shop, 2 AM (`CornerShop.tsx`) | Mika | empty wet street, cold fluorescent shop glow, **one** drink vending machine, sodium street lamp, wires | **vending machine buttons light up one by one as steps** (`steps`) |
| 7 | City rooftop at sunset (`Rooftop.tsx`) | both (arguments) | golden hour from behind, water tank, **string lights, planter boxes and potted plants**, two old chairs, a train crossing far away (no laundry) | **projection on the billboard across the street** (`board.left/right`) |

Moving details already built in: curls/tote/cable sway, hair sway, blinks, dust motes, steam, rain, flickering neon and tubes, siphon bubbles, spinning record, pendant sway, swaying straps, passing city, AC fan, swaying plants, string-light flicker, passing train, clock hands, grad-cap tassel.

---

## 7. Camera (house style)
Slow cinematic moves only: gentle push-ins (`camLerp` across a shot), soft rack focus (`lens.focus`). Lens ~33–38° vertical FOV at 4.5–5.5 units. No whip pans inside a location.

## 8. Fonts
Titles: Yellowtail. Captions, signage, board letters, split-flap: Fredoka 600/700. No Japanese font. Wrap compositions in `<FontGate>` (canvas textures draw with these fonts).

## 9. Title card (`TitleCard`)
A retro 1980s title: dusk gradient, a striped setting sun, neon grid floor, and **only the English title** in chrome-to-pink Yellowtail script (tilted −6°), its glow tinted in the heroine's colour. No subtitle, no other language. Text sits in the middle third and clear of the right column.

## 10. Captions (`CaptionPill`)
**Clean rounded white pill**, Fredoka 700 at 78 px, **1–3 words**, centred at x ≈ 520, inside the middle third (y 640–1280, clamped). **Accent words take the speaker's colour** (Mika red, Nora green, Claude terracotta). **Never over a face**: place with `project()` on the head and move the pill below the chin or onto the clothes.

## 11. Transitions (`VhsGlitch` + `GlitchShift`)
Between locations only: a **VHS glitch, max 6 frames** (RGB split, tracking band, tear lines, static), with `GlitchShift` tearing the picture sideways on the same frames.

## 12. Safe areas
Bottom 20 % (y ≥ 1536) and the right UI column stay free of faces, captions and explainer text. `SafeGuide` overlays the zones on review stills (never in deliverables).

---

## 13. Voices

**Series exception to `CLAUDE.md` (user, 2026-11-27):** Mika and Nora may use other free local mlx-audio models (no API keys, run on this Mac) so they sound alive and human. Claude stays on Kokoro (`am_echo`, see below). For directed pauses, generate Claude's lines in chunks with timed gaps (chunk speeds around the 1.05 base) instead of slowing the whole line. Never clone a voice from the internet; only built-in or designed voices, or the user's own recordings.

| Character | Status | Voice | Settings |
|---|---|---|---|
| **Claude** | **LOCKED 2026-11-27 (v3 redesign, user pick: take 8)** | Kokoro `am_echo` | speed **1.05**, **+1 semitone with tempo kept** (`asetrate=24000*1.059463,aresample=24000,atempo=0.943874`), `highpass=f=70`, **close and dry: no reverb**. Small, warm, friendly, a little playful, at a natural conversational pace. Test and alternatives: `voice-tests/v3-claude/` (README, `claude-voice-test.wav`, canonical sample `takes/k-am_echo-1.05-p1.wav`) |
| Claude (retired) | superseded 2026-11-27 | Kokoro `am_michael` | 0.92, −1 semitone, soft room. User: too slow, too low and robotic for the character. Don't use it |
| **Mika** | **LOCKED 2026-11-27** | **Chatterbox Turbo** (`mlx-community/chatterbox-turbo-fp16`), built-in voice | defaults (temp 0.8, top_p 0.95, rep. penalty 1.2); human sounds as tags in the text: `[laugh]` `[gasp]` `[sigh]` (also `[chuckle]` `[sniff]` `[groan]` `[cough]` `[clear throat]` `[shush]`); respellings from the dictionary. Reference take: `voice-tests/v2/takes/mika-turbo.wav` |
| **Nora** | **LOCKED 2026-11-27** (reference A on its own) | **Qwen3-TTS VoiceDesign 1.7B** (`mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-bf16`) | `generate_voice_design(language="English", instruct=NORA_DESIGN)`, default sampling; description: *"A young British woman in her early twenties with a crisp, educated southern English accent. Calm, clear and smart, with dry humour and a warm, gentle undertone. Measured pace, a slight smile in her voice."*; respellings (`respell_uk`) from the dictionary. **Canonical sample: `voice-tests/v2/refs/nora-ref-a.wav`** |
| Nora fallback | LOCKED | Kokoro `bf_emma` | speed 0.97, Misaki UK overrides |

> **Consistency rule for Nora:** VoiceDesign can drift slightly in timbre between calls. Generate each episode's Nora
> lines in one session, compare every line with `refs/nora-ref-a.wav`, regenerate any that drift, and always
> Whisper-check (VoiceDesign can run on past the line). If drift becomes a problem, switch to Qwen3-TTS **Base**
> cloning from `refs/nora-ref-a.wav` + its transcript (a designed voice, not a real person).

**Pace guard (every Mika and Nora line):** Chatterbox Turbo and Qwen3 have no speed control and their pace varies per
generation, so use `pace_pick()` in `make_takes.py`: generate 3 candidates, keep the fastest one Whisper confirms
word-perfect, and if it is still under ~2.9 words/s, time-stretch it (pitch kept) by at most 12 %. Respellings that
split a word ("Linked In") slow Turbo down: prefer the plain word when the model already says it right.

Generation: `voice-tests/v2/make_takes.py` holds the exact calls (`synth()`; Nora = the `qwen` branch with `NORA_DESIGN`), pronunciation via `tools/pron.py`, then
level to -16 LUFS and Whisper-check every line (regenerate anything that runs on or drops words).

Expressive-model tests for Mika and Nora: `series/onceuponawhy/voice-tests/v2/` (README there, 2026-11-27).
Working here: **Chatterbox Turbo** (sound tags), **Chatterbox** (exaggeration dial; uses its built-in voice as a local
reference clip), **Qwen3-TTS VoiceDesign 1.7B** (voice from a description; always Whisper-check, it can run on).
Not available: CSM (gated repo, needs a Hugging Face login), Dia (download stalls). Both Chatterbox models have one
built-in American voice, so a British Nora needs Qwen3 VoiceDesign, Kokoro or a recording of the user's own voice.
Level every voice track to -16 LUFS (two-pass loudnorm) before it goes into Remotion.

### Pronunciation (every TTS call)
`series/onceuponawhy/pronunciation.json` is applied automatically by `series/onceuponawhy/tools/pron.py` before every TTS call:
- **Kokoro:** Misaki overrides written into the text, `[PhD](/pˌiːˌAʧdˈiː/)`, US or UK phonemes per speaker (Mika US, Nora UK, Claude US).
- **Models without phoneme control** (Chatterbox, Qwen3-TTS, Dia, CSM): the entry's plain respelling (`respell_us` / `respell_uk`), or the word as written when it's null.
- Add a word whenever one sounds wrong; check it in the pronunciation test wav.

### Review renders (v2)

| File | Composition |
|---|---|
| `out/onceuponawhy/v2/01-character-sheet.png` (2160 × 4560) | `XOuawCharacterSheet` (Mika, Claude, Nora A oval, Nora B cat-eye; Nora's expression row alternates the two glasses) |
| `out/onceuponawhy/v2/loc-{office,apartment,shop,rooftop}.png` | `XOuawLoc` `{ set }` |
| `out/onceuponawhy/v2/title-card-{mika,nora}.png` | `XOuawTitle` `{ title, heroine }` |
| `out/onceuponawhy-test-clip-v2.mp4` (5 s, no audio) | `OuawTestClip` via `REMOTION_ARGS="--gl=angle" ./render.sh OuawTestClip onceuponawhy-test-clip-v2` |

v1 renders (`out/onceuponawhy/0*.png`, `out/onceuponawhy-test-clip.mp4`) show the superseded Claude, Nora and katakana titles.

## 14. Production lessons (from the v1 build)
- **Always render 3D with `--gl=angle`.**
- **Never blur a canvas texture per draw call** (`ctx.filter` inside a loop). It crashed the GPU (context lost, blank frame). Draw the layer sharp to an offscreen canvas and blur it once.
- **Bloom threshold ≥ 1.2.** At 0.9 Nora's cream blazer and pale skin bloomed.
- **Never put a point light inside a character** (the laptop light in the apartment blew out Nora's face). Keep practical lights ≥ 0.3 units from faces, intensity ≤ 0.4 at close range.
- **9:16 is narrow:** at 5 units the frame is only ~2 units wide. Stack depth, not width.
- **Felt needs both a bump and a colour map**: bump alone at 0.6 read as smooth plastic. Bump 3.2 + speckle map + sheen reads as felt.
- **Smooth rounded blocks need analytic normals** (`roundedBlock` sets them), or the box's face seams show as creases.
- **IcosahedronGeometry is always flat-shaded** (non-indexed). For a smooth face use `SphereGeometry`.
- **Claude in the tote:** hide its legs (they dangle out of the bag) and keep Mika's left hand and the caption pill off its face.
- **Mika's left arm covers the tote:** when Claude pops out, hold her left arm out (`armL: { sx: 0.5, sz: 1.2+ }`) or turn her slightly away (yaw ≈ −0.3).
- **Stills: pick `t` so nobody blinks** (`blinkAt`). The location stills use `t0 = 40`.
