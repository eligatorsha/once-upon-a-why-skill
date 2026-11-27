"""OUAW 01: every sound effect and the music bed, synthesised procedurally (original, no samples, no copyrighted music).
    .venv/bin/python episodes/ouaw-01-monday/make_sfx.py      -> public/ouaw01/sfx/*.wav (48 kHz mono)
The composition sets SFX levels at 0.35-0.55 under the voice (volume 1). The music bed is mixed low (~-24 LUFS in the mix).
"""
import os
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "public", "ouaw01", "sfx")
rng = np.random.default_rng(101)


def T(d):
    return np.arange(int(SR * d)) / SR


def noise(d):
    return rng.standard_normal(int(SR * d))


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output="sos"), x)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.where(t < a, t / max(a, 1e-6), np.exp(-(t - a) / d))


def adsr(n, a, hold, r):
    t = np.arange(n) / SR
    e = np.clip(t / max(a, 1e-6), 0, 1)
    return e * np.where(t < a + hold, 1, np.exp(-(t - a - hold) / r))


def place(buf, x, at):
    i = int(at * SR)
    j = min(len(buf), i + len(x))
    if 0 <= i < len(buf):
        buf[i:j] += x[: j - i]


def room(x, decay=0.6, mix=0.18):
    n = int(SR * decay)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * decay / 5))
    ir = filt(ir, "low", 5000)
    wet = np.convolve(x, ir)[: len(x)]
    wet /= np.abs(wet).max() + 1e-9
    return x * (1 - mix) + wet * mix * np.abs(x).max()


def save(name, x, peak=0.9):
    x = np.asarray(x, dtype=np.float64)
    x = x / (np.abs(x).max() + 1e-9) * peak
    fade = min(len(x) // 4, int(0.004 * SR))
    if fade:
        x[:fade] *= np.linspace(0, 1, fade)
        x[-fade:] *= np.linspace(1, 0, fade)
    os.makedirs(OUT, exist_ok=True)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def sweep(f0, f1, d, shape=1.0):
    t = T(d)
    u = (t / d) ** shape
    f = f0 * (f1 / f0) ** u
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def loopable(x, xf=0.25):
    """crossfade the tail into the head so the file loops without a click"""
    n = int(xf * SR)
    head = x[:n].copy()
    x = x[n:].copy()
    x[-n:] = x[-n:] * np.linspace(1, 0, n) + head * np.linspace(0, 1, n)
    return x


# ---------- ambiences ----------
def train_amb():
    d = 6.6  # 6 clacks at 1.1 s
    x = filt(noise(d), "low", 160) * 0.9 + filt(noise(d), "band", [300, 1200]) * 0.12
    x *= 1 + 0.12 * np.sin(2 * np.pi * 0.7 * T(d))
    for k in range(6):
        for dt, g in ((0.0, 1.0), (0.13, 0.75)):  # the double clack of a rail joint
            c = filt(noise(0.09), "band", [120, 900]) * env(int(0.09 * SR), 0.002, 0.025) * 1.6 * g
            place(x, c, k * 1.1 + dt + 0.05)
    rattle = filt(noise(d), "band", [2500, 6000]) * 0.04 * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * T(d)) ** 8)
    return loopable(x + rattle)


def cafe_amb():
    d = 8.3
    x = filt(noise(d), "band", [180, 900]) * 0.35
    x *= 1 + 0.35 * filt(noise(d), "low", 1.5) / 0.05
    x = np.clip(x, -2, 2)
    for k in range(4):
        tink = np.sin(2 * np.pi * (2600 + k * 380) * T(0.25)) * env(int(0.25 * SR), 0.001, 0.05) * 0.25
        place(x, tink, 0.9 + k * 1.9 + rng.random() * 0.4)
    return loopable(room(x, 0.8, 0.25))


