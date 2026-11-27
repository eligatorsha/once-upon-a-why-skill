"""Once Upon a Why, episode 1 "Why am I so tired on Mondays?" — voice takes (bible §13).

    .venv/bin/python episodes/ouaw-01-monday/make_voice.py gen [line ...]   # raw takes (resumable; pass ids to redo)
    .venv/bin/python episodes/ouaw-01-monday/make_voice.py pick             # check, pick, level, preview, word timings

Locked voices: Mika = Chatterbox Turbo built-in voice (sound/emotion tags, pace guard), Claude = Kokoro am_echo 1.05
+1 semitone, close and dry (v3 redesign). Every line goes through the pronunciation dictionary (tools/pron.py).
Mika: 3 takes per line (tag variants), Whisper-checked, the most alive word-perfect take wins (pitch movement), then the
pace guard nudges it to the line's target pace (max 12 % stretch, pitch kept). Claude: Kokoro is deterministic, so its
takes are delivery variants (one sentence vs. chunks spliced with timed pauses, chunk speeds).
Outputs in voice/: takes/<id>-<k>.wav, lines/<id>.wav (-16 LUFS, 48 kHz mono), preview.wav, check.json, words.json.
"""
import json, os, re, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../.."))
sys.path.insert(0, os.path.join(ROOT, "series/onceuponawhy/voice-tests/v2"))
import make_takes as mt  # noqa: E402  (synth, trim, level, lufs, write_wav, REPOS)

V = os.path.join(HERE, "voice")
RAW, TAKES, LINES = (os.path.join(V, d) for d in ("raw", "takes", "lines"))
# LOCKED 2026-11-27 (user pick, v3 take 8): Kokoro am_echo, speed 1.05, +1 semitone with tempo kept, close and dry
CLAUDE_VOICE = "am_echo"
CLAUDE_FX = "asetrate=24000*1.059463,aresample=24000,atempo=0.943874,highpass=f=70"

