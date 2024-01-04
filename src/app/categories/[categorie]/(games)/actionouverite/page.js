import pusher from "@/utils/pusher";

import Room from "./Room";
import Actionouverite from "./Actionouverite";

import { launchGame } from "./gameActions";

import getUser from "@/utils/getUser";
import { getRoomFriendList } from "@/utils/getFriendList";

export default async function ActionOuVerite({ params }) {
  const user = await getUser();
  const friendList = await getRoomFriendList({ userId: user.id });

  //mettre dans les outils
  const inviteFriend = async ({
    userName,
    friendMail,
    categorie,
    gameName,
    roomToken,
  }) => {
    "use server";
    await pusher.trigger(`user-${friendMail}`, "user-event", {
      invitation: {
        userName,
        gameName,
        link: `${process.env.NEXT_PUBLIC_APP_URL}/categories/${categorie}/${gameName}?token=${roomToken}`,
      },
    });
  };

  return (
    <Room
      user={user}
      friendList={friendList}
      categorie={params?.categorie}
      gameName="actionouverite"
      Game={Actionouverite}
      inviteFriend={inviteFriend}
      launchGame={launchGame}
    />
  );
}
