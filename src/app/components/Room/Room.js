"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Pusher from "pusher-js";
import QRCode from "react-qr-code";

import genToken from "@/utils/genToken";

import DeleteGroup from "@/components/DeleteGroup";
import ChooseAnotherGame from "@/components/ChooseAnotherGame";
import { CheckIcon } from "@heroicons/react/24/outline";

var pusher = new Pusher("61853af9f30abf9d5b3d", {
  cluster: "eu",
});

import {
  serverCreate,
  goOneMoreGame,
  inviteFriend,
  serverJoin,
  serverDeleteGamer,
  serverAddGuest,
  serverDeleteGuest,
  serverAddMultiGuest,
  serverDeleteMultiGuest,
  getUniqueName,
  getRoomId,
  getRoomRefs,
} from "./actions";

export default function Room({
  user,
  friendList,
  categorie,
  gameName,
  Game,
  launchGame,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchToken = searchParams.get("token");

  const [isAdmin, setIsAdmin] = useState(false);
  const [roomToken, setRoomToken] = useState("");
  const [group, setGroup] = useState();
  const [gamerList, setGamerList] = useState([]);
  const [guestList, setGuestList] = useState([]);
  const [multiGuestList, setMultiGuestList] = useState([]);
  const [newGuest, setNewGuest] = useState("");
  const refGuest = useRef();
  const [multiGuestId, setMultiGuestId] = useState();
  const [uniqueName, setUniqueName] = useState("");
  const [deletedGamer, setDeletedGamer] = useState(null);

  const [options, setOptions] = useState({});
  const [isChosen, setIsChosen] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const [showRoomRefs, setShowRoomRefs] = useState(false);
  const [inputToken, setInputToken] = useState("");
  const [geoLocation, setGeoLocation] = useState(null);

  const [roomId, setRoomId] = useState(0);
  const [isPrivate, setIsPrivate] = useState(false);
  const [gameData, setGameData] = useState({});

  useEffect(() => {
    async function get() {
      const { id, priv } = await getRoomRefs(roomToken);
      setRoomId(id);
      priv && setIsPrivate(true);
    }
    get();

    return () => {
      pusher.unsubscribe(`room-${roomToken}`);
    };
  }, [roomToken]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setGeoLocation({ latitude, longitude });
      });
    }
  }, []);

  const createRoom = async (privacy) => {
    const newRoomToken = genToken(10);

    const { error, gamers } = await serverCreate(
      newRoomToken,
      privacy,
      user,
      gameName,
      geoLocation
    );

    if (error) {
      setServerMessage(error);
    } else {
      const channel = pusher.subscribe(`room-${newRoomToken}`);
      channel.bind("room-event", function (data) {
        data.clientGamerList && setGamerList(data.clientGamerList);
        data.multiGuestList && setMultiGuestList(data.multiGuestList);
        data.gameData && setGameData(data.gameData);
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
        data.clientGamerList && setGamerList(data.clientGamerList);
        data.guestList && setGuestList(data.guestList);
        data.multiGuestList && setMultiGuestList(data.multiGuestList);
        data.started && setIsStarted(true);
        data.gameData && setGameData(data.gameData);
        data.deleted && setDeletedGamer(data.deleted);
      });

      setRoomToken(token);
      setUniqueName(uniqueUserName);
      setGamerList(gamers);
      setGuestList(guests);
      setMultiGuestList(multiGuests);
      setServerMessage("");
    }
  }, [inputToken, user]);

  const deleteGamer = async (gamer) => {
    const gamers = await serverDeleteGamer({
      token: roomToken,
      gamerName: gamer,
    });
    if (!gamers) router.push("/");

    setServerMessage(`Joueur ${gamer} retiré`);
    setGamerList(gamers);
  };

  const addMultiGuest = useCallback(async () => {
    if (!isChosen || !inputToken) {
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
        data.clientGamerList && setGamerList(data.clientGamerList);
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
      if (!user.multiGuest) joinRoom();
      else addMultiGuest();
    }
  }, [searchToken, joinRoom, addMultiGuest, user.multiGuest]);

  useEffect(() => {
    if (deletedGamer === uniqueName) router.push("/");
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
      setMultiGuestId(
        gameData.gamers.find((gamer) => gamer.name === uniqueName).id
      );
  }, [isStarted, gameData, user, uniqueName]);

  useEffect(() => {
    const group = JSON.parse(localStorage.getItem("group"));
    if (!roomToken && group) {
      setGroup(group);
      group.privacy === "public" ? createRoom("public") : createRoom("private");
    } else if (group && geoLocation && roomToken) {
      localStorage.removeItem("group");

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

      setGameData({});

      goOneMoreGame({
        pathname,
        oldRoomToken: group.roomToken,
        newRoomToken: roomToken,
        gameName: "grouping",
      });
    }
  }, [geoLocation, roomToken]);

  if (gameData.nextGame && user) {
    if (gameData.nextGame === "deleted group") {
      return (
        <>
          <h1>Le groupe a été supprimé</h1>
          <button
            onClick={() => router.push("/")}
            className="border border-blue-300 bg-blue-100"
          >
            Quitter
          </button>
        </>
      );
    } else {
      const goNewGame = () => {
        setGameData({});
        setRoomToken("");
        setInputToken("");
        setIsStarted(false);
        router.push(
          `${gameData.nextGame.path}${
            user.multiGuest ? `&guestName=${user.name}` : ""
          }`
        );
      };
      if (gameName === "grouping" || !isStarted) goNewGame();
    }
  }

  if (!isStarted) {
    return (
      <>
        {!isChosen && !group ? (
          <>
            <button
              onClick={() => createRoom("public")}
              className="border border-blue-300 bg-blue-100"
            >
              Nouvelle partie publique
            </button>
            <h2 className="text-sm italic">
              Tous les amis pourront vous rejoindre.
            </h2>

            <hr />

            <button
              onClick={() => {
                createRoom("private");
                setIsPrivate(true);
              }}
              className="border border-blue-300 bg-blue-100"
            >
              Nouvelle partie privée
            </button>
            <h2 className="text-sm italic">
              Seuls tes invités pourront vous rejoindre.
            </h2>
          </>
        ) : (
          <>
            <div>Liste des joueurs</div>

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
                    {gameName === "grouping" &&
                      isHere &&
                      gamerName !== user.name && (
                        <button
                          onClick={() => {
                            const newGamersGroup = [...group.gamers].filter(
                              (gamer) => gamer.name !== gamerName
                            );
                            setGroup((prevGroup) => ({
                              ...prevGroup,
                              gamers: newGamersGroup,
                            }));
                            deleteGamer(gamerName);
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
                    {gameName === "grouping" && isHere && (
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
                    {gameName === "grouping" && isHere && (
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
                    {gameName === "grouping" &&
                      isAdmin &&
                      gamer !== user.name && (
                        <button
                          onClick={() => deleteGamer(gamer)}
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
                    {gameName === "grouping" && isAdmin && (
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
                    {gameName === "grouping" && isAdmin && (
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

            {isPrivate &&
              !user.multiGuest &&
              (gameName === "grouping" || !group) && (
                <>
                  <h1>Invite tes amis !</h1>
                  <h2 className="text-sm italic">
                    Ils recevront ton invitation via &quot;Invitations aux
                    parties&quot;.
                  </h2>
                  <div>
                    {friendList.map((friend) => (
                      <button
                        key={friend.id}
                        onClick={() =>
                          inviteFriend({
                            userName: user.name,
                            friendMail: friend.email,
                            categorie,
                            gameName,
                            roomToken,
                          })
                        }
                        className="border border-blue-300 bg-blue-100"
                      >
                        {friend.customName}
                      </button>
                    ))}
                  </div>
                </>
              )}

            {!user.multiGuest && !isAdmin && (
              <button
                onClick={() => deleteGamer(uniqueName)}
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

            {isAdmin && (
              <>
                <hr />
                {(gameName === "grouping" || !group) && (
                  <>
                    <h1>Invite des Guests multi-screen !</h1>
                    <h2 className="text-sm italic">
                      Ils joueront sur leur propre écran.
                    </h2>
                    <button
                      onClick={() => setShowRoomRefs(!showRoomRefs)}
                      className="border border-blue-300 bg-blue-100"
                    >
                      {!showRoomRefs ? "Afficher" : "Cacher"} le QrCode
                    </button>
                    {showRoomRefs && (
                      <QRCode
                        value={`/categories/${categorie}/${gameName}?token=${roomToken}`}
                      />
                    )}

                    <hr />

                    <h1>Ajoute des Guests mono-screen !</h1>
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
                    </button>
                  </>
                )}

                <hr />

                <button
                  onClick={() => launchRoom()}
                  className="border border-blue-300 bg-blue-100"
                >
                  {gameName === "grouping"
                    ? "Rechercher un jeu"
                    : "Lancer la partie"}
                </button>

                {gameName !== "grouping" && group && (
                  <>
                    <ChooseAnotherGame
                      group={group}
                      roomToken={roomToken}
                      gameData={gameData}
                      isReturnLobby={false}
                    />
                    <ChooseAnotherGame
                      group={group}
                      roomToken={roomToken}
                      gameData={gameData}
                      isReturnLobby={true}
                    />
                  </>
                )}

                <DeleteGroup roomToken={roomToken} />
              </>
            )}
          </>
        )}

        <div>{serverMessage}</div>
      </>
    );
  } else {
    return (
      <Game
        roomId={roomId}
        roomToken={roomToken}
        user={{
          ...user,
          name: uniqueName,
          ...(!!multiGuestId ? { id: multiGuestId } : {}),
        }}
        gameData={gameData}
      />
    );
  }
}
