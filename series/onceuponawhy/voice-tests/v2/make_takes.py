"""Once Upon a Why — expressive voice tests for Mika and Nora (bible §13). Local mlx-audio models only, no cloning.

    .venv/bin/python series/onceuponawhy/voice-tests/v2/make_takes.py gen [model ...]   # generate raw takes (resumable)
    .venv/bin/python series/onceuponawhy/voice-tests/v2/make_takes.py mix              # level, whisper-check, label, combine

Every line goes through the pronunciation dictionary first (tools/pron.py): Kokoro gets Misaki overrides, the other
models get plain respellings. Output: takes/<id>.wav (-16 LUFS, 48 kHz), voice-takes.wav, check.json.
"""
import json, os, re, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../../.."))
sys.path.insert(0, os.path.join(ROOT, "series/onceuponawhy/tools"))
from pron import apply  # noqa: E402

RAW = os.path.join(HERE, "raw")
# Chatterbox's built-in default voice as a reference clip, rendered locally by Chatterbox Turbo (no real person).
# The MLX port can't read the official conds.pt correctly (it produced gibberish), so we pass this clip instead.
BUILTIN_REF = os.path.join(HERE, "chatterbox-builtin-ref.wav")
BUILTIN_REF_TEXT = "Hello there. This is the default voice, speaking calmly and clearly, so the other model can match its tone and its pace."
TAKES = os.path.join(HERE, "takes")

# the user's lines, written the way people talk; [tags] / (tags) are the human sounds for models that support them
MIKA = [
    "Okay, okay, okay... The deadline is in three hours, and I have, like... zero words. Claude, help!",
    "Wait. They actually replied?! Oh my god. Oh my god, what do I say?!",
]
MIKA_TURBO = [
    "Okay, okay, okay... [sigh] The deadline is in three hours, and I have, like... zero words. Claude, help!",
    "Wait. [gasp] They actually replied?! Oh my god. [laugh] Oh my god, what do I say?!",
]
MIKA_DIA = [
    "(inhales) Okay, okay, okay... The deadline is in three hours, and I have, like... zero words. Claude, help!",
    "Wait. (gasps) They actually replied?! Oh my god. (laughs) Oh my god, what do I say?!",
]
NORA = [
    "I've read forty-seven articles about this. I'm still not sure. Is that... normal?",
    "Right. So a PhD is basically three to four years of being paid to be obsessed with one question.",
]
NORA_TURBO = [
    "[sigh] I've read forty-seven articles about this. I'm still not sure. Is that... normal?",
    "Right. So a PhD is basically three to four years of being paid to be obsessed with one question. [chuckle]",
]
NORA_DIA = [
    "(sighs) I've read forty-seven articles about this. I'm still not sure. Is that... normal?",
    "Right. So a PhD is basically three to four years of being paid to be obsessed with one question. (chuckle)",
]

MIKA_DESIGN = (
    "A young American woman in her early twenties. Bright, fast and excited, a little chaotic and giggly, "
    "with lots of pitch movement, slightly breathless, and she laughs easily. Natural, casual, very expressive."
)
MIKA_DESIGN_2 = (
    "A bubbly, energetic young American woman, about twenty-two, speaking quickly with big swings in pitch, "
    "half-laughing as she talks, panicky but playful. Warm, human and spontaneous, not a narrator."
)
NORA_DESIGN = (
    "A young British woman in her early twenties with a crisp, educated southern English accent. Calm, clear "
    "and smart, with dry humour and a warm, gentle undertone. Measured pace, a slight smile in her voice."
)
NORA_DESIGN_2 = (
    "A composed young Englishwoman, about twenty-three, London accent, articulate and quietly witty, "
    "understated and deadpan but kind. Natural conversational delivery, not a newsreader."
)

