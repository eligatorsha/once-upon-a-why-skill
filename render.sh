#!/usr/bin/env bash
# Render a Remotion composition and loudness-normalize its audio.
#
#   ./render.sh <CompositionId> [name]
#   REMOTION_ARGS="--scale=0.5" ./render.sh <CompositionId> [name]   (extra args for remotion render, e.g. drafts)
#   CHUNK=120 REMOTION_ARGS="--gl=angle --concurrency=1" ./render.sh <Id> [name]   (heavy 3D: chunked video with retries)
#
# Final file: out/<name>.mp4 (name defaults to the composition id).
# Audio: two-pass loudnorm I=-14 LUFS, TP=-1.5 dBTP, LRA=11, 48 kHz AAC,
# trimmed to the video stream's length. Video stream is copied untouched.
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <CompositionId> [name]" >&2
  exit 1
fi

COMP="$1"
NAME="${2:-$COMP}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

mkdir -p out/.raw
RAW="out/.raw/${NAME}.mp4"
FINAL="out/${NAME}.mp4"
TMP="out/.raw/${NAME}.norm.mp4"

if [[ -n "${CHUNK:-}" ]]; then
  # Chunked mode (CHUNK=<frames per chunk>): for heavy 3D scenes where the GPU can hang on a random frame.
  # Video renders in frame chunks, each with a frame timeout and up to 4 retries; audio renders once,
  # whole, so there are no seams. The chunks are joined losslessly and muxed with the audio into $RAW.
  CDIR="out/.raw/${NAME}.chunks"
  # RESUME=1 keeps finished chunks from a previous run of the same name
  [[ -n "${RESUME:-}" ]] || rm -rf "$CDIR"
  mkdir -p "$CDIR"
  echo "==> Bundling"
  rm -rf "$CDIR/bundle"
  npx remotion bundle src/index.ts --out-dir "$CDIR/bundle" --log=error
  FRAMES="$(npx remotion compositions "$CDIR/bundle" 2>/dev/null | awk -v c="$COMP" '$1==c{print $4}')"
  [[ -n "$FRAMES" ]] || { echo "composition $COMP not found" >&2; exit 1; }
  : > "$CDIR/list.txt"
  for ((a = 0; a < FRAMES; a += CHUNK)); do
    b=$((a + CHUNK - 1)); ((b >= FRAMES)) && b=$((FRAMES - 1))
    part="$CDIR/part_$(printf %05d "$a").mp4"
    if [[ -n "${RESUME:-}" && -s "$part" ]]; then
      echo "file '$(basename "$part")'" >> "$CDIR/list.txt"
      continue
    fi
    for try in 1 2 3 4 5; do
      echo "==> Frames ${a}-${b} (try ${try})"
      pkill -f chrome-headless-shell 2>/dev/null || true
      if npx remotion render "$CDIR/bundle" "$COMP" "$part" --frames="${a}-${b}" --muted --log=error --timeout=${CHUNK_TIMEOUT:-60000} ${REMOTION_ARGS:-}; then
        break
      fi
      ((try == 5)) && { echo "chunk ${a}-${b} failed 5 times" >&2; exit 1; }
    done
    echo "file '$(basename "$part")'" >> "$CDIR/list.txt"
  done
  # audio in one pass; compositions may skip their visuals when they get the __audioOnly prop
  echo "==> Audio (single pass)"
  npx remotion render "$CDIR/bundle" "$COMP" "$CDIR/audio.wav" --codec=wav --log=error --timeout=120000 --props='{"__audioOnly":true}'
  ffmpeg -v error -y -f concat -safe 0 -i "$CDIR/list.txt" -i "$CDIR/audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k "$RAW"
else
  echo "==> Rendering ${COMP} -> ${RAW}"
  npx remotion render src/index.ts "$COMP" "$RAW" --log=error ${REMOTION_ARGS:-}
fi

VDUR="$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$RAW")"
HAS_AUDIO="$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$RAW" | head -n1)"

if [[ -z "$HAS_AUDIO" ]]; then
  echo "==> No audio stream; copying as-is"
  cp "$RAW" "$FINAL"
  echo "==> Done: ${FINAL} (no audio)"
  exit 0
fi

echo "==> Loudnorm pass 1 (measure)"
MEASURE="$(ffmpeg -hide_banner -nostats -i "$RAW" -vn \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 \
  | awk '/^\{/{f=1} f{print} /^\}/{f=0}')"

get() { printf '%s' "$MEASURE" | sed -n "s/.*\"$1\" *: *\"\([^\"]*\)\".*/\1/p"; }
MI="$(get input_i)"; MTP="$(get input_tp)"; MLRA="$(get input_lra)"
MTH="$(get input_thresh)"; OFF="$(get target_offset)"

echo "==> Loudnorm pass 2 (apply)  measured I=${MI} TP=${MTP} LRA=${MLRA}"
ffmpeg -v error -y -i "$RAW" -t "$VDUR" -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${MI}:measured_TP=${MTP}:measured_LRA=${MLRA}:measured_thresh=${MTH}:offset=${OFF}:linear=true,aresample=48000" \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$TMP"
mv "$TMP" "$FINAL"

echo "==> Result"
ffmpeg -hide_banner -nostats -i "$FINAL" -af ebur128=peak=true -f null - 2>&1 \
  | grep -E '^\s+(I|Peak):' | sed 's/^ */    /'
ffprobe -v error -show_entries stream=codec_type,duration -of compact "$FINAL" | sed 's/^/    /'
echo "==> Done: ${FINAL}"
