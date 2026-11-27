"""Once Upon a Why — Claude voice redesign test (user 2026-11-27): small, cute, warm, playful, natural pace, a bit
higher and lighter, close and dry (no -1 semitone, no room reverb). No cloning of anyone's voice.

    .venv/bin/python series/onceuponawhy/voice-tests/v3-claude/make_claude_test.py gen [kokoro|qwen|turbo ...]
    .venv/bin/python series/onceuponawhy/voice-tests/v3-claude/make_claude_test.py mix

Candidates, 3 takes each, same three lines:
  K  Kokoro am_puck / bm_fable / am_echo: (1.00, +1 st), (1.05, +1 st), (1.05, +2 st). Pitch up with tempo kept.
  Q  Qwen3-TTS VoiceDesign 1.7B with the user's description (3 independent generations).
  T  Chatterbox Turbo. Its only built-in voice is Mika's, so it is steered with a reference clip of the *designed*
     Qwen voice above (a synthetic voice, not a person), plus [happy] / [chuckle] tags.
Pace guard on every take and line: Whisper word-perfect (up to 3 tries for the sampling models), then time-stretch
(pitch kept, max 12 %) if under 2.9 words/s. Everything levelled to -16 LUFS.
Out: takes/<id>.wav, claude-voice-test.wav (spoken label before each take), check.json.
"""
import gc, json, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "episodes/ouaw-01-monday"))
import make_voice as mv  # noqa: E402  (norm, read_wav, whisper, SOUNDS, mt)

mt = mv.mt
RAW, TAKES = os.path.join(HERE, "raw"), os.path.join(HERE, "takes")
LINES = [
    "Because you just flew in from New York.",
    "Your body thinks you did. It's called social jetlag.",
    "Two things. Get morning light as soon as you wake up. And don't sleep in too much on weekends.",
]
TURBO_LINES = [
    ["[happy] Because you just flew in... from New York.", "Your body thinks you did. [chuckle] It's called social jetlag.", "[happy] Two things. Get morning light as soon as you wake up. And don't sleep in too much on weekends."],
    ["Because you just flew in... from New York. [chuckle]", "[happy] Your body thinks you did. It's called social jetlag.", "Two things! Get morning light as soon as you wake up. And don't sleep in too much on weekends."],
    ["[happy] Because you just flew in, from New York.", "Your body thinks you did. It's called... social jetlag.", "[happy] Two things. Get morning light as soon as you wake up. [chuckle] And don't sleep in too much on weekends."],
]
CLAUDE_DESIGN = ("A small, cute, warm and friendly character voice, gentle and playful, light and smiling, calm confidence, "
                 "natural conversational pace.")
TARGET_WPS = 2.9
GAP = 0.4
SAY = {"am_puck": "am puck", "bm_fable": "B M fable", "am_echo": "am echo"}

PLAN = []
for v in ("am_puck", "bm_fable", "am_echo"):
    for sp, st in ((1.0, 1), (1.05, 1), (1.05, 2)):
        PLAN.append(dict(id=f"k-{v}-{sp:.2f}-p{st}", model="kokoro", voice=v, speed=sp, semis=st,
                         label=f"Kokoro, {SAY[v]}, speed {'one' if sp == 1.0 else 'one oh five'}, plus {'one semitone' if st == 1 else 'two semitones'}.",
                         settings=f"Kokoro `{v}`, speed {sp:.2f}, +{st} semitone{'s' if st > 1 else ''}, dry"))
for i in range(3):
    PLAN.append(dict(id=f"q-design-{i + 1}", model="qwen", label=f"Qwen three voice design, take {i + 1}.",
                     settings=f'Qwen3-TTS VoiceDesign 1.7B, description below, default sampling, take {i + 1}'))
for i in range(3):
    PLAN.append(dict(id=f"t-designref-{i + 1}", model="turbo", label=f"Chatterbox Turbo, designed reference, take {i + 1}.",
                     settings=f"Chatterbox Turbo, ref = designed Qwen voice (q-design-1), tags variant {i + 1}", lines=TURBO_LINES[i]))
TURBO_REF = os.path.join(HERE, "designed-ref.wav")


def pitch(src, dst, semis):
    r = 2 ** (semis / 12)
    af = f"asetrate=24000*{r:.6f},aresample=24000,atempo={1 / r:.6f},highpass=f=70" if semis else "highpass=f=70"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", af, dst], check=True)


def check(path, want_text):
    heard = mv.whisper(path)["text"].strip()
    want, got = mv.norm(want_text), mv.norm(heard)
    missing = [w for w in want if w not in got]
    extra = [w for w in got if w not in want and w not in mv.SOUNDS]
    return heard, missing, extra


def guard(path, n_words):
    """Pace guard: stretch (pitch kept) up to 12 % if slower than TARGET_WPS. Returns (wps_before, factor)."""
    a, sr = mv.read_wav(path)
    wps = n_words / (len(mt.trim(a, sr, pad=0)) / sr)
    f = 1.0
    if wps < TARGET_WPS:
        f = min(1.12, TARGET_WPS / wps)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-af", f"atempo={f:.4f}", path + ".s.wav"], check=True)
        os.replace(path + ".s.wav", path)
    return round(wps, 2), round(f, 3)