# id, model, heroine, label, settings (for the table), lines, kwargs
PLAN = [
    ("mika-chatterbox-03", "chatterbox", "mika", "Mika. Chatterbox, built-in voice, exaggeration point three.", "built-in voice, exaggeration 0.3, cfg 0.5, temp 0.8", MIKA, dict(exaggeration=0.3, cfg_weight=0.5)),
    ("mika-chatterbox-06", "chatterbox", "mika", "Mika. Chatterbox, exaggeration point six.", "built-in voice, exaggeration 0.6, cfg 0.4, temp 0.8", MIKA, dict(exaggeration=0.6, cfg_weight=0.4)),
    ("mika-chatterbox-09", "chatterbox", "mika", "Mika. Chatterbox, exaggeration point nine.", "built-in voice, exaggeration 0.9, cfg 0.3, temp 0.85", MIKA, dict(exaggeration=0.9, cfg_weight=0.3, temperature=0.85)),
    ("mika-turbo", "turbo", "mika", "Mika. Chatterbox Turbo, with sigh, gasp and laugh tags.", "built-in voice, tags [sigh] [gasp] [laugh], temp 0.8", MIKA_TURBO, dict()),
    ("mika-qwen-design-1", "qwen", "mika", "Mika. Qwen three voice design, description one.", f'VoiceDesign 1.7B: "{MIKA_DESIGN}"', MIKA, dict(instruct=MIKA_DESIGN)),
    ("mika-qwen-design-2", "qwen", "mika", "Mika. Qwen three voice design, description two.", f'VoiceDesign 1.7B: "{MIKA_DESIGN_2}"', MIKA, dict(instruct=MIKA_DESIGN_2)),
    ("mika-csm-a", "csm", "mika", "Mika. C S M, built-in voice A.", "csm-1b, built-in prompt conversational_a", MIKA, dict(voice="conversational_a")),
    ("mika-dia-s7", "dia", "mika", "Mika. Dia, voice seed seven, with breath, gasp and laugh.", "Dia 1.6B, seed 7, (inhales) (gasps) (laughs), temp 1.3", MIKA_DIA, dict(seed=7)),
    ("mika-dia-s21", "dia", "mika", "Mika. Dia, voice seed twenty one.", "Dia 1.6B, seed 21, (inhales) (gasps) (laughs), temp 1.3", MIKA_DIA, dict(seed=21)),
    ("nora-kokoro-emma", "kokoro", "nora", "Nora. Kokoro B F emma, the locked fallback.", "Kokoro bf_emma, speed 0.97, Misaki overrides", NORA, dict(voice="bf_emma", speed=0.97)),
    ("nora-chatterbox-03", "chatterbox", "nora", "Nora. Chatterbox, built-in voice, exaggeration point three.", "built-in voice, exaggeration 0.3, cfg 0.5", NORA, dict(exaggeration=0.3, cfg_weight=0.5)),
    ("nora-turbo", "turbo", "nora", "Nora. Chatterbox Turbo, with sigh and chuckle.", "built-in voice, tags [sigh] [chuckle]", NORA_TURBO, dict()),
    ("nora-qwen-design-1", "qwen", "nora", "Nora. Qwen three voice design, description one.", f'VoiceDesign 1.7B: "{NORA_DESIGN}"', NORA, dict(instruct=NORA_DESIGN)),
    ("nora-qwen-design-2", "qwen", "nora", "Nora. Qwen three voice design, description two.", f'VoiceDesign 1.7B: "{NORA_DESIGN_2}"', NORA, dict(instruct=NORA_DESIGN_2)),
    ("nora-csm-b", "csm", "nora", "Nora. C S M, built-in voice B.", "csm-1b, built-in prompt conversational_b", NORA, dict(voice="conversational_b")),
    ("nora-dia-s7", "dia", "nora", "Nora. Dia, voice seed seven.", "Dia 1.6B, seed 7, (sighs) (chuckle)", NORA_DIA, dict(seed=7)),
    ("nora-dia-s33", "dia", "nora", "Nora. Dia, voice seed thirty three.", "Dia 1.6B, seed 33, (sighs) (chuckle)", NORA_DIA, dict(seed=33)),
]
REPOS = {
    "chatterbox": "mlx-community/Chatterbox-TTS-fp16",
    "turbo": "mlx-community/chatterbox-turbo-fp16",
    "qwen": "mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-bf16",
    "csm": "mlx-community/csm-1b",
    "dia": "mlx-community/Dia-1.6B",
    "kokoro": "prince-canuma/Kokoro-82M",
}

# PINNED model snapshots: the exact revisions the series was made with (2026-11-27). Loading through load_pinned()
# downloads that snapshot once into the Hugging Face cache, so a later upstream change can't alter the voices.
WHISPER_REPO = "mlx-community/whisper-small-mlx"
REVISIONS = {
    "prince-canuma/Kokoro-82M": "e02c9eada7ce7416798af36b190a8a2dd2ecd566",
    "mlx-community/chatterbox-turbo-fp16": "b2d0a13aa7cfff0a06d9acb247ae91c8f19a6d75",
    "mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-bf16": "7d3824abff87e49756bb0f83fb5411de75d160c4",
    WHISPER_REPO: "45f3915923c7a79a5a5b5a7d909d39aeb0e5630e",
}


