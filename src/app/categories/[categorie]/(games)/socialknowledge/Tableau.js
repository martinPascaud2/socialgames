"use client";

import { useEffect, useState } from "react";

import { startGame, sendResponse, writtingComeBack } from "./gameActions";

import NextStep from "@/components/NextStep";

export default function Tableau({ roomId, roomToken, user, gameData }) {
  const { phase, enhanced, randoms } = gameData;
  const isAdmin = gameData.admin === user.name;
  const [writtenIndex, setWrittenIndex] = useState(0);
  const [response, setResponse] = useState("");

  const [isComingBack, setIsComingBack] = useState(true);
  const [message, setMessage] = useState("");

  const allThemes = [...enhanced, ...randoms]; // useMemo

  useEffect(() => {
    const comeBack = async () => {
      if (phase === "waiting") {
        setIsComingBack(false);
      } else if (phase === "writing" && isComingBack === true) {
        const savedWrittenIndex = await writtingComeBack({ user });
        setWrittenIndex(savedWrittenIndex);
        setIsComingBack(false);
      }
    };
    comeBack();
  }, [phase]);

  console.log("gameData", gameData);

  return (
    <div className="flex flex-col items-center p-2 h-full">
      {phase === "waiting" && (
        <>
          <div>L&apos;admin va lancer la partie...</div>
          {isAdmin && (
            <NextStep
              onClick={() => startGame({ gameData, roomId, roomToken })}
            >
              Lancer
            </NextStep>
          )}
        </>
      )}

      {phase === "writing" && (
        <div className="flex flex-col justify-center items-center h-full">
          {writtenIndex < allThemes.length ? (
            <>
              <div className="font-semibold m-2">{allThemes[writtenIndex]}</div>
              <input
                value={response}
                onChange={(e) => {
                  setResponse(e.target.value);
                  setMessage("");
                }}
                className="border text-center m-2 w-full"
              />
              <div className="w-full m-2 relative">
                <button
                  onClick={() => {
                    if (response.length < 4) setMessage("Réponse trop courte");
                    else {
                      sendResponse({
                        theme: allThemes[writtenIndex],
                        response,
                        gameData,
                        roomId,
                        roomToken,
                        user,
                        isLast: writtenIndex === allThemes.length - 1,
                      });
                      setWrittenIndex((prevIndex) => prevIndex + 1);
                      setResponse("");
                    }
                  }}
                  className="border border-blue-300 bg-blue-100 w-full"
                >
                  Envoyer
                </button>
                <div className="w-full text-center absolute top-8 italic">
                  {message}
                </div>
              </div>
            </>
          ) : (
            <div>En attente des autres joueurs...</div>
          )}
        </div>
      )}

      {phase === "sorting" && <div>Triage</div>}
    </div>
  );
}
