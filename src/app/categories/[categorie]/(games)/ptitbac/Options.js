"use client";

import { useEffect, useState } from "react";

import Countdown from "@/components/Options/Countdown";
import ModeSelector from "@/components/Options/ModeSelector";
import AimPoints from "@/components/Options/AimPoints";
import PtitbacThemeOption from "./PtitbacThemeOption";

export default function PtitbacOptions({ setOptions, lastMode }) {
  const [mode, setMode] = useState(lastMode?.mode || "P'tit bac");
  const [modeList, setModeList] = useState([]);

  useEffect(() => {
    setOptions((options) => ({ ...options, mode }));

    setModeList([{ mode: "P'tit bac", text: "P'tit bac" }]);
  }, [mode, setOptions]);

  return (
    <div>
      <ModeSelector
        defaultValue={lastMode?.mode || "P'tit bac"}
        modeList={modeList}
        setMode={setMode}
        setOptions={setOptions}
      />
      <Countdown
        setOptions={setOptions}
        min={1}
        max={7}
        last={lastMode?.options?.countDownTime}
      />
      <AimPoints
        setOptions={setOptions}
        min={0}
        max={30}
        defaultValue={lastMode?.options?.aimPoints || 0}
      />
      <PtitbacThemeOption setOptions={setOptions} max={6} />
    </div>
  );
}
