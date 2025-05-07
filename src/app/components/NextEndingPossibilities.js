"use client";

import { useUserContext } from "./Room/Room";

import { StaticNextStep } from "@/components/NextStep";
import FinishGame from "@/components/FinishGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import EndGame from "@/components/EndGame";
import GoPostgame from "./GoPostgame";

export default function NextEndingPossibilities({
  isAdmin,
  isEnded,
  gameData,
  roomToken,
  roomId,
  reset,
  postgameRef,
  storedLocation,
  user,
  showed = true,
}) {
  const contextValue = useUserContext();
  const userParams = contextValue.userParams;

  if (postgameRef)
    return (
      <div
        className={`absolute w-full ${!showed ? "hidden" : ""}`}
        style={{
          bottom: `${userParams?.bottomBarSize / 4 || 2}rem`,
          pointerEvents: "none",
        }}
      >
        <div className="w-full flex justify-around h-full">
          <GoPostgame
            postgameRef={postgameRef}
            isAdmin={isAdmin}
            roomId={roomId}
            user={user}
          />
        </div>
      </div>
    );

  return (
    <div
      className={`absolute w-full ${!showed ? "hidden" : ""}`}
      style={{
        bottom: `${userParams?.bottomBarSize / 4 || 2}rem`,
        pointerEvents: "none",
      }}
    >
      <div className="w-full flex justify-around h-full">
        {isAdmin ? (
          !isEnded ? (
            <div
              className="absolute top-full"
              style={{
                pointerEvents: "auto",
              }}
            >
              <FinishGame gameData={gameData} roomToken={roomToken} />
            </div>
          ) : (
            <div
              style={{
                pointerEvents: "auto",
              }}
            >
              <StaticNextStep
                onClick={() => reset({ roomId, roomToken, gameData })}
              >
                Encore
              </StaticNextStep>

              <div>
                <ChooseOneMoreGame
                  gameData={gameData}
                  roomToken={roomToken}
                  roomId={roomId}
                  storedLocation={storedLocation}
                />
              </div>
            </div>
          )
        ) : isEnded ? (
          <div
            className="w-full h-full"
            style={{
              pointerEvents: "auto",
            }}
          >
            <EndGame gameData={gameData} user={user} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
