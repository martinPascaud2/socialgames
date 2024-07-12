"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import ModeSelector from "@/components/Options/ModeSelector";
import MemoryThemeOption from "./MemoryThemeOption";

export default function MemoryOptions({
  isAdmin,
  options,
  setOptions,
  lastMode,
  userId,
  setServerMessage,
  //for new games
  modeSelector = true,
}) {
  // const [mode, setMode] = useState(lastMode?.mode || "Memory");
  const [mode, setMode] = useState(
    (isAdmin && lastMode?.mode) || options?.mode || "Memory"
  );

  const [lastParams, setLastParams] = useState();
  const [modeList, setModeList] = useState([]);
  const [pairsNumber, setPairsNumber] = useState(12);
  const [selectedThemes, setSelectedThemes] = useState([]);

  useEffect(() => {
    const loadLasts = async () => {
      const params = await getLastParams({ userId, mode });
      setLastParams(params);
      setOptions({ ...params, mode });
    };
    isAdmin && setOptions && loadLasts();

    setModeList([{ mode: "Memory", text: "Memory" }]);
  }, [mode, setOptions, isAdmin, userId]);

  useEffect(() => {
    if (pairsNumber < 8) setPairsNumber(8);
    if (pairsNumber > 12) setPairsNumber(12);
    // isAdmin && setOptions((options) => ({ ...options, pairsNumber }));
    isAdmin &&
      setOptions &&
      setOptions((options) => ({ ...options, pairsNumber }));
  }, [pairsNumber, isAdmin, setOptions]);
  // }, [pairsNumber, setOptions, isAdmin]);

  useEffect(() => {
    // if (!lastParams) return;
    if (!lastParams || !isAdmin) return;
    lastParams.pairsNumber && setPairsNumber(lastParams.pairsNumber);
  }, [lastParams, isAdmin]);

  useEffect(() => {
    if (isAdmin || !options) return;
    setMode(options.mode);
    setPairsNumber(options.pairsNumber);
    setSelectedThemes(options.themes);
  }, [isAdmin, options]);

  // useEffect(() => {
  //   if (!isAdmin || !onNewGameOptions) return;
  //   const syncOptions = async () => {
  //     await onNewGameOptions();
  //   };
  //   syncOptions();
  //   }, [isAdmin, onNewGameOptions]);

  console.log("isAdmin", isAdmin);
  console.log("selectedThemes options simples", selectedThemes);
  console.log("options memory options", options);
  console.log("modeSelector", modeSelector);

  return (
    <div>
      {modeSelector && (
        <ModeSelector
          isAdmin={isAdmin}
          options={options}
          defaultValue={mode}
          modeList={modeList}
          setMode={setMode}
          setOptions={setOptions}
        />
      )}

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
            className={`mr-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center ${
              !isAdmin ? "collapse" : ""
            }`}
          >
            -
          </button>
          <div className="flex items-center">{pairsNumber}</div>
          <button
            onClick={() => setPairsNumber((pairs) => pairs + 2)}
            className={`ml-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center ${
              !isAdmin ? "collapse" : ""
            }`}
          >
            +
          </button>
        </div>
      </div>
      <MemoryThemeOption
        isAdmin={isAdmin}
        setOptions={setOptions}
        selectedThemes={selectedThemes}
        setSelectedThemes={setSelectedThemes}
        max={pairsNumber}
        setServerMessage={setServerMessage}
        lastParams={lastParams}
      />
    </div>
  );
}
