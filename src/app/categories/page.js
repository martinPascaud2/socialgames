import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import pusher from "@/utils/pusher";
import prisma from "@/utils/prisma";
import getUser from "@/utils/getUser";
import getDistance from "@/utils/getDistance";
import getFriendList from "@/utils/getFriendList";
import Categories from "./Categories";

export default async function CategoriesPage() {
  const user = await getUser();
  const friendList = await getFriendList({ userId: user.id });

  const addFriend = async ({ userLocation, friendCode }) => {
    "use server";
    const userId = user.id;

    const codeParams = friendCode.split(";");
    const friendId = parseInt(codeParams[0].split("=")[1]);
    const friendMail = codeParams[1].split("=")[1];
    const friendName = codeParams[2].split("=")[1];
    const friendLocation = JSON.parse(codeParams[3]);

    const isFriendExists =
      (await prisma.user.findUnique({
        where: {
          id: friendId,
          email: friendMail,
        },
      })) !== null;
    if (!isFriendExists || !user || friendMail === user.email)
      throw new Error("Utilisateur introuvable");

    const distance = getDistance({
      first: userLocation,
      second: friendLocation,
    });
    if (distance > 20) throw new Error("Vous êtes trop loin !");

    const friendList = await getFriendList({ userId: user.id });
    const isAlreadyFriend = friendList.some(
      (friend) => friend.friendId === friendId
    );
    if (isAlreadyFriend) throw new Error(`${friendName} est votre ami !`);

    try {
      await prisma.friend.create({
        data: {
          user: { connect: { id: userId } },
          friend: { connect: { id: friendId } },
          customName: friendName,
        },
      });
      await prisma.friend.create({
        data: {
          user: { connect: { id: friendId } },
          friend: { connect: { id: userId } },
          customName: user.name,
        },
      });

      await pusher.trigger(`user-${user.email}`, "user-event", {
        message: `${friendName} ajouté dans vos amis !`,
      });
      await pusher.trigger(`user-${friendMail}`, "user-event", {
        message: `${user.name} ajouté dans vos amis !`,
      });

      revalidatePath("/categories");
    } catch (error) {
      throw new Error("Une erreur s'est produite lors de l'ajout");
    }
  };

  const deleteFriend = async ({ userId, friendId }) => {
    "use server";
    await prisma.friend.deleteMany({
      where: { userId: userId, friendId: friendId },
    });
    await prisma.friend.deleteMany({
      where: { userId: friendId, friendId: userId },
    });
    revalidatePath("/categories");
  };

  const signOut = async () => {
    "use server";
    cookies().delete("SG_token");
  };

  return (
    <Categories
      user={user}
      addFriend={addFriend}
      deleteFriend={deleteFriend}
      signOut={signOut}
      friendList={friendList}
    />
  );
}
