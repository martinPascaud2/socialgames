"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Pusher from "pusher-js";
import QRCode from "react-qr-code";

import genToken from "@/utils/genToken";

var pusher = new Pusher("61853af9f30abf9d5b3d", {
  cluster: "eu",
});

import {
  serverCreate,
  serverJoin,
  serverAddGuest,
  serverAddMultiGuest,
  getUniqueName,
  getRoomId,
} from "./actions";

export default function Room({
  user,
  friendList,
  categorie,
  gameName,
  Game,
  inviteFriend,
  launchGame,
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomToken, setRoomToken] = useState("");
  const [gamerList, setGamerList] = useState([]);
  const [guestList, setGuestList] = useState([]);
  const [multiGuestList, setMultiGuestList] = useState([]);
  const [newGuest, setNewGuest] = useState("");
  const refGuest = useRef();
  const [multiGuestId, setMultiGuestId] = useState();
  const [uniqueName, setUniqueName] = useState("");
  const [options, setOptions] = useState({});

  const [isChosen, setIsChosen] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const [showRoomRefs, setShowRoomRefs] = useState(false);
  const [inputToken, setInputToken] = useState("");
  const [geoLocation, setGeoLocation] = useState(null);

  const [roomId, setRoomId] = useState(0);
  const [gameData, setGameData] = useState({});

  const searchParams = useSearchParams();
  const searchToken = searchParams.get("token");

  useEffect(() => {
    async function getId() {
      const id = await getRoomId(roomToken);
      setRoomId(id);
    }
    getId();

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

  const createRoom = async () => {
    const newRoomToken = genToken(5);

    try {
      const gamers = await serverCreate(
        newRoomToken,
        user,
        gameName,
        geoLocation
      );

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
    } catch (error) {
      setServerMessage(error.message);
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

    try {
      const joinData = await serverJoin({
        token,
        user: { ...user, name: uniqueUserName },
      });
      if (joinData === undefined) return;
      const { gamers, guests, multiGuests } = joinData;

      const channel = pusher.subscribe(`room-${token}`);
      channel.bind("room-event", function (data) {
        data.clientGamerList && setGamerList(data.clientGamerList);
        data.guestList && setGuestList(data.guestList);
        data.multiGuestList && setMultiGuestList(data.multiGuestList);
        data.started && setIsStarted(true);
        data.gameData && setGameData(data.gameData);
      });

      setRoomToken(token);
      setUniqueName(uniqueUserName);
      setGamerList(gamers);
      setGuestList(guests);
      setMultiGuestList(multiGuests);
      setServerMessage("");
    } catch (error) {
      setServerMessage(error.message);
    }
  }, [inputToken, user]);

  const addMultiGuest = useCallback(async () => {
    if (!isChosen) {
      setIsChosen(true);
      return;
    }
    const token = inputToken.toUpperCase();
    const id = await getRoomId(token);
    const multiGuestName = await getUniqueName(
      id,
      searchParams.get("guestName")
    );

    try {
      const { gamerList, guests, multiGuests } = await serverAddMultiGuest(
        token,
        multiGuestName,
        geoLocation
      );

      const channel = pusher.subscribe(`room-${token}`);
      channel.bind("room-event", function (data) {
        data.clientGamerList && setGamerList(data.clientGamerList);
        data.guestList && setGuestList(data.guestList);
        data.multiGuestList && setMultiGuestList(data.multiGuestList);
        data.started && setIsStarted(true);
        data.gameData && setGameData(data.gameData);
      });

      setRoomToken(token);
      setUniqueName(multiGuestName);
      setGamerList(gamerList);
      setGuestList(guests);
      setMultiGuestList(multiGuests);
      setServerMessage("");
    } catch (error) {
      setServerMessage(error.message);
    }
  }, [geoLocation, searchParams]);

  useEffect(() => {
    if (searchToken) {
      setInputToken(searchToken);
      if (!user.multiGuest) joinRoom();
      else addMultiGuest();
    }
  }, [searchToken, joinRoom, addMultiGuest]);

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

  const launchRoom = async () => {
    try {
      await launchGame({
        roomId,
        roomToken,
        adminId: user.id,
        gamers: gamerList,
        guests: guestList,
        multiGuests: multiGuestList,
        options,
      });

      setServerMessage("");
      setIsStarted(true);
    } catch (error) {
      setServerMessage(error.message);
    }
  };

  useEffect(() => {
    user.multiGuest &&
      gameData.gamers &&
      setMultiGuestId(
        gameData.gamers.find((gamer) => gamer.name === uniqueName).id
      );
  }, [isStarted, gameData, user, uniqueName]);

  if (!isStarted) {
    return (
      <>
        {!isChosen ? (
          <>
            <button onClick={() => createRoom()}>
              Créer une nouvelle partie
            </button>

            <div>
              <input
                onChange={(event) => setInputToken(event.target.value)}
                value={inputToken}
                className="border focus:outline-none focus:border-2"
              />
              <button onClick={() => joinRoom()}>Rejoindre</button>
            </div>
          </>
        ) : (
          <>
            <div>
              liste des joueurs
              {gamerList.map((gamer) => (
                <div key={gamer}>{gamer}</div>
              ))}
              {guestList.map((guest, i) => (
                <div key={i}>
                  {guest} <span className="italic text-sm">(guest)</span>
                </div>
              ))}
              {multiGuestList.map((multiGuest, i) => (
                <div key={i}>
                  {multiGuest}{" "}
                  <span className="italic text-sm">(guest externe)</span>
                </div>
              ))}
            </div>

            <hr />

            {isAdmin && (
              <>
                <h1>Invitez vos amis !</h1>
                <h2 className="text-sm italic">
                  Ils recevront votre invitation via &quot;Invitations aux
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

                <hr />

                <h1>Invitez des guests multiscreen !</h1>
                <h2 className="text-sm italic">
                  Ils joueront sur leur propre écran.
                </h2>
                <button
                  onClick={() => setShowRoomRefs(!showRoomRefs)}
                  className="border border-blue-300 bg-blue-100"
                >
                  {!showRoomRefs ? "Montrer" : "Cacher"} le QrCode
                </button>
                {showRoomRefs && (
                  <QRCode
                    value={`/categories/${categorie}/${gameName}?token=${roomToken}`}
                  />
                )}

                <hr />

                <h1>Ajoutez des guests monoscreen !</h1>
                <h2 className="text-sm italic">
                  Ils utiliseront votre écran à leur tour de jeu.
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
                  Ajoutez un guest
                </button>

                <hr />

                <button onClick={launchRoom}>Lancer la partie</button>
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
