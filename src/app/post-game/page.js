import getUser from "@/utils/getUser";

import PostGame from "./PostGame";

export default async function PostGamePage() {
  const user = await getUser();
  //   console.log("user", user);

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

  console.log("triaction_PG", triaction_PG);

  const resetPostGamesDEV = async () => {
    "use server";
    await prisma.postGame.deleteMany({ where: {} });
  };

  return (
    <>
      <PostGame
        user={user}
        resetPostGamesDEV={resetPostGamesDEV}
        triaction_PG={triaction_PG}
        // postGames={{ triaction: triaction_PG }}
      />
    </>
  );
}
