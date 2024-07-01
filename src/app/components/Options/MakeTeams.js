"use client";

import { useEffect, useState } from "react";

export default function MakeTeams({ setOptions, last }) {
  const [minByTeam, setMinByTeam] = useState(2);
  const [teamsNumber, setTeamsNumber] = useState(2);
  const [teamMode, setTeamMode] = useState(last?.teamMode || "teamNumber");

  useEffect(() => {
    if (!last) return;
    setMinByTeam(last.minByTeam);
    setTeamsNumber(last.teamsNumber);
    setTeamMode(last.teamMode);
  }, [last]);

  useEffect(() => {
    setOptions((options) => ({ ...options, teamMode }));
  }, [teamMode]);

  useEffect(() => {
    if (minByTeam < 2) setMinByTeam(2);
    setOptions((options) => ({ ...options, minByTeam }));
  }, [minByTeam]);

  useEffect(() => {
    if (teamsNumber < 2) setTeamsNumber(2);
    setOptions((options) => ({ ...options, teamsNumber }));
  }, [teamsNumber]);

  return (
    <div className="m-1 flex flex-col items-center">
      <div>Constitution des équipes</div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          className={`border ${
            teamMode === "teamNumber"
              ? "border-2 border-blue-500"
              : "border border-blue-300"
          } bg-blue-100`}
          onClick={() => {
            setTeamMode("teamNumber");
          }}
        >
          Nombre d&apos;équipes
        </button>
        <button
          type="button"
          className={`border ${
            teamMode === "minimum"
              ? "border-2 border-blue-500"
              : "border border-blue-300"
          } bg-blue-100`}
          onClick={() => {
            setTeamMode("minimum");
          }}
        >
          Joueurs par équipe
        </button>
      </div>

      {teamMode === "teamNumber" && (
        <div className="border w-[60%] flex mt-1">
          <button
            onClick={() => setTeamsNumber((teams) => teams - 1)}
            className="mr-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
          >
            -
          </button>
          <div className="flex items-center">{teamsNumber} équipes</div>
          <button
            onClick={() => setTeamsNumber((teams) => teams + 1)}
            className="ml-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
          >
            +
          </button>
        </div>
      )}

      {teamMode === "minimum" && (
        <div className="border w-[60%] flex mt-1">
          <button
            onClick={() => setMinByTeam((teams) => teams - 1)}
            className="mr-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
          >
            -
          </button>
          <div className="flex items-center">au moins {minByTeam}</div>
          <button
            onClick={() => setMinByTeam((teams) => teams + 1)}
            className="ml-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
