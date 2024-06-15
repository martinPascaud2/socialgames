import NextStep from "@/components/NextStep";
import FinishGame from "@/components/FinishGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import EndGame from "@/components/EndGame";

export default function NextEndingPossibilities({
  isAdmin,
  isEnded,
  gameData,
  roomToken,
  reset,
  storedLocation,
  user,
}) {
  return (
    <div className="fixed bottom-0 h-20 bg-black w-full">
      <div className="w-full flex justify-around">
        {isAdmin ? (
          !isEnded ? (
            <div className="absolute bottom-0 left-0">
              <FinishGame gameData={gameData} roomToken={roomToken} />
            </div>
          ) : (
            <>
              <div className="absolute bottom-0 left-1/2 translate-x-[-50%] translate-y-[-25%]">
                <NextStep onClick={() => reset({ roomToken, gameData })}>
                  Encore
                </NextStep>
              </div>

              <div>
                <ChooseOneMoreGame
                  gameData={gameData}
                  roomToken={roomToken}
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
