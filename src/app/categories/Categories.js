"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { throttle } from "lodash";
import Link from "next/link";
import { useRouter } from "next/navigation";
import classNames from "classnames";
import QRCode from "react-qr-code";
import Pusher from "pusher-js";

import Html5QrcodePlugin from "./Html5QrcodePlugin";
import getLocation from "@/utils/getLocation";

import { categories, gameNames } from "@/assets/globals";

var pusher = new Pusher("61853af9f30abf9d5b3d", {
  cluster: "eu",
});

export default function Categories({
  user,
  addFriend,
  deleteFriend,
  signOut,
  friendList,
}) {
  const router = useRouter();

  const [serverMessage, setServerMessage] = useState();
  const [location, setLocation] = useState(null);

  const [togglingParameters, setTogglingParameters] = useState(false);
  const [toggledParameters, setToggledParameters] = useState(false);

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
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitations, setInvitations] = useState([]);

  const onNewScanResult = useCallback(
    throttle(async (decodedText) => {
      if (scanLocked) return;
      let userLocation;
      try {
        setScanLocked(true);
        userLocation = await getLocation();
        await addFriend({ userLocation, friendCode: decodedText });
      } catch (error) {
        setServerMessage(error.message);
      } finally {
        setTimeout(() => {
          setScanLocked(false);
        }, 10000);
      }
    }, 10000),
    []
  );
  const QrCodeScanner = useMemo(() => {
    return (
      <Html5QrcodePlugin
        scanning={scanning}
        fps={10}
        qrbox={500}
        aspectRatio="1.0"
        qrCodeSuccessCallback={onNewScanResult}
      />
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

  return (
    <>
      <div
        onClick={handleBgClick}
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
                router.push("/");
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
            className=" z-30 absolute top-1/2 left-1/2 -translate-x-1/2	-translate-y-1/2 bg-slate-500 w-[75vw] h-[75vw] border-2 border-black"
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
                <div className="text-center text-slate-300">
                  Invitations de vos amis
                </div>
                {invitations.map((invitation, i) => (
                  <Link key={i} href={invitation.link}>
                    <div className="border border-slate-700 bg-slate-300 text-center">
                      {invitation.userName} pour{" "}
                      {`${gameNames[invitation.gameName]}`}
                    </div>
                  </Link>
                ))}
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
            className="z-30 absolute bg-red-100 w-[75vw] h-36 translate-x-[12.5vw] flex flex-col justify-between"
            style={{ top: `${bottomRect}px` }}
          >
            <div className="absolute w-full text-center">{serverMessage}</div>
            <button
              className={classNames("m-2 mt-8 p-2", {
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
              Générer mon QRCode
            </button>
            <button
              onClick={() => {
                setShowQrCode(false);
                setScanning(true);
                setShowInvitations(false);
                setServerMessage("");
              }}
              className={classNames("m-2 p-2", {
                "outline outline-black": scanning,
              })}
            >
              Ajouter un ami
            </button>
            <button
              onClick={() => {
                setShowQrCode(false);
                setScanning(false);
                setShowInvitations(true);
                setServerMessage("");
              }}
              className={classNames("m-2 p-2", {
                "outline outline-black": showInvitations,
              })}
            >
              Invitations aux parties
            </button>
          </div>

          <div
            className={`z-20 absolute bg-red-100 w-full bottom-0`}
            style={{ height: `${bottomSpace}px` }}
          />
        </div>

        <div
          className={classNames(
            {
              "transition-opacity ease-in-out duration-500 opacity-100":
                !togglingParameters,
            },
            {
              "transition-opacity ease-in-out duration-500 opacity-0":
                togglingParameters,
            }
          )}
        >
          {categories.map((categorie, index) => (
            <Link
              key={index}
              href={categorie.href}
              className={classNames(
                `z-20 absolute w-1/3 p-3 text-center border`,

                {
                  hidden: togglingParameters && toggledParameters,
                }
              )}
              style={{
                top: `${Math.floor(index / 2) * 25 + 5}vh`,
                left: index % 2 === 0 && "2rem",
                right: index % 2 === 1 && "2rem",
              }}
            >
              {categorie.name}
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
