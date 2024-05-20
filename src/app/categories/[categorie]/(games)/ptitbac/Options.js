"use client";

import { useEffect, useState } from "react";

import Countdown from "@/components/Options/Countdown";
import ModeSelector from "@/components/Options/ModeSelector";

export default function PtitbacOptions({ setOptions }) {
  const [mode, setMode] = useState("default");
  const [modeList, setModeList] = useState([]);

  useEffect(() => {
    setOptions((options) => ({ ...options, mode }));

    setModeList([{ mode: "default", text: "P'tit bac" }]);
  }, [mode, setOptions]);
  return (
    <>
      <ModeSelector
        defaultValue="default"
        modeList={modeList}
        setMode={setMode}
        setOptions={setOptions}
      />
      <Countdown setOptions={setOptions} min={2} max={7} />
    </>
  );
}