# The script, exact words. "say" = caption/check words. Mika takes: Turbo text variants (tags = human sounds/emotion).
# Claude takes: list of (text, speed, gap_after_s) chunks spliced before the voice chain. "pace" = Mika's target words/s.
LINES_DEF = [
    # user (step 3 review): no break between "I slept" and "like" -> the silence there is cut down to 0.06 s
    dict(id="m1", who="mika", say="I slept, like, twelve hours this weekend. Why am I SO tired?", pace=2.6, close_gap=("slept", "like", 0.06),
         yawn=False,  # user: too many "ah"s at the start; the written yawn is dropped, m1's own [groan] stays
         takes=["[groan] I slept, like... twelve hours this weekend. Why am I sooo tired?!",
                "[sigh] I slept, like, twelve hours this weekend. [groan] Why am I SO tired?",
                "I slept, like... twelve hours, this weekend. Why am I sooo tired?! [groan]"]),
    dict(id="c1", who="claude", say="Because you just flew in from New York.",
         prefer=1,  # user: say it quicker (no pause before "from New York")
         takes=[[("Because you just flew in from New York.", 1.12, 0)],
                [("Because you just flew in from New York.", 1.18, 0)],
                [("Because you just flew in,", 1.15, 0.08), ("from New York.", 1.12, 0)]]),
    # user: "bed" must clearly be a long whiny "beeed". Spelling it "beeeeed" makes Turbo say "B" / "BEE'd", so Turbo
    # says a clean "bed" and the vowel alone is stretched afterwards (stretch_word). No pace stretch: sleepy line.
    dict(id="m2", who="mika", say="I didn't go anywhere. I was in bed.", pace=0, stretch_word=("bed", 1.5),
         takes=["[sigh] I didn't go anywhere. I was in bed.",
                "[groan] I didn't go anywhere. I was in bed.",
                "[sarcastic] I didn't go anywhere. I was in bed."]),
    dict(id="c2", who="claude", say="Your body thinks you did. It's called social jetlag.", prefer=3,
         takes=[[("Your body thinks you did. It's called social jetlag.", 1.05, 0)],
                [("Your body thinks you did.", 1.05, 0.38), ("It's called", 1.05, 0.10), ("social jetlag.", 0.94, 0)],
                [("Your body thinks you did.", 1.05, 0.42), ("It's called social jetlag.", 0.97, 0)]]),
    dict(id="c3", who="claude", say="On weekends you sleep and wake up hours later, so your body clock shifts. Then Monday's alarm drags it right back.",
         takes=[[("On weekends you sleep and wake up hours later, so your body clock shifts.", 1.05, 0.42), ("Then Monday's alarm drags it right back.", 1.05, 0)],
                [("On weekends you sleep and wake up hours later, so your body clock shifts.", 1.08, 0.45), ("Then Monday's alarm drags it right back!", 1.08, 0)],
                [("On weekends,", 1.05, 0.08), ("you sleep and wake up hours later, so your body clock shifts.", 1.07, 0.45), ("Then Monday's alarm drags it right back.", 1.05, 0)]]),
    dict(id="c4", who="claude", say="Scientists say it's like flying west every Friday and flying back every Sunday.",
         takes=[[("Scientists say it's like flying west every Friday, and flying back every Sunday.", 1.05, 0)],
                [("Scientists say it's like flying west every Friday,", 1.06, 0.18), ("and flying back every Sunday.", 1.06, 0)],
                [("Scientists say... it's like flying west every Friday, and flying back every Sunday.", 1.08, 0)]]),
    dict(id="m3", who="mika", say="Okay, okay. How do I fix it?", pace=3.3, w_pace=0.6,
         takes=["[surprised] Okay, okay! How do I fix it?!",
                "Okay... okay! How do I fix it?!",
                "[happy] Okay, okay. How do I fix it?!"]),
    dict(id="c5", who="claude", say="Two things. Get morning light as soon as you wake up. And don't sleep in too much on weekends.",
         takes=[[("Two things.", 1.05, 0.40), ("Get morning light as soon as you wake up.", 1.05, 0.50), ("And don't sleep in too much on weekends.", 1.05, 0)],
                [("Two things.", 1.03, 0.42), ("Get morning light, as soon as you wake up.", 1.07, 0.55), ("And don't sleep in too much on weekends.", 1.07, 0)],
                [("Two things!", 1.05, 0.38), ("Get morning light as soon as you wake up.", 1.08, 0.48), ("And don't sleep in too much, on weekends.", 1.06, 0)]]),
    dict(id="m4", who="mika", say="Fine. This Saturday, I'm up at eight.", pace=2.9,
         takes=["[dramatic] Fine. This Saturday... I'm up at eight!",
                "[happy] Fine! This Saturday, I'm up at eight!",
                "Fine. [dramatic] This Saturday, I'm up at EIGHT!"]),
]
# a yawn has no Turbo tag: written yawns, kept only if Whisper hears no real words (sounds only) and it lasts 0.7-2.6 s
YAWNS = ["Haaaaaaaawhhh... mmm.", "Hhhaaaahhhh-mmmh.", "[sigh] Aaaaaahhhhh... mmh.",
         "[groan] Hhuaaaaaahh... mm.", "[sigh] Hwaaaaaaah.", "Aaaaaaahhh-hmm... [sigh]"]
YAWN_KEEP = 1.5  # s
GAP_BETWEEN = 0.28  # preview only; the edit sets real gaps in the shot list


def norm(s):
    s = re.sub(r"\[[^\]]*\]", " ", s.lower()).replace("’", "'")
    s = re.sub(r"(.)\1{2,}", r"\1", s)  # sooo -> so, beeed -> bed
    s = s.replace("jet lag", "jetlag").replace("jet-lag", "jetlag")
    s = re.sub(r"\b12\b", "twelve", s)
    s = re.sub(r"\b8(:00)?\b", "eight", s)
    return re.findall(r"[a-z]+", s.replace("'", ""))  # Mondays == Monday's


SOUNDS = {"ugh", "uh", "ah", "oh", "hm", "hmm", "mm", "huh", "ha"}  # tags Whisper writes out; not extra words


def read_wav(p):
    with wave.open(p) as w:
        sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32767
    return a, sr


def f0_track(a, sr):
    """Simple autocorrelation pitch (80-420 Hz). Returns voiced f0 values."""
    fl, hop = int(0.04 * sr), int(0.01 * sr)
    lo, hi = int(sr / 420), int(sr / 80)
    out = []
    gate = 0.25 * np.sqrt(np.mean(a**2) + 1e-12)
    for i in range(0, len(a) - fl, hop):
        x = a[i : i + fl]
        if np.sqrt(np.mean(x**2)) < gate:
            continue
        x = x - x.mean()
        c = np.correlate(x, x, "full")[fl - 1 :]
        if c[0] <= 0:
            continue
        c = c / c[0]
        k = lo + int(np.argmax(c[lo:hi]))
        if c[k] > 0.45:
            out.append(sr / k)
    return np.array(out)


