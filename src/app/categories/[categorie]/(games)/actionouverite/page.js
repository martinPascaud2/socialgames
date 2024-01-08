import pusher from "@/utils/pusher";

import Room from "./Room";
import Actionouverite from "./Actionouverite";

import { launchGame } from "./gameActions";

import getUser from "@/utils/getUser";
import { getRoomFriendList } from "@/utils/getFriendList";

export default async function ActionOuVerite({ params, searchParams }) {
  const user = await getUser(); //gérer le retour guest
  console.log("user AoV", user);
  console.log("searchParams AoV", searchParams);
  //idem
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

  const { id, name, alreadyActionouverite } = user;

  return (
    <Room
      // user={user}
      user={{ id, name, alreadyActionouverite }}
      friendList={friendList}
      categorie={params?.categorie}
      gameName="actionouverite"
      Game={Actionouverite}
      inviteFriend={inviteFriend}
      launchGame={launchGame}
    />
  );
}
