"use client";

import { useEffect, useState } from "react";

export default function MemoryOptions({ setOptions, lastMode }) {
  const [pairsNumber, setPairsNumber] = useState(
    lastMode?.options?.pairsNumber || 12
  );

  useEffect(() => {
    // if (pairsNumber < 8) setPairsNumber(8);
    if (pairsNumber < 8) setPairsNumber(8);
    // if (pairsNumber > 20) setPairsNumber(20);
    if (pairsNumber > 12) setPairsNumber(12);
    setOptions((options) => ({ ...options, pairsNumber }));
  }, [pairsNumber]);

  return (
    <div className="m-4 flex flex-col items-center">
      <div>Nombre de paires</div>
      <div className="border w-[60%] flex">
        <button
          onClick={() => setPairsNumber((pairs) => pairs - 2)}
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
  );
}
