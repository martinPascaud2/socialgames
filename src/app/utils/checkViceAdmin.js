export default async function checkViceAdmin({
  roomId,
  admin,
  viceAdmin,
  gamersAndGuests,
}) {
  let newViceAdmin;
  const isThereViceAdmin = gamersAndGuests.some(
    (gamer) => gamer.name === viceAdmin
  );

  if (isThereViceAdmin) {
    newViceAdmin = viceAdmin;
  } else {
    newViceAdmin = gamersAndGuests.find((gamer) => gamer.name !== admin).name;
    await prisma.room.update({
      where: { id: roomId },
      data: { viceAdmin: newViceAdmin },
    });
  }
  return newViceAdmin;
}
