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
}) {
  const contextValue = useUserContext();
  const userParams = contextValue.userParams;

  return (
    <div
      className={`fixed bottom-0 bg-black w-full`}
      style={{ height: `${userParams?.bottomBarSize / 4 || 2}rem` }}
    >
      <div className="w-full flex justify-around">
        {isAdmin ? (
          !isEnded ? (
            <div
              className={`absolute bottom-${
                userParams?.bottomBarSize || 8
              } left-2`}
            >
              <FinishGame gameData={gameData} roomToken={roomToken} />
            </div>
          ) : (
            <>
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
            </>
          )
        ) : isEnded ? (
          <EndGame gameData={gameData} user={user} />
        ) : null}
      </div>
    </div>
  );
}
