import getUser from "@/utils/getUser";

import { launchGame } from "./gameActions";

import Room from "@/components/Room/Room";
import Undercover from "./Undercover";

export default async function UndercoverPage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        categorie={params?.categorie}
        gameName="undercover"
        Game={Undercover}
        launchGame={null}
      />
    );

  const { id, name, params: userParams } = user;

  return (
    <Room
      user={{ id, name, params: userParams }}
      categorie={params?.categorie}
      gameName="undercover"
      Game={Undercover}
      launchGame={launchGame}
    />
  );
}
