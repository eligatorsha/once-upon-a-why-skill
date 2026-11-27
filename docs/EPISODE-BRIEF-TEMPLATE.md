# Episode brief template (paste after `/ouaw-episode`)

Fill in the brackets. Episode 1's brief is the worked example: see `episodes/ouaw-01-monday/shotlist.md` for what
the skill turned it into.

```
Make episode [N] of the Once Upon a Why series: "[the question, e.g. Why am I so tired on Mondays?]"

Follow CLAUDE.md and series/onceuponawhy/BIBLE.md for everything: locked cast, City Pop Dusk style, locked voices,
pace guard, pronunciation dictionary, captions, safe areas, render with ./render.sh. Reuse the existing components
and sets; build only what is new and make it reusable.

Length: about [40 to 45] seconds (hard max 50).
Folder: episodes/ouaw-[NN]-[slug]
Composition id: OUAW[NN][Slug]
Final file: out/ouaw-[NN]-[slug].mp4

TOP PRIORITY RULES
1. Everyone is emotional in every frame: big, cartoon-clear, readable on a phone in half a second. Non-speakers react.
2. Voices are alive and human, never flat. Regenerate any flat take. Use the pace guard. Small human sounds where they fit.
3. No mushy half-shots or half-actions. One clear idea per shot, every shot holds at least 1.2 s.
4. If something does not fit or cannot be done cleanly, cut it and tell me what you cut.
5. The first second must already hook: [what happens in frame 1]. No title card at the start.

CAST AND NEW PROPS
- [MIKA / NORA]: locked design. Today: [state, e.g. Monday-morning wrecked: messy curls, half-closed eyes].
- CLAUDE: locked felted orange design. New reusable prop: [e.g. a tiny neck pillow], [how it appears].

LOCATIONS
1. [Set from the bible, e.g. TRAIN CARRIAGE], [light / time of day variant], explainer surface: [board / hologram / ...]
2. [...]

SCRIPT (use these lines exactly; fact-checked)
0:00 (visual) [...]
0:01 [SPEAKER]: [line]
0:04 [SPEAKER]: [line]
...
0:40 End text: [e.g. Send this to your Monday zombie friend]

VOICE DIRECTION
| Line | Emotion | How |
|---|---|---|
| [speaker "first words..."] | [emotion] | [pace, stress, pauses, sounds] |

Pronunciation: check these with the dictionary and add any that need fixing: [tricky words].

SHOTS, EMOTIONS AND FX
- [beat]: [camera, emotion, FX]

SOUND
Original only. [ambience, SFX list]. A soft original lo-fi city pop music bed, low under the voice. SFX at 0.4 to 0.6.

CAPTIONS
House style: 1 to 3 words, rounded pills in the middle third, never over faces, accent words in the speaker colour.
Accent words: [WORDS]. No captions over time cards.

WORKFLOW (stop and wait for my OK at each step)
1. Voice takes for every line plus a pronunciation check; one preview wav and a settings table.
2. Shot list in episodes/ouaw-[NN]-[slug]/shotlist.md anchored to word timings.
3. Half-size draft: REMOTION_ARGS="--scale=0.5" ./render.sh OUAW[NN][Slug] ouaw-[NN]-[slug]-draft, a contact sheet
   of one frame per second, and a check that captions sit in the middle third and never cover a face.
4. Final: ./render.sh OUAW[NN][Slug] ouaw-[NN]-[slug], plus a 1080x1920 cover still: [cover idea, headline text].
```
