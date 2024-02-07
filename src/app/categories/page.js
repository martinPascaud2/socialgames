import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import pusher from "@/utils/pusher";
import prisma from "@/utils/prisma";
import getUser from "@/utils/getUser";
import getDistance from "@/utils/getDistance";
import getFriendList from "@/utils/getFriendList";
import Categories from "./Categories";

import { gamesRefs } from "@/assets/globals";

export default async function CategoriesPage() {
  const user = await getUser();
  const friendList = await getFriendList({ userId: user.id });

  const getPublicRooms = async () => {
    "use server";
    const publicRooms = {};
    (
      await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          friends: {
            select: {
              friend: {
                select: {
                  room: {
                    where: {
                      private: false,
                      started: false,
                      creationDate: {
                        gte: new Date(new Date() - 30 * 60 * 1000),
                      },
                    },
                  },
                  name: true,
                },
              },
            },
          },
        },
      })
    ).friends.map((ref) => {
      if (ref.friend.room) {
        const friendName = ref.friend.name;
        const { id: roomId, game } = ref.friend.room;
        const { name: gameName, categorie } = gamesRefs[game];
        const roomToken = ref.friend.room.token;
        const link = `${process.env.NEXT_PUBLIC_APP_URL}/categories/${categorie}/${game}?token=${roomToken}`;

        const gamersNumber = publicRooms[`${roomId}`]?.gamersNumber || 0;
        publicRooms[roomId] = {
          friendName,
          gameName,
          link,
          gamersNumber: gamersNumber + 1,
        };
      }
    });
    return publicRooms;
  };

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
      return { error: "Utilisateur introuvable" };

    const distance = getDistance({
      first: userLocation,
      second: friendLocation,
    });
    if (distance > 20) return { error: "Vous êtes trop loin !" };

    const friendList = await getFriendList({ userId: user.id });
    const isAlreadyFriend = friendList.some(
      (friend) => friend.friendId === friendId
    );
    if (isAlreadyFriend) return { error: `${friendName} est votre ami !` };

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
    } catch (e) {
      return { error: "Une erreur s'est produite lors de l'ajout" };
    }

    return {};
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
      friendList={friendList}
      addFriend={addFriend}
      deleteFriend={deleteFriend}
      getPublicRooms={getPublicRooms}
      signOut={signOut}
    />
  );
}
