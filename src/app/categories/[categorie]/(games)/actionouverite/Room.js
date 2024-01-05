"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Pusher from "pusher-js";
import QRCode from "react-qr-code";

var pusher = new Pusher("61853af9f30abf9d5b3d", {
  cluster: "eu",
});

import {
  serverCreate,
  serverJoin,
  serverAddGuest,
  joinAgain,
  getRoomId,
} from "./actions";

const genRoomToken = () => {
  let roomId = "";
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let count = 0;
  while (count < 5) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    count++;
  }
  return roomId;
};

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
  const [newGuest, setNewGuest] = useState("");
  const refGuest = useRef();
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
    const newRoomToken = genRoomToken();

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
        data.gameData && setGameData(data.gameData);
      });

      setIsAdmin(true);
      setRoomToken(newRoomToken);
      setGamerList(gamers);
      setIsChosen(true);
      setServerMessage("");
    } catch (error) {
      setServerMessage(error.message);
    }
  };

  const joinRoom = useCallback(async () => {
    const token = inputToken.toUpperCase();
    try {
      const { gamers, guests, alreadyStarted } = await serverJoin(
        token,
        user,
        geoLocation
      );

      const channel = pusher.subscribe(`room-${token}`);
      channel.bind("room-event", function (data) {
        data.clientGamerList && setGamerList(data.clientGamerList);
        data.guestList && setGuestList(data.guestList);
        data.started && setIsStarted(true);
        data.gameData && setGameData(data.gameData);
      });

      setRoomToken(token);
      setGamerList(gamers);
      setGuestList(guests);
      setIsChosen(true);
      setServerMessage("");
      alreadyStarted && (await joinAgain(token));
    } catch (error) {
      setServerMessage(error.message);
    }
  }, [geoLocation, inputToken, user]);

  useEffect(() => {
    if (searchToken) {
      setInputToken(searchToken);
      joinRoom();
    }
  }, [searchToken, joinRoom]);

  const addGuest = async () => {
    if (newGuest.length < 3) {
      setServerMessage("Nom trop court");
      return;
    }
    const guests = await serverAddGuest({
      token: roomToken,
      guestName: newGuest,
    });
    refGuest.current.value = "";
    setServerMessage(`Guest ${newGuest} ajouté`);
    setNewGuest("");
    setGuestList(guests);
  };

  const launchRoom = async () => {
    try {
      await launchGame(roomId, roomToken, gamerList, guestList, options);
      setServerMessage("");
      setIsStarted(true);
    } catch (error) {
      setServerMessage(error.message);
    }
  };

  if (!isStarted) {
    return (
      <>
        {!isChosen ? (
          <>
            <button onClick={createRoom}>Créer une nouvelle partie</button>

            <div>
              <input
                onChange={(event) => setInputToken(event.target.value)}
                value={inputToken}
                className="border focus:outline-none focus:border-2"
              />
              <button onClick={joinRoom}>Rejoindre</button>
            </div>
          </>
        ) : (
          <>
            <div>
              liste des joueurs
              {gamerList.map((gamer) => (
                <div key={gamer.name}>{gamer.name}</div>
              ))}
              {guestList.map((guest, i) => (
                <div key={i}>
                  {guest} <span className="italic text-sm">(guest)</span>
                </div>
              ))}
            </div>

            <hr />

            {isAdmin && (
              <>
                <button onClick={() => setShowRoomRefs(!showRoomRefs)}>
                  {!showRoomRefs ? "Montrer" : "Cacher"} les références
                </button>
                {showRoomRefs && (
                  <>
                    <div>token : {roomToken}</div>
                    <QRCode
                      value={`${process.env.NEXT_PUBLIC_APP_URL}/categories/${categorie}/${gameName}?token=${roomToken}`}
                    />
                  </>
                )}

                <hr />

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

                <h1>Invitez des guests !</h1>
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
        user={user}
        gameData={gameData}
      />
    );
  }
}
