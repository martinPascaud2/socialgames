"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  goNextPhase,
  initChain,
  addLink,
  getLastLink,
  goNextShow,
  getNextLink,
} from "./gameActions";

import NextStep from "@/components/NextStep";
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
  const [hasComeback, setHasComeback] = useState();
  const [CBHadValidated, setCBHadValidated] = useState();
  const [timeoutId, setTimeoutId] = useState();

  const [showedGamer, setShowedGamer] = useState("");
  const [showedLinks, setShowedLinks] = useState([]);
  const [isShower, setIsShower] = useState(false);

  console.log("gameData", gameData);
  console.log("isEven", isEven);
  console.log("chainIndex", chainIndex);
  console.log("chainRef", chainRef);
  console.log("lastLink", lastLink);
  console.log("data", data);
  console.log("guess", guess);
  console.log("hasValidated", hasValidated);
  console.log("CBHadValidated", CBHadValidated);
  console.log("hasComeback", hasComeback);
  console.log("timeoutId", timeoutId);
  console.log("showedGamer", showedGamer);
  console.log("showedLinks", showedLinks);
  console.log("isShower", isShower);
  console.log("user", user);
  console.log("phase", phase);
  console.log("turn", turn);

  useEffect(() => {
    // if (turn !== 0) return;
    if (turn !== 0 || !words || !user || hasComeback === true) return;

    const index = user.multiGuest
      ? words.findIndex((word) => word.DCuserID === user.dataId)
      : words.findIndex((word) => word.DCuserID === user.id);

    setChainIndex(index);
    setChainRef(words[index]);
  }, [words, user]);

  useEffect(() => {
    if (!data || !hasValidated) return;

    const send = async () => {
      await addLink({
        userName: user.name,
        chainRef,
        data,
        type: phase === "drawing" ? "draw" : "word",
        roomId,
        roomToken,
        gameData,
      });
    };
    send();
  }, [data, hasValidated]);

  useEffect(() => {
    if (turn !== 0 || !chainRef) return;

    const addFirstLink = async () => {
      await initChain({
        userName: user.name,
        chainRef,
      });
    };
    addFirstLink();
  }, [chainRef]);

  useEffect(() => {
    // if (turn === 0) return;
    if (turn === 0 || hasComeback === true) return;

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
      hasValidated ||
      !user ||
      !gameData ||
      !roomId ||
      !roomToken ||
      isAdmin === undefined ||
      !phase ||
      !finishCountdownDate
    )
      return;

    // const getLast = async () => {
    //   const newLastLink = await getLastLink({
    //     chainRef,
    //     skip: CBHadValidated ? 1 : 0,
    //   });
    //   setLastLink(newLastLink);
    // };
    // getLast();

    const manageDrawing = async () => {
      if (phase === "drawing") {
        setTimeoutId(
          setTimeout(async () => {
            isAdmin &&
              (await goNextPhase({
                userName: user.name,
                roomId,
                roomToken,
                gameData,
                full: true,
              }));
          }, finishCountdownDate - Date.now() + 2000)
        );
      } else {
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

    setHasComeback(false);
    // setCBHadValidated(false);
  }, [chainRef, user]);

  useEffect(() => {
    if (!phase.startsWith("showing")) return;

    const [, showedGamerIndex, showedLinkIndex] = phase
      .split("-")
      .map((index) => parseInt(index));
    setShowedGamer(gamers[showedGamerIndex].name);

    const shower = words[showedGamerIndex];
    if (shower.DCuserID === user.id) setIsShower(true);
    else setIsShower(false);

    const get = async () => {
      const newLink = await getNextLink({ shower, showedLinkIndex });
      if (showedLinkIndex === 1) setShowedLinks([newLink]);
      else setShowedLinks([...showedLinks, newLink]);
    };
    get();
  }, [phase]);

  useEffect(() => {
    if (!words || !user || !gameData.validatedList || isEven === undefined)
      return;
    const comeBack = async () => {
      if (turn !== 0 && (Number.isNaN(chainIndex) || !chainRef)) {
        console.log("ici", "user.id", user.id);
        const initialIndex = user.multiGuest
          ? words.findIndex((word) => word.DCuserID === user.dataId)
          : words.findIndex((word) => word.DCuserID === user.id);
        const turnOneIndex = isEven
          ? initialIndex
          : (initialIndex + 1) % words.length;
        const actualIndex =
          turn === 1 ? turnOneIndex : (turnOneIndex + turn - 1) % words.length;
        console.log("actualIndex", actualIndex);
        setChainIndex(actualIndex);

        const actualChainRef = words[actualIndex];
        setChainRef(actualChainRef);

        setHasComeback(true);

        // const hadValidated = gameData.validatedList.some(
        //   (val) => val === user.name
        // );
        // setCBHadValidated(hadValidated);
      }
    };
    comeBack();
  }, [turn, chainIndex, chainRef, user, words, gameData, isEven]);

  useEffect(() => {
    if (!gameData.validatedList) return;
    const hadValidated = gameData.validatedList.some(
      (val) => val === user.name
    );
    setCBHadValidated(hadValidated);
  }, [gameData.validatedList]);
  useEffect(() => {
    // if (hasComeback === undefined || CBHadValidated === undefined) return;
    if (hasComeback === undefined) return;
    setHasComeback(false);
    // setCBHadValidated(false);
  }, [phase]);

  useEffect(() => {
    // if (!chainRef) return;
    if (!chainRef || CBHadValidated === undefined) return;
    const getLast = async () => {
      const newLastLink = await getLastLink({
        chainRef,
        skip: CBHadValidated ? 1 : 0,
      });
      setLastLink(newLastLink);
    };
    getLast();
  }, [chainRef, CBHadValidated]);

  return (
    <div className="overflow-y-auto">
      {!gameData.ended && (
        <>
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
                        goNextPhase({
                          userName: user.name,
                          roomId,
                          roomToken,
                          gameData,
                        });
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
                    <div className="fixed bottom-0 z-10 left-1/2 translate-x-[-50%] translate-y-[-25%]">
                      <NextStep
                        onClick={() =>
                          goNextPhase({
                            userName: user.name,
                            roomId,
                            roomToken,
                            gameData,
                            full: true,
                          })
                        }
                      >
                        Lancer
                      </NextStep>
                    </div>
                  ) : (
                    <div>Ça va commencer !</div>
                  )}
                </>
              )}
            </>
          )}

          {phase === "drawing" && lastLink?.type === "word" && (
            <>
              {!hasValidated && !CBHadValidated ? (
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
                {!hasValidated && !CBHadValidated ? (
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

          {phase.startsWith("showing") && (
            <>
              <div>Chaîne de {showedGamer}</div>

              {showedLinks && (
                <div>
                  {showedLinks.map((link, i) => (
                    <div key={i}>
                      {link.type === "draw" ? (
                        <div>
                          <div>Dessin de {link.userName}</div>
                          <div
                            style={{
                              position: "relative",
                              width: "auto",
                              height: "50vh",
                              // left: "5vw",
                            }}
                          >
                            <Image
                              src={link.data}
                              alt="drawing-png"
                              // sizes="500px"
                              fill
                              style={{
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        </div>
                      ) : showedGamer !== link.userName ? (
                        <div>
                          {link.userName} pense qu&apos;il s&apos;agit de :{" "}
                          {link.data}
                        </div>
                      ) : (
                        <div>
                          Et il s&apos;agissait de :{" "}
                          <span className="font-semibold">{link.data}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isShower && (
                <div className="fixed bottom-0 z-10 left-1/2 translate-x-[-50%] translate-y-[-50%]">
                  <NextStep
                    onClick={() => {
                      goNextShow({ roomId, roomToken, gameData });
                    }}
                  >
                    Suite
                  </NextStep>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
