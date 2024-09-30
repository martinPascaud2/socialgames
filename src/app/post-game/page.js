import getUser from "@/utils/getUser";

import PostGame from "./PostGame";

export default async function PostGamePage() {
  const user = await getUser();

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

  const triaction_PG = postGameArray.filter(
    (postGame) => postGame.gameName === "triaction"
  );

  return (
    <>
      <PostGame user={user} triaction_PG={triaction_PG} />
    </>
  );
}
