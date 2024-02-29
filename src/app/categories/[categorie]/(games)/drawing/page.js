import getUser from "@/utils/getUser";
import { getRoomFriendList } from "@/utils/getFriendList";

import Room from "@/components/Room/Room";
import Drawing from "./Drawing";
import { launchGame } from "./gameActions";

export default async function DrawingPage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        friendList={null}
        categorie={params?.categorie}
        gameName="drawing"
        Game={Drawing}
        launchGame={null}
      />
    );

  const { id, name } = user;
  const friendList = await getRoomFriendList({ userId: user.id });

  return (
    <Room
      user={{ id, name }}
      friendList={friendList}
      categorie={params?.categorie}
      gameName="drawing"
      Game={Drawing}
      launchGame={launchGame}
    />
  );
}
