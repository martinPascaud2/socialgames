"use client";

import { useEffect, useState } from "react";

import ModeSelector from "@/components/Options/ModeSelector";

export default function TriactionOptions({ setOptions }) {
  const [mode, setMode] = useState("random");
  const [modeList, setModeList] = useState([]);

  useEffect(() => {
    setOptions((options) => ({ ...options, mode }));

    setModeList([
      { mode: "random", text: "Aléatoire" },
      { mode: "peek", text: "Peek" },
    ]);
  }, [mode, setOptions]);

  return (
    <>
      <ModeSelector
        defaultValue="random"
        modeList={modeList}
        setMode={setMode}
        setOptions={setOptions}
      />
    </>
  );
}
