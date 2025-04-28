"use client";

import NextStep from "@/components/NextStep";
import FinishGame from "@/components/FinishGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import EndGame from "@/components/EndGame";
import { useUserContext } from "./Room/Room";

export default function NextEndingPossibilities({
  isAdmin,
  isEnded,
  gameData,
  roomToken,
  roomId,
  reset,
  storedLocation,
  user,
  showed = true,
}) {
  const contextValue = useUserContext();
  const userParams = contextValue.userParams;

  return (
    <div
      className={`absolute bottom-0 w-full ${!showed ? "hidden" : ""}`}
      style={{
        height: `${userParams?.bottomBarSize / 4 || 2}rem`,
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
              <NextStep onClick={() => reset({ roomId, roomToken, gameData })}>
                Encore
              </NextStep>

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
          <EndGame gameData={gameData} user={user} />
        ) : null}
      </div>
    </div>
  );
}
