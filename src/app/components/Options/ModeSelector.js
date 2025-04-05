"use client";

import { useCallback, useEffect, useState } from "react";
import compareState from "@/utils/compareState";

//modeList [{mode: "mode1", text: "text1"}, ...]
export default function ModeSelector({
  isAdmin,
  options,
  defaultValue,
  adminChangeSameGameNewMode,
  modeList,
  setMode,
  setOptions,
}) {
  const [value, setValue] = useState();

  useEffect(() => {
    if (!defaultValue) return;
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (!adminChangeSameGameNewMode || !isAdmin) return;

    setValue(adminChangeSameGameNewMode);
    setMode(adminChangeSameGameNewMode);
    setOptions((prevOptions) => {
      const newOptions = { ...options, mode: adminChangeSameGameNewMode };
      return compareState(prevOptions, newOptions);
    });
  }, [adminChangeSameGameNewMode, isAdmin, options, setOptions, setMode]);

  const Select = useCallback(() => {
    if (!value) return;

    return (
      <div className="flex justify-center">
        {isAdmin ? (
          <select
            value={value}
            onChange={(e) => (
              setMode(e.target.value),
              setOptions((prevOptions) => {
                const newOptions = { ...options, mode: e.target.value };
                return compareState(prevOptions, newOptions);
              })
            )}
            className="border border-amber-700 bg-amber-100 text-amber-700 text-xl p-1"
          >
            {modeList.map((mode) => (
              <option key={mode.mode} value={mode.mode}>
                {mode.text}
              </option>
            ))}
          </select>
        ) : (
          <div className="font-semibold text-xl">{options.mode}</div>
        )}
      </div>
    );
  }, [value, modeList, setMode, setOptions, isAdmin, options]);

  return (
    <div className="flex w-full items-center justify-center mt-2 mb-4">
      {Select()}
    </div>
  );
}
