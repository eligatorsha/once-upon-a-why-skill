// ONCE UPON A WHY compositions (bible §14). X* = review stills and tests, never deliverables.
import React from "react";
import { Composition, Still } from "remotion";
import { CharacterSheet, SHEET_H, SHEET_W } from "./dev/CharacterSheet";
import { LocationStill } from "./dev/Locations";
import { TestClip, TEST_CLIP_FRAMES } from "./dev/TestClip";
import { TitleStill } from "./dev/TitleStill";
import { ClaudeStill } from "./dev/ClaudeStill";
import { NoraStill } from "./dev/NoraStill";
import { PfpStill } from "./dev/Pfp";
import { OUAW01Cover, OUAW01Monday, OUAW01_FRAMES } from "./episodes/ouaw01/OUAW01Monday";

export const OnceUponAWhyCompositions: React.FC = () => (
  <>
    <Still id="XOuawCharacterSheet" component={CharacterSheet} width={SHEET_W} height={SHEET_H} />
    <Still id="XOuawLoc" component={LocationStill} width={1080} height={1920} defaultProps={{ set: "office" as const, guide: false, t0: 40 }} />
    <Composition id="OuawTestClip" component={TestClip} durationInFrames={TEST_CLIP_FRAMES} fps={30} width={1080} height={1920} />
    <Still id="XOuawTitle" component={TitleStill} width={1080} height={1920} defaultProps={{ title: "The CV Panic", heroine: "mika" as const }} />
    <Still id="XOuawClaude" component={ClaudeStill} width={1080} height={1920} />
    <Still id="XOuawNora" component={NoraStill} width={1080} height={1920} defaultProps={{ close: false }} />
    <Still id="XOuawPfp" component={PfpStill} width={1080} height={1080} defaultProps={{ option: "A" as const }} />
    {/* EPISODES (deliverables: render with ./render.sh) */}
    <Composition id="OUAW01Monday" component={OUAW01Monday} durationInFrames={OUAW01_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ __audioOnly: false, debugFaces: false }} />
    <Still id="OUAW01Cover" component={OUAW01Cover} width={1080} height={1920} />
  </>
);
