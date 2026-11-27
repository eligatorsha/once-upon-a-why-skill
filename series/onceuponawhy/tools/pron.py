"""Once Upon a Why: apply the pronunciation dictionary before every TTS call (bible §13).

    from pron import apply
    apply("My PhD supervisor", engine="kokoro", accent="uk")   # -> "My [PhD](/pˌiːˌAʧdˈiː/) [supervisor](/sˈuːpəvˌIzə/)"
    apply("Ask Claude about Erasmus", engine="respell")         # -> "Ask Clawd about ih-RAZZ-mus"

engine: "kokoro" (Misaki phoneme overrides) or "respell" (plain-text respelling, for Chatterbox / Qwen3-TTS / Dia / CSM).
accent: "us" or "uk" (Mika is US, Nora is UK, Claude is US).
"""
import json
import os
import re

DICT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "pronunciation.json")


def load():
    with open(DICT, encoding="utf-8") as f:
        return json.load(f)["words"]


def apply(text: str, engine: str = "kokoro", accent: str = "us") -> str:
    words = load()
    # longest spellings first so "graduate scheme" wins over a shorter entry
    pairs = sorted(((m, w) for w in words for m in w["match"]), key=lambda p: -len(p[0]))
    taken = []  # spans already replaced, so entries never nest
    out = text
    for spelling, w in pairs:
        if engine == "kokoro":
            ph = w.get(f"kokoro_{accent}")
            if not ph:
                continue
        else:
            rs = w.get(f"respell_{accent}")
            if not rs:
                continue
        rx = re.compile(r"(?<![\w\[/])" + re.escape(spelling) + r"(?![\w\]])", re.IGNORECASE)

        def sub(m):
            if engine == "kokoro":
                return f"[{m.group(0)}](/{ph}/)"
            return rs

        new = []
        last = 0
        for m in rx.finditer(out):
            if any(a <= m.start() < b for a, b in taken):
                continue
            new.append(out[last : m.start()])
            new.append(sub(m))
            last = m.end()
        new.append(out[last:])
        if len(new) > 1:
            out = "".join(new)
            # recompute protected spans: everything inside [..](/../) or a respelling we inserted
            taken = [(m.start(), m.end()) for m in re.finditer(r"\[[^\]]+\]\(/[^)]+/\)", out)]
            if engine != "kokoro":
                taken += [(m.start(), m.end()) for m in re.finditer(re.escape(rs), out)]
    return out


if __name__ == "__main__":
    for s in ["My PhD supervisor said the graduate scheme at Cambridge is research-heavy.", "Mika asked Claude about Erasmus and her résumé."]:
        print(apply(s, "kokoro", "uk"))
        print(apply(s, "respell", "us"))
