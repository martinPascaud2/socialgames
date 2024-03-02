"use client";

import MakeTeams from "@/components/Options/MakeTeams";
import Countdown from "@/components/Options/Countdown";

export default function DrawingOptions({ setOptions }) {
  return (
    <>
      <MakeTeams setOptions={setOptions} />
      <Countdown setOptions={setOptions} min={1} max={5} />
    </>
  );
}
