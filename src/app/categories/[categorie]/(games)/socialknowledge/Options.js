"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import ModeSelector from "@/components/Options/ModeSelector";

export default function SocialKnowledgeOptions({
  userId,
  isAdmin,
  options,
  lastMode,
  setOptions,
}) {
  const [mode, setMode] = useState(
    (isAdmin && lastMode?.mode) || options.mode || "Tableau"
  );
  const [modeList, setModeList] = useState([]);

  useEffect(() => {
    const loadLasts = async () => {
      const params = await getLastParams({ userId, mode });
      setOptions({ ...params, mode });
    };
    isAdmin && loadLasts();

    setModeList([{ mode: "Tableau", text: "Tableau" }]);
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
