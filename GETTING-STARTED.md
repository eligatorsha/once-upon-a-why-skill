# Getting started: make ONCE UPON A WHY episodes on your own Mac

This guide sets up **exactly** the same studio: the same characters, sets and look, the same three locked voices,
the same models at the same versions, and the same workflow, run by Claude Code with the `/ouaw-episode` skill.
Follow it top to bottom once (about 30–60 minutes, mostly downloads). After that, an episode is one Claude Code
conversation.

## What will be identical, and what varies

| | Same as the original? |
|---|---|
| Characters (Mika, Nora, Claude), 7 sets, props, look, captions, title and time cards | **Identical** (it's all code) |
| Claude's voice (Kokoro `am_echo`, 1.05, +1 semitone, dry) | **Identical** (Kokoro is deterministic) |
| Mika's voice (Chatterbox Turbo built-in voice) | **Same voice**; each take's delivery varies (the skill makes 3 takes and picks the best) |
| Nora's voice (Qwen3-TTS VoiceDesign, designed British voice) | **Same design**; the timbre can drift a little per generation, so compare with the reference sample and regenerate drifted lines (bible §13) |
| Models | **Identical versions**: pinned to exact Hugging Face revisions in `series/onceuponawhy/voice-tests/v2/make_takes.py` |
| Rendering, loudness (−14 LUFS, −1.5 dBTP) | **Identical** (`render.sh`) |

## 0. What you need

- A **Mac with Apple Silicon** (M1 or newer). 8 GB RAM works (one model at a time); 16 GB is comfier.
- About **15 GB free disk** (models ~7 GB, Node modules ~1 GB, renders).
- A **GitHub account** with access to this repo (ask the owner to add you as a collaborator, then accept the email invite).
- A **Claude Code** subscription / login (https://claude.com/claude-code).

## 1. Install the tools

Apple's command line tools (git, compilers):

```bash
xcode-select --install
```

Homebrew (skip if `brew --version` already works):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Node, ffmpeg 7+, Python 3.12 and the GitHub CLI:

```bash
brew install node ffmpeg python@3.12 gh
```

Claude Code:

```bash
npm install -g @anthropic-ai/claude-code
```

Check the versions (Node 20+, ffmpeg 7+, Python 3.12.x):

```bash
node -v && ffmpeg -version | head -1 && python3.12 --version
```

## 2. Get the project

```bash
gh auth login
```

```bash
gh repo clone eligatorsha/once-upon-a-why-skill && cd once-upon-a-why-skill
```

Node packages, exactly as locked in `package-lock.json`:

```bash
npm ci
```

Python environment with the exact versions in `requirements.txt` (MLX, mlx-audio, mlx-whisper, the phonemiser):

```bash
python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

Check that the code compiles:

```bash
npx tsc --noEmit -p .
```

## 3. Download the voices and check them

This downloads the four pinned models (Kokoro, Chatterbox Turbo, Qwen3-TTS VoiceDesign, Whisper small; several GB,
first run only), makes one line per character and writes `out/voice-check.wav`: for each character, the **reference
sample** from the original series, then **your take**.

```bash
.venv/bin/python series/onceuponawhy/tools/voice_check.py
```

Listen to `out/voice-check.wav`. Claude should match closely, and Mika and Nora should clearly be the same people,
though their delivery will differ a little. The script also prints what Whisper heard; each line should be word-perfect.

The models come from Hugging Face under **their own licences**; read the model cards before publishing (see README).

## 4. Check the picture: render the episode 1 cover

```bash
npx remotion still src/index.ts OUAW01Cover out/cover-test.png --gl=angle
```

Open `out/cover-test.png`. You should see Mika asleep on the train strap under the SOCIAL JETLAG board, with the
"WHY SO TIRED ON MONDAYS?" headline. To browse every composition (characters, sets, the episode), open the studio:

```bash
npx remotion studio
```

## 5. Optional: rebuild episode 1 completely

This is the full pipeline once, start to finish (about 1–2 hours on an 8 GB Mac, most of it rendering). Takes are
sampled, so your Mika and Nora deliveries will differ slightly from the original.

```bash
.venv/bin/python episodes/ouaw-01-monday/make_voice.py gen
```

```bash
.venv/bin/python episodes/ouaw-01-monday/make_voice.py pick && .venv/bin/python episodes/ouaw-01-monday/make_voice.py publish
```

```bash
python3 episodes/ouaw-01-monday/make_timeline.py && .venv/bin/python episodes/ouaw-01-monday/make_sfx.py
```

```bash
node episodes/ouaw-01-monday/run_check.mjs
```

```bash
CHUNK=150 REMOTION_ARGS="--gl=angle --concurrency=2" ./render.sh OUAW01Monday ouaw-01-monday
```

The result is `out/ouaw-01-monday.mp4` (1080 × 1920, 46 s, −14 LUFS).

## 6. Make your own episode

1. Open Claude Code **in this folder** (the skill and the house rules in `CLAUDE.md` load from here):

```bash
claude
```

2. Copy `docs/EPISODE-BRIEF-TEMPLATE.md`, fill it in (question, script lines, voice direction, shots), and paste it
   into Claude Code after typing `/ouaw-episode`.
3. Claude works in 4 steps and **stops for your OK after each one**:
   1. **Voices**: 2–3 takes per line, a pronunciation check, `voice/preview.wav` and a settings table. Listen and
      ask for changes ("make Claude quicker on this line", "say 'beed' not 'beeed'", "no pause after 'I slept'").
   2. **Shot list**: `shotlist.md`, anchored to the word timings: camera, emotions, reactions, FX, SFX per shot.
   3. **Half-size draft**: `out/<name>-draft.mp4`, a contact sheet (one frame per second) and the caption check.
   4. **Final + cover**: `out/<name>.mp4` and `out/<name>-cover.png`.
4. When you're happy, ask Claude to commit it.

## Rules the skill follows (so you know what to expect)

- 1080 × 1920, 30 fps, 40–50 s. Always rendered through `./render.sh` (loudness normalised).
- Captions: 1–3 words, rounded white pills in the middle third, accent words in the speaker's colour (Mika red,
  Nora green, Claude terracotta), never over a face, kept out of the bottom 20 % and the right-hand button column.
- Locked characters and sets are never redesigned; new props, lights and sets are added beside them and reused.
- Everyone emotes in every frame; every shot holds at least 1.2 s; anything that doesn't work cleanly is cut and reported.
- All sound is original and generated in code; no copyrighted music, no real brands, no cloned voices.

## Troubleshooting

| Problem | Fix |
|---|---|
| A render hangs or a frame comes out blank | Use the chunked command above (`CHUNK=150 … --gl=angle`); it retries chunks. Close other GPU-heavy apps. |
| Out of memory while making voices | Only one TTS model loads at a time; close other apps. 8 GB is the minimum. |
| A word sounds wrong | Add it to `series/onceuponawhy/pronunciation.json` (Kokoro phonemes and/or a plain respelling), then regenerate the line. |
| Nora sounds slightly different in one line | Regenerate that line and compare with `voice-tests/v2/refs/nora-ref-a.wav` (bible §13). |
| `voice_check.py` fails on the phonemiser | Re-run `.venv/bin/pip install -r requirements.txt` (it installs the English spaCy model `en_core_web_sm`). |
| Fonts look wrong in a still | The fonts load from Google Fonts at render time; check your internet connection and render again. |