def aliveness(a, sr):
    f = f0_track(a, sr)
    if len(f) < 10:
        return 0.0, 0.0
    st = 12 * np.log2(f / np.median(f))
    st = st[np.abs(st) < 12]
    return float(np.std(st)), float(np.percentile(st, 95) - np.percentile(st, 5))


def whisper(p, words=False):
    import mlx_whisper

    return mlx_whisper.transcribe(p, path_or_hf_repo=mt.whisper_path(), language="en", word_timestamps=words)


def prep(text, who):
    return mt.apply(text, "kokoro" if who == "claude" else "respell", "us")


def gen(only):
    from mlx_audio.tts.utils import load_model
    import gc

    os.makedirs(RAW, exist_ok=True)
    todo = [L for L in LINES_DEF if not only or L["id"] in only or (L.get("yawn") and "yawn" in only)]
    for model, who in (("turbo", "mika"), ("kokoro", "claude")):
        lines = [L for L in todo if L["who"] == who]
        if not lines:
            continue
        m = mt.load_pinned(model)
        sr = m.sample_rate
        for L in lines:
            for k, t in enumerate(L["takes"]):
                if only and L["id"] not in only:
                    break
                p = os.path.join(RAW, f"{L['id']}-{k + 1}.wav")
                if os.path.exists(p) and not only:
                    continue
                if who == "mika":
                    a = mt.trim(mt.synth(m, "turbo", prep(t, who), {}), sr)
                else:
                    parts = []
                    for text, speed, gap in t:
                        parts += [mt.trim(mt.synth(m, "kokoro", prep(text, who), dict(voice=CLAUDE_VOICE, speed=speed)), sr, pad=0.03), np.zeros(int(gap * sr), np.float32)]
                    a = np.concatenate(parts + [np.zeros(int(0.05 * sr), np.float32)])  # dry: no reverb tail to keep
                mt.write_wav(p, a, sr)
                print(f"OK {L['id']}-{k + 1} {len(a) / sr:.2f}s", flush=True)
            if L.get("yawn"):
                for k, t in enumerate(YAWNS):
                    p = os.path.join(RAW, f"yawn-{k + 1}.wav")
                    if os.path.exists(p) and "yawn" not in only:
                        continue
                    mt.write_wav(p, mt.trim(mt.synth(m, "turbo", t, {}), sr), sr)
                    print(f"OK yawn-{k + 1}", flush=True)
        del m
        gc.collect()


def fx_claude(src, dst):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", CLAUDE_FX, dst], check=True)


def stretch(src, dst, f):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", f"atempo={f:.4f}", dst], check=True)


def stretch_vowel(src, dst, word, factor):
    """Lengthen the vowel of `word` (its middle, between the onset and the final stop) by `factor`, pitch kept."""
    a, sr = read_wav(src)
    ws = [w for seg in whisper(src, words=True)["segments"] for w in seg["words"]]
    hit = [w for w in ws if norm(w["word"]) == [word]][-1]
    end = np.where(np.abs(a) > 0.006)[0][-1] / sr
    v0, v1 = hit["start"] + 0.07, end - 0.07  # skip the consonants: b... d
    i0, i1 = int(v0 * sr), int(v1 * sr)
    tmp = dst + ".v.wav"
    mt.write_wav(tmp, a[i0:i1], sr)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"atempo={factor ** -0.5:.4f},atempo={factor ** -0.5:.4f}", tmp + ".s.wav"], check=True)
    v, _ = read_wav(tmp + ".s.wav")
    os.remove(tmp)
    os.remove(tmp + ".s.wav")
    x = int(0.012 * sr)  # 12 ms crossfades at both joins
    ramp = np.linspace(0, 1, x, dtype=np.float32)
    head, tail = a[: i0 + x].copy(), a[i1 - x :].copy()
    v = v.copy()
    v[:x] = v[:x] * ramp + head[-x:] * (1 - ramp)
    v[-x:] = v[-x:] * (1 - ramp) + tail[:x] * ramp
    mt.write_wav(dst, np.concatenate([head[:-x], v, tail[x:]]), sr)
    return round(v1 - v0, 2), round((v1 - v0) * factor, 2)


