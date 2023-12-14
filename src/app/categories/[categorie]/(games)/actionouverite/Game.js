"use client";

import { useState, useEffect } from "react";
import Pusher from "pusher-js";

var pusher = new Pusher("61853af9f30abf9d5b3d", {
  cluster: "eu",
});

import { serverCreate, serverJoin, launch } from "./actions";

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

export default function Game({ user, game }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomToken, setRoomToken] = useState("");
  const [gamerList, setGamerList] = useState([]);

  const [isChosen, setIsChosen] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    return () => {
      pusher.unsubscribe(`room-${roomToken}`);
    };
  }, [roomToken]);

  const createRoom = async () => {
    const newRoomToken = genRoomToken();
    const gamers = await serverCreate(newRoomToken, user, game);

    const channel = pusher.subscribe(`room-${newRoomToken}`);
    channel.bind("room-event", function (data) {
      data.clientGamerList && setGamerList(data.clientGamerList);
    });

    setIsAdmin(true);
    setRoomToken(newRoomToken);
    setGamerList(gamers);
    setIsChosen(true);
  };

  const joinRoom = async () => {
    const token = inputValue;
    try {
      const gamers = await serverJoin(token, user);

      const channel = pusher.subscribe(`room-${token}`);
      channel.bind("room-event", function (data) {
        data.clientGamerList && setGamerList(data.clientGamerList);
        data.started && setIsStarted(true);
      });

      setRoomToken(token);
      setGamerList(gamers);
      setIsChosen(true);
    } catch (error) {
      setServerMessage(error.message);
    }
  };

  const launchRoom = async () => {
    await launch(roomToken);
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <>
        <div>jeu action ou vérité</div>
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
              liste des joueurs{" "}
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
    return <div>jeu lancé</div>;
  }
}