def birds():
    d = 2.6
    x = np.zeros(int(SR * d))
    for k in range(7):
        n = 0.08 + rng.random() * 0.08
        f0 = 2800 + rng.random() * 1600
        c = sweep(f0, f0 * (1.25 + rng.random() * 0.4), n, 0.6) * env(int(n * SR), 0.01, n / 3)
        place(x, c, 0.1 + k * 0.33 + rng.random() * 0.12)
        if rng.random() > 0.4:
            place(x, c * 0.7, 0.1 + k * 0.33 + n + 0.03)
    return room(x, 0.9, 0.3)


# ---------- one-shots ----------
def whoosh(d=0.5, lo=300, hi=3200):
    t = T(d)
    x = noise(d)
    out = np.zeros_like(x)
    seg = int(0.01 * SR)
    for i in range(0, len(x), seg):
        u = i / len(x)
        fc = lo + (hi - lo) * np.sin(np.pi * u)
        out[i : i + seg] = filt(x[i : i + seg + 200], "band", [fc * 0.6, fc * 1.4])[:seg][: len(out[i : i + seg])]
    return out * np.sin(np.pi * t / d) ** 1.5


def jerk():
    return whoosh(0.28, 400, 2200) * 0.8 + sweep(220, 520, 0.28, 0.5) * env(int(0.28 * SR), 0.005, 0.1) * 0.25


def pop():
    d = 0.3
    thump = sweep(180, 70, d, 0.4) * env(int(d * SR), 0.004, 0.06)
    squeak = sweep(900, 1400, 0.12, 0.7) * env(int(0.12 * SR), 0.004, 0.04) * 0.25
    fluff = filt(noise(d), "low", 900) * env(int(d * SR), 0.002, 0.04) * 0.6
    x = thump + fluff
    place(x, squeak, 0.02)
    return x


def end_pop():
    return pop() * 0.8


def rustle(d=0.45):
    x = filt(noise(d), "band", [1500, 6000]) * (0.5 + 0.5 * np.abs(filt(noise(d), "low", 25)) * 8)
    return x * np.sin(np.pi * T(d) / d)


def flaps(d):
    n = int(d * 34)  # dense clacks, letter by letter
    x = np.zeros(int(SR * (d + 0.1)))
    for k in range(n):
        at = (k / n) * d + rng.random() * 0.012
        c = filt(noise(0.03), "band", [1400, 5200]) * env(int(0.03 * SR), 0.0005, 0.006)
        c += filt(noise(0.03), "band", [300, 900]) * env(int(0.03 * SR), 0.0005, 0.01) * 0.5
        place(x, c * (0.75 + 0.5 * rng.random()), at)
    return room(x, 0.35, 0.12)


def holo_on():
    d = 0.8
    t = T(d)
    hum = (np.sin(2 * np.pi * 220 * t) + 0.5 * np.sin(2 * np.pi * 330 * t) + 0.3 * np.sin(2 * np.pi * 660 * t)) * adsr(len(t), 0.15, 0.3, 0.2)
    sh = sweep(600, 2400, d, 0.5) * adsr(len(t), 0.02, 0.1, 0.15) * 0.3
    return (hum * 0.4 + sh) * (1 + 0.2 * np.sin(2 * np.pi * 9 * t))


def clock_yawn():
    # a cartoon "mwaaah": buzzy tone gliding up then down through a moving vowel filter
    d = 0.8
    t = T(d)
    f = 300 + 160 * np.sin(np.pi * np.clip(t / 0.55, 0, 1)) - 90 * np.clip((t - 0.45) / 0.35, 0, 1)
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
    x = filt(saw, "band", [500, 1500]) + filt(saw, "band", [900, 2600]) * 0.4
    return x * adsr(len(t), 0.06, 0.45, 0.12)


def alarm():
    d = 0.5
    x = np.zeros(int(SR * (d + 0.3)))
    k = 0
    while k * 0.04 < d:
        f = 2350 if k % 2 else 3100
        tt = T(0.12)
        b = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt)) * env(len(tt), 0.0005, 0.04)
        place(x, b, k * 0.04)
        k += 1
    return room(x, 0.4, 0.15)


def zip_():
    d = 0.32
    x = sweep(1300, 160, d, 0.6) * env(int(d * SR), 0.003, 0.12)
    return x + filt(noise(d), "band", [800, 3000]) * env(int(d * SR), 0.002, 0.05) * 0.3