def close_gap(path, w0, w1, keep):
    """cut the silence between words w0 and w1 down to `keep` seconds (10 ms crossfade). Returns seconds removed."""
    a, sr = read_wav(path)
    ws = [w for seg in whisper(path, words=True)["segments"] for w in seg["words"]]
    i0 = next(i for i, w in enumerate(ws) if norm(w["word"]) == [w0])
    lo, hi = int((ws[i0]["end"] - 0.1) * sr), int((ws[i0 + 1]["start"] + 0.2) * sr)
    h = int(0.01 * sr)
    quiet = [np.sqrt(np.mean(a[j : j + h] ** 2)) < 0.006 for j in range(lo, hi, h)]
    best, run, start = (0, 0), 0, 0
    for k, q in enumerate(quiet):
        if q:
            if run == 0:
                start = k
            run += 1
            if run > best[1]:
                best = (start, run)
        else:
            run = 0
    g0 = lo + best[0] * h
    g1 = g0 + best[1] * h
    cut0, cut1 = g0 + int(keep / 2 * sr), g1 - int(keep / 2 * sr)
    if cut1 <= cut0:
        return 0.0
    x = int(0.01 * sr)
    ramp = np.linspace(0, 1, x, dtype=np.float32)
    head, tail = a[:cut0].copy(), a[cut1:].copy()
    head[-x:] = head[-x:] * (1 - ramp) + tail[:x] * ramp
    mt.write_wav(path, np.concatenate([head, tail[x:]]), sr)
    return round((cut1 - cut0) / sr, 3)


