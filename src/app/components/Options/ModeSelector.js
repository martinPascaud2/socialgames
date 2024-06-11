"use client";

import { useCallback } from "react";

//modeList [{mode: "mode1", text: "text1"}, ...]
export default function ModeSelector({
  defaultValue,
  modeList,
  setMode,
  setOptions,
}) {
  const Select = useCallback(() => {
    return (
      <div className="flex justify-center">
        <select
          defaultValue={defaultValue || modeList[0]}
          onChange={(e) => (
            setMode(e.target.value),
            setOptions((options) => ({ ...options, mode: e.target.value }))
          )}
          className="border border-blue-300 bg-blue-100 p-1"
        >
          {modeList.map((mode) => (
            <option key={mode.mode} value={mode.mode}>
              {mode.text}
            </option>
          ))}
        </select>
      </div>
    );
  }, [defaultValue, modeList, setMode, setOptions]);

  return (
    <div className="flex flex-col items-center m-1">
      <div>Mode de jeu</div>
      <Select />
    </div>
  );
}
