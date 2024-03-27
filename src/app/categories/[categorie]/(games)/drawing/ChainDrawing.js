"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { goNextPhase, initChain, addLink, getLastLink } from "./gameActions";

import Draw from "./Draw";
import CountDown from "@/components/CountDown";

export default function ChainDrawing({ roomId, roomToken, user, gameData }) {
  const { gamers, phase, turn, words, finishCountdownDate } = gameData;
  const isAdmin = gameData.admin === user.name;
  const isEven = gamers.length % 2 === 0;

  const [chainIndex, setChainIndex] = useState();
  const [chainRef, setChainRef] = useState();
  const [lastLink, setLastLink] = useState();
  const [data, setData] = useState();
  const [guess, setGuess] = useState("");
  const [hasValidated, setHasValidated] = useState(false);
  const [timeoutId, setTimeoutId] = useState();

  useEffect(() => {
    if (turn !== 0) return;
    console.log("chiffre 11111111", words);
    const index = user.multiGuest
      ? words.findIndex((word) => word.DCuserID === user.dataId)
      : words.findIndex((word) => word.DCuserID === user.id);
    setChainIndex(index);
    setChainRef(words[index]);
  }, [words, user]);

  useEffect(() => {
    if (!data || !hasValidated) return;
    console.log("chiffre 2222222");
    const send = async () => {
      await addLink({
        userName: user.name,
        chainRef,
        data,
        type: phase === "drawing" ? "draw" : "word",
        roomToken,
        gameData,
      });
    };
    send();
  }, [data, hasValidated]);
  // }, [hasValidated]);

  useEffect(() => {
    if (turn !== 0 || !chainRef) return;
    console.log("chiffre 333333");
    const addFirstLink = async () => {
      await initChain({
        userName: user.name,
        chainRef,
      });
    };
    addFirstLink();
  }, [chainRef]);

  useEffect(() => {
    if (turn === 0) return;
    console.log("chiffre 44444");
    const newChainIndex =
      isEven && turn === 1 ? chainIndex : (chainIndex + 1) % words.length;
    setChainIndex(newChainIndex);
    const newChainRef = words[newChainIndex];
    setChainRef(newChainRef);

    setGuess("");
    setData();
    setHasValidated(false);
  }, [turn]);

  useEffect(() => {
    if (
      typeof chainIndex === "undefined" ||
      !chainRef ||
      turn === 0 ||
      hasValidated
    )
      return;
    console.log("chiffre 555555");

    const getLast = async () => {
      const newLastLink = await getLastLink({ chainRef });
      setLastLink(newLastLink);
    };
    getLast();

    const manageDrawing = async () => {
      if (phase === "drawing") {
        setTimeoutId(
          setTimeout(async () => {
            isAdmin && (await goNextPhase({ roomToken, gameData, full: true }));
          }, finishCountdownDate - Date.now() + 2000)
        );
      } else {
        console.log("clear");
        clearTimeout(timeoutId);
      }

      return () => {
        clearTimeout(timeoutId);
      };
    };
    manageDrawing();

    setGuess("");
    setData();
    setHasValidated(false);

    // }, [turn]);
  }, [chainRef]);

  // console.log("user", user);
  // console.log("gameData", gameData);
  // console.log("chainIndex", chainIndex);
  // console.log("chainRef", chainRef);
  // console.log("lastLink", lastLink);
  // console.log("chainIndex", chainIndex);
  // console.log("chainRef", chainRef);
  // console.log("lastLink", lastLink);
  console.log("data", data);
  console.log("hasValidated", hasValidated);
  console.log("turn", turn);
  console.log("phase", phase);
  console.log("timeoutId", timeoutId);

  return (
    <>
      <div>mode chaîné</div>
      {phase === "waiting" && (
        <>
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

      {phase === "drawing" && lastLink?.type === "word" && (
        <>
          {!hasValidated ? (
            <>
              <div className="flex justify-center">
                Mot à dessiner :
                <span className="font-semibold">
                  &nbsp;{lastLink && lastLink.data}
                </span>
              </div>
              <Draw
                setImgData={setData}
                //   setSvg={setSvg}
                //   setPath={setPath}
                setHasValidated={setHasValidated}
                finishCountdownDate={finishCountdownDate}
              />
            </>
          ) : (
            <div className="flex justify-center">
              Hop ! C&apos;est envoyé ! On attend les autres...
            </div>
          )}

          <div className="flex justify-center">
            <CountDown finishCountdownDate={finishCountdownDate} />
          </div>
        </>
      )}

      {phase === "guessing" &&
        lastLink?.type === "draw" &&
        lastLink?.data.startsWith("data:image") && (
          <>
            <div
              style={{
                position: "relative",
                width: "auto",
                height: "50vh",
                // left: "5vw",
              }}
            >
              <Image
                src={lastLink.data}
                alt="drawing-png"
                // sizes="500px"
                fill
                style={{
                  objectFit: "contain",
                }}
              />
            </div>
            {!hasValidated ? (
              <>
                <div>Qu&apos;est-ce que ça représente ???</div>
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  className="border focus:outline-none focus:border-2"
                />

                <button
                  onClick={() => {
                    setData(guess);
                    setHasValidated(true);
                  }}
                  className="border border-blue-300 bg-blue-100"
                >
                  Envoi
                </button>
              </>
            ) : (
              <div>Envoyé ! On attend les autres...</div>
            )}
          </>
        )}
    </>
  );
}
