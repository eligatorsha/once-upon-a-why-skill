// ONCE UPON A WHY fonts (bible §8). Import from here only. No Japanese text anywhere in the series.
//  - DISPLAY  Yellowtail       retro 1980s script for title cards
//  - ROUND    Fredoka 500/600/700  captions, signage, plastic letters, split-flap, UI
import { loadFont as loadYellowtail } from "@remotion/google-fonts/Yellowtail";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";

const y = loadYellowtail("normal", { weights: ["400"], subsets: ["latin"] });
const f = loadFredoka("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });

export const DISPLAY = y.fontFamily;
export const ROUND = f.fontFamily;

export const fontsReady = Promise.all([y.waitUntilDone(), f.waitUntilDone()]).then(async () => {
  // make sure canvas textures can use them straight away
  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all([document.fonts.load(`400 80px "${DISPLAY}"`), document.fonts.load(`700 80px "${ROUND}"`), document.fonts.load(`600 80px "${ROUND}"`)]);
  }
});
