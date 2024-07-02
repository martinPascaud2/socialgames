"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import Countdown from "@/components/Options/Countdown";
import ModeSelector from "@/components/Options/ModeSelector";
import AimPoints from "@/components/Options/AimPoints";
import PtitbacThemeOption from "./PtitbacThemeOption";

export default function PtitbacOptions({
  setOptions,
  userId,
  lastMode,
  setServerMessage,
}) {
  const [mode, setMode] = useState(lastMode?.mode || "P'tit bac");
  const [lastParams, setLastParams] = useState();
  const [modeList, setModeList] = useState([]);

  useEffect(() => {
    const loadLasts = async () => {
      const params = await getLastParams({ userId, mode });
      setLastParams(params);
      setOptions({ ...params, mode });
    };
    loadLasts();

    setModeList([{ mode: "P'tit bac", text: "P'tit bac" }]);
  }, [mode, setOptions]);

  return (
    <div>
      <ModeSelector
        defaultValue={mode}
        modeList={modeList}
        setMode={setMode}
        setOptions={setOptions}
      />
      <Countdown
        setOptions={setOptions}
        min={1}
        max={7}
        last={lastParams?.countDownTime}
      />
      <AimPoints
        setOptions={setOptions}
        min={0}
        max={30}
        defaultValue={lastParams?.aimPoints || 0}
      />
      <PtitbacThemeOption
        setOptions={setOptions}
        max={6}
        lastParams={lastParams}
        setServerMessage={setServerMessage}
      />
    </div>
  );
}
