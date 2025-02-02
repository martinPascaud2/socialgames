"use server";
import prisma from "./prisma";

export default async function getFriendList({ userId }) {
  const friendList = (
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        friends: {
          include: {
            friend: true,
          },
          orderBy: {
            friend: {
              name: "asc",
            },
          },
        },
      },
    })
  ).friends;

  return friendList;
}

const isNotReinvitated = async ({ friend }) => {
  const { roomId: currentRoomId } = friend;

  if (!currentRoomId) return true;

  const { creationDate, arrivalsOrder, started } = await prisma.room.findFirst({
    where: { id: currentRoomId },
    select: {
      creationDate: true,
      arrivalsOrder: true,
      started: true,
    },
  });

  const creationAgeInMn =
    (new Date().getTime() - creationDate.getTime()) / (1000 * 60);

  if (arrivalsOrder.length <= 1 || (!started && creationAgeInMn > 30))
    return true;
  else return false;
};

export async function getRoomFriendList({ userId }) {
  const friendList = (
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        friends: {
          select: {
            customName: true,
            friend: {
              select: {
                id: true,
                name: true,
                email: true,
                lastControlPanel: true,
                roomId: true,
              },
            },
          },
        },
      },
    })
  ).friends.filter(
    (friend) =>
      friend.friend.lastControlPanel >= new Date(Date.now() - 30 * 60 * 1000)
  );

  const friendListFlat = friendList.map((friend) => ({
    customName: friend.customName,
    ...friend.friend,
  }));

  const byLastCPFriendList = friendListFlat.sort(
    (a, b) => new Date(b.lastControlPanel) - new Date(a.lastControlPanel)
  );

  const onlyNotReinvitated = (
    await Promise.all(
      byLastCPFriendList.map(async (friend) => ({
        friend,
        isValid: await isNotReinvitated({ friend }),
      }))
    )
  )
    .filter(({ isValid }) => isValid)
    .map(({ friend }) => friend);

  return onlyNotReinvitated;
}
