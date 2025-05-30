import getUser from "@/utils/getUser";

import { launchGame } from "./gameActions";

import Room from "@/components/Room/Room";
import SecretOptions from "./Options";
import Secret from "./Secret";

export default async function SecretPage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        categorie={params?.categorie}
        gameName="secret"
        Game={Secret}
        Options={SecretOptions}
        launchGame={null}
      />
    );

  const { id, name, params: userParams } = user;

  return (
    <Room
      user={{ id, name, params: userParams }}
      categorie={params?.categorie}
      gameName="secret"
      Game={Secret}
      Options={SecretOptions}
      launchGame={launchGame}
    />
  );
}
