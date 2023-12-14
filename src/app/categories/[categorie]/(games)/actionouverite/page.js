import getUser from "@/utils/getUser";
import Game from "./Game";

export default async function ActionOuVerite() {
  const user = await getUser();

  return <Game user={user} game="actionouverite" />;
}
