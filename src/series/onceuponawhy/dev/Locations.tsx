// ONCE UPON A WHY: location review stills (1080 × 1920), one per set, with the right heroine(s) in it.
// `XOuawLoc` with props { set }. The explainer surface is shown mid-way so it can be judged.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../look/Stage";
import { FontGate, SafeGuide } from "../look/overlay";
import { breathe, pose, Pose } from "../cast/rig";
import { Mika } from "../cast/Mika";
import { Nora } from "../cast/Nora";
import { Claude } from "../cast/Claude";
import { MIKA_ARGUE, MIKA_POSES, NORA_CROSSED, NORA_POSES, NORA_CHAIR, STRAP_R, waveArm } from "../cast/poses";
import { SetLook } from "../sets/common";
import { OFFICE, OFFICE_MARKS, OfficeSet } from "../sets/Office";
import { LIBRARY, LIBRARY_MARKS, LibrarySet } from "../sets/Library";
import { APARTMENT, APARTMENT_MARKS, ApartmentSet } from "../sets/Apartment";
import { COFFEE, COFFEE_MARKS, CoffeeShopSet } from "../sets/CoffeeShop";
import { CARRIAGE, CARRIAGE_MARKS, CarriageSet, PLATFORM, PLATFORM_MARKS, PlatformSet } from "../sets/Train";
import { SHOP, SHOP_MARKS, CornerShopSet } from "../sets/CornerShop";
import { ROOFTOP, ROOFTOP_MARKS, RooftopSet } from "../sets/Rooftop";

export type LocId = "office" | "library" | "apartment" | "coffee" | "platform" | "carriage" | "shop" | "rooftop";
type V3 = [number, number, number];
const At: React.FC<{ m: { pos: V3; yaw: number }; children: React.ReactNode }> = ({ m, children }) => (
  <group position={m.pos} rotation={[0, m.yaw, 0]}>
    {children}
  </group>
);

export const LocationStill: React.FC<{ set: LocId; guide?: boolean; t0?: number }> = ({ set, guide = false, t0 = 40 }) => {
  const t = useCurrentFrame() + t0;
  let look: SetLook = OFFICE;
  let body: React.ReactNode = null;
  const b = (p: Pose, amt = 0.5) => breathe(p, t, amt);
  switch (set) {
    case "office":
      look = OFFICE;
      body = (
        <>
          <OfficeSet t={t} explain={0.85} />
          <At m={OFFICE_MARKS.nora}>
            <Nora p={b(NORA_POSES.thinking, 0.3)} expr="thinking" t={t} />
          </At>
        </>
      );
      break;
    case "library":
      look = LIBRARY;
      body = (
        <>
          <LibrarySet t={t} explain={0.9} />
          <At m={LIBRARY_MARKS.nora}>
            <Nora p={b(pose({ head: [-0.3, -0.15, 0.05], armL: { sx: 0.6, sz: 0.1, el: 1.4, ez: 0.6 } }), 0.3)} expr="shocked" over={{ look: [0.04, 0.1] }} t={t} holdL="notebook" />
          </At>
          <At m={LIBRARY_MARKS.claude}>
            <Claude t={t} expr="proud" />
          </At>
        </>
      );
      break;
    case "apartment":
      look = APARTMENT;
      body = (
        <>
          <ApartmentSet t={t} explain={0.9} />
          <At m={APARTMENT_MARKS.nora}>
            <Nora p={b(pose({ head: [-0.18, -0.75, 0.06], twist: -0.25 }, NORA_CHAIR), 0.3)} expr="happy" over={{ look: [0.05, 0.1] }} t={t} />
          </At>
          <At m={APARTMENT_MARKS.claude}>
            <Claude t={t} expr="happy" />
          </At>
        </>
      );
      break;
    case "coffee":
      look = COFFEE;
      body = (
        <>
          <CoffeeShopSet t={t} explain={0.8} />
          <At m={COFFEE_MARKS.mika}>
            <Mika p={b(pose({ armR: waveArm(t), armL: { sx: 0.5, sz: 1.35, el: 0.25 }, head: [0, 0.18, 0.1] }, MIKA_POSES.happy))} expr="happy" t={t} claudePop={1} claudeExpr="happy" claudeWave={1} papers={4} />
          </At>
        </>
      );
      break;
    case "platform":
      look = PLATFORM;
      body = (
        <>
          <PlatformSet t={t} explain={0.85} trainX={0.6} />
          <At m={PLATFORM_MARKS.mika}>
            <Mika p={b(pose({ head: [-0.25, 0.15, 0], armR: { sx: 1.0, sz: 0.15, el: 1.3, ez: 0.3 } }, MIKA_POSES.anxious))} expr="anxious" over={{ look: [0.03, 0.12] }} t={t} holdR="phone" claudePop={0.55} claudeExpr="thinking" />
          </At>
        </>
      );
      break;
    case "carriage":
      look = CARRIAGE;
      body = (
        <>
          <CarriageSet t={t} />
          <At m={CARRIAGE_MARKS.mika}>
            <Mika p={b(pose({ armR: STRAP_R, head: [0.1, 0, 0.2], lean: 0.03 }, MIKA_POSES.sleepy))} expr="sleepy" t={t} headphonesOn papers={3} />
          </At>
        </>
      );
      break;
    case "shop":
      look = SHOP;
      body = (
        <>
          <CornerShopSet t={t} explain={0.62} />
          <At m={SHOP_MARKS.mika}>
            <Mika p={b(pose({ head: [-0.08, -0.35, 0.08], armR: { sx: 0.9, sz: 0.2, el: 1.3, ez: 0.3 } }, MIKA_POSES.thinking))} expr="thinking" over={{ look: [-0.08, 0.05] }} t={t} holdR="phone" />
          </At>
        </>
      );
      break;
    case "rooftop":
      look = ROOFTOP;
      body = (
        <>
          <RooftopSet t={t} explain={0.85} />
          <At m={ROOFTOP_MARKS.mika}>
            <Mika p={b(MIKA_ARGUE)} expr="shocked" t={t} bounce={0.4} />
          </At>
          <At m={ROOFTOP_MARKS.nora}>
            <Nora p={b(NORA_CROSSED, 0.3)} expr="smug" t={t} />
          </At>
          <At m={ROOFTOP_MARKS.claude}>
            <Claude t={t} expr="anxious" />
          </At>
        </>
      );
      break;
  }
  return (
    <FontGate>
      <Stage cam={look.cam} lens={look.lens} bloom={look.bloom} exposure={look.exposure} bg={look.bg} fog={look.fog} env={look.env} overlay={guide ? <SafeGuide /> : null}>
        {body}
      </Stage>
    </FontGate>
  );
};
