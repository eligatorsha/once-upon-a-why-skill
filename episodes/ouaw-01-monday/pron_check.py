"""Ep 1 pronunciation check: Mika (Turbo) and Claude (Kokoro, locked chain) each say every new word; Whisper-checked.
    .venv/bin/python episodes/ouaw-01-monday/pron_check.py   -> voice/pron-check.wav, voice/pron-check.json"""
import json, os, sys, gc
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_voice as mv
mt = mv.mt
SENT = ["It's called social jetlag.", "Every Monday after the weekend.", "Twelve hours in bed.", "I flew in from New York.", "See you on Saturday."]
def main():
    from mlx_audio.tts.utils import load_model
    out, rep = [], []
    for who, model, kw in (("mika", "turbo", {}), ("claude", "kokoro", dict(voice=mv.CLAUDE_VOICE, speed=1.05))):
        m = mt.load_pinned(model); sr = m.sample_rate
        for i, s in enumerate(SENT):
            raw = os.path.join(mv.V, f"_pc-{who}-{i}.wav")
            mt.write_wav(raw, mt.trim(mt.synth(m, model, mv.prep(s, who), kw), sr), sr)
            src = raw
            if who == "claude":
                mv.fx_claude(raw, raw + ".fx.wav"); src = raw + ".fx.wav"
            lev = raw + ".lev.wav"; mt.level(src, lev)
            heard = mv.whisper(lev)["text"].strip()
            rep.append(dict(who=who, text=s, sent=mv.prep(s, who), heard=heard, ok=mv.norm(heard) == mv.norm(s)))
            a, _ = mv.read_wav(lev); out += [a, np.zeros(int(0.35 * 48000), np.float32)]
        del m; gc.collect()
    tmp = os.path.join(mv.V, "_pc.wav"); mt.write_wav(tmp, np.concatenate(out), 48000)
    mt.level(tmp, os.path.join(mv.V, "pron-check.wav"))
    for f in os.listdir(mv.V):
        if f.startswith("_p"): os.remove(os.path.join(mv.V, f))
    json.dump(rep, open(os.path.join(mv.V, "pron-check.json"), "w"), indent=1, ensure_ascii=False)
    for r in rep: print(r["who"], r["ok"], "|", r["sent"], "|", r["heard"])
main()
