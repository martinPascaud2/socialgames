"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";

const initialState = {
  message: null,
  status: 100,
};

import {
  launchDescriptions,
  getNextGamer,
  voteAgainst,
  goddessVote,
  whiteGuess,
} from "./gameActions";

export default function Undercover({ roomId, roomToken, user, gameData }) {
  console.log("gameData", gameData);
  console.log("user", user);
  const [deviceGamers, setDeviceGamers] = useState([]);
  const [reveals, setReveals] = useState({});
  const [adminVoter, setAdminVoter] = useState(0);
  const [adminPossibleVotes, setAdminPossibleVotes] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [goddess, setGoddess] = useState("");
  const [isGoddess, setIsGoddess] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [isWhite, setIsWhite] = useState(false);
  const whiteGuessWithData = whiteGuess.bind(null, gameData, roomToken);
  const [state, formAction] = useFormState(whiteGuessWithData, initialState);

  useEffect(() => {
    const dead = !gameData.gamers?.find((gamer) => gamer.name === user.name)
      .alive;
    setIsDead(dead);

    if (
      user.name === goddess ||
      deviceGamers.find((gamer) => gamer.name === goddess)
    )
      setIsGoddess(true);

    const white = gameData.gamers?.find((gamer) => gamer.role === "white");
    if (
      user.name === white ||
      deviceGamers.find((gamer) => gamer.name === white?.name)
    ) {
      setIsWhite(true);
    }
  }, [gameData.gamers, user.name, deviceGamers, goddess]);

  useEffect(() => {
    const gamers = gameData.gamers.filter(
      (gamer) =>
        gamer.name === user.name ||
        (user.name === gameData.admin && gamer.guest)
    );
    setDeviceGamers(gamers);
    gamers.map((gamer) =>
      setReveals((prevReveals) => ({ ...prevReveals, [gamer.name]: false }))
    );
  }, [gameData.gamers, user.name, gameData.admin]);

  console.log("deviceGamers", deviceGamers);
  console.log("reveals", reveals);

  const possibleVotes = gameData.gamers?.map((gamer) => {
    if (isDead) return;
    if (gamer.id === user.id || !gamer.alive) return;
    return (
      <button
        key={gamer.name}
        onClick={() => {
          voteAgainst(gameData, roomToken, gamer.name);
          setHasVoted(true);
        }}
      >
        {gamer.name}
      </button>
    );
  });

  useEffect(() => {
    if (user.name !== gameData.admin) return;

    // const adminAndGuests = [user];
    const adminAndGuests = [
      gameData.gamers.find((gamer) => gamer.name === user.name),
    ];
    gameData.gamers.map((gamer) => {
      if (gamer.guest) {
        adminAndGuests.push(gamer);
      }
    });

    // let nextIndex = index + 1;
    // while (nextIndex !== gamerList.length) {
    //   if (gamerList[nextIndex].alive) {
    //     phase = "description";
    //     nextGamer = gamerList[nextIndex];
    //     break;
    //   }
    //   nextIndex++;
    // }

    // if (!nextGamer) {
    //   phase = "vote";
    //   nextGamer = gamerList[0];
    // }

    let voterIndex = adminVoter;
    let voter;
    while (voterIndex !== adminAndGuests.length) {
      if (adminAndGuests[voterIndex].alive) {
        voter = adminAndGuests[voterIndex];
        break;
      }
      voterIndex++;
    }

    if (!voter) {
      setAdminVoter(0);
      setHasVoted(true);
      return;
    }

    // if (adminVoter > adminAndGuests.length - 1) {
    //   setAdminVoter(0);
    //   setHasVoted(true);
    //   return;
    // }

    // let voterIndex = adminVoter;
    // let voter = adminAndGuests[voterIndex];
    // while (adminAndGuests[voterIndex]?.alive === false) {
    //   voter = adminAndGuests[voterIndex];
    //   voterIndex++;
    // }

    // const voter = adminAndGuests[adminVoter];
    console.log("voter", voter);
    console.log("adminAndGuests", adminAndGuests);
    const fromWhichToChoose = (
      <>
        <div>C&apos;est au tour de {`${voter.name}`} de voter.</div>
        <div>
          {gameData.gamers.map((gamer) => {
            if (gamer.name === voter.name || !gamer.alive) return;
            return (
              <button
                key={gamer.name}
                onClick={() => {
                  setAdminVoter(parseInt(voterIndex + 1));
                  voteAgainst(gameData, roomToken, gamer.name);
                }}
              >
                {gamer.name}
              </button>
            );
          })}
        </div>
      </>
    );

    setAdminPossibleVotes(fromWhichToChoose);
  }, [adminVoter, gameData, roomToken, user]);

  useEffect(() => {
    const goddess = gameData.gamers.find((gamer) => gamer.goddess);
    setGoddess(goddess.name);
  }, [gameData.gamers]);

  const goddessPossibleVotes = gameData.deadMen?.map((gamerName) => {
    return (
      <button
        key={gamerName}
        onClick={() => {
          goddessVote(gameData, roomToken, gamerName);
        }}
      >
        {gamerName}
      </button>
    );
  });

  useEffect(() => {
    if (gameData.phase === "description") setHasVoted(false);
  }, [gameData.phase]);

  const whiteForm = isWhite ? (
    <form
      action={formAction}
      className="flex flex-col justify-center items-center"
    >
      <label htmlFor="guess">Essayez de deviner le mot :</label>
      <input
        type="text"
        name="guess"
        id="guess"
        autoFocus
        className="border focus:outline-none focus:border-2"
      />

      {/* <div className="text-justify font-bold">{state.message}</div> */}

      <button type="submit">Proposer</button>
    </form>
  ) : null;

  console.log("adminVoter", adminVoter);
  console.log("isDead", isDead);
  console.log("isGoddess", isGoddess);
  console.log("isWhite", isWhite);

  return (
    <>
      <div>
        {deviceGamers.map((gamer) => (
          <div key={gamer.name} className="m-20">
            <button
              onClick={() =>
                setReveals((prevReveals) => ({
                  ...prevReveals,
                  [gamer.name]: !reveals[gamer.name],
                }))
              }
            >
              {deviceGamers.length === 1
                ? "Révéler votre mot"
                : `Révéler le mot de ${gamer.name}`}
            </button>
            {reveals[gamer.name] && <div>Votre mot : {gamer.word}</div>}
          </div>
        ))}
      </div>

      {gameData.phase === "reveal" && (
        <div>
          <div>Phase de découverte des mots</div>
          {user.name === gameData.admin && (
            <button onClick={() => launchDescriptions({ gameData, roomToken })}>
              Lancer le tour des descriptions
            </button>
          )}
        </div>
      )}

      {gameData.phase === "description" && (
        <div>
          {gameData.activePlayer.id === user.id ? (
            <div>
              {gameData.gamers.some((gamer) => gamer.guest === true) ? (
                <>
                  <div>
                    C&apos;est au tour de {`${gameData.activePlayer.name}`} de
                    décrire le mot.
                  </div>
                  <button onClick={() => getNextGamer(gameData, roomToken)}>
                    Passer au joueur suivant
                  </button>
                </>
              ) : (
                <div>C&apos;est à votre tour !</div>
              )}
            </div>
          ) : (
            <div>
              C&apos;est au tour de {`${gameData.activePlayer.name}`} de décrire
              le mot.
            </div>
          )}
        </div>
      )}

      {gameData.phase === "vote" && (
        <>
          <div>Phase d&apos;élimination</div>

          {!hasVoted ? (
            <div>
              {user.name === gameData.admin ? (
                <div>{adminPossibleVotes}</div>
              ) : (
                <div className="flex flex-col">{possibleVotes}</div>
              )}
            </div>
          ) : (
            <div>Vous avez voté ! En attente de la fin du vote.</div>
          )}
        </>
      )}

      <div>Déesse de la Justice : {goddess}</div>

      {gameData.phase === "goddess" && (
        <div>
          <div>La Déesse de la Justice tranche !</div>
          {isGoddess && <div>{goddessPossibleVotes}</div>}
        </div>
      )}

      {gameData.phase === "white" && (
        <>
          <div>Mister White a été tué !</div>
          {whiteForm}
          {/* <form
            action={formAction}
            className="flex flex-col justify-center items-center"
          >
            <label htmlFor="guess">Essayez de deviner le mot :</label>
            <input
              type="text"
              name="guess"
              id="guess"
              autoFocus
              className="border focus:outline-none focus:border-2"
            />

            <div className="text-justify font-bold">{state.message}</div>

            <button type="submit">Proposer</button>
          </form> */}
        </>
      )}

      {gameData.phase === "undercoversWinMaybeWhite" && (
        <>
          <div>
            Les undercovers remportent la partie, Mister White avec eux ?
          </div>
          {whiteForm}
        </>
      )}

      {gameData.phase === "whiteWin" && (
        <div>Mister White remporte la partie !</div>
      )}

      {gameData.phase === "civilsWin" && (
        <div>Les civils remportent la partie !</div>
      )}

      {gameData.phase === "undercoversWin" && (
        <div>Les undercovers remportent la partie !</div>
      )}

      {gameData.phase === "undercoversWinWithWhite" && (
        <div>Les undercovers ainsi que Mister White remportent la partie !</div>
      )}

      <div>
        Joueurs restants :{" "}
        {gameData.gamers
          .filter(
            (gamer) =>
              gamer.alive ||
              (gamer.role === "white" &&
                [
                  "white",
                  "undercoversWinMaybeWhite",
                  "whiteWin",
                  "undercoversWinWithWhite",
                ].includes(gameData.phase))
          )
          .map((alive) => (
            <div key={alive.name}>{alive.name}</div>
          ))}
      </div>
    </>
  );
}

// onst isActive =
//     gameData.activePlayer?.id === user.id ||
//     (gameData.activePlayer?.guest && isAdmin);
