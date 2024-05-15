import getUser from "@/utils/getUser";
import { getRoomFriendList } from "@/utils/getFriendList";

import Room from "@/components/Room/Room";
import Memory from "./Memory";
import MemoryOptions from "./Options";
import { launchGame } from "./gameActions";

export default async function MemoryPage({ params, searchParams }) {
  const user = await getUser();

  if (!user)
    return (
      <Room
        user={{ name: searchParams.guestName, multiGuest: true }}
        friendList={null}
        categorie={params?.categorie}
        gameName="memory"
        Game={Memory}
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
      gameName="memory"
      Game={Memory}
      Options={MemoryOptions}
      launchGame={launchGame}
    />
  );
}
