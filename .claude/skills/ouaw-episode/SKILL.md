---
name: ouaw-episode
description: Make one ONCE UPON A WHY episode end to end: a 40–50 s vertical 3D cartoon (Mika, Nora and the felted Claude) from a script. Covers locked voices with takes and a pace guard, the pronunciation dictionary, a word-anchored shot list, the build from the locked kit, face-aware captions with an automated check, original SFX and music, a half-size draft with a contact sheet, the final render with render.sh and a cover still. Stops for the user's OK after every step. Use when the user asks to make, voice, build or render a Once Upon a Why episode.
---

# /ouaw-episode — make one ONCE UPON A WHY episode

The worked example is **episode 1**, `episodes/ouaw-01-monday/` + `src/series/onceuponawhy/episodes/ouaw01/`.
Copy its structure for every new episode (`episodes/ouaw-NN-<slug>/`, `src/series/onceuponawhy/episodes/ouawNN/`).

**Before anything:** read `CLAUDE.md` and `series/onceuponawhy/BIBLE.md` (look, cast, sets, voices §13, production
lessons §14). Reuse the locked kit. Build only what is new, make it reusable (an optional prop, a light variant, an
exported component), and never change a locked default look.

**Stop and wait for the user's OK after each of the 4 steps.** If something does not fit or cannot be done cleanly,
cut it and say what you cut.

## Inputs to collect
Title / question, the exact script lines per speaker (fact-checked), target length (default 40–45 s, hard max 50),
locations (sets) and new props, voice direction per line, accent words for captions, end text, cover idea.

## Step 1 — voices (stop)
1. Copy `episodes/ouaw-01-monday/make_voice.py`; replace `LINES_DEF` with the new lines (`say` = exact words).
   - **Mika:** Chatterbox Turbo built-in voice, 3 takes per line as text variants with sound / emotion tags
     (`[sigh] [groan] [laugh] [chuckle] [gasp] [happy] [surprised] [sarcastic] [dramatic]` …). There is no yawn tag;
     written yawns come out as words, so prefer a short groan or a breath SFX.
   - **Claude:** Kokoro `am_echo`, speed 1.05, +1 semitone, dry (`CLAUDE_FX`). Kokoro is deterministic, so "takes"
     are delivery variants: chunks spliced with timed pauses, chunk speeds around 1.05. Never slow a whole line.
   - **Nora:** Qwen3-TTS VoiceDesign with `NORA_DESIGN` (`voice-tests/v2/make_takes.py`); always Whisper-check.
2. Pronunciation: run new words through `tools/pron.py`; add Misaki phonemes / respellings to `pronunciation.json`;
   prove it with a `pron_check.py`-style wav (both voices, Whisper-checked).
3. `make_voice.py gen` then `pick`: Whisper word-perfect, the most alive take (pitch movement), pace guard (max 12 %
   stretch, pitch kept), levelled to −16 LUFS. Post-fixes live in `LINES_DEF` (`stretch_word`, `close_gap`, `prefer`).
4. Deliver `voice/preview.wav` and `voice/SETTINGS.md` (exact text, tags, speeds, pace, Whisper result per line).

## Step 2 — shot list (stop)
1. `make_timeline.py`: set line starts (gaps 0.15–0.25 s after the last word, reactions overlap) and 1–3-word caption
   groups (accent words in CAPS). It writes `timeline.json` and the TS module the composition imports, and asserts every
   caption group matches the Whisper words.
2. Write `shotlist.md`: per shot frames, anchor words, camera, emotions (speaker AND listener, always readable in half a
   second), background reactions, FX, SFX, caption placement. Every shot ≥ 1.2 s, one clear idea, every action with a
   clear start and end, nothing important half out of frame. List the new reusable builds and anything cut.

## Step 3 — build + half-size draft (stop)
1. Build the new pieces beside the locked kit (optional props / variants), then `scene.ts` (pure logic: shots, cameras,
   performances, `facesAt`, caption placement) and the composition (stage per shot, overlays, `Sound`). Register it in
   `src/series/onceuponawhy/Compositions.tsx`.
2. Sound: copy and edit `make_sfx.py` (all procedural, original; music bed low under the voice).
   Voice copies for Remotion: `make_voice.py publish` (peak-limited so the delivery holds −1.5 dBTP).
3. **Framing rule that makes captions fit:** Mika's face high, Claude's face mid-frame, caption below both; check with
   the face circles (`debugFaces` prop) and `node episodes/<ep>/run_check.mjs` until it reports **0 problems**
   (middle third, right UI column, no face overlap on any frame). Long 3-word captions drop to 68 px automatically.
4. Iterate with quick half-size stills (`npx remotion still <bundle> <Id> f.png --frame=N --gl=angle --scale=0.5
   --props='{"debugFaces":true}'`) before rendering.
5. Draft: `CHUNK=150 REMOTION_ARGS="--scale=0.5 --gl=angle --concurrency=2" ./render.sh <Id> <name>-draft`, then a
   contact sheet (`ffmpeg -i out/<name>-draft.mp4 -vf "fps=1,scale=270:480,tile=8x6" -frames:v 1 contact_sheet.jpg`)
   and a check sheet of debug stills. Report loudness and true peak.

## Step 4 — final + cover (stop)
`CHUNK=150 REMOTION_ARGS="--gl=angle --concurrency=2" ./render.sh <Id> <name>` → verify 1080×1920, 30 fps, length,
−14 LUFS, true peak ≤ −1.5 dBTP. Cover: a `Still` composition (1080 × 1920) with the brief's moment, an optional big
headline at the top (inside the 3:4 grid crop, clear of the right column), rendered with `npx remotion still … --gl=angle`.

## Lessons from episode 1
- Claude rides in the tote at about Mika's hip height: hold her left arm back (`ARM_CLEAR`) and lift Claude (`lift`).
- Two-shots need a level camera aimed at y ≈ 0.79 at ~2.9 units (fov 34) to leave room for a caption under both faces.
- A board / hologram shot needs the camera pitched so the board is high, faces in the middle, caption between or below.
- Mouths flap from the word timings (`talk()`); whiny lines use a wide mouth with teeth.
- 8 GB Macs: load one TTS model at a time; render one 3D job at a time.
