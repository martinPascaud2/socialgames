"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Pusher from "pusher-js";
import QRCode from "react-qr-code";
import useWake from "@/utils/useWake";

import genToken from "@/utils/genToken";
import getLocation from "@/utils/getLocation";
import getErrorInformations from "@/utils/getErrorInformations";
import { getRoomFriendList } from "@/utils/getFriendList";
import { saveLastParams } from "@/utils/getLastParams";
import cancelBack from "@/utils/cancelBack";
import { gamesRefs } from "@/assets/globals";

import DeleteGroup from "@/components/DeleteGroup";
import ChooseAnotherGame from "@/components/ChooseAnotherGame";
import ChooseLastGame from "@/components/ChooseLastGame";
import {
  CheckIcon,
  ArrowPathIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import NextStep from "../NextStep";

var pusher = new Pusher("61853af9f30abf9d5b3d", {
  cluster: "eu",
  useTLS: true,
});
var pusherPresence;

const UserContext = createContext();

import {
  serverCreate,
  goOneMoreGame,
  inviteFriend,
  inviteAll,
  deleteInvitations,
  removeArrival,
  serverJoin,
  triggerGamers,
  triggerMultiguests,
  serverDeleteGamer,
  serverAddMultiGuest,
  serverDeleteMultiGuest,
  getUniqueName,
  getRoomId,
  getRoomRefs,
  changeOptions,
  togglePrivacy,
  saveLocation,
  checkConnection,
  retryGamerConnection,
  retryMultiGuestConnection,
  sendPresenceSign,
} from "./actions";

function subscribePresenceChannel({
  userId,
  userName,
  status,
  setOnlineGamers,
  roomToken,
}) {
  pusherPresence = new Pusher("61853af9f30abf9d5b3d", {
    cluster: "eu",
    useTLS: true,
    authEndpoint: "/api/pusherAuth/",
    auth: {
      params: {
        userId,
        userName,
        multiGuest: status === "multiGuest",
      },
    },
  });
  const presenceChannel = pusherPresence.subscribe(`presence-${roomToken}`);
  let pingTimeStamps = {};

  presenceChannel.bind("pusher:subscription_succeeded", ({ members }) => {
    setOnlineGamers(Object.values(members));
  });

  presenceChannel.bind("pusher:subscription_error", (status) => {
    console.error("Subscription failed:", status);
  });

  presenceChannel.bind("pusher:member_added", (member) => {
    setOnlineGamers(Object.values(presenceChannel.members.members));
  });

  presenceChannel.bind("pusher:member_removed", (member) => {
    setOnlineGamers(Object.values(presenceChannel.members.members));
  });

  presenceChannel.bind("check-presence", (presence) => {
    pingTimeStamps[presence.userName] = presence.time;

    Object.entries(pingTimeStamps).forEach((stamp) => {
      if (Date.now() - stamp[1] > 12000) {
        delete pingTimeStamps[stamp[0]];
        setOnlineGamers((prevOnlines) => {
          const newOnlines = prevOnlines.filter(
            (online) => online.userName !== stamp[0]
          );
          return newOnlines;
        });
      } else {
        const { userId, userName, multiGuest } = presence;
        setOnlineGamers((prevOnlines) => {
          if (prevOnlines.some((online) => online.userName === userName))
            return prevOnlines;
          else return [...prevOnlines, { userId, userName, multiGuest }];
        });
      }
    });
  });
}

export default function Room({
  user,
  categorie,
  gameName,
  Game,
  Options,
  launchGame,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchToken = searchParams.get("token");

  const [isAdmin, setIsAdmin] = useState(false);
  const [roomId, setRoomId] = useState(0);
  const [inputToken, setInputToken] = useState("");
  const [roomToken, setRoomToken] = useState();
  const [isChosen, setIsChosen] = useState(false); // gamer has joined
  const [uniqueName, setUniqueName] = useState();
  const [isHere, setIsHere] = useState(false);
  const [multiGuestId, setMultiGuestId] = useState();
  const [multiGuestDataId, setMultiGuestDataId] = useState();
  const [joinError, setJoinError] = useState();
  const [showRoomRefs, setShowRoomRefs] = useState(false);
  const [isPrivate, setIsPrivate] = useState();
  const [geoLocation, setGeoLocation] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const [friendsList, setFriendsList] = useState();
  const [invitedList, setInvitedList] = useState([]);
  const [group, setGroup] = useState();
  const [gamerList, setGamerList] = useState([]);
  const [guestList, setGuestList] = useState([]);
  const [multiGuestList, setMultiGuestList] = useState([]);
  const [deletedGamer, setDeletedGamer] = useState(null);
  const [deletedGamersList, setDeletedGamersList] = useState([]);

  const [options, setOptions] = useState({});
  const [gameData, setGameData] = useState({});
  const [onlineGamers, setOnlineGamers] = useState([]);

  const { isSupported, isVisible, released, request, release } = useWake(); // check
  const userParams = user.params;
  const barsSizes = {
    bottom: userParams?.bottomBarSize || 8,
    top: userParams?.topBarSize || 8,
  };

  // admin room_creation
  const createRoom = useCallback(
    async (privacy, storedLocation, storedViceAdmin, storedArrivalsOrder) => {
      if (isChosen) return;
      const newRoomToken = genToken(10);

      localStorage.setItem(
        "reservedName",
        JSON.stringify({ roomToken: newRoomToken, name: user.name })
      );

      const {
        error,
        gamers,
        roomId: room_id,
      } = await serverCreate(
        newRoomToken,
        privacy,
        user,
        gameName,
        storedLocation,
        storedViceAdmin,
        storedArrivalsOrder
      );

      if (error) {
        setServerMessage(error);
      } else {
        const channel = pusher.subscribe(`room-${newRoomToken}`);

        channel.bind("room-event", async function (data) {
          data.clientGamerList &&
            setGamerList([...new Set([...data.clientGamerList, ...gamerList])]);
          data.multiGuestList &&
            data.multiGuestList.length &&
            setMultiGuestList([
              ...new Set([...data.multiGuestList, ...multiGuestList]),
            ]);
          data.gameData && setGameData(data.gameData);
          if (data.deleted) {
            await removeArrival({
              roomId: room_id,
              deletedGamer: data.deleted,
            });

            setDeletedGamer(data.deleted);
            setInvitedList((prevInv) =>
              prevInv.filter((inv) => inv !== data.deleted)
            );
            setGroup((prevGroup) => ({
              ...prevGroup,
              gamers: gamerList.filter((gamer) => gamer !== data.deleted),
              multiGuests: multiGuestList.filter(
                (multiGuest) => multiGuest !== data.deleted
              ),
              arrivalsOrder: prevGroup?.arrivalsOrder?.filter(
                (arrival) => arrival.userName !== data.deleted
              ),
            }));
          }
          data.privacy !== undefined && setIsPrivate(data.privacy);
        });

        subscribePresenceChannel({
          userId: user.id,
          userName: user.name,
          status: "standard",
          setOnlineGamers,
          roomToken: newRoomToken,
        });

        setRoomToken(newRoomToken);
        setUniqueName(user.name);
        setIsAdmin(true);
        setGamerList(gamers);
        setIsChosen(true);
        setServerMessage("");

        router.replace(`${pathname}?token=${newRoomToken}`);
      }
    },
    [user, gameName, gamerList, invitedList]
  );
  // ------------------------------

  // admin group_management
  useEffect(() => {
    const storedGroup = JSON.parse(localStorage.getItem("group"));
    const storedGroupPrivacy = storedGroup?.privacy;
    const storedLocation = storedGroup?.lastPosition;
    const storedViceAdmin = storedGroup?.viceAdmin;
    const storedArrivalsOrder = storedGroup?.arrivalsOrder;

    const init = async () => {
      await createRoom(
        storedGroupPrivacy || "private",
        storedLocation,
        storedViceAdmin,
        storedArrivalsOrder
      );
      storedLocation && setGeoLocation(storedLocation);
    };
    !searchToken && init();
  }, []);

  useEffect(() => {
    const storedGroup = JSON.parse(localStorage.getItem("group"));
    if (!roomToken && storedGroup) {
      setGroup(storedGroup);
    }
  }, [roomToken, gameName]);

  useEffect(() => {
    if (
      !gameName ||
      !group?.roomToken ||
      !pathname ||
      !roomToken ||
      roomToken === null ||
      gameData.ended ||
      !roomId
    )
      return;

    const storedGroup = JSON.parse(localStorage.getItem("group"));

    const go = async () => {
      if (!storedGroup) return;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // check
        await goOneMoreGame({
          pathname,
          oldRoomToken: storedGroup.roomToken,
          newRoomToken: roomToken,
          gameName,
          roomId,
        });
        localStorage.removeItem("group");
      } catch (error) {
        console.error("error", error);
      }
    };
    go();
  }, [gameName, group, pathname, roomToken, gameData.ended, roomId]);
  // ------------------------------

  //admin privacy_management
  const togglePriv = useCallback(async () => {
    await togglePrivacy({ roomId, roomToken, privacy: isPrivate });
    group &&
      setGroup((prevGroup) => ({
        ...prevGroup,
        privacy: !isPrivate ? "private" : "public",
      }));
  }, [isPrivate, roomId]);
  // ------------------------------

  //admin options_management
  useEffect(() => {
    if (
      !isAdmin ||
      !options ||
      !Object.keys(options).length ||
      !roomId ||
      !roomToken
    )
      return;

    const editOptions = async () => {
      await changeOptions({ roomId, roomToken, options });
    };
    editOptions();
  }, [options]);
  // ------------------------------

  // admin launch_room
  const launchRoom = useCallback(async () => {
    gameName !== "grouping" &&
      Object.keys(options).length &&
      (await saveLastParams({ userId: user.id, options }));
    const { error } = await launchGame({
      roomId,
      roomToken,
      adminId: user.id,
      gamers: gamerList,
      guests: guestList,
      multiGuests: multiGuestList,
      options,
    });

    if (error) {
      setServerMessage(error);
    } else {
      setServerMessage("");
      setIsStarted(true);
    }
  }, [
    gameName,
    options,
    roomId,
    roomToken,
    user.id,
    gamerList,
    guestList,
    multiGuestList,
  ]);
  // ------------------------------

  // join Room
  const joinRoom = useCallback(async () => {
    if (!isChosen || !inputToken) {
      setIsChosen(true);
      return;
    }

    const token = inputToken.toUpperCase();
    const room_id = await getRoomId(token);

    const reserved = JSON.parse(localStorage.getItem("reservedName"));
    const reservedToken = reserved?.roomToken;
    const reservedName = reserved?.name;
    const isReserved =
      reservedToken === token ||
      (reservedToken === group?.roomToken && reservedToken && group);
    const wantedName = isReserved ? reservedName : user.name;
    const uniqueUserName = await getUniqueName(room_id, wantedName, isReserved);
    localStorage.setItem(
      "reservedName",
      JSON.stringify({ roomToken: token, name: uniqueUserName })
    );

    const { error, joinData } = await serverJoin({
      token,
      user: { ...user, name: uniqueUserName },
    });

    if (error) {
      setJoinError(error);
    } else {
      if (joinData === undefined) return;
      if (joinData.isJoinAgain) {
        setIsStarted(joinData.isStarted);
        setGameData(joinData.gameData);
        setIsAdmin(joinData.admin === uniqueUserName);
        joinData.admin === uniqueUserName &&
          joinData.adminLocation &&
          setGeoLocation(joinData.adminLocation);
        setOptions(joinData.options);
      }
      const { gamers, guests, multiGuests, options } = joinData;
      const isBackedAdmin = joinData.admin === uniqueUserName;

      const channel = pusher.subscribe(`room-${token}`);
      channel.bind("room-event", async function (data) {
        data.clientGamerList &&
          data.clientGamerList.length &&
          setGamerList([...new Set([...data.clientGamerList, ...gamerList])]);
        data.multiGuestList &&
          data.multiGuestList.length &&
          setMultiGuestList([
            ...new Set([...data.multiGuestList, ...multiGuestList]),
          ]);
        data.started && setIsStarted(true);
        data.gameData && setGameData(data.gameData);
        if (data.deleted) {
          isBackedAdmin &&
            (await removeArrival({
              roomId: room_id,
              deletedGamer: data.deleted,
            }));

          setDeletedGamer(data.deleted);
          setInvitedList((prevInv) =>
            prevInv.filter((inv) => inv !== data.deleted)
          );
          if (isBackedAdmin) {
            setGroup((prevGroup) => ({
              ...prevGroup,
              gamers: gamerList.filter((gamer) => gamer !== data.deleted),
              multiGuests: multiGuestList.filter(
                (multiGuest) => multiGuest !== data.deleted
              ),
              arrivalsOrder: prevGroup?.arrivalsOrder?.filter(
                (arrival) => arrival.userName !== data.deleted
              ),
            }));
          }
        }
        !isBackedAdmin && data.options && setOptions(data.options);
        data.privacy !== undefined && setIsPrivate(data.privacy);
      });

      !isBackedAdmin && (await triggerGamers({ roomToken: token, gamers }));

      subscribePresenceChannel({
        userId: user.id,
        userName: uniqueUserName,
        status: "standard",
        setOnlineGamers,
        roomToken: token,
      });

      setRoomToken(token);
      setUniqueName(uniqueUserName);
      setGamerList(gamers);
      setGuestList(guests);
      setMultiGuestList(multiGuests);
      setOptions(options);
      setServerMessage("");
    }
  }, [inputToken, user, gamerList, isChosen]);

  const addMultiGuest = useCallback(async () => {
    if (!isChosen || !inputToken || !geoLocation) {
      setIsChosen(true);
      return;
    }
    const token = inputToken.toUpperCase();
    const id = await getRoomId(token);

    const paramsName = searchParams.get("guestName");
    const reserved = JSON.parse(localStorage.getItem("reservedName"));
    const reservedToken = reserved?.roomToken;
    const reservedName = reserved?.name;

    const isReserved =
      reservedToken === token ||
      (reservedToken === group?.roomToken && reservedToken && group);

    const wantedName = isReserved ? reservedName : paramsName;
    const multiGuestName = await getUniqueName(id, wantedName, isReserved);
    localStorage.setItem(
      "reservedName",
      JSON.stringify({ roomToken: token, name: multiGuestName })
    );

    const { error, data } = await serverAddMultiGuest(
      token,
      multiGuestName,
      geoLocation
    );

    if (error) {
      setJoinError(error);
    } else {
      if (data === undefined) return;
      if (data.isJoinAgain) {
        setIsStarted(data.isStarted);
        setGameData(data.gameData);
        setOptions(data.options);
      }
      const { gamerList, guests, multiGuests, options } = data;
      const channel = pusher.subscribe(`room-${token}`);
      channel.bind("room-event", function (data) {
        data.clientGamerList &&
          data.clientGamerList.length &&
          setGamerList([...new Set([...data.clientGamerList, ...gamerList])]);
        data.multiGuestList &&
          data.multiGuestList.length &&
          setMultiGuestList([
            ...new Set([...data.multiGuestList, ...multiGuestList]),
          ]);
        data.started && setIsStarted(true);
        data.gameData && setGameData(data.gameData);
        data.deleted && setDeletedGamer(data.deleted);
        data.options && setOptions(data.options);
      });

      await triggerMultiguests({ roomToken: token, multiGuests });

      setRoomToken(token);
      setUniqueName(multiGuestName);
      setGamerList(gamerList);
      setGuestList(guests);
      setMultiGuestList(multiGuests);
      setOptions(options);
      setServerMessage("");
    }
  }, [geoLocation, searchParams, inputToken, isChosen]);

  useEffect(() => {
    if (searchToken) {
      setInputToken(searchToken);

      const join = async () => {
        if (
          !user.multiGuest &&
          !uniqueName &&
          !gamerList?.some((gamerName) => gamerName === uniqueName) &&
          deletedGamer !== uniqueName
        )
          await joinRoom();
        else if (
          user.multiGuest &&
          !uniqueName &&
          !multiGuestList?.some((multiName) => multiName === uniqueName) &&
          deletedGamer !== uniqueName
        )
          await addMultiGuest();
      };
      join();
    }
  }, [
    searchToken,
    joinRoom,
    addMultiGuest,
    user.multiGuest,
    gamerList,
    multiGuestList,
    uniqueName,
  ]);

  useEffect(() => {
    if (!joinError) return;
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  }, [joinError]);
  // ------------------------------

  // get [roomId + privacy]
  useEffect(() => {
    if (!roomToken) return;
    async function get() {
      const storedGroupPrivacy = JSON.parse(
        localStorage.getItem("group")
      )?.privacy;
      const { id, priv } = await getRoomRefs(roomToken);

      setRoomId(id);

      if (isAdmin && !!storedGroupPrivacy) {
        setIsPrivate(storedGroupPrivacy === "private");
      } else {
        setIsPrivate(priv);
      }
    }
    get();

    return () => {
      pusher.unsubscribe(`room-${roomToken}`);
    };
  }, [roomToken, isAdmin]);
  // ------------------------------

  // CP friends
  const getFriends = useCallback(async () => {
    const friends = await getRoomFriendList({ userId: user.id });
    setFriendsList(friends);
  }, [user.id]);

  useEffect(() => {
    if (user.multiGuest) return;
    setTimeout(async () => await getFriends(), !friendsList ? 0 : 2000);
    getFriends();
  }, [gamerList]);
  // ------------------------------

  // delete CP_invitations when going out
  const deleteInvs = useCallback(async () => {
    await deleteInvitations({
      userId: user.id,
      categorie,
      gameName,
      roomToken,
    });
  }, [user.id, categorie, gameName, roomToken]);
  // ------------------------------

  // multiGuest: get Location
  useEffect(() => {
    const getMultiLoc = async () => {
      try {
        const loc = await getLocation();
        setGeoLocation(loc);
      } catch (error) {
        setServerMessage(error.message);
      }
    };
    user.multiGuest && getMultiLoc();
  }, [user]);
  // ------------------------------

  // init multiGuest: id, dataId, presence
  useEffect(() => {
    if (user.multiGuest && gameData.gamers && uniqueName && roomToken) {
      const id = gameData.gamers.find((gamer) => gamer.name === uniqueName)?.id;

      setMultiGuestId(id);
      setMultiGuestDataId(
        gameData.gamers.find((gamer) => gamer.name === uniqueName)?.dataId
      );
      // check : gamedata
      subscribePresenceChannel({
        userId: id,
        userName: uniqueName,
        status: "multiGuest",
        setOnlineGamers,
        roomToken,
      });
    }
  }, [isStarted, gameData.gamers, uniqueName, roomToken, user]);
  // ------------------------------

  // check connection
  useEffect(() => {
    if (!roomId || isHere || !uniqueName || !roomToken) return;
    let connectInterval = setInterval(() => {
      const check = async () => {
        const isConnected = await checkConnection({
          roomId,
          uniqueName,
          isMultiGuest: user.multiGuest,
        });
        if (isConnected) {
          setIsHere(true);
          clearInterval(connectInterval);
        } else {
          if (!user.multiGuest)
            await retryGamerConnection({
              roomId,
              roomToken,
              uniqueName,
              userId: user.id,
            });
          else
            await retryMultiGuestConnection({ roomId, uniqueName, roomToken });
        }
      };
      check();
    }, 1000);
    return () => {
      clearInterval(connectInterval);
    };
  }, [isHere, roomId, uniqueName, roomToken, user.id, user.multiGuest]);
  // ------------------------------

  // deletions
  const deleteGamer = async (gamer) => {
    const gamers = await serverDeleteGamer({
      token: roomToken,
      gamerName: gamer,
    });
    if (gamer === uniqueName)
      pusherPresence.unsubscribe(`presence-${roomToken}`);
    if (!gamers) router.push("/");

    setServerMessage(`Joueur ${gamer} retiré`);
    setGamerList(gamers);
    setDeletedGamersList((prevList) => [...prevList, gamer]);
    setTimeout(async () => await getFriends(), 1000);
  };

  const deleteMultiGuest = async (multiGuest) => {
    const multiGuests = await serverDeleteMultiGuest({
      token: roomToken,
      multiGuestName: multiGuest,
    });
    if (!multiGuests) router.push("/");

    setServerMessage(`Guest ${multiGuest} retiré`);
    setMultiGuestList(multiGuests);
  };

  useEffect(() => {
    if (!deletedGamer || !uniqueName || !router) return;
    const backToHome = async () => {
      try {
        //tricky: router before
        localStorage.removeItem("reservedName");
        router.push("/categories?control=true");
        !user.multiGuest && (await cancelBack({ userId: user.id }));
      } catch (error) {
        console.error("Erreur pendant la redirection : ", error);
      }
    };
    if (deletedGamer === uniqueName) backToHome();
  }, [deletedGamer, uniqueName, router]);

  useEffect(() => {
    if (!deletedGamer) return;
    setGamerList((prevGamers) =>
      prevGamers.filter((gamer) => gamer !== deletedGamer)
    );
    setMultiGuestList((prevMultiGuests) =>
      prevMultiGuests.filter((multiGuest) => multiGuest !== deletedGamer)
    );
  }, [deletedGamer]);
  // ------------------------------

  // not_admins redirections
  useEffect(() => {
    if (
      !gameData ||
      !gameData.nextGame ||
      !gameName ||
      isStarted === undefined ||
      !user
    )
      return;
    if (
      gameData?.nextGame !== "deleted group" &&
      (gameName === "grouping" || !isStarted)
    ) {
      const goNewGame = async () => {
        !user.multiGuest && (await deleteInvs());
        const group = { roomToken };
        localStorage.setItem("group", JSON.stringify(group));
        // check router.push
        window.location.href = `${gameData.nextGame.path}${
          user.multiGuest ? `&guestName=${user.name}` : ""
        }`;
      };
      goNewGame();
    }
  }, [gameData, gameName, isStarted, user]);
  // ------------------------------

  // send presence_sign
  useEffect(() => {
    if (!roomToken || !user?.name) return;
    const interval = setInterval(async () => {
      await sendPresenceSign({
        roomToken,
        userName: user.name,
        userId: user.id,
        multiGuest: !!user.multiGuest,
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [roomToken, user]);
  // ------------------------------

  if (joinError) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        {joinError}
      </div>
    );
  }

  if (gameData && gameData?.nextGame === "deleted group" && user) {
    return (
      <>
        <h1 className="mt-28">Le groupe a été supprimé</h1>
        <button
          onClick={async () => {
            !user.multiGuest && (await deleteInvs());
            router.push("/categories?control=true");
          }}
          className="border border-blue-300 bg-blue-100"
        >
          Quitter
        </button>
      </>
    );
  }

  if (!roomId || !gameData) return null;

  if (!isStarted) {
    return (
      <div className="absolute h-screen w-full z-50">
        <UserContext.Provider value={{ userParams }}>
          <div
            className={`flex items-end h-${barsSizes.top} w-full z-50 bg-black`}
          >
            <div className="flex justify-center text-white w-full m-1">
              {gamesRefs[gameName].categorie === "grouping"
                ? "Lobby"
                : gamesRefs[gameName].name}
            </div>
          </div>

          {(!isChosen && !group) || isPrivate === undefined ? (
            <div>Chargement...</div>
          ) : (
            <>
              {isAdmin && (
                <>
                  <div className="flex justify-center items-center m-2">
                    {isPrivate ? (
                      <LockClosedIcon
                        onClick={async () => {
                          await togglePriv();
                          await inviteAll({
                            userId: user.id,
                            userName: user.name,
                            categorie,
                            gameName,
                            mode: options?.mode,
                            roomToken,
                          });
                          setInvitedList(() => {
                            const friendsNames = friendsList.map(
                              (friend) => friend.name
                            );
                            return friendsNames;
                          });
                        }}
                        className="ml-2 mb-2 w-8 h-8 text-blue-300"
                      />
                    ) : (
                      <LockOpenIcon
                        onClick={async () => await togglePriv()}
                        className="ml-2 mb-2 w-8 h-8 text-green-300"
                      />
                    )}
                  </div>
                </>
              )}
              <div>
                {(() => {
                  if (!gamerList || !multiGuestList) return;
                  const gamersNumber =
                    gamerList.length + guestList.length + multiGuestList.length;
                  const badGamersNumber =
                    gamersNumber < gamesRefs[gameName].limits?.min ||
                    gamersNumber > gamesRefs[gameName].limits?.max;

                  return (
                    <div>
                      Liste des joueurs [
                      <span
                        className={`${
                          badGamersNumber && "text-red-800 font-semibold"
                        }`}
                      >
                        {gamersNumber}
                      </span>
                      {gamesRefs[gameName].limits &&
                        ` / ${gamesRefs[gameName].limits.max}`}
                      ]
                    </div>
                  );
                })()}
              </div>
              {group?.gamers &&
                group.gamers.map((gamer) => {
                  const gamerName = gamer.name;
                  const isHere = gamerList?.includes(gamerName);
                  return (
                    <div key={gamerName} className="flex">
                      <div className="flex">
                        <div
                          className={
                            gamerName === uniqueName ? "font-semibold" : ""
                          }
                        >
                          {gamerName}
                        </div>
                        {gamerName !== user.name ? (
                          isHere ? (
                            <CheckIcon className="block h-6 w-6 " />
                          ) : (
                            " ... "
                          )
                        ) : null}
                      </div>
                      {isHere && gamerName !== user.name && (
                        <button
                          onClick={async () => {
                            const newGamersGroup = [...group.gamers].filter(
                              (gamer) => gamer.name !== gamerName
                            );
                            setGroup((prevGroup) => ({
                              ...prevGroup,
                              gamers: newGamersGroup,
                            }));
                            await deleteGamer(gamerName);
                          }}
                          className="border border-blue-300 bg-blue-100"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  );
                })}
              {group?.multiGuests &&
                group.multiGuests.map((multi) => {
                  const multiName = multi.name;
                  const isHere = multiGuestList?.includes(multiName);
                  return (
                    <div key={multiName} className="flex">
                      <div className="flex">
                        {multiName}{" "}
                        <span className="italic text-sm">(guest externe)</span>
                        {isHere ? (
                          <CheckIcon className="block h-6 w-6 " />
                        ) : (
                          " ... "
                        )}
                      </div>
                      {isHere && (
                        <button
                          onClick={() => {
                            const newMultiGroup = [...group.multiGuests].filter(
                              (multi) => multi.name !== multiName
                            );
                            setGroup((prevGroup) => ({
                              ...prevGroup,
                              multiGuests: newMultiGroup,
                            }));
                            deleteMultiGuest(multiName);
                          }}
                          className="border border-blue-300 bg-blue-100"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  );
                })}
              <div>
                {gamerList?.map((gamer) => {
                  const gamerNameList =
                    group?.gamers?.map((gamer) => gamer.name) || [];
                  const multiNameList =
                    group?.multiGuests?.map((multi) => multi.name) || [];
                  if (
                    gamerNameList.includes(gamer) ||
                    multiNameList.includes(gamer)
                  )
                    return;
                  return (
                    <div key={gamer} className="flex">
                      <div
                        className={gamer === uniqueName ? "font-semibold" : ""}
                      >
                        {gamer}
                      </div>
                      {isAdmin && gamer !== user.name && (
                        <button
                          onClick={async () => await deleteGamer(gamer)}
                          className="border border-blue-300 bg-blue-100"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  );
                })}
                {multiGuestList?.map((multiGuest, i) => {
                  const gamerNameList =
                    group?.gamers?.map((gamer) => gamer.name) || [];
                  const multiNameList =
                    group?.multiGuests?.map((multi) => multi.name) || [];
                  if (
                    multiNameList.includes(multiGuest) ||
                    gamerNameList.includes(multiGuest)
                  )
                    return;
                  return (
                    <div key={i} className="flex">
                      <div>
                        <div
                          className={
                            multiGuest === uniqueName ? "font-semibold" : ""
                          }
                        >
                          {multiGuest}
                          <span className="italic text-sm font-normal">
                            (guest externe)
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => deleteMultiGuest(multiGuest)}
                          className="border border-blue-300 bg-blue-100"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <hr />
              {!user.multiGuest && (
                <div className="flex flex-col items-center">
                  <div className="flex mt-1">
                    <h1>Invite tes amis !</h1>
                    <button
                      onClick={async () => {
                        const friends = await getRoomFriendList({
                          userId: user.id,
                        });
                        setFriendsList(friends);
                      }}
                      className="flex justify-center items-center border border-blue-300 bg-blue-100 ml-2"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <h2 className="text-sm italic">
                    Ils recevront ton invitation via &quot;Invitations aux
                    parties&quot;.
                  </h2>
                  <div>
                    {friendsList &&
                      friendsList.map((friend) => {
                        if (
                          deletedGamersList.some(
                            (deleted) => deleted === friend.name
                          ) ||
                          gamerList.some((gamer) => gamer === friend.name)
                        )
                          return;
                        const invited = invitedList.some(
                          (inv) => inv === friend.name
                        );
                        return (
                          <button
                            key={friend.id}
                            onClick={async () => {
                              await inviteFriend({
                                userName: user.name,
                                friendMail: friend.email,
                                categorie,
                                gameName,
                                mode: options?.mode,
                                roomToken,
                              });
                              setInvitedList((prevInv) => [
                                ...new Set([...prevInv, friend.name]),
                              ]);
                            }}
                            className={`border ${
                              !invited
                                ? "border-blue-300 bg-blue-100"
                                : "border-green-300 bg-green-100"
                            }`}
                          >
                            {friend.customName}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
              <div
                className={`absolute flex items-end h-${barsSizes.bottom} w-full z-50 bg-black bottom-0`}
              >
                <div
                  className="absolute bottom-[0.2rem] left-2"
                  style={{ bottom: `${barsSizes.bottom / 4}rem` }}
                >
                  {!user.multiGuest && !isAdmin && (
                    <button
                      onClick={async () => await deleteGamer(uniqueName)}
                      className="border border-blue-300 bg-blue-100"
                    >
                      Quitter le groupe
                    </button>
                  )}
                  {user.multiGuest && (
                    <button
                      onClick={async () => await deleteMultiGuest(uniqueName)}
                      className="border border-blue-300 bg-blue-100"
                    >
                      Quitter le groupe
                    </button>
                  )}
                </div>
              </div>
              {isAdmin && (
                <>
                  <hr />

                  <>
                    <h1>Invite des Guests multi-screen !</h1>
                    <h2 className="text-sm italic">
                      Ils joueront sur leur propre écran.
                    </h2>
                    <button
                      onClick={async () => {
                        try {
                          if (!geoLocation) {
                            const loc = await getLocation();
                            await saveLocation({ geoLocation: loc, roomId });
                            setGeoLocation(loc);
                            setShowRoomRefs(true);
                          } else {
                            setShowRoomRefs(!showRoomRefs);
                          }
                        } catch (error) {
                          console.error(error.message);
                          const errorInformations = getErrorInformations({
                            window,
                            fail: "location_permission",
                          }).map((info, i) => (
                            <div
                              key={i}
                              className={`${i === 0 && "font-bold"}`}
                            >
                              {i !== 0 && "=>"}
                              {info}
                            </div>
                          ));
                          setServerMessage(errorInformations);
                        }
                      }}
                      className="border border-blue-300 bg-blue-100"
                    >
                      {!showRoomRefs ? "Afficher" : "Cacher"} le QrCode
                    </button>
                    {showRoomRefs && geoLocation && (
                      <QRCode
                        value={`${process.env.NEXT_PUBLIC_APP_URL}/invitation/?categorie=${categorie}&gameName=${gameName}&token=${roomToken}`}
                      />
                    )}

                    <hr />
                  </>

                  <div className="flex justify-center">
                    <div className="flex flex-col">{serverMessage}</div>
                  </div>

                  <div
                    className={`absolute bottom-0 w-full bg-black z-10`}
                    style={{ height: `${barsSizes.bottom}` }}
                  >
                    <div className="relative h-full">
                      <div
                        onClick={async () => await deleteInvs()}
                        className="absolute left-2"
                        style={{ bottom: `${barsSizes.bottom / 4}rem` }}
                      >
                        <DeleteGroup roomToken={roomToken} roomId={roomId} />
                      </div>
                      <div
                        onClick={async () => await deleteInvs()}
                        className="absolute right-2"
                        style={{ bottom: `${barsSizes.bottom / 4}rem` }}
                      >
                        {group?.lastGame &&
                          group.lastGame !== "grouping" &&
                          gameName === "grouping" && (
                            <ChooseLastGame
                              lastGame={group.lastGame}
                              lastMode={group.lastMode}
                              lastPosition={geoLocation}
                              group={group}
                              roomToken={roomToken}
                            />
                          )}

                        {gameName !== "grouping" && group && (
                          <>
                            <ChooseAnotherGame
                              group={group}
                              roomToken={roomToken}
                              gameData={gameData}
                              lastGame={group.lastGame}
                              lastPosition={geoLocation}
                              viceAdmin={group.viceAdmin}
                              arrivalsOrder={group.arrivalsOrder}
                            />
                          </>
                        )}
                      </div>
                      <div onClick={async () => await deleteInvs()}>
                        <NextStep onClick={() => launchRoom()}>
                          {gameName === "grouping" ? (
                            <div className="text-xl">Jouer</div>
                          ) : (
                            <div className="">Lancer</div>
                          )}
                        </NextStep>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {Options && options && setOptions && setServerMessage && (
                <Options
                  userId={user.id}
                  isAdmin={isAdmin}
                  options={options}
                  setOptions={setOptions}
                  lastMode={group?.lastMode}
                  setServerMessage={setServerMessage}
                />
              )}
            </>
          )}
        </UserContext.Provider>
      </div>
    );
  } else {
    return (
      <div className="absolute h-screen w-full z-50">
        <UserContext.Provider value={{ userParams }}>
          <div className={`fixed h-${barsSizes.top} w-full z-[70] bg-black`} />

          <div
            className={`overflow-y-auto z-[60] w-full`}
            style={{
              height: `calc(100vh - ${
                barsSizes.top / 4 + barsSizes.top / 4
              }rem)`,
              marginTop: `${barsSizes.top / 4}rem`,
            }}
          >
            <Game
              roomId={roomId}
              roomToken={roomToken}
              user={{
                ...user,
                name: uniqueName,
                ...(!!multiGuestId ? { id: multiGuestId } : {}),
                ...(!!multiGuestDataId ? { dataId: multiGuestDataId } : {}),
              }}
              onlineGamers={onlineGamers}
              gameData={gameData}
              storedLocation={geoLocation} //searching game only
            />
          </div>
        </UserContext.Provider>
      </div>
    );
  }
}

export function useUserContext() {
  return useContext(UserContext);
}
