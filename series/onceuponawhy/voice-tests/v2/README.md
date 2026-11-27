# Once Upon a Why — expressive voice tests for Mika and Nora (v2, 2026-11-27)

**Chosen by the user:** Mika = take 4 `mika-turbo` (Chatterbox Turbo). Nora = **reference A on its own** (`refs/nora-ref-a.wav`, Qwen3 VoiceDesign, crisp southern English), chosen after the British reference test below. Locked in BIBLE.md §13.

**Listen:** `voice-takes.wav` (11 takes, ~3 min, each after a short spoken label) and `pronunciation-test.wav` (~3.6 min).
Single takes: `takes/<id>.wav`. Whisper results: `check.json`, `pronunciation-test.json`.
Scripts: `make_takes.py` (gen / mix), `pron_test.py`. All local mlx-audio, no API keys, no cloned voices.

Every take: the pronunciation dictionary applied first, levelled to **-16 LUFS** (two-pass loudnorm + gain/limiter
correction, 48 kHz mono), then **mlx-whisper (small) confirmed every word** in all 11 takes ("three to four" is written
"3-4" by Whisper).

## Models on this Mac

| Model | Status | Notes |
|---|---|---|
| **Chatterbox Turbo** (`mlx-community/chatterbox-turbo-fp16`) | ✅ works | one built-in voice (American, female); sound tags `[laugh] [chuckle] [sigh] [gasp] [sniff] [groan] [cough] [clear throat] [shush]` |
| **Chatterbox** (`mlx-community/Chatterbox-TTS-fp16`) | ✅ works | emotion **exaggeration** dial. The MLX port can't read the official built-in voice file (it produced gibberish), so it uses a 10 s clip of the same built-in voice, rendered locally by Turbo (`chatterbox-builtin-ref.wav`), as its reference |
| **Qwen3-TTS VoiceDesign 1.7B** (`mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-bf16`) | ✅ works | voice designed from a written description, any accent. Occasionally runs on past the line into nonsense: always Whisper-check and regenerate (the scripts do) |
| **CSM 1B** (`mlx-community/csm-1b`) | ❌ blocked | its built-in voices live in the gated `sesame/csm-1b` repo: needs a Hugging Face login + licence acceptance |
| **Dia 1.6B** (`mlx-community/Dia-1.6B`) | ❌ download stalls | twice the weights never started downloading (49 min, 0 bytes), also with Xet disabled |

## Takes in `voice-takes.wav` (in order)

| # | Take | Model | Voice / description | Settings | Loudness |
|---|---|---|---|---|---|
| 1 | mika-chatterbox-03 | Chatterbox | built-in voice | exaggeration 0.3, cfg 0.5, temp 0.8 | -16.1 |
| 2 | mika-chatterbox-06 | Chatterbox | built-in voice | exaggeration 0.6, cfg 0.4, temp 0.8 | -16.1 |
| 3 | mika-chatterbox-09 | Chatterbox | built-in voice | exaggeration 0.9, cfg 0.3, temp 0.85 | -15.9 |
| 4 | mika-turbo | Chatterbox Turbo | built-in voice | tags `[sigh]` `[gasp]` `[laugh]` | -16.0 |
| 5 | mika-qwen-design-1 | Qwen3 VoiceDesign | "A young American woman in her early twenties. Bright, fast and excited, a little chaotic and giggly, with lots of pitch movement, slightly breathless, and she laughs easily. Natural, casual, very expressive." | default sampling | -16.0 |
| 6 | mika-qwen-design-2 | Qwen3 VoiceDesign | "A bubbly, energetic young American woman, about twenty-two, speaking quickly with big swings in pitch, half-laughing as she talks, panicky but playful. Warm, human and spontaneous, not a narrator." | default sampling | -15.9 |
| 7 | nora-kokoro-emma | Kokoro (locked fallback) | `bf_emma` | speed 0.97, Misaki overrides (UK) | -16.1 |
| 8 | nora-chatterbox-03 | Chatterbox | built-in voice (American) | exaggeration 0.3, cfg 0.5 | -16.2 |
| 9 | nora-turbo | Chatterbox Turbo | built-in voice (American) | tags `[sigh]` `[chuckle]` | -16.2 |
| 10 | nora-qwen-design-1 | Qwen3 VoiceDesign | "A young British woman in her early twenties with a crisp, educated southern English accent. Calm, clear and smart, with dry humour and a warm, gentle undertone. Measured pace, a slight smile in her voice." | default sampling | -16.1 |
| 11 | nora-qwen-design-2 | Qwen3 VoiceDesign | "A composed young Englishwoman, about twenty-three, London accent, articulate and quietly witty, understated and deadpan but kind. Natural conversational delivery, not a newsreader." | default sampling | -16.1 |

Combined file: -16.1 LUFS. Note: both Chatterbox models have **one built-in American voice**, so for Nora they can't
give a British accent without a reference recording; only Qwen3 VoiceDesign (and Kokoro) can.

### Lines as spoken (written the way people talk)
- Mika: "Okay, okay, okay... The deadline is in three hours, and I have, like... zero words. Claude, help!" /
  "Wait. They actually replied?! Oh my god. Oh my god, what do I say?!" (Turbo adds `[sigh]`, `[gasp]`, `[laugh]`)
- Nora: "I've read forty-seven articles about this. I'm still not sure. Is that... normal?" /
  "Right. So a PhD is basically three to four years of being paid to be obsessed with one question." (Turbo adds `[sigh]`, `[chuckle]`)

## Pronunciation test (`pronunciation-test.wav`, v2)
Re-rendered 2026-11-27 with the **locked voices**, 0.3 s gaps (~2.3 min): Mika (Chatterbox Turbo), Nora (Qwen3
VoiceDesign ref A), Claude (Kokoro am_michael 0.92, −1 st, soft room). Each says all 22 dictionary words in a short
sentence. After the user's notes: Claude = one long "Clawd" (US `klˈɔːd`), Kokoro = "Cocoro", even syllables.
Whisper heard every word (spelling differences only). **Whisper checks words, not stress: listen for stress.**

## Optional cloning
See `RECORDING-SCRIPT.md` (scripts for Mika and Nora, recording tips, which model to use).

## Nora with British reference voices (2026-11-27)

`nora-british.wav` (~1.8 min, labelled): the current lock, then for each reference the Chatterbox take
(exaggeration 0.3, cfg 0.5, temp 0.8) followed by the reference clip on its own. Script: `nora_refs.py`.

| Take | Reference clip (`refs/`) | Loudness | Whisper |
|---|---|---|---|
| nora-chatterbox-03 (current lock) | Chatterbox built-in voice (American, same as Mika) | -16.2 | all words |
| nora-cb03-ref-a | **A** Qwen3 VoiceDesign: crisp, educated southern English, calm, dry, warm | -16.1 | all words |
| nora-cb03-ref-b | **B** Qwen3 VoiceDesign: London, articulate, deadpan, quietly witty | -16.2 | all words |
| nora-cb03-ref-c | **C** Kokoro `bf_emma` (the locked fallback) | -16.2 | all words |

All references are designed or built-in voices (no real person). The reference passage: "Right, so here's the plan.
I've written everything down, in order, with the deadlines next to each step. It's honestly not as bad as it looks.
We just take it one bit at a time."
