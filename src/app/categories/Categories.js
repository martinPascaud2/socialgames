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
import getErrorInformations from "@/utils/getErrorInformations";

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
  updateLastCP,
  signOut,
}) {
  const router = useRouter();

  const [serverMessage, setServerMessage] = useState();
  const [location, setLocation] = useState(null);

  const [togglingParameters, setTogglingParameters] = useState(false);
  const [toggledParameters, setToggledParameters] = useState(false);

  const searchParams = useSearchParams();
  const urlControl = searchParams.get("control") === "true";
  const [hasLoaded, setHadLoaded] = useState(!urlControl);

  const [topRect, setTopRect] = useState();
  const [bottomRect, setBottomRect] = useState();
  const [topSpace, setTopSpace] = useState();
  const [bottomSpace, setBottomSpace] = useState();

  const [showQrCode, setShowQrCode] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [stopScan, setStopScan] = useState();

  const [showInvitations, setShowInvitations] = useState(true);
  const [invitations, setInvitations] = useState([]);

  const [publicRooms, setPublicRooms] = useState({});

  const isGroup = searchParams.get("group") === "true";
  const handleBgClick = () => {
    setTogglingParameters(!togglingParameters);
    setTimeout(() => {
      setToggledParameters(!toggledParameters);
    }, 500);
    setHadLoaded(true);
  };

  useEffect(() => {
    if (urlControl) handleBgClick();
  }, [urlControl]);

  useEffect(() => {
    const qrZone =
      document !== undefined ? document.getElementById("QR-zone") : null;
    const rect = qrZone?.getBoundingClientRect();
    setTopRect(rect?.top);
    setBottomRect((rect?.bottom).toString());
  }, []);

  useEffect(() => {
    if (!topRect) return;
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
    const requestCameraAccess = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (error) {
        console.error("Erreur lors de l'accès à la caméra :", error);
        const errorInformations = getErrorInformations({
          window,
          fail: "camera_permission",
        }).map((info, i) => (
          <div key={i} className={`${i === 0 && "font-bold"}`}>
            {i !== 0 && "=>"}
            {info}
          </div>
        ));
        setServerMessage(errorInformations);
        setScanning(false);
      }
    };
    requestCameraAccess();

    return (
      <>
        <Html5QrcodePlugin
          scanning={scanning}
          fps={10}
          aspectRatio="1.0"
          qrCodeSuccessCallback={onNewScanResult}
          setStopScan={setStopScan}
        />
      </>
    );
  }, [scanning]);

  const resetPermissions = useCallback(() => {
    stopScan && stopScan();
    setStopScan();
  }, [stopScan]);

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

    updateLastCP({ userId: user.id }); //no await

    return () => {
      pusher.unsubscribe(`user-${user.email}`);
    };
  }, [user.email]);

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
        className="z-10 absolute h-screen w-screen max-h-full"
      />

      <main className="relative h-[100svh]">
        <div
          className={classNames(
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
                onClick={async () => {
                  await deleteFriend({
                    userId: user.id,
                    friendId: friend.friendId,
                  });
                  updateLastCP({ userId: user.id }); //no await
                }}
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
                await updateLastCP({ userId: user.id, out: true });
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
                  onClick={async () => {
                    setPublicRooms(await getPublicRooms());
                    updateLastCP({ userId: user.id }); //no await
                  }}
                  className="flex justify-center items-center border text-center text-slate-300"
                >
                  Parties de tes amis <ArrowPathIcon className="ml-2 h-4 w-4" />
                </div>

                {!invitations.length && !Object.keys(publicRooms).length && (
                  <div className="text-center text-black">
                    Aucune partie disponible
                  </div>
                )}
                {invitations.map((invitation, i) => (
                  <Link
                    key={i}
                    onClick={async () => {
                      resetPermissions();
                      await updateLastCP({ userId: user.id, out: true });
                    }}
                    href={invitation.link}
                  >
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
            <div className="flex justify-center w-full">
              <div className="flex flex-col w-full text-white">
                {serverMessage}
              </div>
            </div>
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
            <div className="flex flex-row m-3">
              <button
                onClick={async () => {
                  resetPermissions();
                  updateLastCP({ userId: user.id }); //no await
                  setShowQrCode(false);
                  setScanning(false);
                  setShowInvitations(true);
                  setServerMessage("");
                }}
                className={classNames("m-1 p-2", {
                  "outline outline-black": showInvitations,
                })}
              >
                Parties de tes amis
              </button>
              <Link
                onClick={async () => {
                  resetPermissions();
                  await updateLastCP({ userId: user.id, out: true });
                }}
                href="/categories/grouping/grouping"
                className="text-center m-1 p-2"
              >
                Crée un groupe
              </Link>
            </div>
            <div className="flex flex-row m-3">
              <button
                className={classNames("m-1 p-2", {
                  "outline outline-black": showQrCode,
                })}
                onClick={async () => {
                  resetPermissions();
                  updateLastCP({ userId: user.id }); //no await
                  try {
                    setLocation(await getLocation());
                    setServerMessage("QR code généré !");
                  } catch (error) {
                    console.error(error.message);
                    const errorInformations = getErrorInformations({
                      window,
                      fail: "location_permission",
                    }).map((info, i) => (
                      <div key={i} className={`${i === 0 && "font-bold"}`}>
                        {i !== 0 && "=>"}
                        {info}
                      </div>
                    ));
                    setServerMessage(errorInformations);
                    setLocation();
                  }
                  setShowQrCode(true);
                  setScanning(false);
                  setShowInvitations(false);
                }}
              >
                Génère ton QRCode
              </button>
              <button
                onClick={() => {
                  resetPermissions();
                  updateLastCP({ userId: user.id }); //no await
                  setShowQrCode(false);
                  setScanning(!scanning);
                  setShowInvitations(false);
                  setServerMessage("");
                }}
                className={classNames("m-1 p-2 bg-red-100", {
                  "outline outline-black": scanning,
                })}
              >
                Ajoute un ami
              </button>
            </div>
          </div>

          <div
            className={`z-20 absolute bg-red-100 w-full bottom-0`}
            style={{
              height: `${bottomSpace}px`,
              maxHeight: "20vh",
            }}
          />
        </div>

        {hasLoaded && (
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
            {categories.map((categorie, index) => {
              const isLast = index === 6;
              return (
                <Link
                  key={index}
                  onClick={async () => {
                    resetPermissions();
                    await updateLastCP({ userId: user.id, out: true });
                  }}
                  href={`${categorie.href}${isGroup ? "?group=true" : ""}`}
                  className={classNames(`z-20 absolute  min-h-[18dvh] border`, {
                    hidden: togglingParameters && toggledParameters,
                  })}
                  style={{
                    top: `${Math.floor(index / 2) * 23 + 5.4}dvh`,
                    left: index % 2 === 0 && "8%",
                    right: index % 2 === 1 && "8%",
                    width: !isLast ? "33.333333%" : "84%",
                    aspectRatio: !isLast ? "1 / 1" : "auto",
                  }}
                >
                  <div
                    className={`flex items-center justify-center h-full ${
                      isLast && "m-[9dvh]"
                    }`}
                  >
                    {categorie.name}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
