"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Pusher from "pusher-js";
import QRCode from "react-qr-code";

import genToken from "@/utils/genToken";
import getLocation from "@/utils/getLocation";
import getErrorInformations from "@/utils/getErrorInformations";
import { gamesRefs } from "@/assets/globals";
import { getRoomFriendList } from "@/utils/getFriendList";

import ToggleCheckbox from "./ToggleCheckbox";
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
  serverJoin,
  triggerGamers,
  serverDeleteGamer,
  serverAddGuest,
  serverDeleteGuest,
  serverAddMultiGuest,
  serverDeleteMultiGuest,
  getUniqueName,
  getRoomId,
  getRoomRefs,
  togglePrivacy,
  saveLocation,
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
  const [roomToken, setRoomToken] = useState("");
  const [group, setGroup] = useState();
  const [friendsList, setFriendsList] = useState();
  const [invitedList, setInvitedList] = useState([]);
  const [gamerList, setGamerList] = useState([]);
  const [guestList, setGuestList] = useState([]);
  const [multiGuestList, setMultiGuestList] = useState([]);
  const [newGuest, setNewGuest] = useState("");
  const refGuest = useRef();
  const [multiGuestId, setMultiGuestId] = useState();
  const [multiGuestDataId, setMultiGuestDataId] = useState();
  const [uniqueName, setUniqueName] = useState("");
  const [deletedGamer, setDeletedGamer] = useState(null);
  const [deletedGamersList, setDeletedGamersList] = useState([]);

  const [options, setOptions] = useState({});
  const [isChosen, setIsChosen] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const [showRoomRefs, setShowRoomRefs] = useState(false);
  const [inputToken, setInputToken] = useState("");
  const [geoLocation, setGeoLocation] = useState(null);

  const [roomId, setRoomId] = useState(0);
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
  }, []);

  useEffect(() => {
    if (user.multiGuest) return;
    setTimeout(async () => await getFriends(), !friendsList ? 0 : 800);
    getFriends();
  }, [gamerList]);

  const createRoom = async (privacy, storedLocation) => {
    const newRoomToken = genToken(10);

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
        data.multiGuestList && setMultiGuestList(data.multiGuestList);
        data.gameData && setGameData(data.gameData);
        data.deleted &&
          setInvitedList((prevInv) =>
            prevInv.filter((inv) => inv !== data.deleted)
          );
        data.privacy !== undefined && setIsPrivate(data.privacy);
      });

      setRoomToken(newRoomToken);
      setIsAdmin(true);
      setUniqueName(user.name);
      setGamerList(gamers);
      setIsChosen(true);
      setServerMessage("");
    }
  };

  const joinRoom = useCallback(async () => {
    if (!isChosen || !inputToken) {
      setIsChosen(true);
      return;
    }

    const token = inputToken.toUpperCase();
    const id = await getRoomId(token);
    const uniqueUserName = await getUniqueName(id, user.name);

    const { error, joinData } = await serverJoin({
      token,
      user: { ...user, name: uniqueUserName },
    });

    if (error) {
      setServerMessage(error);
    } else {
      if (joinData === undefined) return;
      const { gamers, guests, multiGuests } = joinData;

      const channel = pusher.subscribe(`room-${token}`);
      channel.bind("room-event", function (data) {
        data.clientGamerList &&
          setGamerList([...new Set([...data.clientGamerList, ...gamerList])]);
        data.guestList && setGuestList(data.guestList);
        data.multiGuestList && setMultiGuestList(data.multiGuestList);
        data.started && setIsStarted(true);
        data.gameData && setGameData(data.gameData);
        data.deleted &&
          (setDeletedGamer(data.deleted),
          setInvitedList((prevInv) =>
            prevInv.filter((inv) => inv !== data.deleted)
          ));
        data.privacy !== undefined && setIsPrivate(data.privacy);
      });

      triggerGamers({ roomToken: token, gamers }); // no await

      setRoomToken(token);
      setUniqueName(uniqueUserName);
      setGamerList(gamers);
      setGuestList(guests);
      setMultiGuestList(multiGuests);
      setServerMessage("");
    }
  }, [inputToken, user, gamerList]);

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

  const addMultiGuest = useCallback(async () => {
    if (!isChosen || !inputToken || !geoLocation) {
      setIsChosen(true);
      return;
    }
    const token = inputToken.toUpperCase();
    const id = await getRoomId(token);
    const multiGuestName = await getUniqueName(
      id,
      searchParams.get("guestName")
    );

    const { error, data } = await serverAddMultiGuest(
      token,
      multiGuestName,
      geoLocation
    );

    if (error) {
      setServerMessage(error);
    } else {
      const { gamerList, guests, multiGuests } = data;
      const channel = pusher.subscribe(`room-${token}`);
      channel.bind("room-event", function (data) {
        data.clientGamerList &&
          setGamerList([...new Set([...data.clientGamerList, ...gamerList])]);
        data.guestList && setGuestList(data.guestList);
        data.multiGuestList && setMultiGuestList(data.multiGuestList);
        data.started && setIsStarted(true);
        data.gameData && setGameData(data.gameData);
        data.deleted && setDeletedGamer(data.deleted);
      });

      setRoomToken(token);
      setUniqueName(multiGuestName);
      setGamerList(gamerList);
      setGuestList(guests);
      setMultiGuestList(multiGuests);
      setServerMessage("");
    }
  }, [geoLocation, searchParams, inputToken, isChosen]);

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
    if (searchToken) {
      setInputToken(searchToken);

      const join = async () => {
        if (
          !user.multiGuest &&
          !gamerList.some((multiName) => multiName === uniqueName) &&
          deletedGamer !== uniqueName
        )
          await joinRoom();
        else if (!multiGuestList.some((multiName) => multiName === uniqueName))
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
    if (deletedGamer === uniqueName) router.push("/categories?control=true");
  }, [deletedGamer]);

  const addGuest = async () => {
    if (newGuest.length < 3) {
      setServerMessage("Nom trop court");
      return;
    }

    const uniqueGuestName = await getUniqueName(roomId, newGuest);
    const guests = await serverAddGuest({
      token: roomToken,
      guestName: uniqueGuestName,
    });

    refGuest.current.value = "";
    setServerMessage(`Guest ${uniqueGuestName} ajouté`);
    setNewGuest("");
    setGuestList(guests);
    if (group) {
      const newGuestsGroup = [
        ...group.guests,
        { id: user.id, name: uniqueGuestName, guest: true, multiGuest: false },
      ];
      setGroup((prevGroup) => ({ ...prevGroup, guests: newGuestsGroup }));
    }
  };

  const deleteGuest = async (guest) => {
    const guests = await serverDeleteGuest({
      token: roomToken,
      guestName: guest,
    });

    setServerMessage(`Guest ${guest} retiré`);
    setGuestList(guests);
  };

  const launchRoom = async () => {
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

  useEffect(() => {
    user.multiGuest &&
      gameData.gamers &&
      (setMultiGuestId(
        gameData.gamers.find((gamer) => gamer.name === uniqueName).id
      ),
      setMultiGuestDataId(
        gameData.gamers.find((gamer) => gamer.name === uniqueName).dataId
      ));
  }, [isStarted, gameData, user, uniqueName]);

  useEffect(() => {
    const storedGroup = JSON.parse(localStorage.getItem("group"));
    if (!roomToken && storedGroup) {
      setGroup(storedGroup);
      const create = async () => {
        const storedLocation = storedGroup.lastPosition;
        storedGroup.privacy === "public"
          ? await createRoom("public", storedLocation)
          : await createRoom("private", storedLocation);
        storedLocation && setGeoLocation(storedLocation);
      };
      create();
      // } else if (group && roomToken && gameName) {
    } else if (group && roomToken && gameName && pathname) {
      const addElderGuests = async () => {
        let elderGuests = [];
        await Promise.all(
          group.guests.map(async (guest) => {
            await serverAddGuest({
              token: roomToken,
              guestName: guest.name,
            });
            elderGuests.push(guest.name);
          })
        );
        setGuestList(elderGuests);
      };
      addElderGuests();

      // const go = async () => {
      //   await goOneMoreGame({
      //     pathname,
      //     oldRoomToken: group.roomToken,
      //     newRoomToken: roomToken,
      //     gameName,
      //   });
      //   localStorage.removeItem("group");
      // };
      // go();

      setGameData({});
    }
  }, [roomToken, gameName]);
  // }, [roomToken, gameName, pathname, group]);

  useEffect(() => {
    if (!gameName || !group || !pathname || !roomToken) return;
    const go = async () => {
      await goOneMoreGame({
        pathname,
        oldRoomToken: group.roomToken,
        newRoomToken: roomToken,
        gameName,
      });
      localStorage.removeItem("group");
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

  const togglePriv = useCallback(async () => {
    await togglePrivacy({ roomId, roomToken, privacy: isPrivate });
    group &&
      setGroup((prevGroup) => ({
        ...prevGroup,
        privacy: !isPrivate ? "private" : "public",
      }));
  }, [isPrivate, roomId]);

  if (gameData.nextGame && user) {
    if (gameData.nextGame === "deleted group") {
      return (
        <>
          <h1 className="mt-28">Le groupe a été supprimé</h1>
          <button
            onClick={() => router.push("/categories?control=true")}
            className="border border-blue-300 bg-blue-100"
          >
            Quitter
          </button>
        </>
      );
    } else {
      const goNewGame = () => {
        // check router.push

        window.location.href = `${gameData.nextGame.path}${
          user.multiGuest ? `&guestName=${user.name}` : ""
        }`;
      };
      if (gameName === "grouping" || !isStarted) goNewGame();
    }
  }

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
            <>
              <div>Chargement...</div>

              {/*
                <button
                  onClick={() =>
                    router.push(
                      `/categories${
                        gameName !== "grouping"
                          ? `/${gamesRefs[gameName].categorie}`
                          : "?control=true"
                      }`
                    )
                  }
                  className="border border-blue-300 bg-blue-100"
                >
                  Retour
                </button>
              </>
            )} */}
            </>
          ) : (
            <>
              {isAdmin && (
                <>
                  <div className="flex justify-center items-center m-2">
                    <div
                      style={{
                        color: isPrivate
                          ? "rgb(147 197 253)"
                          : "rgb(134 239 172)", //blue-300, green-300
                      }}
                    >
                      Partie {isPrivate ? "privée" : "publique"}
                    </div>
                    {isPrivate ? (
                      <LockClosedIcon
                        onClick={() => togglePriv()}
                        className="ml-2 mb-2 w-8 h-8 text-blue-300"
                      />
                    ) : (
                      <LockOpenIcon
                        onClick={() => togglePriv()}
                        className="ml-2 mb-2 w-8 h-8 text-green-300"
                      />
                    )}
                  </div>
                </>
              )}

              <div>
                Liste des joueurs [
                {gamerList.length + guestList.length + multiGuestList.length}
                {gamesRefs[gameName].limits &&
                  ` / ${gamesRefs[gameName].limits.max}`}
                ]
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
              {group?.guests &&
                group.guests.map((guest) => {
                  const guestName = guest.name;
                  const isHere = guestList?.includes(guestName);
                  return (
                    <div key={guestName} className="flex">
                      <div className="flex">
                        {guestName}{" "}
                        <span className="italic text-sm">(guest)</span>
                        {isHere ? (
                          <CheckIcon className="block h-6 w-6 " />
                        ) : (
                          " ... "
                        )}
                      </div>
                      {isHere && (
                        <button
                          onClick={() => {
                            const newGuestsGroup = [...group.guests].filter(
                              (guest) => guest.name !== guestName
                            );
                            setGroup((prevGroup) => ({
                              ...prevGroup,
                              guests: newGuestsGroup,
                            }));
                            deleteGuest(guestName);
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
                  if (gamerNameList.includes(gamer)) return;
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
                {guestList?.map((guest, i) => {
                  const guestNameList =
                    group?.guests?.map((guest) => guest.name) || [];
                  if (guestNameList.includes(guest)) return;
                  return (
                    <div key={i} className="flex">
                      <div>
                        {guest} <span className="italic text-sm">(guest)</span>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => deleteGuest(guest)}
                          className="border border-blue-300 bg-blue-100"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  );
                })}
                {multiGuestList?.map((multiGuest, i) => {
                  const multiNameList =
                    group?.multiGuests?.map((multi) => multi.name) || [];
                  if (multiNameList.includes(multiGuest)) return;
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

              {isPrivate && !user.multiGuest && (
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

              <div className="absolute bottom-0">
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
                    onClick={() => deleteMultiGuest(uniqueName)}
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

                    {/* <h1>Ajoute des Guests mono-screen !</h1>
                  <h2 className="text-sm italic">
                    Ils utiliseront ton écran à leur tour de jeu.
                  </h2>
                  <input
                    ref={refGuest}
                    placeholder="Nom du guest"
                    onChange={(event) => setNewGuest(event.target.value)}
                    className="outline-none focus:outline-black mr-2"
                  />
                  <button
                    onClick={async () => {
                      await addGuest();
                    }}
                    className="border border-blue-300 bg-blue-100"
                  >
                    Ajouter le Guest
                  </button> */}
                  </>

                  <hr />

                  {Options && setOptions && setServerMessage && (
                    <Options
                      setOptions={setOptions}
                      lastMode={group?.lastMode}
                      setServerMessage={setServerMessage}
                    />
                  )}

                  <div className="flex justify-center">
                    <div className="flex flex-col">{serverMessage}</div>
                  </div>

                  <div className="absolute bottom-0 w-full bg-black h-20 z-10">
                    <div className="relative h-full">
                      <div className="absolute bottom-0 left-0">
                        <DeleteGroup roomToken={roomToken} />
                      </div>
                      <div className="absolute bottom-0 right-0">
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

                    <div className="absolute left-1/2 top-[20%] translate-x-[-50%]">
                      <NextStep onClick={() => launchRoom()}>
                        {gameName === "grouping" ? (
                          <div className="">Jouer</div>
                        ) : (
                          <div className="">Lancer</div>
                        )}
                      </NextStep>
                    </div>
                  </div>
                </>
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
          <div className="mt-20 overflow-y-auto z-[60] w-full">
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
