// ONCE UPON A WHY: "City Pop Dusk" palette (series/onceuponawhy/BIBLE.md §2). LOCKED.
// Import colours from here only.

export const PAL = {
  // world
  lilac: "#B9A3E3",
  lilacSoft: "#D8C8F0",
  duskPurple: "#4B2E6E",
  duskDeep: "#2A1A48",
  peach: "#FFB894",
  peachSoft: "#FFD9C2",
  orange: "#FF8A4C",
  cream: "#FFF1DC",
  creamWarm: "#F4E2C4",
  tealNeon: "#3FE0D0",
  pinkNeon: "#FF6FB5",
  amber: "#FFB547",
  navy: "#141A3A",
  navyDeep: "#0B0F26",

  // speakers (captions, title cards, accents)
  mika: "#D7263D", // cherry red
  nora: "#7FA35B", // matcha green
  claude: "#C9764F", // terracotta

  // materials
  woodWarm: "#8A5634",
  woodDark: "#4E2D1C",
  woodLight: "#B98356",
  velvet: "#7A2440",
  velvetDeep: "#4E1530",
  chrome: "#C9CDD6",
  ink: "#1B1420",
} as const;

export type Speaker = "mika" | "nora" | "claude";
export const SPEAKER_COLOR: Record<Speaker, string> = { mika: PAL.mika, nora: PAL.nora, claude: PAL.claude };