def gen(models):
    from mlx_audio.tts.utils import load_model

    os.makedirs(RAW, exist_ok=True)
    for model in models:
        todo = [p for p in PLAN if p["model"] == model and not os.path.exists(os.path.join(RAW, p["id"] + ".json"))]
        if not todo:
            continue
        m = load_model(mt.REPOS[model])
        sr = m.sample_rate
        for p in todo:
            info = []
            for li, line in enumerate(LINES):
                out = os.path.join(RAW, f"{p['id']}-{li}.wav")
                text = p.get("lines", LINES)[li]
                tries = 1 if model == "kokoro" else 3
                for t in range(tries):
                    if model == "kokoro":
                        acc = "uk" if p["voice"].startswith("b") else "us"
                        a = mt.synth(m, "kokoro", mt.apply(text, "kokoro", acc), dict(voice=p["voice"], speed=p["speed"]))
                    elif model == "qwen":
                        a = mt.synth(m, "qwen", mt.apply(text, "respell", "us"), dict(instruct=CLAUDE_DESIGN))
                    else:
                        gen_ = m.generate(text=mt.apply(text, "respell", "us"), ref_audio=TURBO_REF)
                        a = np.concatenate([np.array(r.audio).reshape(-1) for r in gen_]).astype(np.float32)
                    mt.write_wav(out, mt.trim(a, sr), sr)
                    if model == "kokoro":
                        pitch(out, out + ".p.wav", p["semis"])
                        os.replace(out + ".p.wav", out)
                    heard, missing, extra = check(out, line)
                    if not missing and not extra:
                        break
                wps, f = guard(out, len(mv.norm(line)))
                info.append(dict(line=li, text=text, heard=heard, missing=missing, extra=extra, tries=t + 1, wps=wps, stretch=f))
                print(f"{p['id']} L{li}: {wps} w/s x{f} tries {t + 1} miss {missing} extra {extra}", flush=True)
            json.dump(info, open(os.path.join(RAW, p["id"] + ".json"), "w"), indent=1)
            if p["id"] == "q-design-1":  # the designed reference for Turbo: all three lines, > 5 s
                parts = [mv.read_wav(os.path.join(RAW, f"{p['id']}-{li}.wav"))[0] for li in range(3)]
                mt.write_wav(TURBO_REF, np.concatenate([np.concatenate([x, np.zeros(int(0.3 * sr), np.float32)]) for x in parts]), sr)
        del m
        gc.collect()


def mix():
    from mlx_audio.tts.utils import load_model

    os.makedirs(TAKES, exist_ok=True)
    ann = load_model(mt.REPOS["kokoro"])
    seq, report = [], []
    for n, p in enumerate(PLAN, 1):
        js = os.path.join(RAW, p["id"] + ".json")
        if not os.path.exists(js):
            continue
        parts = []
        for li in range(3):
            a, sr = mv.read_wav(os.path.join(RAW, f"{p['id']}-{li}.wav"))
            parts += [a, np.zeros(int(GAP * sr), np.float32)]
        raw = os.path.join(TAKES, f"_{p['id']}.wav")
        mt.write_wav(raw, np.concatenate(parts), sr)
        take = os.path.join(TAKES, p["id"] + ".wav")
        mt.level(raw, take)
        os.remove(raw)
        lab = mt.trim(mt.synth(ann, "kokoro", f"Take {n}. " + p["label"], dict(voice="af_sky", speed=1.05)), 24000)
        lp = os.path.join(TAKES, f"_label-{n}.wav")
        mt.write_wav(lp, np.concatenate([lab, np.zeros(int(0.5 * 24000), np.float32)]), 24000)
        mt.level(lp, lp + ".lev.wav")
        seq += [lp + ".lev.wav", take]
        info = json.load(open(js))
        report.append(dict(n=n, id=p["id"], settings=p["settings"], lufs=round(mt.lufs(take), 1), lines=info))
    parts = []
    for s in seq:
        a, _ = mv.read_wav(s)
        parts += [a, np.zeros(int(0.6 * 48000), np.float32)]
    tmp = os.path.join(HERE, "_all.wav")
    mt.write_wav(tmp, np.concatenate(parts), 48000)
    mt.level(tmp, os.path.join(HERE, "claude-voice-test.wav"))
    os.remove(tmp)
    for f in os.listdir(TAKES):
        if f.startswith("_"):
            os.remove(os.path.join(TAKES, f))
    json.dump(report, open(os.path.join(HERE, "check.json"), "w"), indent=1, ensure_ascii=False)
    for r in report:
        print(r["n"], r["id"], r["lufs"], [(x["wps"], x["stretch"], x["missing"], x["extra"]) for x in r["lines"]])


if __name__ == "__main__":
    if sys.argv[1] == "gen":
        gen(sys.argv[2:] or ["kokoro", "qwen", "turbo"])
    else:
        mix()
