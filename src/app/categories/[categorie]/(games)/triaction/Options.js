"use client";

import { useEffect, useState } from "react";

import ModeSelector from "@/components/Options/ModeSelector";

export default function TriactionOptions({ setOptions, lastMode }) {
  const [mode, setMode] = useState(lastMode?.mode || "Triaction (random)");
  const [modeList, setModeList] = useState([]);

  useEffect(() => {
    setOptions((options) => ({ ...options, mode }));

    setModeList([
      { mode: "Triaction (random)", text: "Aléatoire" },
      { mode: "Triaction (peek)", text: "Triaction (peek)" },
    ]);
  }, [mode, setOptions]);

  return (
    <>
      <ModeSelector
        defaultValue={lastMode?.mode || "Triaction (random)"}
        modeList={modeList}
        setMode={setMode}
        setOptions={setOptions}
      />
    </>
  );
}
