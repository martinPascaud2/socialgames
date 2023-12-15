"use client";

import { useState, useEffect } from "react";
import Pusher from "pusher-js";

var pusher = new Pusher("61853af9f30abf9d5b3d", {
  cluster: "eu",
});

import { serverCreate, serverJoin, joinAgain, getId } from "./actions";

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

export default function Room({ user, gameName, Game, launchGame }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomToken, setRoomToken] = useState("");
  const [gamerList, setGamerList] = useState([]);
  const [options, setOptions] = useState({});

  const [isChosen, setIsChosen] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  const [roomId, setRoomId] = useState(0);
  const [gameData, setGameData] = useState({});

  useEffect(() => {
    async function getRoomId() {
      const id = await getId(roomToken);
      setRoomId(id);
    }
    getRoomId();

    return () => {
      pusher.unsubscribe(`room-${roomToken}`);
    };
  }, [roomToken]);

  const createRoom = async () => {
    const newRoomToken = genRoomToken();
    const gamers = await serverCreate(newRoomToken, user, gameName);

    const channel = pusher.subscribe(`room-${newRoomToken}`);
    channel.bind("room-event", function (data) {
      data.clientGamerList && setGamerList(data.clientGamerList);
      data.gameData && setGameData(data.gameData);
    });

    setIsAdmin(true);
    setRoomToken(newRoomToken);
    setGamerList(gamers);
    setIsChosen(true);
  };

  const joinRoom = async () => {
    const token = inputValue;
    try {
      const { gamers, alreadyStarted } = await serverJoin(token, user);

      const channel = pusher.subscribe(`room-${token}`);
      channel.bind("room-event", function (data) {
        data.clientGamerList && setGamerList(data.clientGamerList);
        data.started && setIsStarted(true);
        data.gameData && setGameData(data.gameData);
      });

      setRoomToken(token);
      setGamerList(gamers);
      setIsChosen(true);
      alreadyStarted && (await joinAgain(token));
    } catch (error) {
      setServerMessage(error.message);
    }
  };

  const launchRoom = async () => {
    await launchGame(roomId, roomToken, gamerList, options);
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <>
        {!isChosen ? (
          <>
            <button onClick={createRoom}>Créer une nouvelle partie</button>

            <div>
              <input
                onChange={(event) => setInputValue(event.target.value)}
                value={inputValue}
                className="border focus:outline-none focus:border-2"
              />
              <button onClick={joinRoom}>Rejoindre</button>
              <div>{serverMessage}</div>
            </div>
          </>
        ) : (
          <>
            <div>
              liste des joueurs
              {gamerList.map((gamer) => (
                <div key={gamer}>{gamer}</div>
              ))}
            </div>
            <div>token : {roomToken}</div>
            {isAdmin && <button onClick={launchRoom}>Lancer la partie</button>}
          </>
        )}
      </>
    );
  } else {
    return (
      <Game
        roomId={roomId}
        roomToken={roomToken}
        userName={user.name}
        gameData={gameData}
      />
    );
  }
}
