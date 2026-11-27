"""Once Upon a Why — pronunciation test (bible §13). Each heroine says every dictionary word in a short sentence.

    .venv/bin/python series/onceuponawhy/voice-tests/v2/pron_test.py

Uses the LOCKED voices: Mika = Chatterbox Turbo (US respellings), Nora = Qwen3 VoiceDesign ref A (UK respellings),
Claude = Kokoro am_echo 1.05, +1 semitone, dry (US Misaki phonemes). Short gaps between sentences.
Output: pronunciation-test.wav (-16 LUFS), pronunciation-test.json (Whisper check per sentence).
"""
import json, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_takes as mt  # noqa: E402

SENT = {
    "Mika": "Hi, I'm Mika, by the way.",
    "Nora": "Nora always reads the small print.",
    "Claude": "Claude, can you help me?",
    "PhD": "She's starting a PhD in the autumn.",
    "CV": "I need to fix my CV tonight.",
    "LinkedIn": "He messaged me on LinkedIn.",
    "master's": "I'm doing a master's next year.",
    "supervisor": "My supervisor wants a draft.",
    "scholarship": "I got the scholarship!",
    "Erasmus": "I did Erasmus in Lisbon.",
    "thesis": "The thesis is due in May.",
    "dissertation": "My dissertation is about bees.",
    "interview": "The interview is at ten.",
    "résumé": "Send them your résumé.",
    "Oxford": "She's applying to Oxford.",
    "Cambridge": "He studied at Cambridge.",
    "graduate scheme": "It's a two-year graduate scheme.",
    "cover letter": "Keep the cover letter short.",
    "internship": "The internship is unpaid.",
    "research": "I love the research part.",
    "application": "The application closes on Friday.",
    "Kokoro": "This voice runs on Kokoro.",
}
# the LOCKED voices (bible §13): Mika = Chatterbox Turbo, Nora = Qwen3 VoiceDesign ref A, Claude = Kokoro am_echo 1.05 +1 st dry
SECTIONS = [
    ("Mika.", "turbo", "mika", dict()),
    ("Nora.", "qwen", "nora", dict(instruct=mt.NORA_DESIGN)),
    ("Claude.", "kokoro", "claude", dict(voice="am_echo", speed=1.05)),
]
CLAUDE_FX = "asetrate=24000*1.059463,aresample=24000,atempo=0.943874,highpass=f=70"  # LOCKED v3 (bible §13)
GAP = 0.3


def main():
    from mlx_audio.tts.utils import load_model
    import mlx_whisper

    tmp = os.path.join(HERE, "_pron")
    os.makedirs(tmp, exist_ok=True)
    models = {}
    seq, report = [], []
    for si, (label, model, heroine, kw) in enumerate(SECTIONS):
        if model not in models:
            for k in [k for k in models if k != "kokoro"]:
                del models[k]  # 8 GB Mac: one big model at a time
            import gc
            gc.collect()
            models[model] = load_model(mt.REPOS[model])
        m = models[model]
        ann = models.setdefault("kokoro", load_model(mt.REPOS["kokoro"]))
        lab = mt.trim(mt.synth(ann, "kokoro", label, dict(voice="af_sky", speed=1.05)), 24000)
        p = os.path.join(tmp, f"{si:02d}-label.wav")
        mt.write_wav(p, np.concatenate([lab, np.zeros(int(0.4 * 24000), np.float32)]), 24000)
        mt.level(p, p.replace(".wav", ".lev.wav"))
        seq.append(p.replace(".wav", ".lev.wav"))
        for wi, (word, sent) in enumerate(SENT.items()):
            text = mt.prep(sent, model, "mika" if heroine == "claude" else heroine)
            p = os.path.join(tmp, f"{si:02d}-{wi:02d}.wav")
            # regenerate when the model rambles past the sentence (Qwen3 sometimes runs on into nonsense)
            if model in ("turbo", "qwen"):
                # pace guard: best of 3, word-perfect, nudged up to natural pace if still slow
                a, _ = mt.pace_pick(m, model, text, kw, sent, n=3, wav_tmp=p + ".cand.wav")
                mt.write_wav(p, np.concatenate([a, np.zeros(int(GAP * m.sample_rate), np.float32)]), m.sample_rate)
            else:
                a = mt.trim(mt.synth(m, model, text, kw), m.sample_rate)
                mt.write_wav(p, np.concatenate([a, np.zeros(int(GAP * m.sample_rate), np.float32)]), m.sample_rate)
            heard = mlx_whisper.transcribe(p, path_or_hf_repo="mlx-community/whisper-small-mlx", language="en")["text"].strip()
            for f in (p + ".cand.wav", p + ".cand.wav.fast.wav"):
                if os.path.exists(f):
                    os.remove(f)
            if heroine == "claude":
                fx = p.replace(".wav", ".fx.wav")
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-af", CLAUDE_FX, fx], check=True)
                os.replace(fx, p)
            mt.level(p, p.replace(".wav", ".lev.wav"))
            seq.append(p.replace(".wav", ".lev.wav"))
            report.append(dict(section=label, word=word, sent=sent, tts_text=text, heard=heard))
            print(f"{label[:22]:22s} {word:16s} -> {heard}", flush=True)
    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as f:
        for p in seq:
            f.write(f"file '{p}'\n")
    out = os.path.join(HERE, "pronunciation-test.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out], check=True)
    with open(os.path.join(HERE, "pronunciation-test.json"), "w") as f:
        json.dump(report, f, indent=1, ensure_ascii=False)
    subprocess.run(["rm", "-rf", tmp])
    print("done", out, mt.lufs(out))


if __name__ == "__main__":
    main()
