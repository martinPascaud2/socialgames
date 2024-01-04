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
              },
            },
          },
        },
      },
    })
  ).friends;
  const friendListFlat = friendList.map((friend) => ({
    customName: friend.customName,
    ...friend.friend,
  }));
  return friendListFlat;
}
