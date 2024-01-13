import pusher from "@/utils/pusher";
import getUser from "@/utils/getUser";
import { getRoomFriendList } from "@/utils/getFriendList";

import Room from "./Room";
import Actionouverite from "./Actionouverite";
import { launchGame } from "./gameActions";

export default async function ActionOuVerite({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        friendList={null}
        categorie={params?.categorie}
        gameName="actionouverite"
        Game={Actionouverite}
        inviteFriend={null}
        launchGame={null}
      />
    );

  const { id, name } = user;
  const friendList = await getRoomFriendList({ userId: user.id });

  //utils quand 2e jeu
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
      user={{ id, name }}
      friendList={friendList}
      categorie={params?.categorie}
      gameName="actionouverite"
      Game={Actionouverite}
      inviteFriend={inviteFriend}
      launchGame={launchGame}
    />
  );
}
