// review still of the locked title card (bible §9)
import React from "react";
import { FontGate, TitleCard } from "../look/overlay";
export const TitleStill: React.FC<{ title: string; heroine: "mika" | "nora" }> = ({ title, heroine }) => (
  <FontGate>
    <TitleCard title={title} heroine={heroine} t={60} />
  </FontGate>
);
