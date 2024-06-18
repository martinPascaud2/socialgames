"use client";

import { useEffect, useState } from "react";

import ModeSelector from "@/components/Options/ModeSelector";
import MemoryThemeOption from "./MemoryThemeOption";

export default function MemoryOptions({
  setOptions,
  lastMode,
  setServerMessage,
}) {
  const [mode, setMode] = useState(lastMode?.mode || "Memory");
  const [modeList, setModeList] = useState([]);

  const [pairsNumber, setPairsNumber] = useState(
    lastMode?.options?.pairsNumber || 12
  );
  const [selectedThemes, setSelectedThemes] = useState([]);

  useEffect(() => {
    setOptions((options) => ({ ...options, mode }));

    setModeList([{ mode: "Memory", text: "Memory" }]);
  }, [mode, setOptions]);

  useEffect(() => {
    if (pairsNumber < 8) setPairsNumber(8);
    if (pairsNumber > 12) setPairsNumber(12);
    setOptions((options) => ({ ...options, pairsNumber }));
  }, [pairsNumber]);

  return (
    <div>
      <ModeSelector
        defaultValue={mode}
        modeList={modeList}
        setMode={setMode}
        setOptions={setOptions}
      />

      <div className="m-4 flex flex-col items-center">
        <div>Nombre de paires</div>
        <div className="border w-[60%] flex">
          <button
            onClick={() => {
              const newPairsNumber = pairsNumber - 2;
              if (newPairsNumber < selectedThemes.length) {
                setServerMessage("coucou"); // can be used
                return;
              }
              setPairsNumber((pairs) => pairs - 2);
            }}
            className="mr-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
          >
            -
          </button>
          <div className="flex items-center">{pairsNumber}</div>
          <button
            onClick={() => setPairsNumber((pairs) => pairs + 2)}
            className="ml-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
          >
            +
          </button>
        </div>
      </div>
      <MemoryThemeOption
        setOptions={setOptions}
        selectedThemes={selectedThemes}
        setSelectedThemes={setSelectedThemes}
        max={pairsNumber}
        setServerMessage={setServerMessage}
        lastMode={lastMode}
      />
    </div>
  );
}