def pick():
    os.makedirs(TAKES, exist_ok=True)
    os.makedirs(LINES, exist_ok=True)
    report, chosen = [], {}
    for L in LINES_DEF:
        want = norm(L["say"])
        rows = []
        for k in range(len(L["takes"])):
            raw = os.path.join(RAW, f"{L['id']}-{k + 1}.wav")
            take = os.path.join(TAKES, f"{L['id']}-{k + 1}.wav")
            src = raw
            if L["who"] == "claude":
                src = raw + ".fx.wav"
                fx_claude(raw, src)
            mt.level(src, take)
            heard = whisper(take)["text"].strip()
            got = norm(heard)
            missing = [w for w in want if w not in got]
            extra = len([w for w in got if w not in want and w not in SOUNDS])
            a, sr = read_wav(take)
            dur = len(mt.trim(a, sr, pad=0)) / sr
            sd, rng = aliveness(a, sr)
            lw = None
            if L.get("long_word"):  # from the word's start (Whisper) to the end of the sound
                ws = [w for seg in whisper(take, words=True)["segments"] for w in seg["words"]]
                hit = [w for w in ws if norm(w["word"]) == [L["long_word"]]]
                lw = round(len(mt.trim(a, sr, pad=0)) / sr + (np.where(np.abs(a) > 0.006)[0][0] / sr) - hit[-1]["start"], 2) if hit else 0
            rows.append(dict(take=k + 1, text=L["takes"][k] if L["who"] == "mika" else " | ".join(f"{t} @{s}" + (f" +{g}s" if g else "") for t, s, g in L["takes"][k]),
                             heard=heard, missing=missing, extra=extra, dur=round(dur, 2), wps=round(len(want) / dur, 2), pitch_sd=round(sd, 2), pitch_range=round(rng, 1), long_word=lw))
        ok = [r for r in rows if not r["missing"] and r["extra"] == 0] or rows
        if L.get("long_word"):
            best = max(ok, key=lambda r: r["long_word"])
        elif L["who"] == "mika":
            best = max(ok, key=lambda r: (r["pitch_sd"] + 0.15 * r["pitch_range"] + L.get("w_pace", 0) * r["wps"]))
        else:
            best = next((r for r in ok if r["take"] == L.get("prefer", 2)), ok[0]) if len(ok) > 1 else ok[0]
        src = os.path.join(TAKES, f"{L['id']}-{best['take']}.wav")
        out = os.path.join(LINES, f"{L['id']}.wav")
        note = ""
        if L["who"] == "mika" and best["wps"] < L["pace"]:
            f = min(1.12, L["pace"] / best["wps"])
            stretch(src, out + ".s.wav", f)
            mt.level(out + ".s.wav", out)
            os.remove(out + ".s.wav")
            note = f"pace guard x{f:.3f}"
        elif L.get("stretch_word"):
            w, f = L["stretch_word"]
            before, after = stretch_vowel(src, out + ".w.wav", w, f)
            mt.level(out + ".w.wav", out)
            os.remove(out + ".w.wav")
            note = f'"{w}" vowel {before}s -> {after}s'
            heard = whisper(out)["text"].strip()
            note += f' (Whisper after: "{heard}")'
        else:
            mt.level(src, out)
        if L.get("close_gap"):
            w0, w1, keep = L["close_gap"]
            cut = close_gap(out, w0, w1, keep)
            note += f' gap "{w0}"-"{w1}" cut by {cut}s'
        report.append(dict(id=L["id"], who=L["who"], say=L["say"], picked=best["take"], note=note, takes=rows))
        chosen[L["id"]] = out
        print(f"{L['id']}: picked take {best['take']} {note}  " + "  ".join(f"[{r['take']}] {r['dur']}s {r['wps']}w/s sd{r['pitch_sd']} miss{r['missing']}" for r in rows), flush=True)

    # (kept for the record; the preview leaves the yawn out while m1 has yawn=False)
    # yawn: no real words, 0.7-2.2 s, the longest pitch glide wins
    yrows = []
    for k in range(len(YAWNS)):
        raw = os.path.join(RAW, f"yawn-{k + 1}.wav")
        if not os.path.exists(raw):
            continue
        take = os.path.join(TAKES, f"yawn-{k + 1}.wav")
        mt.level(raw, take)
        a, sr = read_wav(take)
        heard = whisper(take)["text"].strip()
        yrows.append(dict(take=k + 1, text=YAWNS[k], heard=heard, dur=round(len(a) / sr, 2), pitch_range=aliveness(a, sr)[1]))
    yok = [r for r in yrows if 0.7 <= r["dur"] <= 2.6 and all(w in SOUNDS for w in norm(r["heard"]))] or yrows
    ybest = max(yok, key=lambda r: r["pitch_range"])
    # keep the first two bursts ("uh... hmm") so the hook stays tight; fade the tail
    yt = os.path.join(V, "_yawn.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(TAKES, f"yawn-{ybest['take']}.wav"), "-af", f"atrim=0:{YAWN_KEEP},afade=t=out:st={YAWN_KEEP - 0.25}:d=0.25", yt], check=True)
    mt.level(yt, os.path.join(LINES, "yawn.wav"))
    os.remove(yt)
    report.insert(0, dict(id="yawn", who="mika", say="(yawn)", picked=ybest["take"], note="", takes=yrows))
    print("yawn: picked", ybest["take"], yrows, flush=True)

    # preview: yawn, then every line in script order with a short gap
    seq = ([os.path.join(LINES, "yawn.wav")] if LINES_DEF[0].get("yawn") else []) + [chosen[L["id"]] for L in LINES_DEF]
    parts = []
    for p in seq:
        a, sr = read_wav(p)
        parts += [a, np.zeros(int(GAP_BETWEEN * sr), np.float32)]
    tmp = os.path.join(V, "_preview.wav")
    mt.write_wav(tmp, np.concatenate(parts), 48000)
    mt.level(tmp, os.path.join(V, "preview.wav"))
    os.remove(tmp)

    # word timings from the clean picked lines
    words = {}
    for L in LINES_DEF:
        r = whisper(chosen[L["id"]], words=True)
        words[L["id"]] = dict(who=L["who"], say=L["say"], dur=round(len(read_wav(chosen[L["id"]])[0]) / 48000, 3),
                              words=[dict(w=w["word"].strip(), s=round(w["start"], 3), e=round(w["end"], 3)) for seg in r["segments"] for w in seg["words"]])
    with open(os.path.join(V, "words.json"), "w") as f:
        json.dump(words, f, indent=1, ensure_ascii=False)
    with open(os.path.join(V, "check.json"), "w") as f:
        json.dump(report, f, indent=1, ensure_ascii=False)
    print("preview", os.path.join(V, "preview.wav"), mt.lufs(os.path.join(V, "preview.wav")), "LUFS")


if __name__ == "__main__":

    if sys.argv[1] == "publish":
        pass
    elif sys.argv[1] == "gen":
        gen(sys.argv[2:])
    else:
        pick()


def publish():
    """copy the picked lines to public/ouaw01/voice for Remotion, with a gentle peak limiter (-4.5 dBFS, fast attack):
    the delivery stays -14 LUFS / -1.5 dBTP only if the voice's peak-to-loudness ratio is under ~12.5 dB."""
    dst = os.path.join(ROOT, "public/ouaw01/voice")
    os.makedirs(dst, exist_ok=True)
    for L in LINES_DEF:
        src = os.path.join(LINES, L["id"] + ".wav")
        out = os.path.join(dst, L["id"] + ".wav")
        lim = "alimiter=limit=0.596:attack=2:release=40:level=false"
        gain = 0.0
        for _ in range(3):  # limit, then make-up gain back to -16.5 LUFS under the same ceiling
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", f"volume={gain:.2f}dB,{lim}", "-ar", "48000", "-ac", "1", out], check=True)
            gain += -16.5 - mt.lufs(out)
        print(L["id"], f"{mt.lufs(out):.1f} LUFS")


if __name__ == "__main__" and sys.argv[1] == "publish":
    publish()
