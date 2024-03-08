"use client";

import MakeTeams from "@/components/Options/MakeTeams";
import Countdown from "@/components/Options/Countdown";
import AimPoints from "@/components/Options/AimPoints";

export default function DrawingOptions({ setOptions }) {
  return (
    <>
      <MakeTeams setOptions={setOptions} />
      <Countdown setOptions={setOptions} min={1} max={5} />
      <AimPoints setOptions={setOptions} min={3} max={10} defaultValue={5} />
    </>
  );
}