def pinned(repo):
    """local path of the pinned snapshot (downloads it the first time); unpinned repos load as-is"""
    if repo not in REVISIONS:
        return repo
    from huggingface_hub import snapshot_download

    return snapshot_download(repo, revision=REVISIONS[repo])


def load_pinned(key):
    """load a TTS model at its pinned revision (mlx-audio passes `revision` through to the Hub download)"""
    from mlx_audio.tts.utils import load_model

    repo = REPOS[key]
    return load_model(repo, revision=REVISIONS[repo]) if repo in REVISIONS else load_model(repo)


def whisper_path():
    return pinned(WHISPER_REPO)


def write_wav(path, a, sr):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())


def trim(a, sr, thresh=0.006, pad=0.06):
    idx = np.where(np.abs(a) > thresh)[0]
    return a if len(idx) == 0 else a[max(0, idx[0] - int(pad * sr)) : min(len(a), idx[-1] + int(pad * sr))]


def prep(line, model, heroine):
    accent = "uk" if heroine == "nora" else "us"
    if model == "kokoro":
        return apply(line, "kokoro", accent)
    return apply(line, "respell", accent)


def synth(m, model, line, kw):
    import mlx.core as mx

    if model == "chatterbox":
        gen = m.generate(text=line, verbose=False, ref_audio=BUILTIN_REF, temperature=kw.get("temperature", 0.8), exaggeration=kw["exaggeration"], cfg_weight=kw["cfg_weight"])
    elif model == "turbo":
        gen = m.generate(text=line)
    elif model == "qwen":
        gen = m.generate_voice_design(text=line, language="English", instruct=kw["instruct"])
    elif model == "csm":
        gen = m.generate(text=line, voice=kw["voice"])
    elif model == "dia":
        mx.random.seed(kw["seed"])
        gen = m.generate(text="[S1] " + line)
    else:
        gen = m.generate(text=line, voice=kw["voice"], speed=kw["speed"], lang_code="b" if kw["voice"].startswith("b") else "a")
    return np.concatenate([np.array(r.audio).reshape(-1) for r in gen]).astype(np.float32)


TARGET_WPS = 2.9  # natural conversational pace, words per second (Mika may run faster)


def pace_pick(m, model, text, kw, check_words, n=3, wav_tmp="/tmp/_pace.wav"):
    """Pace guard (bible §13): generate n candidates, keep the fastest one Whisper confirms word-perfect; if it is still
    slower than TARGET_WPS, time-stretch it (pitch kept) by at most 12 %. Returns (audio, sample_rate)."""
    import mlx_whisper

    best = None
    want = norm_words(check_words)
    for _ in range(n):
        a = trim(synth(m, model, text, kw), m.sample_rate)
        write_wav(wav_tmp, a, m.sample_rate)
        heard = norm_words(mlx_whisper.transcribe(wav_tmp, path_or_hf_repo=whisper_path(), language="en")["text"])
        ok = all(w in heard for w in want) and len(heard) <= len(want) + 3
        wps = len(want) / (len(a) / m.sample_rate)
        score = (ok, wps)
        if best is None or score > best[0]:
            best = (score, a)
    a = best[1]
    wps = best[0][1]
    if wps < TARGET_WPS:
        f = min(1.12, TARGET_WPS / wps)
        write_wav(wav_tmp, a, m.sample_rate)
        out = wav_tmp + ".fast.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav_tmp, "-af", f"atempo={f:.3f}", out], check=True)
        with wave.open(out) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32767
    return a, m.sample_rate


