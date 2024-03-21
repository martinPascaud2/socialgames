"use client";

import { useEffect, useState } from "react";

import { goNextPhase, initChain, addLink } from "./gameActions";

import Draw from "./Draw";

export default function ChainDrawing({ roomId, roomToken, user, gameData }) {
  console.log("user", user);
  console.log("gameData", gameData);

  const { gamers, phase, turn, words } = gameData;
  const isAdmin = gameData.admin === user.name;
  const isEven = gamers.length % 2 === 0;

  const [chainIndex, setChainIndex] = useState();
  const [chainRef, setChainRef] = useState();
  const [lastLink, setLastLink] = useState();

  useEffect(() => {
    const index = user.multiGuest
      ? words.findIndex((word) => word.DCuserID === user.dataId)
      : words.findIndex((word) => word.DCuserID === user.id);
    setChainIndex(index);
    setChainRef(words[index]);
  }, [words, user]);
  console.log("chainIndex", chainIndex);

  const [hasValidated, setHasValidated] = useState(false);

  useEffect(() => {
    if (!chainIndex) return;

    const addFirstLink = async () => {
      // await addLink({
      //   userName: user.name,
      //   chainRef,
      //   data: chainRef.word,
      //   type: "word",
      // });
      await initChain({
        userName: user.name,
        chainRef,
      });
    };
    if (turn === 0 && chainRef) {
      addFirstLink();
    } else {
      const newChainIndex =
        isEven && turn === 1 ? chainIndex : (chainIndex + 1) % words.length;
      setChainIndex(newChainIndex);
      setChainRef(words[newChainIndex]);
    }
  }, [turn, user]);

  return (
    <>
      <div>mode chaîné</div>
      {phase === "waiting" && (
        <>
          {/* {gamers.length % 2 === 1 ? ( */}
          {!isEven ? (
            <>
              <div>
                Votre mot de départ :{" "}
                <span className="font-semibold">{chainRef?.word}</span>
              </div>
              {!hasValidated ? (
                <button
                  onClick={() => {
                    goNextPhase({ roomToken, gameData });
                    setHasValidated(true);
                  }}
                  className="border border-blue-300 bg-blue-100"
                >
                  Ok !
                </button>
              ) : (
                <div>On attend les autres joueurs</div>
              )}
            </>
          ) : (
            <>
              {isAdmin ? (
                <button
                  onClick={() =>
                    goNextPhase({ roomToken, gameData, full: true })
                  }
                  className="border border-blue-300 bg-blue-100"
                >
                  Tout le monde est prêt ?
                </button>
              ) : (
                <div>Ça va commencer !</div>
              )}
            </>
          )}
        </>
      )}

      {/* {phase === "drawing" && (
        <>
          <>
            <div className="flex justify-center">
              Mot à dessiner :
              <span className="font-semibold">&nbsp;{word}</span>
            </div>

            {!hasValidated ? (
              <Draw
                setImgData={setImgData}
                //   setSvg={setSvg}
                //   setPath={setPath}
                setHasValidated={setHasValidated}
                finishCountdownDate={finishCountdownDate}
              />
            ) : (
              <div className="flex justify-center">
                Hop ! C&apos;est envoyé ! On attend les autres...
              </div>
            )}
          </>

          <div className="flex justify-center">
            <CountDown finishCountdownDate={finishCountdownDate} />
          </div>
        </>
      )} */}
    </>
  );
}
