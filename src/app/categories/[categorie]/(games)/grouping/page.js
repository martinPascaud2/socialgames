import pusher from "@/utils/pusher";
import getUser from "@/utils/getUser";
import { getRoomFriendList } from "@/utils/getFriendList";

import Room from "@/components/Room/Room";
import Grouping from "./Grouping";
import { launchGame } from "./gameActions";

export default async function GroupingPage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        friendList={null}
        categorie="grouping"
        gameName="grouping"
        Game={Grouping}
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
      categorie="grouping"
      gameName="grouping"
      Game={Grouping}
      inviteFriend={inviteFriend}
      launchGame={launchGame}
    />
  );
}
