import genToken from "@/utils/genToken";

export const initGamersAndGuests = ({
  adminId,
  gamers,
  guests,
  multiGuests,
}) => {
  const gamersAndGuests = Object.entries(gamers).map((gamer) => ({
    id: gamer[1],
    name: gamer[0],
    guest: false,
    multiGuest: false,
  }));

  guests.map((guest) => {
    gamersAndGuests.push({
      id: adminId,
      name: guest,
      guest: true,
      multiGuest: false,
    });
  });

  let startIndex = 0;
  gamersAndGuests.map((gamer) => {
    if (gamer.id >= startIndex) startIndex = gamer.id + 1;
  });
  multiGuests.map((multiGuest) => {
    gamersAndGuests.push({
      id: startIndex,
      name: multiGuest,
      guest: false,
      multiGuest: true,
      dataId: genToken(5),
    });
    startIndex++;
  });

  return gamersAndGuests;
};
