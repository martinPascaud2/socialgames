import getUser from "@/utils/getUser";

import { launchGame } from "./gameActions";

import Room from "@/components/Room/Room";
import Drawing from "./Drawing";
import DrawingOptions from "./Options";

export default async function DrawingPage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        categorie={params?.categorie}
        gameName="drawing"
        Game={Drawing}
        launchGame={null}
      />
    );

  const { id, name } = user;

  return (
    <Room
      user={{ id, name }}
      categorie={params?.categorie}
      gameName="drawing"
      Game={Drawing}
      Options={DrawingOptions}
      launchGame={launchGame}
    />
  );
}
