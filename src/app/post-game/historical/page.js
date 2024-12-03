import getUser from "@/utils/getUser";
import formatDate from "@/utils/formatDate";

import Link from "next/link";

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default async function HistoricalPage() {
  const user = await getUser();
  const userParams = user.params;
  const barsSizes = {
    bottom: userParams?.bottomBarSize || 8,
    top: userParams?.topBarSize || 8,
  };

  const postGames = (
    await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        postGames: {
          select: {
            postGame: true,
          },
        },
      },
    })
  )?.postGames;

  const postGameArray = postGames.map((postGame) => postGame.postGame);

  const currentDate = new Date();

  const TEN_DAYS_IN_MS = 10 * 24 * 60 * 60 * 1000;
  const triaction_PG = postGameArray.filter((postGame) => {
    if (postGame.gameName !== "triaction") return;
    else {
      const gameDate = new Date(postGame.createdAt);
      return currentDate - gameDate > TEN_DAYS_IN_MS;
    }
  });

  return (
    <>
      <div
        className={`fixed h-[${barsSizes.top / 4}rem] w-full z-[70] bg-black`}
        style={{
          height: `${barsSizes.top / 4}rem`,
        }}
      />
      <div
        className={`fixed h-[${
          barsSizes.bottom / 4
        }rem] w-full z-[70] bg-black bottom-0`}
        style={{ height: `${barsSizes.bottom / 4}rem` }}
      />

      <Link
        href="/post-game"
        className="absolute z-20 border border-blue-300 bg-blue-100 p-2"
        style={{ top: `${barsSizes.top / 4}rem` }}
      >
        Retour
      </Link>

      <div className="absolute h-full w-full z-0 flex flex-col items-center justify-start">
        <div
          className={`overflow-y-auto z-[60] w-full`}
          style={{
            height: `calc(100dvh - ${barsSizes.top / 4}rem)`,
            marginTop: `${barsSizes.top / 4}rem`,
            marginBottom: `${barsSizes.bottom / 4}rem`,
          }}
        >
          <div className="font-bold text-center text-lg">Triaction</div>
          {triaction_PG.map((postGame, i) => {
            const { createdAt: date } = postGame;
            const { actions } = postGame.gameData;
            return (
              <div key={i} className="flex flex-col">
                <div className="text-center w-full font-semibold">
                  {formatDate(date)}
                </div>
                {Object.entries(actions).map(([gamer, actions]) => {
                  const { backed, proposedBack, kept } = actions;
                  return (
                    <div key={gamer} className="ml-4 flex my-2">
                      <div>
                        {gamer}&nbsp;{"=>"}&nbsp;
                      </div>
                      <ul>
                        <li className="flex">
                          {`\u2022`}&#34;{backed.action}&#34;(
                          <span className="italic">{backed.from}</span>)
                          {backed.done ? (
                            <CheckIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <XMarkIcon className="h-6 w-6 text-red-600" />
                          )}
                        </li>
                        <li className="flex">
                          {`\u2022`}&#34;{proposedBack.action}&#34;(
                          <span className="italic">{proposedBack.from}</span>)
                          {proposedBack.done ? (
                            <CheckIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <XMarkIcon className="h-6 w-6 text-red-600" />
                          )}
                        </li>
                        <li className="flex">
                          {`\u2022`}&#34;{kept.action}&#34;(
                          <span className="italic">{kept.from}</span>)
                          {kept.done ? (
                            <CheckIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <XMarkIcon className="h-6 w-6 text-red-600" />
                          )}
                        </li>
                      </ul>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
