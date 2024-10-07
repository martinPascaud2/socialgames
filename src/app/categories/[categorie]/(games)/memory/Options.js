"use client";

import { useEffect, useState } from "react";

import getLastParams from "@/utils/getLastParams";

import ModeSelector from "@/components/Options/ModeSelector";
import MemoryThemeOption from "./MemoryThemeOption";
import Spinner from "@/components/spinners/Spinner";

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
  const [mode, setMode] = useState(
    (isAdmin && lastMode?.mode) || options?.mode || "Memory"
  );
  const [lastParams, setLastParams] = useState();
  const [modeList, setModeList] = useState([]);
  const [pairsNumber, setPairsNumber] = useState(12);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    const loadLasts = async () => {
      const params = await getLastParams({ userId, mode });
      setLastParams(params);
      setOptions({ ...params, mode });
      setIsFetched(true);
    };
    isAdmin && setOptions && loadLasts();
    !isAdmin && setIsFetched(true);

    setModeList([{ mode: "Memory", text: "Memory" }]);
  }, [mode, setOptions, isAdmin, userId]);

  useEffect(() => {
    if (pairsNumber < 8) setPairsNumber(8);
    if (pairsNumber > 12) setPairsNumber(12);

    isAdmin &&
      setOptions &&
      setOptions((options) => ({ ...options, pairsNumber }));
  }, [pairsNumber, isAdmin, setOptions]);

  useEffect(() => {
    if (!lastParams || !isAdmin) return;
    lastParams.pairsNumber && setPairsNumber(lastParams.pairsNumber);
  }, [lastParams, isAdmin]);

  useEffect(() => {
    if (isAdmin || !options) return;
    setMode(options.mode);
    setPairsNumber(options.pairsNumber);
    setSelectedThemes(options.themes);
  }, [isAdmin, options]);

  return (
    <div>
      {!isFetched ? (
        <Spinner />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