def grab():
    return rustle(0.22) * 0.9 + filt(noise(0.22), "low", 400) * env(int(0.22 * SR), 0.002, 0.03) * 0.6


def shimmer():
    d = 1.4
    t = T(d)
    x = np.zeros_like(t)
    for i, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0]):
        x += np.sin(2 * np.pi * f * t) * adsr(len(t), 0.3 + i * 0.08, 0.3, 0.4) * (0.6 if i else 1)
    return room(x * (1 + 0.15 * np.sin(2 * np.pi * 6 * t)), 0.9, 0.3)


def punch():
    return whoosh(0.22, 500, 3000)


def claps():
    d = 0.7
    x = np.zeros(int(SR * d))
    for k in range(3):
        c = filt(noise(0.08), "band", [400, 2200]) * env(int(0.08 * SR), 0.001, 0.015)
        c += filt(noise(0.08), "low", 300) * env(int(0.08 * SR), 0.001, 0.02) * 0.6
        place(x, c, 0.03 + k * 0.17)
    return x


def glitch():
    d = 0.22
    t = T(d)
    x = np.sign(np.sin(2 * np.pi * (180 + 900 * rng.random(len(t)) * 0.02) * t)) * 0.3
    x += filt(noise(d), "band", [2000, 9000]) * 0.8
    gate = (np.floor(t * 70) % 3 != 0).astype(float)
    return x * gate * env(len(t), 0.002, 0.08)


def chime():
    d = 1.6
    x = np.zeros(int(SR * d))
    for at, f in ((0.0, 1318.5), (0.22, 1046.5)):
        tt = T(d - at)
        b = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 2.0 * tt) + 0.15 * np.sin(2 * np.pi * f * 3.1 * tt)) * env(len(tt), 0.002, 0.45)
        place(x, b, at)
    return room(x, 0.9, 0.25)


def snore():
    d = 0.75
    t = T(d)
    f = 85 + 18 * np.sin(np.pi * t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    buzz = (2 * ((ph / (2 * np.pi)) % 1) - 1) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t))
    x = filt(buzz, "low", 700) + filt(noise(d), "band", [300, 1400]) * 0.35
    whistle = np.sin(2 * np.pi * np.cumsum(900 + 400 * t / d) / SR) * 0.06
    return x * np.sin(np.pi * t / d) ** 1.4 + whistle * np.sin(np.pi * t / d)


def sigh():
    # a soft, felt-y breath out: noise through a falling formant, little pitch underneath
    d = 0.9
    t = T(d)
    x = np.zeros_like(t)
    seg = int(0.01 * SR)
    src = noise(d)
    for i in range(0, len(t), seg):
        u = i / len(t)
        fc = 1400 - 800 * u
        x[i : i + seg] = filt(src[i : i + seg + 300], "band", [fc * 0.5, fc * 1.3])[:seg][: len(x[i : i + seg])]
    tone = np.sin(2 * np.pi * np.cumsum(260 - 90 * t / d) / SR) * 0.12
    e = adsr(len(t), 0.08, 0.25, 0.25)
    return (x + tone) * e


def fwump():
    d = 0.35
    return filt(noise(d), "low", 350) * env(int(d * SR), 0.004, 0.06) + sweep(120, 60, d, 0.5) * env(int(d * SR), 0.004, 0.08) * 0.6


def clink():
    d = 0.5
    tt = T(d)
    return (np.sin(2 * np.pi * 3150 * tt) + 0.5 * np.sin(2 * np.pi * 5230 * tt)) * env(len(tt), 0.0005, 0.06)


