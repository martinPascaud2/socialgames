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
