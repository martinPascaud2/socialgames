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

import genToken from "@/utils/genToken";
import getLocation from "@/utils/getLocation";
import getErrorInformations from "@/utils/getErrorInformations";
import { getRoomFriendList } from "@/utils/getFriendList";
import { saveLastParams } from "@/utils/getLastParams";
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
});

const UserContext = createContext();

import {
  serverCreate,
  goOneMoreGame,
  inviteFriend,
  inviteAll,
  deleteInvitations,
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
} from "./actions";

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
  const [isChosen, setIsChosen] = useState(false);
  const [showRoomRefs, setShowRoomRefs] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const [uniqueName, setUniqueName] = useState();
  const [isHere, setIsHere] = useState(false);

  const [friendsList, setFriendsList] = useState();
  const [invitedList, setInvitedList] = useState([]);
  const [group, setGroup] = useState();
  const [gamerList, setGamerList] = useState([]);
  const [guestList, setGuestList] = useState([]);
  const [multiGuestList, setMultiGuestList] = useState([]);
  const [multiGuestId, setMultiGuestId] = useState();
  const [multiGuestDataId, setMultiGuestDataId] = useState();
  const [deletedGamer, setDeletedGamer] = useState(null);
  const [deletedGamersList, setDeletedGamersList] = useState([]);

  const [options, setOptions] = useState({});
  const [geoLocation, setGeoLocation] = useState(null);
  const [isPrivate, setIsPrivate] = useState();
  const [gameData, setGameData] = useState({});

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
  }, [roomToken]);

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

  const getFriends = useCallback(async () => {
    const friends = await getRoomFriendList({ userId: user.id });
    setFriendsList(friends);
  }, [user.id]);

  useEffect(() => {
    if (user.multiGuest) return;
    setTimeout(async () => await getFriends(), !friendsList ? 0 : 2000);
    getFriends();
  }, [gamerList]);

  useEffect(() => {
    user.multiGuest &&
      gameData.gamers &&
      uniqueName &&
      (setMultiGuestId(
        gameData.gamers.find((gamer) => gamer.name === uniqueName)?.id
      ),
      setMultiGuestDataId(
        gameData.gamers.find((gamer) => gamer.name === uniqueName)?.dataId
      ));
  }, [isStarted, gameData, user, uniqueName]);

  const createRoom = useCallback(
    async (privacy, storedLocation) => {
      if (isChosen) return;
      const newRoomToken = genToken(10);

      localStorage.setItem(
        "reservedName",
        JSON.stringify({ roomToken: newRoomToken, name: user.name })
      );

      const { error, gamers } = await serverCreate(
        newRoomToken,
        privacy,
        user,
        gameName,
        storedLocation
      );

      if (error) {
        setServerMessage(error);
      } else {
        const channel = pusher.subscribe(`room-${newRoomToken}`);
        channel.bind("room-event", function (data) {
          data.clientGamerList &&
            setGamerList([...new Set([...data.clientGamerList, ...gamerList])]);
          data.multiGuestList &&
            data.multiGuestList.length &&
            setMultiGuestList([
              ...new Set([...data.multiGuestList, ...multiGuestList]),
            ]);
          data.gameData && setGameData(data.gameData);
          data.deleted && setDeletedGamer(data.deleted),
            (setInvitedList((prevInv) =>
              prevInv.filter((inv) => inv !== data.deleted)
            ),
            setGroup((prevGroup) => ({
              ...prevGroup,
              gamers: gamerList.filter((gamer) => gamer !== data.deleted),
              multiGuests: multiGuestList.filter(
                (multiGuest) => multiGuest !== data.deleted
              ),
            })));
          data.privacy !== undefined && setIsPrivate(data.privacy);
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

  const joinRoom = useCallback(async () => {
    if (!isChosen || !inputToken) {
      setIsChosen(true);
      return;
    }

    const token = inputToken.toUpperCase();
    const id = await getRoomId(token);

    const reserved = JSON.parse(localStorage.getItem("reservedName"));
    const reservedToken = reserved?.roomToken;
    const reservedName = reserved?.name;
    const isReserved =
      reservedToken === token ||
      (reservedToken === group?.roomToken && reservedToken && group);
    const wantedName = isReserved ? reservedName : user.name;
    const uniqueUserName = await getUniqueName(id, wantedName, isReserved);
    localStorage.setItem(
      "reservedName",
      JSON.stringify({ roomToken: token, name: uniqueUserName })
    );

    const { error, joinData } = await serverJoin({
      token,
      user: { ...user, name: uniqueUserName },
    });

    if (error) {
      setServerMessage(error);
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
        data.deleted &&
          (setDeletedGamer(data.deleted),
          setInvitedList((prevInv) =>
            prevInv.filter((inv) => inv !== data.deleted)
          ));
        data.options && setOptions(data.options);
        data.privacy !== undefined && setIsPrivate(data.privacy);
      });

      joinData.admin !== uniqueUserName &&
        (await triggerGamers({ roomToken: token, gamers }));

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
      setServerMessage(error);
      console.error(error);
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
          !gamerList?.some((multiName) => multiName === uniqueName) &&
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

  const deleteGamer = async (gamer) => {
    const gamers = await serverDeleteGamer({
      token: roomToken,
      gamerName: gamer,
    });
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
    if (deletedGamer === uniqueName) router.push("/categories?control=true");
  }, [deletedGamer]);

  useEffect(() => {
    if (!deletedGamer) return;
    setGamerList((prevGamers) =>
      prevGamers.filter((gamer) => gamer !== deletedGamer)
    );
    setMultiGuestList((prevMultiGuests) =>
      prevMultiGuests.filter((multiGuest) => multiGuest !== deletedGamer)
    );
  }, [deletedGamer]);

  const deleteInvs = useCallback(async () => {
    await deleteInvitations({
      userId: user.id,
      categorie,
      gameName,
      roomToken,
    });
  }, [user.id, categorie, gameName, roomToken]);

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
      roomToken === null
    )
      return;

    const storedGroup = JSON.parse(localStorage.getItem("group"));

    const go = async () => {
      if (!storedGroup?.roomToken) return;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // check
        await goOneMoreGame({
          pathname,
          oldRoomToken: storedGroup.roomToken,
          newRoomToken: roomToken,
          gameName,
        });
        localStorage.removeItem("group");
      } catch (error) {
        console.error("error", error);
      }
    };
    go();
  }, [gameName, group, pathname, roomToken]);

  useEffect(() => {
    const storedGroup = JSON.parse(localStorage.getItem("group"));
    const storedGroupPrivacy = storedGroup?.privacy;
    const storedLocation = storedGroup?.lastPosition;

    const init = async () => {
      await createRoom(storedGroupPrivacy || "private", storedLocation);
      storedLocation && setGeoLocation(storedLocation);
    };
    !searchToken && init();
  }, []);

  useEffect(() => {
    if (!isAdmin || !options || !Object.keys(options).length) return;
    const editOptions = async () => {
      await changeOptions({ roomId, roomToken, options });
    };
    editOptions();
  }, [options]);

  const togglePriv = useCallback(async () => {
    await togglePrivacy({ roomId, roomToken, privacy: isPrivate });
    group &&
      setGroup((prevGroup) => ({
        ...prevGroup,
        privacy: !isPrivate ? "private" : "public",
      }));
  }, [isPrivate, roomId]);

  const launchRoom = async () => {
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
  };

  if (gameData && gameData.nextGame && user) {
    if (gameData.nextGame === "deleted group") {
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
    } else {
      const goNewGame = async () => {
        !user.multiGuest && (await deleteInvs());
        const group = { roomToken };
        localStorage.setItem("group", JSON.stringify(group));

        // check router.push
        window.location.href = `${gameData.nextGame.path}${
          user.multiGuest ? `&guestName=${user.name}` : ""
        }`;
      };
      if (gameName === "grouping" || !isStarted) goNewGame();
    }
  }

  if (!roomId || !gameData) return null;

  if (!isStarted) {
    return (
      <div className="absolute h-screen w-full z-50">
        <UserContext.Provider value={"coucou"}>
          <div className="flex items-end h-20 w-full z-50 bg-black">
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

              <div className="absolute bottom-[2rem] left-2">
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
                        value={`/categories/${categorie}/${gameName}?token=${roomToken}`}
                      />
                    )}

                    <hr />
                  </>

                  <div className="flex justify-center">
                    <div className="flex flex-col">{serverMessage}</div>
                  </div>

                  <div className="absolute bottom-0 w-full bg-black h-20 z-10">
                    <div className="relative h-full">
                      <div
                        onClick={async () => await deleteInvs()}
                        className="absolute bottom-[2rem] left-2"
                      >
                        <DeleteGroup roomToken={roomToken} roomId={roomId} />
                      </div>
                      <div
                        onClick={async () => await deleteInvs()}
                        className="absolute bottom-[2rem] right-2"
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
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <div
                      onClick={async () => await deleteInvs()}
                      className="absolute left-1/2 top-[15%] translate-x-[-50%]"
                    >
                      <NextStep onClick={() => launchRoom()}>
                        {gameName === "grouping" ? (
                          <div className="text-xl">Jouer</div>
                        ) : (
                          <div className="">Lancer</div>
                        )}
                      </NextStep>
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
        <UserContext.Provider value={"coucou"}>
          <div className="fixed flex items-end h-20 w-full z-[70] bg-black">
            <div className="flex justify-center w-full text-white m-1">
              {gamesRefs[gameName].categorie === "grouping"
                ? "Lobby"
                : gameData.options?.mode || gamesRefs[gameName].name}{" "}
              {gameData.gamers?.length &&
                `(${gameData.gamers?.length} joueurs)`}
            </div>
          </div>
          <div className="mt-20 h-[calc(100vh-5rem)] overflow-y-auto z-[60] w-full">
            <Game
              roomId={roomId}
              roomToken={roomToken}
              user={{
                ...user,
                name: uniqueName,
                ...(!!multiGuestId ? { id: multiGuestId } : {}),
                ...(!!multiGuestDataId ? { dataId: multiGuestDataId } : {}),
              }}
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
