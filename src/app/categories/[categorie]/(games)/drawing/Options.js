"use client";

import { useEffect, useState } from "react";

export default function DrawingOptions({ setOptions, gameData }) {
  const [teamNumber, setTeamNumber] = useState(2);

  useEffect(() => {
    if (teamNumber < 2) setTeamNumber(2);
    setOptions((options) => ({ ...options, teamNumber }));
  }, [teamNumber]);

  return (
    <div className="m-4 flex flex-col items-center">
      <div>Joueurs minimum par équipe</div>
      <div className="border w-[60%] flex">
        <button
          onClick={() => setTeamNumber((teams) => teams - 1)}
          className="mr-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
        >
          -
        </button>
        <div className="flex items-center">{teamNumber}</div>
        <button
          onClick={() => setTeamNumber((teams) => teams + 1)}
          className="ml-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}
