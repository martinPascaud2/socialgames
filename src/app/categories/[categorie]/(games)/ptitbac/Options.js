"use client";

import Countdown from "@/components/Options/Countdown";

export default function PtitbacOptions({ setOptions }) {
  return (
    <>
      <Countdown setOptions={setOptions} min={2} max={7} />
    </>
  );
}
