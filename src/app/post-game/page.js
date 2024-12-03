import getUser from "@/utils/getUser";

import PostGame from "./PostGame";

export default async function PostGamePage() {
  const user = await getUser();

  const TEN_DAYS_AGO = new Date();
  TEN_DAYS_AGO.setDate(TEN_DAYS_AGO.getDate() - 10);
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
          where: {
            postGame: {
              createdAt: {
                gte: TEN_DAYS_AGO,
              },
            },
          },
        },
      },
    })
  )?.postGames;

  const postGameArray = postGames.map((postGame) => postGame.postGame);

  const triaction_PG = postGameArray.filter(
    (postGame) => postGame.gameName === "triaction"
  );

  return (
    <>
      <PostGame user={user} triaction_PG={triaction_PG} />
    </>
  );
}
