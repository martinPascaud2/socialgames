"use client";

import { useEffect, useState } from "react";

import Countdown from "@/components/Options/Countdown";
import ModeSelector from "@/components/Options/ModeSelector";
import AimPoints from "@/components/Options/AimPoints";

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
      <Countdown setOptions={setOptions} min={1} max={7} />
      <AimPoints setOptions={setOptions} min={0} max={30} defaultValue={0} />
    </>
  );
}
