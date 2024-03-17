"use client";

import { useEffect, useState } from "react";

import ModeSelector from "@/components/Options/ModeSelector";
import MakeTeams from "@/components/Options/MakeTeams";
import Countdown from "@/components/Options/Countdown";
import AimPoints from "@/components/Options/AimPoints";

export default function DrawingOptions({ setOptions }) {
  const [mode, setMode] = useState("team");
  const [modeList, setModeList] = useState([]);

  useEffect(() => {
    setOptions((options) => ({ ...options, mode }));

    setModeList([
      { mode: "team", text: "Par équipes" },
      { mode: "chain", text: "Chaîné (esquissé)" },
    ]);
  }, [mode, setOptions]);

  return (
    <>
      <ModeSelector
        defaultValue="team"
        modeList={modeList}
        setMode={setMode}
        setOptions={setOptions}
      />

      {mode === "team" && (
        <>
          <MakeTeams setOptions={setOptions} />
          <Countdown setOptions={setOptions} min={1} max={5} />
          <AimPoints
            setOptions={setOptions}
            min={3}
            max={10}
            defaultValue={5}
          />
        </>
      )}

      {mode === "chain" && (
        <>
          <Countdown setOptions={setOptions} min={1} max={5} />
        </>
      )}
    </>
  );
}
