"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import ModeSelector from "@/components/Options/ModeSelector";

export default function PtitbacOptions({
  userId,
  isAdmin,
  options,
  setOptions,
  searchMode,
  adminChangeSameGameNewMode,
  lastMode,
}) {
  const [mode, setMode] = useState(
    searchMode ||
      (isAdmin && lastMode?.mode) ||
      options.mode ||
      "Triaction (random)"
  );
  const [modeList, setModeList] = useState([]);

  useEffect(() => {
    if (!mode) return;
    const loadLasts = async () => {
      const params = await getLastParams({ userId, mode });
      setOptions({ ...params, mode });
    };
    isAdmin && loadLasts();

    setModeList([
      { mode: "Triaction (random)", text: "Triaction (random)" },
      { mode: "Triaction (peek)", text: "Triaction (peek)" },
    ]);
  }, [mode, setOptions, isAdmin, userId]);

  return (
    <>
      <ModeSelector
        isAdmin={isAdmin}
        options={options}
        defaultValue={mode}
        adminChangeSameGameNewMode={adminChangeSameGameNewMode}
        modeList={modeList}
        setMode={setMode}
        setOptions={setOptions}
      />
    </>
  );
}
