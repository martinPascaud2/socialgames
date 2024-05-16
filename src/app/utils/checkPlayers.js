import { gamesRefs } from "@/assets/globals";

export default function checkPlayers({
  gameName,
  gamers,
  guests,
  multiGuests,
}) {
  const isGuestsAllowed = gamesRefs[gameName].isGuestsAllowed;
  if (!isGuestsAllowed && guests.length)
    return { error: "Ce jeu est incompatible avec les guests monoscreen." };

  if (
    gamers.length + guests.length + multiGuests.length <
    gamesRefs[gameName].limits.min
  )
    return { error: "Un plus grand nombre de joueurs est requis." };
  if (
    gamers.length + guests.length + multiGuests.length >
    gamesRefs[gameName].limits.max
  )
    return { error: "Vous avez dépassé la limite de joueurs." };

  return { error: null };
}
