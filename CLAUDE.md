# once-upon-a-why-skill

This project makes short vertical 3D cartoon episodes with code, English voices and captions (Reels / TikTok / Shorts).

## Video rules (always)

- **Dimensions:** **1080 × 1920** (9:16), **30 fps**.
- **Length:** 40–50 s per episode unless the brief says otherwise.
- **Voices:** generated locally with mlx-audio (no API keys). Claude = Kokoro; Mika and Nora = expressive local models (see `series/onceuponawhy/BIBLE.md` §13).
- **Captions:** 1 to 3 words at a time, in the **middle third** (y ≈ 640–1280 px), never over a face. Word timings come from **mlx-whisper**.

## Safe areas

- Keep the **bottom 20%** (y ≥ 1536 px) and the **right-hand UI column** free of faces, captions and key text.

## Output

- Renders go to `out/`.
- **Always render with `./render.sh <CompositionId> [name]`**: it renders, then runs two-pass loudnorm (−14 LUFS, −1.5 dBTP, LRA 11, 48 kHz AAC) and trims audio to the video length.
- Heavy 3D: `CHUNK=150 REMOTION_ARGS="--gl=angle --concurrency=2" ./render.sh <Id> [name]`.

## Audio levels at the source

- Level every voice line to about **−16 LUFS** before Remotion. Voice at `volume={1}`, SFX at 0.35–0.6.

## Series: ONCE UPON A WHY

- **Read `series/onceuponawhy/BIBLE.md` first** and reuse `src/series/onceuponawhy/`. Never redesign a locked character or set; add new pieces beside them.
- Apply `series/onceuponawhy/pronunciation.json` (via `series/onceuponawhy/tools/pron.py`) before every TTS call.
- To make an episode, use the skill **`/ouaw-episode`** (`.claude/skills/ouaw-episode/SKILL.md`).
