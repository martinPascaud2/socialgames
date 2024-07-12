"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import ModeSelector from "@/components/Options/ModeSelector";

export default function PtitbacOptions({
  userId,
  isAdmin,
  options,
  setOptions,
  lastMode,
}) {
  const [mode, setMode] = useState(
    (isAdmin && lastMode?.mode) || options.mode || "Triaction (random)"
  );
  // const [mode, setMode] = useState(lastMode?.mode || "Triaction (random)");
  const [lastParams, setLastParams] = useState();
  const [modeList, setModeList] = useState([]);

  useEffect(() => {
    const loadLasts = async () => {
      const params = await getLastParams({ userId, mode });
      setLastParams(params);
      setOptions({ ...params, mode });
    };
    isAdmin && loadLasts();

    setModeList([
      { mode: "Triaction (random)", text: "Triaction (random)" },
      // { mode: "Triaction (random)", text: "Aléatoire" },
      { mode: "Triaction (peek)", text: "Triaction (peek)" },
    ]);
  }, [mode, setOptions, isAdmin, userId]);

  return (
    <>
      <ModeSelector
        isAdmin={isAdmin}
        options={options}
        defaultValue={mode}
        modeList={modeList}
        setMode={setMode}
        setOptions={setOptions}
      />
    </>
  );
}