def gen(models):
    from mlx_audio.tts.utils import load_model

    os.makedirs(RAW, exist_ok=True)
    if "chatterbox" in models and not os.path.exists(BUILTIN_REF):
        t = load_pinned("turbo")
        a = np.concatenate([np.array(r.audio).reshape(-1) for r in t.generate(text=BUILTIN_REF_TEXT)]).astype(np.float32)
        write_wav(BUILTIN_REF, trim(a, t.sample_rate), t.sample_rate)
        del t
    for model in models:
        todo = [p for p in PLAN if p[1] == model and not os.path.exists(os.path.join(RAW, p[0] + ".wav"))]
        if not todo:
            continue
        try:
            m = load_pinned(model)
        except Exception as e:
            print(f"FAIL load {model}: {type(e).__name__}: {str(e)[:200]}", flush=True)
            continue
        sr = m.sample_rate
        for tid, _, heroine, _, _, lines, kw in todo:
            try:
                parts = []
                for ln in lines:
                    parts += [trim(synth(m, model, prep(ln, model, heroine), kw), sr), np.zeros(int(0.7 * sr), np.float32)]
                write_wav(os.path.join(RAW, tid + ".wav"), np.concatenate(parts), sr)
                print(f"OK {tid} ({sum(len(p) for p in parts) / sr:.1f}s)", flush=True)
            except Exception as e:
                print(f"FAIL {tid}: {type(e).__name__}: {str(e)[:200]}", flush=True)
        del m


def level(src, dst):
    m = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", src, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex("{") : m.rindex("}") + 1])
    ln = f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", ln + ",aresample=48000", "-ac", "1", dst], check=True)
    # linear loudnorm stops short when the true-peak limit binds: correct the remaining gap with gain + a limiter
    gap = -16.0 - lufs(dst)
    if abs(gap) > 0.25:
        tmp = dst + ".fix.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", dst, "-af", f"volume={gap:.2f}dB,alimiter=limit=0.84:level=false", "-ar", "48000", "-ac", "1", tmp], check=True)
        os.replace(tmp, dst)


def lufs(path):
    o = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1])


def norm_words(s):
    s = re.sub(r"\[[^\]]*\]|\([a-z ]+\)", " ", s.lower())
    s = s.replace("forty-seven", "47").replace("phd", "phd")
    return re.findall(r"[a-z0-9']+", s.replace("’", "'"))


def mix():
    import mlx_whisper
    from mlx_audio.tts.utils import load_model

    os.makedirs(TAKES, exist_ok=True)
    ann = load_pinned("kokoro")
    seq, report = [], []
    for tid, model, heroine, label, settings, lines, kw in PLAN:
        raw = os.path.join(RAW, tid + ".wav")
        if not os.path.exists(raw):
            report.append(dict(id=tid, model=model, status="missing"))
            continue
        take = os.path.join(TAKES, tid + ".wav")
        level(raw, take)
        r = mlx_whisper.transcribe(take, path_or_hf_repo=whisper_path(), language="en")
        heard = r["text"].strip()
        want = norm_words(" ".join(lines))
        got = norm_words(heard.replace("PhD", "phd").replace("Ph.D.", "phd").replace("P.H.D.", "phd"))
        missing = [w for w in want if w not in got]
        report.append(dict(id=tid, model=model, heroine=heroine, settings=settings, lufs=lufs(take), heard=heard, missing=missing))
        lab = np.concatenate([np.concatenate([np.array(x.audio).reshape(-1) for x in ann.generate(text=label, voice="af_sky", speed=1.05, lang_code="a")]), np.zeros(int(0.5 * 24000), np.float32)])
        labp = os.path.join(TAKES, f"_label-{tid}.wav")
        write_wav(labp, trim(lab, 24000), 24000)
        level(labp, labp.replace(".wav", ".lev.wav"))
        seq += [labp.replace(".wav", ".lev.wav"), take]
        print(f"{tid:22s} {report[-1]['lufs']:6.1f} LUFS  missing={missing}", flush=True)
    lst = os.path.join(TAKES, "_list.txt")
    with open(lst, "w") as f:
        for p in seq:
            f.write(f"file '{p}'\n")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", os.path.join(HERE, "voice-takes.wav")], check=True)
    for p in os.listdir(TAKES):
        if p.startswith("_"):
            os.remove(os.path.join(TAKES, p))
    with open(os.path.join(HERE, "check.json"), "w") as f:
        json.dump(report, f, indent=1, ensure_ascii=False)
    print("combined", os.path.join(HERE, "voice-takes.wav"), lufs(os.path.join(HERE, "voice-takes.wav")))


if __name__ == "__main__":
    if sys.argv[1] == "gen":
        gen(sys.argv[2:] or ["kokoro", "turbo", "chatterbox", "qwen", "csm", "dia"])
    else:
        mix()
