"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Pusher from "pusher-js";
import QRCode from "react-qr-code";
import useWake from "@/utils/useWake";

import usePreventScroll from "@/utils/usePreventScroll";
import genToken from "@/utils/genToken";
import getLocation from "@/utils/getLocation";
import getErrorInformations from "@/utils/getErrorInformations";
import { getRoomFriendList } from "@/utils/getFriendList";
import { saveLastParams } from "@/utils/getLastParams";
import cancelBack from "@/utils/cancelBack";
import { gamesRefs, modesRules, categoriesIcons } from "@/assets/globals";

import { CornerTriangle } from "../Triangle";
import { LobbyDeleteGroup } from "@/components/DeleteGroup";
import ChooseAnotherGame from "@/components/ChooseAnotherGame";
import ChooseLastGame from "@/components/ChooseLastGame";
import NextStep from "../NextStep";

import {
  CheckIcon,
  ArrowPathIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import { FaInfo } from "react-icons/fa6";
import { IoInformationCircleOutline } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FaUserFriends } from "react-icons/fa";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoMdArrowDropright } from "react-icons/io";
import { LiaQrcodeSolid } from "react-icons/lia";

import "./room.css";

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

const subscribePresenceChannel = ({
  userId,
  userName,
  status,
  setOnlineGamers,
  roomToken,
}) => {
  pusherPresence = new Pusher("61853af9f30abf9d5b3d", {
    cluster: "eu",
    useTLS: true,
    authEndpoint: "/api/pusherAuth/",
    auth: {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params: {
        userId,
        userName,
        multiGuest: (status === "multiGuest").toString(),
      },
    },
  });
  const presenceChannel = pusherPresence.subscribe(`presence-${roomToken}`);
  let pingTimeStamps = {};

  // presenceChannel.bind("pusher:subscription_succeeded", ({ members }) => {
  //   setOnlineGamers(Object.values(members));
  // });

  // presenceChannel.bind("pusher:subscription_error", (status) => {
  //   console.error("Subscription failed:", status);
  // });

  // presenceChannel.bind("pusher:member_added", (member) => {
  //   setOnlineGamers(Object.values(presenceChannel.members.members));
  // });

  // presenceChannel.bind("pusher:member_removed", (member) => {
  //   setOnlineGamers(Object.values(presenceChannel.members.members));
  // });

  presenceChannel.bind("check-presence", (presence) => {
    pingTimeStamps[presence.userName] = presence.time;

    Object.entries(pingTimeStamps).forEach((stamp) => {
      if (Date.now() - stamp[1] > 15000) {
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
};

export default function Room({
  user,
  categorie,
  gameName,
  Game,
  Options,
  launchGame,
}) {
  usePreventScroll();
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

  const [showPlayers, setShowPlayers] = useState(true);
  const [showGamerList, setShowGamerList] = useState(true);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showRoomRefs, setShowRoomRefs] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

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
    // if (!isChosen || !inputToken || !geoLocation) {
    if (!isChosen || !inputToken) {
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
      const { gamers, guests, multiGuests, options } = data;
      const channel = pusher.subscribe(`room-${token}`);
      channel.bind("room-event", function (data) {
        data.clientGamerList &&
          data.clientGamerList.length &&
          setGamerList([...new Set([...data.clientGamerList, ...gamers])]);
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
      setGamerList(gamers);
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
    // user.multiGuest && getMultiLoc();
  }, [user]);
  // ------------------------------

  // init multiGuest: id, dataId, presence
  useEffect(() => {
    const id = gameData?.gamers?.find((gamer) => gamer.name === uniqueName)?.id;
    if (
      id &&
      user.multiGuest &&
      gameData.gamers &&
      uniqueName &&
      roomToken &&
      isStarted &&
      setOnlineGamers
    ) {
      subscribePresenceChannel({
        userId: id,
        userName: uniqueName,
        status: "multiGuest",
        setOnlineGamers,
        roomToken,
      });

      setMultiGuestId(id);
      setMultiGuestDataId(
        gameData.gamers.find((gamer) => gamer.name === uniqueName)?.dataId
      );
    }
  }, [
    isStarted,
    gameData.gamers,
    uniqueName,
    roomToken,
    user,
    setOnlineGamers,
  ]);
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
        router.push("/categories");
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
    if (!roomToken || !user) return;
    const sendFirstPresenceSign = async () => {
      await sendPresenceSign({
        roomToken,
        userName: user.name,
        userId: user.id,
        multiGuest: !!user.multiGuest,
      });
    };
    sendFirstPresenceSign();

    const interval = setInterval(async () => {
      await sendPresenceSign({
        roomToken,
        userName: user.name,
        userId: user.id,
        multiGuest: !!user.multiGuest,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [roomToken, user]);
  // ------------------------------

  const [isExtandedPlayers, setIsExtandedPlayers] = useState(false);

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
            router.push("/categories");
          }}
          className="border border-sky-300 bg-sky-100"
        >
          Quitter
        </button>
      </>
    );
  }

  if (!roomId || !gameData) return null;

  if (!isStarted) {
    return (
      <div className="absolute h-[100dvh] w-full px-2 overflow-x-hidden">
        <UserContext.Provider value={{ userParams }}>
          <div className={`relative h-full w-full`}>
            <div
              className="absolute left-0 translate-x-[-50%] translate-y-[-1rem] z-10"
              style={{ top: `${barsSizes.top / 4}rem` }}
            >
              <CornerTriangle direction={{ y: "bottom", x: "left" }} />
            </div>
            <div
              className="absolute right-0 translate-x-[50%] translate-y-[-1rem] z-10"
              style={{ top: `${barsSizes.top / 4}rem` }}
            >
              <CornerTriangle direction={{ y: "bottom", x: "right" }} />
            </div>
            <div
              className="absolute left-0 translate-x-[-50%] translate-y-[1rem] z-10"
              style={{ bottom: `${barsSizes.bottom / 4}rem` }}
            >
              <CornerTriangle direction={{ y: "top", x: "left" }} />
            </div>
            <div
              className="absolute right-0 translate-x-[50%] translate-y-[1rem] z-10"
              style={{ bottom: `${barsSizes.bottom / 4}rem` }}
            >
              <CornerTriangle direction={{ y: "top", x: "right" }} />
            </div>
            <div className="absolute right-full w-2.5 bg-black h-full z-10" />
            <div className="absolute left-full w-2.5 bg-black h-full z-10" />
            <div
              className="h-full w-full relative bg-purple-600"
              style={{
                paddingTop: `${barsSizes.top / 4}rem`,
                paddingBottom: `${barsSizes.bottom / 4}rem`,
              }}
            >
              <div
                className="absolute left-0 w-full bg-transparent"
                style={{
                  top: `${barsSizes.top / 4}rem`,
                  height: `calc(100% - ${barsSizes.top / 4}rem - ${
                    barsSizes.bottom / 4
                  }rem)`,
                  boxShadow:
                    "inset -9px 0px 5px -6px #581c87, inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
                }}
              />
            </div>
          </div>
          {isAdmin && gameName !== "grouping" && (
            <div onClick={async () => await deleteInvs()}>
              <NextStep onClick={() => launchRoom()}>
                <div>Lancer</div>
              </NextStep>
            </div>
          )}

          <div
            className="h-full w-full absolute top-0 left-0 z-20 px-2"
            style={{
              paddingTop: `${barsSizes.top / 4}rem`,
              paddingBottom: `${barsSizes.bottom / 4}rem`,
            }}
          >
            {(!isChosen && !group) || isPrivate === undefined ? (
              <div>Chargement...</div>
            ) : (
              <div className="relative h-full w-full">
                <div className="absolute left-1/2 translate-x-[-50%] h-[10dvh] w-full">
                  <div className="w-full flex justify-center translate-y-[1rem]">
                    {categorie !== "grouping" && (
                      <div className="flex items-center">
                        <div>
                          {options?.mode
                            ? modesRules[options?.mode].limits.min
                            : gamesRefs[gameName].limits.min}
                          &nbsp;
                        </div>
                        <FaLongArrowAltRight className="mr-1 w-6 h-6" />
                        <div className="text-2xl text-amber-400">
                          {options?.mode
                            ? modesRules[options?.mode].limits.opti
                            : gamesRefs[gameName].limits.opti}
                        </div>
                        <FaLongArrowAltLeft className="ml-1 w-6 h-6" />
                        <div>
                          &nbsp;
                          {options?.mode
                            ? modesRules[options?.mode].limits.max
                            : gamesRefs[gameName].limits.max}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-[7dvh] w-full flex justify-center items-center">
                    {categorie !== "grouping" && categoriesIcons ? (
                      <Image
                        src={categoriesIcons[categorie]}
                        alt={`${categorie} image`}
                        className="max-h-[4dvh] max-w-[4dvh] aspect-square"
                        style={{ objectFit: "contain" }}
                        width={500}
                        height={500}
                      />
                    ) : (
                      <div className="h-[4dvh] w-[4dvh]" />
                    )}
                    {isAdmin ? (
                      <div className="text-center text-amber-700 text-3xl flex justify-center items-center border border-amber-700 bg-amber-100 p-2 mx-2 min-w-[15dvh]">
                        {gamesRefs[gameName].categorie === "grouping" ? (
                          <div
                            onClick={() => launchRoom()}
                            className="w-full h-full"
                          >
                            +
                          </div>
                        ) : (
                          gameName !== "grouping" &&
                          group && (
                            <ChooseAnotherGame
                              group={group}
                              roomToken={roomToken}
                              gameData={gameData}
                              lastGame={group.lastGame}
                              lastPosition={geoLocation}
                              viceAdmin={group.viceAdmin}
                              arrivalsOrder={group.arrivalsOrder}
                            >
                              {gamesRefs[gameName].name}
                            </ChooseAnotherGame>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-amber-400 text-3xl flex justify-center items-center mx-2 min-w-[15dvh]">
                        {gamesRefs[gameName].categorie === "grouping" ? (
                          <span>Lobby</span>
                        ) : (
                          gamesRefs[gameName].name
                        )}
                      </div>
                    )}
                    <div className="rounded-full h-[4dvh] w-[4dvh] border border-amber-700 bg-amber-100 flex justify-center items-center">
                      <FaInfo className="h-[2.5dvh] w-[2.5dvh] text-amber-700" />
                    </div>
                  </div>
                </div>

                <div
                  className="le_test absolute top-1/2 translate-y-[-50%] left-1/2 translate-x-[-50%] w-full flex flex-col items-center gap-2"
                  style={{ height: "calc(100% - 30vh)" }}
                >
                  <div
                    onClick={() => {
                      if (!showPlayers) {
                        setShowPlayers(true);
                        setShowConfig(false);
                      }
                    }}
                    className={`overflow-hidden relative flex flex-col items-center border w-[80%] transition-[height] duration-1000 ease-in-out ${
                      !showPlayers
                        ? "h-12 border border-2 rounded-md border-amber-700 bg-amber-100 text-amber-700 p-2"
                        : "h-full border border-2 rounded-md border-sky-700 bg-sky-100 text-sky-700 p-2"
                    }`}
                  >
                    {!showPlayers && (
                      <div>
                        <div className="flex items-center absolute left-2 top-1">
                          {isPrivate ? (
                            <LockClosedIcon className="h-8 w-8 mb-0.5" />
                          ) : (
                            <LockOpenIcon className="h-8 w-8 mb-0.5" />
                          )}
                        </div>
                        {(() => {
                          if (!gamerList || !multiGuestList) return;
                          const gamersNumber =
                            gamerList.length +
                            guestList.length +
                            multiGuestList.length;
                          const badGamersNumber =
                            gamersNumber < gamesRefs[gameName].limits?.min ||
                            gamersNumber > gamesRefs[gameName].limits?.max;

                          return (
                            <div className="text-xl absolute top-1.5 left-[50%] translate-x-[-50%]">
                              <span>Joueurs&nbsp;:&nbsp;</span>
                              <span
                                className={`${
                                  badGamersNumber &&
                                  "text-red-800 font-semibold"
                                }`}
                              >
                                {gamersNumber}
                              </span>
                              <span>
                                {gamesRefs[gameName].limits &&
                                  `\u00A0/\u00A0${gamesRefs[gameName].limits.max}`}
                              </span>
                            </div>
                          );
                        })()}
                        <div className="absolute right-1 top-1">
                          <ChevronRightIcon className="h-8 w-8" />
                        </div>
                      </div>
                    )}
                    {showPlayers && (
                      <div>
                        <div className="absolute right-2 top-2">
                          <ChevronDownIcon className="h-8 w-8" />
                        </div>

                        <div className="absolute top-2 left-2 flex flex-col gap-2">
                          <div
                            className={`p-1 ${
                              isAdmin &&
                              "border border-amber-700 bg-amber-100 w-fit"
                            }`}
                          >
                            {isPrivate ? (
                              <LockClosedIcon
                                onClick={async () => {
                                  if (!isAdmin) return;
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
                                className={`w-8 h-8 ${
                                  isAdmin ? "text-amber-700" : "text-sky-700"
                                }`}
                              />
                            ) : (
                              <LockOpenIcon
                                onClick={async () => {
                                  if (!isAdmin) return;
                                  await togglePriv();
                                }}
                                className={`w-8 h-8 ${
                                  isAdmin ? "text-amber-700" : "text-sky-700"
                                }`}
                              />
                            )}
                          </div>
                          {!user.multiGuest && (
                            <>
                              <div
                                onClick={() => {
                                  setShowGamerList(true);
                                  setShowInvitations(false);
                                  setShowRoomRefs(false);
                                }}
                                className={`${
                                  showGamerList
                                    ? "border border-sky-100 text-sky-700 relative p-1"
                                    : "border border-amber-700 bg-amber-100 text-amber-700 relative p-1"
                                }`}
                              >
                                <FaUserFriends className="w-8 h-8" />
                                {showGamerList && (
                                  <div className="absolute left-full top-1/2 translate-y-[-50%]">
                                    <IoMdArrowDropright className="h-8 w-8 pr-2" />
                                  </div>
                                )}
                              </div>
                              <div
                                onClick={() => {
                                  setShowGamerList(false);
                                  setShowInvitations(true);
                                  setShowRoomRefs(false);
                                }}
                                className={`${
                                  showInvitations
                                    ? "border border-sky-100 text-sky-700 relative p-1"
                                    : "border border-amber-700 bg-amber-100 text-amber-700 relative p-1"
                                }`}
                              >
                                <IoPersonAddSharp className="w-8 h-8" />
                                {showInvitations && (
                                  <div className="absolute left-full top-1/2 translate-y-[-50%]">
                                    <IoMdArrowDropright className="h-8 w-8 pr-2" />
                                  </div>
                                )}
                              </div>

                              {isAdmin && (
                                <div
                                  onClick={async () => {
                                    try {
                                      // if (!geoLocation) {
                                      //   const loc = await getLocation();
                                      //   await saveLocation({
                                      //     geoLocation: loc,
                                      //     roomId,
                                      //   });
                                      //   setGeoLocation(loc);
                                      // }
                                      setShowGamerList(false);
                                      setShowInvitations(false);
                                      setShowRoomRefs(true);
                                    } catch (error) {
                                      console.error(error.message);
                                      const errorInformations =
                                        getErrorInformations({
                                          window,
                                          fail: "location_permission",
                                        }).map((info, i) => (
                                          <div
                                            key={i}
                                            className={`${
                                              i === 0 && "font-bold"
                                            }`}
                                          >
                                            {i !== 0 && "=>"}
                                            {info}
                                          </div>
                                        ));
                                      setServerMessage(errorInformations);
                                    }
                                  }}
                                  className={`${
                                    showRoomRefs
                                      ? "border border-sky-100 text-sky-700 relative p-1"
                                      : "border border-amber-700 bg-amber-100 text-amber-700 relative p-1"
                                  }`}
                                >
                                  <LiaQrcodeSolid className="w-8 h-8" />
                                  {showRoomRefs && (
                                    <div className="absolute left-full top-1/2 translate-y-[-50%]">
                                      <IoMdArrowDropright className="h-8 w-8 pr-2" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {showGamerList && (
                          <>
                            {(() => {
                              if (!gamerList || !multiGuestList) return;
                              const gamersNumber =
                                gamerList.length +
                                guestList.length +
                                multiGuestList.length;
                              const badGamersNumber =
                                gamersNumber <
                                  gamesRefs[gameName].limits?.min ||
                                gamersNumber > gamesRefs[gameName].limits?.max;

                              return (
                                <div className="flex justify-center items-center h-8">
                                  <div className="relative">
                                    Liste des joueurs&nbsp;:&nbsp;
                                    <div className="absolute left-full top-1/2 translate-y-[-50%] w-full flex items-baseline">
                                      <div
                                        className={`font-semibold ${
                                          badGamersNumber && "text-red-800"
                                        }`}
                                      >
                                        {gamersNumber}&nbsp;
                                      </div>
                                      {gamesRefs[gameName].limits && (
                                        <div>
                                          {`/\u0020${gamesRefs[gameName].limits.max}`}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                            {group?.gamers &&
                              group.gamers.map((gamer) => {
                                const gamerName = gamer.name;
                                const isHere = gamerList?.includes(gamerName);
                                return (
                                  <div
                                    key={gamerName}
                                    className="w-full flex justify-center"
                                  >
                                    <div
                                      className={`${
                                        gamerName === uniqueName
                                          ? "font-semibold"
                                          : ""
                                      } relative`}
                                    >
                                      <span className="text-lg">
                                        {gamerName}
                                      </span>
                                      <div className="absolute right-full top-0">
                                        {gamerName !== user.name ? (
                                          isHere ? (
                                            <CheckIcon className="h-6 w-6 " />
                                          ) : (
                                            " ... "
                                          )
                                        ) : null}
                                      </div>
                                      {isHere && gamerName !== user.name && (
                                        <button
                                          onClick={async () => {
                                            const newGamersGroup = [
                                              ...group.gamers,
                                            ].filter(
                                              (gamer) =>
                                                gamer.name !== gamerName
                                            );
                                            setGroup((prevGroup) => ({
                                              ...prevGroup,
                                              gamers: newGamersGroup,
                                            }));
                                            await deleteGamer(gamerName);
                                          }}
                                          className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                        >
                                          <XMarkIcon className="w-5 h-5" />
                                        </button>
                                      )}
                                      {isHere && gamerName === user.name && (
                                        <div
                                          onClick={async () =>
                                            await deleteInvs()
                                          }
                                        >
                                          <LobbyDeleteGroup
                                            roomToken={roomToken}
                                            roomId={roomId}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            {group?.multiGuests &&
                              group.multiGuests.map((multi) => {
                                const multiName = multi.name;
                                const isHere =
                                  multiGuestList?.includes(multiName);
                                return (
                                  <div
                                    key={multiName}
                                    className="w-full flex justify-center"
                                  >
                                    <div className="flex justify-center items-center relative">
                                      <span className="text-lg">
                                        {multiName}
                                      </span>{" "}
                                      <span className="italic text-sm">
                                        (invité)
                                      </span>
                                      <div className="absolute right-full top-0">
                                        {isHere ? (
                                          <CheckIcon className="h-6 w-6 " />
                                        ) : (
                                          " ... "
                                        )}
                                      </div>
                                      {isHere && (
                                        <button
                                          onClick={() => {
                                            const newMultiGroup = [
                                              ...group.multiGuests,
                                            ].filter(
                                              (multi) =>
                                                multi.name !== multiName
                                            );
                                            setGroup((prevGroup) => ({
                                              ...prevGroup,
                                              multiGuests: newMultiGroup,
                                            }));
                                            deleteMultiGuest(multiName);
                                          }}
                                          className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                        >
                                          <XMarkIcon className="w-5 h-5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            {gamerList?.map((gamer) => {
                              const gamerNameList =
                                group?.gamers?.map((gamer) => gamer.name) || [];
                              const multiNameList =
                                group?.multiGuests?.map(
                                  (multi) => multi.name
                                ) || [];
                              if (
                                gamerNameList.includes(gamer) ||
                                multiNameList.includes(gamer)
                              )
                                return;
                              return (
                                <div
                                  key={gamer}
                                  className="w-full flex justify-center my-0.5"
                                >
                                  <div
                                    className={`${
                                      gamer === uniqueName
                                        ? "font-semibold"
                                        : ""
                                    } relative
                                  `}
                                  >
                                    <span className="text-lg">{gamer}</span>
                                    {isAdmin && gamer !== user.name && (
                                      <button
                                        onClick={async () =>
                                          await deleteGamer(gamer)
                                        }
                                        className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                      >
                                        <XMarkIcon className="h-5 w-5" />
                                      </button>
                                    )}
                                    {isAdmin && gamer === user.name && (
                                      <>
                                        <div
                                          onClick={async () =>
                                            await deleteInvs()
                                          }
                                        >
                                          <LobbyDeleteGroup
                                            roomToken={roomToken}
                                            roomId={roomId}
                                          />
                                        </div>
                                      </>
                                    )}
                                    {!isAdmin && gamer === user.name && (
                                      <button
                                        onClick={async () =>
                                          await deleteGamer(uniqueName)
                                        }
                                        className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                      >
                                        <ImExit className="ml-1 w-5 h-5 p-0.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {multiGuestList?.map((multiGuest, i) => {
                              const gamerNameList =
                                group?.gamers?.map((gamer) => gamer.name) || [];
                              const multiNameList =
                                group?.multiGuests?.map(
                                  (multi) => multi.name
                                ) || [];
                              if (
                                multiNameList.includes(multiGuest) ||
                                gamerNameList.includes(multiGuest)
                              )
                                return;
                              return (
                                <div
                                  key={i}
                                  className="w-full flex justify-center"
                                >
                                  <div
                                    className={`${
                                      multiGuest === uniqueName
                                        ? "font-semibold"
                                        : ""
                                    } relative
                                  `}
                                  >
                                    <span className="text-lg">
                                      {multiGuest}
                                    </span>
                                    <span className="italic text-sm font-normal">
                                      (invité)
                                    </span>
                                    {isAdmin && (
                                      <button
                                        onClick={() =>
                                          deleteMultiGuest(multiGuest)
                                        }
                                        className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                      >
                                        <XMarkIcon className="h-5 w-5" />
                                      </button>
                                    )}
                                    {multiGuest === user.name && (
                                      <button
                                        onClick={async () =>
                                          await deleteMultiGuest(uniqueName)
                                        }
                                        className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                                      >
                                        <ImExit className="ml-1 w-5 h-5 p-0.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        )}

                        {showInvitations && (
                          <div className="flex flex-col gap-1 items-center">
                            <div className="relative h-8 flex items-center">
                              <h1>Invite tes amis !</h1>
                              <button
                                onClick={async () => {
                                  const friends = await getRoomFriendList({
                                    userId: user.id,
                                  });
                                  setFriendsList(friends);
                                }}
                                className="absolute left-full top-1/2 translate-y-[-50%] border border-amber-700 rounded-sm bg-amber-100 text-amber-700 ml-2"
                              >
                                <ArrowPathIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <div>
                              {friendsList &&
                                friendsList.map((friend) => {
                                  if (
                                    deletedGamersList.some(
                                      (deleted) => deleted === friend.name
                                    ) ||
                                    gamerList.some(
                                      (gamer) => gamer === friend.name
                                    )
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
                                      className={`${
                                        !invited
                                          ? "border border-amber-700 bg-amber-100 text-amber-700 p-1"
                                          : "border border-sky-100 text-sky-700 pulse-soft p-1"
                                      }`}
                                    >
                                      {friend.customName}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {/* {showRoomRefs && geoLocation && ( */}
                        {showRoomRefs && (
                          <div className="w-full">
                            <div className="w-full h-8 flex justify-center items-center ml-6">
                              Qr code de la partie
                            </div>

                            <div className="w-full ml-16 pl-1">
                              <QRCode
                                value={`${process.env.NEXT_PUBLIC_APP_URL}/invitation/?categorie=${categorie}&gameName=${gameName}&token=${roomToken}`}
                                style={{
                                  width: "calc(100% - 5rem)",
                                  aspectRatio: "1 / 1",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {gameName !== "grouping" && (
                    <div
                      onClick={() => {
                        if (!showConfig) {
                          setShowConfig(true);
                          setShowPlayers(false);
                        }
                      }}
                      className={`overflow-hidden relative border w-[80%] transition-[height] duration-1000 ease-in-out ${
                        !showConfig
                          ? "h-12 border border-2 rounded-md border-amber-700 bg-amber-100 text-amber-700 p-2"
                          : "h-full border border-2 rounded-md border-sky-700 bg-sky-100 text-sky-700 p-2"
                      }`}
                    >
                      {!showConfig && (
                        <div>
                          <div className="absolute right-1 top-1">
                            <ChevronRightIcon className="h-8 w-8" />
                          </div>
                          <div className="text-xl absolute top-1.5 left-[50%] translate-x-[-50%]">
                            Configuration
                          </div>
                        </div>
                      )}

                      <div className={`${!showConfig && "hidden"}`}>
                        <div className="absolute right-2 top-2">
                          <ChevronDownIcon className="h-8 w-8" />
                        </div>
                        {Options &&
                          options &&
                          setOptions &&
                          setServerMessage && (
                            <Options
                              userId={user.id}
                              isAdmin={isAdmin}
                              options={options}
                              setOptions={setOptions}
                              lastMode={group?.lastMode}
                              serverMessage={serverMessage}
                              setServerMessage={setServerMessage}
                              gamersNumber={
                                gamerList.length +
                                guestList.length +
                                multiGuestList.length
                              }
                            />
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </UserContext.Provider>
      </div>
    );
  } else {
    return (
      <div className="absolute h-screen w-full z-50">
        <UserContext.Provider value={{ userParams }}>
          <div
            className={`fixed w-full z-[70] bg-black`}
            style={{ height: `${barsSizes.top / 4}rem` }}
          />
          <div
            className={`fixed bottom-0 w-full z-0 bg-black`}
            style={{ height: `${barsSizes.bottom / 4}rem` }}
          />

          <div
            className={`overflow-y-auto z-[60] w-full`}
            style={{
              // height: `calc(100dvh - ${barsSizes.top / 4}rem)`,
              height: `calc(100dvh - ${barsSizes.top / 4}rem - ${
                barsSizes.bottom / 4
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
