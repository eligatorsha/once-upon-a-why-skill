# OUAW 01 "Why am I so tired on Mondays?" — voice settings (step 1)

Preview: `voice/preview.wav` (39.1 s, all lines in script order with 0.28 s gaps, -16.0 LUFS).
Picked lines: `voice/lines/<id>.wav` (-16 LUFS, 48 kHz mono). All takes: `voice/takes/`. Whisper report: `voice/check.json`.
Word timings from the picked lines: `voice/words.json`. Rebuild: `make_voice.py gen` then `make_voice.py pick`.

**Locked voices.** Mika = Chatterbox Turbo, built-in voice, defaults (temp 0.8, top_p 0.95, rep. penalty 1.2), sound and emotion tags in the text.
Claude = **Kokoro `am_echo`, speed 1.05, +1 semitone (tempo kept), highpass 70 Hz, close and dry**: the v3 redesign, user pick 2026-11-27 (take 8 of `series/onceuponawhy/voice-tests/v3-claude/`). The old `am_michael` 0.92 / −1 st / room voice is retired. Base speed 1.05; chunks vary per line (below).

| # | Line | Who | Picked | Exact TTS text / chunks | Pace | Whisper |
|---|---|---|---|---|---|---|
| — | (yawn before line 1) | Mika | **dropped** (user: too many "ah"s at the start) | — | — | m1 keeps its own single `[groan]` |
| m1 | I slept, like, twelve hours this weekend. Why am I SO tired? | Mika | take 1 of 3 | `[groan] I slept, like... twelve hours this weekend. Why am I sooo tired?!` | 2.39 → 2.6 w/s (pace guard ×1.088) | word-perfect |
| c1 | Because you just flew in from New York. | Claude | take 1 of 3 | `Because you just flew in from New York.` **@1.12, one chunk, no pause** (user: quicker) | 4.06 w/s | word-perfect |
| m2 | I didn't go anywhere. I was in bed. | Mika | take 3 of 3 | `[sarcastic] I didn't go anywhere. I was in bed.` then **only the vowel of "bed" stretched ×1.5 (0.26 → 0.39 s), pitch kept**: a slightly long "beed" (user: "beed", not "beeeed"). Respellings like "beeeeed" made Turbo say "B" / "BEE'd", so they were dropped | 3.56 w/s before the stretch, no pace stretch | word-perfect after the stretch |
| c2 | Your body thinks you did. It's called social jetlag. | Claude | take 3 of 3 | `Your body thinks you did.` @1.05 · 0.42 s · `It's called social jetlag.` **@0.97** | 2.22 w/s incl. the pause (slower reveal; one chunk, so no splice inside "It's called social jetlag") | word-perfect ("jet lag") |
| c3 | On weekends you sleep … body clock shifts. Then Monday's alarm drags it right back. | Claude | take 2 of 3 | sentence 1 @1.08 · **0.45 s pause after "shifts"** · `Then Monday's alarm drags it right back!` @1.08 | 3.01 w/s | word-perfect |
| c4 | Scientists say it's like flying west every Friday and flying back every Sunday. | Claude | take 2 of 3 | `…every Friday,` @1.06 · 0.18 s · `and flying back every Sunday.` @1.06 | 2.55 w/s | word-perfect |
| m3 | Okay, okay. How do I fix it? | Mika | take 3 of 3 | `[happy] Okay, okay. How do I fix it?!` | 3.71 w/s (fast, eager) | word-perfect |
| c5 | Two things. Get morning light … And don't sleep in too much on weekends. | Claude | take 2 of 3 | `Two things.` @1.03 · 0.42 s · `Get morning light, as soon as you wake up.` @1.07 · **0.55 s** · `And don't sleep in…` @1.07 | 3.00 w/s | word-perfect |
| m4 | Fine. This Saturday, I'm up at eight. | Mika | take 3 of 3 | `Fine. [dramatic] This Saturday, I'm up at EIGHT!` | 2.44 → 2.73 w/s (pace guard ×1.12, the cap) | word-perfect |

**How takes were picked.** Mika: only word-perfect takes with no extra words (Whisper; tag sounds like "ugh" allowed), then the one with the most pitch movement (pitch SD + range in semitones; for m3 the faster take also scores, since the line is "faster, brighter"). Pace guard per line, max 12 % stretch with pitch kept: m1 target 2.6 w/s and m2 left slow (sleepy lines), m3 3.3, m4 2.9.
Claude: Kokoro gives the same output for the same input, so its 3 takes are delivery variants (one sentence vs. chunks spliced with timed pauses, chunk speeds). Take 2 (chunked) wins in c1, c3, c4 and c5 because it lands the directed pauses ("…flew in, | from New York", "shifts. | Then", "Two things. | … | And"). In c2, take 3 wins: it keeps "It's called social jetlag" in one chunk, so it sounds less spliced and less slow. Chunk speeds were rescaled from the old 0.92 base to 1.05 (×1.141), so the pauses and slow spots stay where they were.

**Takes not used and why.** m3 take 2 originally said "Okay, okay, okay" (extra word): rewritten and regenerated. Yawn takes 1–5: Whisper heard words in them (Turbo has no yawn tag, so written yawns come out as grunts or words).

## Pronunciation check (`voice/pron-check.wav`, `voice/pron-check.json`)
Mika then Claude, each saying: *It's called social jetlag. / Every Monday after the weekend. / Twelve hours in bed. / I flew in from New York. / See you on Saturday.* All 10 sentences Whisper-perfect.

| Word | Result | Dictionary |
|---|---|---|
| jetlag | Misaki had **no entry** for the one-word spelling (Kokoro would guess) | **added**: Kokoro `ʤˈɛtlˌæɡ` (JET-lag), respelling `jet lag` |
| social | sˈOʃᵊl, correct | none needed |
| Saturday | sˈæTəɹdˌA, correct | none needed |
| Monday / Monday's | mˈʌndˌA(z), correct | none needed |
| weekend(s) | wˈikˌɛndz, correct | none needed |
| New York | nˈu jˈɔɹk, correct | none needed |
| twelve | twˈɛlv, correct | none needed |

## Things to listen for
1. **The yawn** is gone from the voice track. If the hook still needs one, it would be a quiet original breath SFX under her first blink, not a voice take.
2. **Claude's sigh and Mika's snore** (ending) will be SFX, not Kokoro (it can't sigh).
3. **Runtime budget.** With the faster, dry Claude, the quicker New York line and no yawn: speech + gaps ≈ 39.1 s, plus the Saturday cards and shots (~6 s) and the 2 s end text ≈ 47 s. Plan for the edit: tighter gaps between lines (0.1–0.2 s, with reactions overlapping), and the end text over the soft freeze instead of after it. That should land at about 44–46 s. If it still runs long, I'd shorten the 9:15 sleeping shot first, then cut a line and tell you which.