# ---------- music: soft original lo-fi city-pop bed ----------
def music():
    bpm = 92
    beat = 60 / bpm
    d = 46.0
    n = int(SR * d)
    x = np.zeros(n)
    # Fmaj7 – Em7 – Dm7 – Cmaj7 (two beats... one bar each), voiced around middle C
    prog_ = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
    bass = [41, 40, 38, 36]
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    bar = 4 * beat
    nbars = int(np.ceil(d / bar))
    bright_from = 37.3
    for b in range(nbars):
        t0 = b * bar
        ch = prog_[b % 4]
        # Rhodes-ish: sine + soft bell partial, tremolo, on beats 1 and 2.5
        for hit in (0.0, 1.5 * beat, 3.0 * beat):
            for m in ch:
                dd = 1.6 * beat
                tt = T(dd)
                f = hz(m)
                tone = (np.sin(2 * np.pi * f * tt) + 0.22 * np.sin(2 * np.pi * f * 2 * tt) + 0.08 * np.sin(2 * np.pi * f * 7.1 * tt) * np.exp(-tt * 12))
                tone *= env(len(tt), 0.006, 0.55) * (1 + 0.12 * np.sin(2 * np.pi * 5 * tt))
                place(x, tone * 0.11, t0 + hit)
        # bass: root on 1, fifth-ish pickup on 3.5
        for hit, mm in ((0.0, bass[b % 4]), (2.5 * beat, bass[b % 4] + 7), (3.5 * beat, bass[b % 4])):
            dd = 0.9 * beat
            tt = T(dd)
            f = hz(mm)
            bs = np.tanh(1.6 * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt))) * adsr(len(tt), 0.01, 0.4 * beat, 0.12)
            place(x, bs * 0.22, t0 + hit)
        # brushed beat: soft kick 1 & 3, brush snare 2 & 4, shaker 8ths
        for k in range(4):
            tb = t0 + k * beat
            if k in (0, 2):
                kk = sweep(110, 45, 0.25, 0.4) * env(int(0.25 * SR), 0.003, 0.07)
                place(x, kk * 0.25, tb)
            else:
                sn = filt(noise(0.25), "band", [1200, 6000]) * env(int(0.25 * SR), 0.01, 0.07)
                place(x, sn * 0.06, tb)
            for e8 in (0, 0.5):
                sh = filt(noise(0.06), "high", 6000) * env(int(0.06 * SR), 0.003, 0.015)
                place(x, sh * 0.035, tb + e8 * beat)
        # brighter from the Saturday cards: a chime arpeggio on top
        if t0 >= bright_from - bar:
            for i, m in enumerate([ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12]):
                at = t0 + i * beat
                if at < bright_from:
                    continue
                tt = T(beat * 1.2)
                f = hz(m)
                c = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 3 * f * tt)) * env(len(tt), 0.003, 0.3)
                place(x, c * 0.07, at)
    x = filt(x, "low", 7000)
    # resolve: fade the last 1.8 s
    fl = int(1.8 * SR)
    x[-fl:] *= np.linspace(1, 0, fl) ** 1.5
    return room(x, 1.2, 0.2)[:n]


SOUNDS = {
    "train-amb": (train_amb, 0.7),
    "cafe-amb": (cafe_amb, 0.6),
    "birds": (birds, 0.7),
    "jerk": (jerk, 0.8),
    "pop": (pop, 0.85),
    "end-pop": (end_pop, 0.7),
    "rustle": (rustle, 0.7),
    "flaps-long": (lambda: flaps(1.4), 0.85),
    "flaps-mid": (lambda: flaps(0.9), 0.85),
    "flaps-short": (lambda: flaps(0.5), 0.85),
    "holo-on": (holo_on, 0.6),
    "clock-yawn": (clock_yawn, 0.75),
    "alarm": (alarm, 0.85),
    "zip": (zip_, 0.8),
    "whoosh": (lambda: whoosh(0.55), 0.85),
    "grab": (grab, 0.7),
    "shimmer": (shimmer, 0.6),
    "punch": (punch, 0.85),
    "claps": (claps, 0.8),
    "glitch": (glitch, 0.75),
    "chime": (chime, 0.7),
    "snore": (snore, 0.85),
    "sigh": (sigh, 0.8),
    "fwump": (fwump, 0.8),
    "clink": (clink, 0.6),
    "music": (music, 0.5),
}

if __name__ == "__main__":
    for name, (fn, peak) in SOUNDS.items():
        save(name, fn(), peak)
        print("ok", name)
