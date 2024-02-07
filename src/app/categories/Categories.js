"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { throttle } from "lodash";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import classNames from "classnames";
import QRCode from "react-qr-code";
import Pusher from "pusher-js";

import { ArrowPathIcon } from "@heroicons/react/24/outline";

import Html5QrcodePlugin from "@/components/Html5QrcodePlugin";
import getLocation from "@/utils/getLocation";

import { categories, gamesRefs } from "@/assets/globals";
var pusher = new Pusher("61853af9f30abf9d5b3d", {
  cluster: "eu",
});

export default function Categories({
  user,
  friendList,
  addFriend,
  deleteFriend,
  getPublicRooms,
  signOut,
}) {
  const router = useRouter();

  const [serverMessage, setServerMessage] = useState();
  const [location, setLocation] = useState(null);

  const [togglingParameters, setTogglingParameters] = useState(false);
  const [toggledParameters, setToggledParameters] = useState(false);

  const searchParams = useSearchParams();
  const isGroup = searchParams.get("group") === "true";
  const handleBgClick = () => {
    setTogglingParameters(!togglingParameters);
    setTimeout(() => {
      setToggledParameters(!toggledParameters);
    }, 500);
  };

  const [topRect, setTopRect] = useState();
  const [bottomRect, setBottomRect] = useState();
  const [topSpace, setTopSpace] = useState();
  const [bottomSpace, setBottomSpace] = useState();

  useEffect(() => {
    const qrZone =
      document !== undefined ? document.getElementById("QR-zone") : null;
    const rect = qrZone?.getBoundingClientRect();
    setTopRect(rect?.top);
    setBottomRect((rect?.bottom).toString());
  }, []);

  useEffect(() => {
    const infosettings =
      document !== undefined ? document.getElementById("infosettings") : null;
    const infosettingsRect = infosettings?.getBoundingClientRect();
    setTopSpace(infosettingsRect.top);
  }, [topRect]);

  useEffect(() => {
    const bottomSide =
      document !== undefined ? document.getElementById("bottom") : null;
    const bottomSideRect = bottomSide?.getBoundingClientRect();
    setBottomSpace((window.innerHeight - bottomSideRect.bottom + 1).toString());
  }, [bottomRect]);

  const [showQrCode, setShowQrCode] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [showInvitations, setShowInvitations] = useState(true);
  const [invitations, setInvitations] = useState([]);

  const onNewScanResult = useCallback(
    throttle(async (decodedText) => {
      if (scanLocked) return;
      let userLocation;
      setScanLocked(true);
      userLocation = await getLocation();
      const { error: addFriendError } = await addFriend({
        userLocation,
        friendCode: decodedText,
      });
      if (addFriendError) setServerMessage(addFriendError);
      setTimeout(() => {
        setScanLocked(false);
      }, 10000);
    }, 10000),
    []
  );
  const QrCodeScanner = useMemo(() => {
    if (!scanning) return;
    return (
      <>
        <Html5QrcodePlugin
          scanning={scanning}
          fps={10}
          qrbox={500}
          aspectRatio="1.0"
          qrCodeSuccessCallback={onNewScanResult}
        />
      </>
    );
  }, [scanning]);

  useEffect(() => {
    const channel = pusher.subscribe(`user-${user.email}`);
    channel.bind("user-event", function (data) {
      if (data.message) {
        setServerMessage(data.message);
        router.refresh();
      }
      if (data.invitation) {
        setInvitations((prevInvitations) => {
          if (prevInvitations.some((inv) => inv.link === data.invitation.link))
            return [...prevInvitations];
          return [...prevInvitations, data.invitation];
        });
      }
    });
    return () => {
      pusher.unsubscribe(`user-${user.email}`);
    };
  }, [user.email]);

  const [publicRooms, setPublicRooms] = useState({});
  useEffect(() => {
    const getRooms = async () => {
      setPublicRooms(await getPublicRooms());
    };
    getRooms();
  }, [getPublicRooms, invitations]);

  return (
    <>
      <div
        onClick={() =>
          !isGroup
            ? handleBgClick()
            : router.push("/categories/grouping/grouping")
        }
        className="z-10 absolute h-screen w-screen"
      />

      <main className="relative h-screen">
        <div
          className={classNames(
            "relative h-screen w-screen",
            {
              "transition-opacity ease-in-out duration-500 opacity-100":
                togglingParameters,
            },
            {
              "transition-opacity ease-in-out duration-500 opacity-0":
                !togglingParameters,
            }
          )}
        >
          <div
            className={`z-20 absolute bg-blue-100 w-1/2 border-r border-black`}
            style={{ height: `${topSpace + 1}px` }}
          />
          <div
            className={`z-20 absolute bg-yellow-100 w-1/2 border-l border-black translate-x-[50vw]`}
            style={{ height: `${topSpace + 1}px` }}
          />

          <div
            className="z-30 absolute bg-blue-100 w-[12.6vw] h-36 skew-y-[45deg] -translate-y-[6.1vw] border-b-2 border-black"
            style={{ top: `${topRect - 144}px` }}
          />
          <div
            className="z-30 absolute bg-yellow-100 w-[12.6vw] h-36 -skew-y-[45deg] -translate-y-[6.1vw] right-0 border-b-2 border-black"
            style={{ top: `${topRect - 144}px` }}
          />

          <div
            id="infosettings"
            className="z-30 absolute bg-blue-100 w-[37.5vw] h-36 translate-x-[12.5vw] border-r border-black"
            style={{ top: `${topRect - 144}px` }}
          >
            <div>infos</div>
            {friendList.map((friend) => (
              <div
                key={friend.friendId}
                onClick={() =>
                  deleteFriend({
                    userId: user.id,
                    friendId: friend.friendId,
                  })
                }
              >
                {friend.customName}
              </div>
            ))}
          </div>

          <div
            className="z-30 absolute bg-yellow-100 w-[37.5vw] h-36 border-l border-black translate-x-[50vw]"
            style={{ top: `${topRect - 144}px` }}
          >
            <div>settings</div>
            <Link
              href="/"
              onClick={async () => {
                await signOut();
                window.location.reload();
              }}
              className={classNames(
                { hidden: !togglingParameters && !toggledParameters },
                "z-20 absolute w-1/3 p-3 text-center border"
              )}
            >
              Déconnexion
            </Link>
          </div>

          <div
            id="QR-zone"
            className="z-30 absolute top-1/2 left-1/2 -translate-x-1/2	-translate-y-1/2 bg-slate-500 w-[75vw] h-[75vw] border-2 border-black"
          >
            {showQrCode && location && (
              <QRCode
                value={`id=${user.id};mail=${user.email};name=${user.name};{"latitude":"${location?.latitude}","longitude":"${location?.longitude}"}`}
                className="w-full h-full"
              />
            )}

            {QrCodeScanner}

            {showInvitations && (
              <>
                <div
                  onClick={async () => setPublicRooms(await getPublicRooms())}
                  className="flex justify-center items-center border text-center text-slate-300"
                >
                  Parties de vos amis <ArrowPathIcon className="ml-2 h-4 w-4" />
                </div>

                {!invitations.length && !Object.keys(publicRooms).length && (
                  <div className="text-center text-black">
                    Aucune partie disponible
                  </div>
                )}
                {invitations.map((invitation, i) => (
                  <Link key={i} href={invitation.link}>
                    <div className="border border-slate-700 bg-slate-300 text-center">
                      {invitation.userName} pour{" "}
                      {`${gamesRefs[invitation.gameName].name}`}
                    </div>
                  </Link>
                ))}
                {Object.entries(publicRooms).map((room) => {
                  const { friendName, gameName, gamersNumber } = room[1];
                  return (
                    <Link key={room[0]} href={`${room[1].link}`}>
                      <div className="border border-slate-700 bg-slate-300 text-center">
                        {friendName}
                        {gamersNumber > 1 && `(+${gamersNumber - 1})`} pour{" "}
                        {gameName}
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </div>

          <div
            className="z-30 absolute bg-red-100 w-[12.6vw] h-36 -skew-y-[45deg] translate-y-[6.1vw] border-t-2 border-black"
            style={{ top: `${bottomRect}px` }}
          />
          <div
            className="z-30 absolute bg-red-100 w-[12.6vw] h-36 skew-y-[45deg] translate-y-[6.1vw] border-t-2 border-black"
            style={{ top: `${bottomRect}px`, right: "0px" }}
          />

          <div
            id="bottom"
            className="z-30 absolute bg-red-100 w-[75vw] h-36 translate-x-[12.5vw] flex flex-col justify-between items-center"
            style={{ top: `${bottomRect}px` }}
          >
            <div className="z-30 w-full text-center">{serverMessage}</div>
            <div className="flex flex-row m-3">
              <button
                onClick={() => {
                  setShowQrCode(false);
                  setScanning(false);
                  setShowInvitations(true);
                  setServerMessage("");
                }}
                className={classNames("m-1 p-2", {
                  "outline outline-black": showInvitations,
                })}
              >
                Parties en cours
              </button>
              <Link
                href="/categories/grouping/grouping"
                className="text-center m-1 p-2"
              >
                Créer un groupe
              </Link>
            </div>
            <div className="flex flex-row m-3">
              <button
                className={classNames("m-1 p-2", {
                  "outline outline-black": showQrCode,
                })}
                onClick={async () => {
                  try {
                    setLocation(await getLocation());
                    setServerMessage("QR code généré !");
                  } catch (error) {
                    setServerMessage(error.message);
                  }
                  setShowQrCode(true);
                  setScanning(false);
                  setShowInvitations(false);
                }}
              >
                Générer votre QRCode
              </button>
              <button
                onClick={() => {
                  setShowQrCode(false);
                  setScanning(true);
                  setShowInvitations(false);
                  setServerMessage("");
                }}
                className={classNames("m-1 p-2 bg-red-100", {
                  "outline outline-black": scanning,
                })}
              >
                Ajouter un ami
              </button>
            </div>
          </div>

          <div
            className={`z-20 absolute bg-red-100 w-full bottom-0`}
            style={{ height: `${bottomSpace}px` }}
          />
        </div>

        <div
          className={classNames(
            {
              "m-auto transition-opacity ease-in-out duration-500 opacity-100":
                !togglingParameters,
            },
            {
              "m-auto transition-opacity ease-in-out duration-500 opacity-0":
                togglingParameters,
            }
          )}
        >
          {categories.map((categorie, index) => (
            <Link
              key={index}
              href={`${categorie.href}${isGroup ? "?group=true" : ""}`}
              className={classNames(
                `z-20 absolute w-1/3 aspect-square p-3 border`,
                {
                  hidden: togglingParameters && toggledParameters,
                }
              )}
              style={{
                top: `${Math.floor(index / 2) * 23 + 6.4}vh`,
                left: index % 2 === 0 && "2rem",
                right: index % 2 === 1 && "2rem",
              }}
            >
              <div className="flex items-center justify-center h-full">
                {categorie.name}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
