"""Check that your machine produces the locked series voices (bible §13).

    .venv/bin/python series/onceuponawhy/tools/voice_check.py

Downloads the pinned models on first run (several GB), then makes one short line per character with the locked
settings and writes out/voice-check.wav: for each character, the REFERENCE sample from the repo first, then YOUR take.
Listen and compare. Claude (Kokoro) is deterministic and should match closely; Mika (Chatterbox Turbo) and Nora
(Qwen3 VoiceDesign) are sampled, so the delivery varies but the voice should clearly be the same person.
Also prints what Whisper heard for each line (it should be word-perfect).
"""
import gc
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
sys.path.insert(0, os.path.join(ROOT, "series/onceuponawhy/voice-tests/v2"))
sys.path.insert(0, os.path.join(ROOT, "series/onceuponawhy/tools"))
import make_takes as mt  # noqa: E402

CLAUDE_FX = "asetrate=24000*1.059463,aresample=24000,atempo=0.943874,highpass=f=70"  # locked: +1 semitone, dry
REFS = {
    "claude": "series/onceuponawhy/voice-tests/v3-claude/takes/k-am_echo-1.05-p1.wav",
    "mika": "series/onceuponawhy/voice-tests/v2/takes/mika-turbo.wav",
    "nora": "series/onceuponawhy/voice-tests/v2/refs/nora-ref-a.wav",
}
LINES = {
    "claude": "Because you just flew in from New York.",
    "mika": "[sigh] Okay, okay. How do I fix it?!",
    "nora": "Right. I've read forty-seven articles about this.",
}


def read(path):
    import wave

    with wave.open(path) as w:
        sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32767
    return a, sr


def to48(path):
    out = path + ".48k.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ar", "48000", "-ac", "1", out], check=True)
    a, _ = read(out)
    os.remove(out)
    return a


def main():
    import mlx_whisper

    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    tmp = os.path.join(ROOT, "out", "_vc")
    os.makedirs(tmp, exist_ok=True)
    seq = []
    for who, model in (("claude", "kokoro"), ("mika", "turbo"), ("nora", "qwen")):
        m = mt.load_pinned(model)
        text = mt.apply(LINES[who], "kokoro" if model == "kokoro" else "respell", "uk" if who == "nora" else "us")
        kw = {"kokoro": dict(voice="am_echo", speed=1.05), "turbo": {}, "qwen": dict(instruct=mt.NORA_DESIGN)}[model]
        raw = os.path.join(tmp, f"{who}.wav")
        mt.write_wav(raw, mt.trim(mt.synth(m, model, text, kw), m.sample_rate), m.sample_rate)
        if who == "claude":
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", CLAUDE_FX, raw + ".fx.wav"], check=True)
            os.replace(raw + ".fx.wav", raw)
        lev = raw + ".lev.wav"
        mt.level(raw, lev)
        heard = mlx_whisper.transcribe(lev, path_or_hf_repo=mt.whisper_path(), language="en")["text"].strip()
        print(f"{who:7s} heard: {heard}")
        ref = os.path.join(tmp, f"{who}-ref.wav")
        mt.level(os.path.join(ROOT, REFS[who]), ref)
        gap = np.zeros(int(0.8 * 48000), np.float32)
        seq += [to48(ref)[: 48000 * 8], gap, to48(lev), gap, gap]
        del m
        gc.collect()
    out = os.path.join(ROOT, "out", "voice-check.wav")
    mt.write_wav(out, np.concatenate(seq), 48000)
    for f in os.listdir(tmp):
        os.remove(os.path.join(tmp, f))
    os.rmdir(tmp)
    print("wrote", out, "(per character: reference, then your take)")


if __name__ == "__main__":
    main()
