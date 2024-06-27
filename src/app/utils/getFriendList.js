"use server";
import prisma from "./prisma";

export default async function getFriendList({ userId }) {
  const friendList = (
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        friends: true,
      },
    })
  ).friends;

  return friendList;
}

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

  return byLastCPFriendList;
}
