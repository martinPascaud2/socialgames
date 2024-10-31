"use client";

import { useEffect, useState } from "react";

import compareState from "@/utils/compareState";

export default function OptionsLabel({
  isAdmin,
  options,
  setOptions,
  param,
  values,
  last,
}) {
  const [value, setValue] = useState(
    last || options[param.value] || values.default
  );

  useEffect(() => {
    if (!isAdmin || !value) return;
    setOptions((prevOptions) => {
      const newOptions = {
        ...options,
        [param.value]: value,
      };
      return compareState(prevOptions, newOptions);
    });
  }, [value, isAdmin]);

  return (
    <div className="flex flex-col items-center m-1">
      <div>{param.label}</div>

      <div className="flex justify-center">
        {isAdmin ? (
          <select
            defaultValue={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            className="border border-blue-300 bg-blue-100 p-1 text-center"
          >
            {values.possibles.map((possible) => (
              <option key={possible.value} value={possible.value}>
                {possible.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="border p-1">
            {(() =>
              values.possibles.find(
                (possible) => possible.value === options[param.value]
              ).label)()}
          </div>
        )}
      </div>
    </div>
  );
}
