import getUser from "@/utils/getUser";
import Room from "./Room";
import Actionouverite from "./Actionouverite";
import { launchGame } from "./gameActions";

export default async function ActionOuVerite({ params }) {
  const user = await getUser();

  return (
    <Room
      user={user}
      categorie={params?.categorie}
      gameName="actionouverite"
      Game={Actionouverite}
      launchGame={launchGame}
    />
  );
}
