import getUser from "@/utils/getUser";

import { launchGame } from "./gameActions";

import Room from "@/components/Room/Room";
import Triaction from "./Triaction";
import TriactionOptions from "./Options";

export default async function TriactionPage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        categorie={params?.categorie}
        gameName="triaction"
        Game={Triaction}
        Options={TriactionOptions}
        launchGame={null}
      />
    );

  const { id, name } = user;

  return (
    <Room
      user={{ id, name }}
      categorie={params?.categorie}
      gameName="triaction"
      Game={Triaction}
      Options={TriactionOptions}
      launchGame={launchGame}
    />
  );
}
