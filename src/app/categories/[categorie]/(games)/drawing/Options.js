"use client";

import { useEffect, useState } from "react";

import ModeSelector from "@/components/Options/ModeSelector";
import MakeTeams from "@/components/Options/MakeTeams";
import Countdown from "@/components/Options/Countdown";
import AimPoints from "@/components/Options/AimPoints";

export default function DrawingOptions({ setOptions, lastMode }) {
  const [mode, setMode] = useState(lastMode?.mode || "Pictionary");
  const [modeList, setModeList] = useState([]);

  useEffect(() => {
    setOptions((options) => ({ ...options, mode }));

    setModeList([
      { mode: "Pictionary", text: "Pictionary" },
      { mode: "Esquissé", text: "Esquissé" },
    ]);
  }, [mode, setOptions]);

  // const same = lastMode.mode === mode; //can be used

  return (
    <>
      <ModeSelector
        defaultValue={mode}
        modeList={modeList}
        setMode={setMode}
        setOptions={setOptions}
      />

      {mode === "Pictionary" && (
        <>
          <MakeTeams
            setOptions={setOptions}
            last={lastMode?.options?.teamMode}
          />
          <Countdown
            setOptions={setOptions}
            min={1}
            max={5}
            last={lastMode?.options?.countDownTime}
          />
          <AimPoints
            setOptions={setOptions}
            min={3}
            max={10}
            defaultValue={lastMode?.options?.aimPoints || 5}
          />
        </>
      )}

      {mode === "Esquissé" && (
        <>
          <Countdown
            setOptions={setOptions}
            min={1}
            max={5}
            last={lastMode?.options?.countDownTime}
          />
        </>
      )}
    </>
  );
}
