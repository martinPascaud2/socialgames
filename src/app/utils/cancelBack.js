"use server";
export default async function cancelBack({ userId }) {
  await prisma.user.update({
    where: { id: userId },
    data: { roomId: null },
  });
}
