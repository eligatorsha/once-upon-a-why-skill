# Claude voice redesign test (v3, 2026-11-27)

Brief: small, cute, warm, friendly, a little playful; calm and confident at a natural pace; a bit higher and lighter;
not a child or a squeak; clearly different from Mika (American female) and Nora (British female). **Close and dry: the
old −1 semitone shift and room reverb are gone** (only a 70 Hz highpass). No cloned voices.

**Listen:** `claude-voice-test.wav` (4 min 18 s). A spoken label ("Take N. …") comes before each take. Each take says the same
three lines: *"Because you just flew in from New York." / "Your body thinks you did. It's called social jetlag." /
"Two things. Get morning light as soon as you wake up. And don't sleep in too much on weekends."*
Single takes: `takes/<id>.wav`. Whisper report: `check.json`. Rebuild: `make_claude_test.py gen` then `mix`.

All 15 takes are **Whisper word-perfect** and levelled to **−16 LUFS**. Pace guard on every line (stretch, pitch kept,
max 12 %, if under 2.9 words/s); only 4 lines needed it.

| Take | Model | Voice | Settings | Pace (w/s, lines 1/2/3) | Pitch (median) | Pitch movement |
|---|---|---|---|---|---|---|
| 1 | Kokoro | `am_puck` | speed 1.00, +1 st | 5.3 / 3.6 / 4.1 | 125 Hz | 3.6 st |
| 2 | Kokoro | `am_puck` | speed 1.05, +1 st | 5.6 / 3.7 / 4.2 | 124 Hz | 3.7 st |
| 3 | Kokoro | `am_puck` | speed 1.05, +2 st | 5.6 / 3.7 / 4.2 | 132 Hz | 3.7 st |
| 4 | Kokoro | `bm_fable` | speed 1.00, +1 st | 4.4 / 3.4 / 4.2 | 132 Hz | 4.3 st |
| 5 | Kokoro | `bm_fable` | speed 1.05, +1 st | 4.5 / 3.5 / 4.4 | 133 Hz | 4.4 st |
| 6 | Kokoro | `bm_fable` | speed 1.05, +2 st | 4.5 / 3.5 / 4.4 | 140 Hz | 4.4 st |
| 7 | Kokoro | `am_echo` | speed 1.00, +1 st | 3.9 / 2.9 / 3.9 | 119 Hz | 3.6 st |
| 8 | Kokoro | `am_echo` | speed 1.05, +1 st | 4.0 / 3.0 / 4.0 | 120 Hz | 3.6 st |
| 9 | Kokoro | `am_echo` | speed 1.05, +2 st | 4.0 / 3.0 / 4.0 | 127 Hz | 3.6 st |
| 10 | Qwen3-TTS VoiceDesign 1.7B | designed (description below) | default sampling, gen 1 | 3.9 / 2.9 / 3.1 | 281 Hz | 4.2 st |
| 11 | Qwen3-TTS VoiceDesign 1.7B | designed | gen 2 (line 2 stretched ×1.12) | 4.1 / 2.5→2.8 / 2.9 | 314 Hz | 3.2 st |
| 12 | Qwen3-TTS VoiceDesign 1.7B | designed | gen 3 | 3.8 / 3.2 / 3.2 | 306 Hz | 3.6 st |
| 13 | Chatterbox Turbo | ref = designed voice of take 10 | `[happy]` `[chuckle]` tags, variant 1 (line 2 ×1.12) | 3.3 / 2.1→2.3 / 3.7 | 282 Hz | 3.7 st |
| 14 | Chatterbox Turbo | ref = designed voice of take 10 | tags variant 2 | 2.9 / 3.4 / 4.0 | 316 Hz | 4.3 st |
| 15 | Chatterbox Turbo | ref = designed voice of take 10 | tags variant 3 | 3.2 / 2.9 / 2.9 | 291 Hz | 3.8 st |

For comparison: old Claude (`am_michael` 0.92, −1 st) 114 Hz, 3.0 st · Mika ≈ 235 Hz · Nora ≈ 293 Hz.
"Pitch movement" = standard deviation of the pitch in semitones (more = livelier). Pitch is measured by a simple autocorrelation tracker, so compare the numbers with each other rather than reading them as exact.

Qwen description (the user's words): *"A small, cute, warm and friendly character voice, gentle and playful, light and smiling, calm confidence, natural conversational pace."*

## Notes
- **Chatterbox Turbo has only one built-in voice: Mika's.** So for takes 13–15 Turbo was steered with a reference clip of
  the designed Qwen voice from take 10 (`designed-ref.wav`). That is a synthetic voice, not a person. The tags
  `[happy]` / `[chuckle]` were placed per variant (see `make_claude_test.py`, `TURBO_LINES`).
- **Qwen and Turbo (takes 10–15) came out in a female or young register** (~280–316 Hz, at or above Mika and close to
  Nora). Listen for whether they sound like a third heroine, or like a child, which the brief rules out.
- **Kokoro takes are consistent across lines** (Kokoro gives the same output for the same input). The Qwen and Turbo voices can drift
  a little between calls, like Nora's (bible §13).
- `am_puck` is quick (5.3–5.6 w/s on line 1). If you like its sound but not its rush, speed 0.95 would bring it to ~4.8.
- By the numbers alone, the **`bm_fable` takes (4–6)** have the most pitch movement of the Kokoro voices and are the
  highest and lightest male option, and a British male voice is still clearly apart from both heroines. That's a lean from the numbers, not from listening; your ear decides.
