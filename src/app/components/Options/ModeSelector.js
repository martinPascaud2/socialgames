"use client";

import { useCallback, useEffect, useState } from "react";

//modeList [{mode: "mode1", text: "text1"}, ...]
export default function ModeSelector({
  isAdmin,
  options,
  defaultValue,
  modeList,
  setMode,
  setOptions,
}) {
  const [value, setValue] = useState();

  useEffect(() => {
    if (!defaultValue) return;
    setValue(defaultValue);
  }, [defaultValue]);

  const Select = useCallback(() => {
    if (!value) return;

    return (
      <div className="flex justify-center">
        {isAdmin ? (
          <select
            defaultValue={value}
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
        ) : (
          <div className="border p-1">{options.mode}</div>
        )}
      </div>
    );
  }, [value, modeList, setMode, setOptions, isAdmin, options]);

  return (
    <div className="flex flex-col items-center m-1">
      <div>Mode de jeu</div>
      {Select()}
    </div>
  );
}
