"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { throttle } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import classNames from "classnames";
import QRCode from "react-qr-code";
import Pusher from "pusher-js";

import { ArrowPathIcon } from "@heroicons/react/24/outline";

import Html5QrcodePlugin from "@/components/Html5QrcodePlugin";
import Modal from "@/components/Modal";
import useWake from "@/utils/useWake";
import { useDeviceDetector } from "@/utils/useGetBarsSizes";
import getLocation from "@/utils/getLocation";
import getErrorInformations from "@/utils/getErrorInformations";
import cancelBack from "@/utils/cancelBack";

import { categories, gamesRefs } from "@/assets/globals";
var pusher = new Pusher("61853af9f30abf9d5b3d", {
  cluster: "eu",
});

import "./test.css";

import getUser from "@/utils/getUser";

// export default function Categories({
//   user,
//   updateParams,
//   friendList,
//   addFriend,
//   deleteFriend,
//   getPublicRooms,
//   getCurrentGame,
//   updateLastCP,
//   signOut,
// }) {
//   const { isSupported, isVisible, released, request, release } = useWake();
//   const deviceInfo = useDeviceDetector();
//   const router = useRouter();

//   const [serverMessage, setServerMessage] = useState();
//   const [location, setLocation] = useState(null);

//   const [togglingParameters, setTogglingParameters] = useState(false);
//   const [toggledParameters, setToggledParameters] = useState(false);

//   const searchParams = useSearchParams();
//   const urlControl = searchParams.get("control") === "true";
//   const [hasLoaded, setHadLoaded] = useState(!urlControl);

//   const [topRect, setTopRect] = useState();
//   const [bottomRect, setBottomRect] = useState();
//   const [topSpace, setTopSpace] = useState();
//   const [bottomSpace, setBottomSpace] = useState();

//   const [showQrCode, setShowQrCode] = useState(false);
//   const [scanning, setScanning] = useState(false);
//   const [scanLocked, setScanLocked] = useState(false);
//   const [stopScan, setStopScan] = useState();

//   const [showInvitations, setShowInvitations] = useState(true);
//   const [invitations, setInvitations] = useState([]);

//   const [publicRooms, setPublicRooms] = useState({});
//   const [currentGame, setCurrentGame] = useState();

//   const [showParams, setShowParams] = useState(false);
//   const possibleBarValues = [8, 12, 14, 16, 18, 20];
//   const [barValues, setBarValues] = useState();

//   useEffect(() => {
//     if (!user?.params) {
//       setBarValues({ bottomBarSize: 8, topBarSize: 8 });
//       return;
//     }
//     const userParams = user.params || {};
//     setBarValues({
//       bottomBarSize: userParams.bottomBarSize,
//       topBarSize: userParams.topBarSize,
//     });
//   }, [user]);

//   useEffect(() => {
//     if (!barValues || !user) return;
//     const update = async () => {
//       await updateParams({
//         userId: user.id,
//         param: "topBarSize",
//         value: barValues.topBarSize,
//       });
//       await updateParams({
//         userId: user.id,
//         param: "bottomBarSize",
//         value: barValues.bottomBarSize,
//       });
//     };
//     update();
//   }, [barValues, user, updateParams]);

//   const isGroup = searchParams.get("group") === "true";
//   const handleBgClick = () => {
//     setTogglingParameters(!togglingParameters);
//     setTimeout(() => {
//       setToggledParameters(!toggledParameters);
//     }, 500);
//     setHadLoaded(true);
//   };

//   useEffect(() => {
//     if (urlControl) handleBgClick();
//   }, [urlControl]);

//   useEffect(() => {
//     const qrZone =
//       document !== undefined ? document.getElementById("QR-zone") : null;
//     const rect = qrZone?.getBoundingClientRect();
//     setTopRect((rect?.top).toString());
//     setBottomRect((rect?.bottom).toString());
//   }, []);

//   useEffect(() => {
//     if (!topRect) return;
//     const infosettings =
//       document !== undefined ? document.getElementById("infosettings") : null;
//     const infosettingsRect = infosettings?.getBoundingClientRect();
//     setTopSpace(infosettingsRect.top);
//   }, [topRect]);

//   useEffect(() => {
//     if (!bottomRect) return;
//     const bottomSide =
//       document !== undefined ? document.getElementById("bottom") : null;
//     const bottomSideRect = bottomSide?.getBoundingClientRect();
//     setBottomSpace((window.innerHeight - bottomSideRect.bottom + 1).toString());
//   }, [bottomRect]);

//   const onNewScanResult = throttle(async (decodedText) => {
//     if (scanLocked) return;
//     let userLocation;
//     setScanLocked(true);
//     userLocation = await getLocation();
//     const { error: addFriendError } = await addFriend({
//       userLocation,
//       friendCode: decodedText,
//     });
//     if (addFriendError) setServerMessage(addFriendError);
//     setTimeout(() => {
//       setScanLocked(false);
//     }, 1000);
//   }, 1000);

//   const QrCodeScanner = useMemo(() => {
//     if (!scanning) return;
//     const requestCameraAccess = async () => {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true });
//       } catch (error) {
//         console.error("Erreur lors de l'accès à la caméra :", error);
//         const errorInformations = getErrorInformations({
//           window,
//           fail: "camera_permission",
//         }).map((info, i) => (
//           <div key={i} className={`${i === 0 && "font-bold"}`}>
//             {i !== 0 && "=>"}
//             {info}
//           </div>
//         ));
//         setServerMessage(errorInformations);
//         setScanning(false);
//       }
//     };
//     requestCameraAccess();

//     return (
//       <>
//         <Html5QrcodePlugin
//           scanning={scanning}
//           fps={10}
//           aspectRatio="1.0"
//           qrCodeSuccessCallback={onNewScanResult}
//           setStopScan={setStopScan}
//         />
//       </>
//     );
//   }, [scanning]);

//   const resetPermissions = useCallback(() => {
//     stopScan && stopScan();
//     setStopScan();
//   }, [stopScan]);

//   useEffect(() => {
//     const channel = pusher.subscribe(`user-${user.email}`);
//     channel.bind("user-event", function (data) {
//       if (data.message) {
//         setServerMessage(data.message);
//         router.refresh();
//       }
//       if (data.invitation) {
//         if (data.invitation.deleted) {
//           setPublicRooms((prevPublics) => {
//             const prevPubs = { ...prevPublics };
//             let deletedId;
//             Object.entries(prevPubs).find((pub) => {
//               if (pub[1].link === data.invitation.link) deletedId = pub[0];
//             });
//             if (deletedId) delete prevPubs[deletedId];
//             return prevPubs;
//           });
//         }
//         setInvitations((prevInvitations) => {
//           const prevInvs = [...prevInvitations];
//           if (data.invitation.deleted) {
//             const deletedInvs = prevInvs.filter(
//               (inv) => inv.link !== data.invitation.link
//             );
//             return deletedInvs;
//           }

//           const alreadyInviterIndex = prevInvs.findIndex(
//             (inv) => inv.userName === data.invitation.userName
//           );
//           if (alreadyInviterIndex !== -1) {
//             prevInvs.splice(alreadyInviterIndex, 1);
//             return [...prevInvs, data.invitation];
//           }

//           const sameInvLink = prevInvs.some(
//             (inv) => inv.link === data.invitation.link
//           );
//           if (sameInvLink) return [...prevInvs];

//           return [...prevInvs, data.invitation];
//         });
//       }
//     });

//     updateLastCP({ userId: user.id }); //no await

//     return () => {
//       pusher.unsubscribe(`user-${user.email}`);
//     };
//   }, [user, router, updateLastCP]);

//   useEffect(() => {
//     setPublicRooms((prevPublics) => {
//       const alreadyInInvitations = [];
//       Object.entries(prevPublics).forEach((pub) => {
//         invitations.forEach((inv) => {
//           if (inv.link === pub[1].link) alreadyInInvitations.push(pub[0]);
//         });
//       });
//       if (!alreadyInInvitations.length) return prevPublics;
//       const publics = { ...prevPublics };
//       alreadyInInvitations.forEach((already) => delete publics[already]);
//       return publics;
//     });
//   }, [publicRooms, invitations]);

//   useEffect(() => {
//     const getRooms = async () => {
//       setPublicRooms(await getPublicRooms());
//     };
//     getRooms();
//   }, [getPublicRooms]);

//   useEffect(() => {
//     const backToRoom = async () => {
//       const current = await getCurrentGame();
//       current && setCurrentGame(current);
//     };
//     backToRoom();
//   }, [getCurrentGame, router]);

//   return (
//     <>
//       <div
//         onClick={() =>
//           !isGroup
//             ? handleBgClick()
//             : router.push("/categories/grouping/grouping")
//         }
//         className="z-10 absolute h-[100dvh] w-screen max-h-full"
//       />

//       {currentGame && !isGroup && (
//         <Modal
//           isOpen={true}
//           onClose={() => {
//             setCurrentGame();
//             return;
//           }}
//         >
//           <div className="flex flex-col items-center gap-2 text-2xl p-2">
//             <div className="w-full">Vous avez une partie en cours !</div>
//             <div>
//               Admin : <span className="font-semibold">{currentGame.admin}</span>
//             </div>
//             {currentGame.game === "grouping" ? (
//               <div>Nouveau groupe de joueurs</div>
//             ) : (
//               <div>
//                 Jeu :{" "}
//                 <span className="font-semibold">
//                   {currentGame.mode || currentGame.game}
//                 </span>
//               </div>
//             )}

//             <div className="w-full flex justify-evenly m-2">
//               <Link
//                 href={currentGame.path}
//                 className="border border-blue-300 bg-blue-100 p-2 rounded-md"
//               >
//                 Rejoindre
//               </Link>
//               <button
//                 onClick={async () => {
//                   setCurrentGame();
//                   await cancelBack({ userId: user.id });
//                 }}
//                 className="border border-red-300 bg-red-100 p-2 rounded-md"
//               >
//                 Annuler
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       <main className="relative h-[100dvh]">
//         <div
//           className={classNames(
//             {
//               "transition-opacity ease-in-out duration-500 opacity-100":
//                 togglingParameters,
//             },
//             {
//               "transition-opacity ease-in-out duration-500 opacity-0":
//                 !togglingParameters,
//             }
//           )}
//         >
//           <div
//             className={`z-20 absolute bg-blue-100 w-1/2 border-r border-black`}
//             style={{ height: `${topSpace + 1}px` }}
//           />
//           <div
//             className={`z-20 absolute bg-yellow-100 w-1/2 border-l border-black translate-x-[50vw]`}
//             style={{ height: `${topSpace + 1}px` }}
//           />

//           <div
//             className="z-30 absolute bg-blue-100 w-[12.6vw] h-36 skew-y-[45deg] -translate-y-[6.1vw] border-b-2 border-black"
//             style={{ top: `${topRect - 144}px` }}
//           />
//           <div
//             className="z-30 absolute bg-yellow-100 w-[12.6vw] h-36 -skew-y-[45deg] -translate-y-[6.1vw] right-0 border-b-2 border-black"
//             style={{ top: `${topRect - 144}px` }}
//           />

//           <div
//             id="infosettings"
//             className="z-30 absolute bg-blue-100 w-[37.5vw] h-36 translate-x-[12.5vw] border-r border-black"
//             style={{ top: `${topRect - 144}px` }}
//           >
//             <div>joueur {user.name}</div>
//             <div>{deviceInfo?.device?.model}</div>
//             <div>infos</div>
//             {friendList.map((friend) => (
//               <div
//                 key={friend.friendId}
//                 onClick={async () => {
//                   await deleteFriend({
//                     userId: user.id,
//                     friendId: friend.friendId,
//                   });
//                   updateLastCP({ userId: user.id }); //no await
//                 }}
//               >
//                 {friend.customName}
//               </div>
//             ))}
//           </div>

//           <div
//             className="z-30 absolute bg-yellow-100 w-[37.5vw] h-36 border-l border-black translate-x-[50vw] flex flex-col"
//             style={{ top: `${topRect - 144}px` }}
//           >
//             <Link
//               href="/"
//               onClick={async () => {
//                 await updateLastCP({ userId: user.id, out: true });
//                 await signOut();
//                 window.location.reload();
//               }}
//               // check
//               className={classNames(
//                 { hidden: !togglingParameters && !toggledParameters },
//                 "z-20 w-1/3 text-center text-slate-300 border border-slate-300 w-full m-1 p-1"
//               )}
//             >
//               Déconnexion
//             </Link>
//             <Link
//               href={"/post-game/"}
//               className="w-full m-1 p-1 bg-red-100 border border-red-300 text-center"
//             >
//               Post game
//             </Link>
//             <button
//               onClick={() => {
//                 resetPermissions();
//                 updateLastCP({ userId: user.id }); //no await
//                 setShowParams(true);
//                 setShowQrCode(false);
//                 setScanning(false);
//                 setShowInvitations(false);
//                 setServerMessage("");
//               }}
//               className={classNames(
//                 "m-1 p-1 bg-red-100 border border-red-300 w-full",
//                 {
//                   "outline outline-black": showParams,
//                 }
//               )}
//             >
//               Paramètres
//             </button>
//           </div>

//           <div
//             id="QR-zone"
//             className="z-30 absolute top-[50lvh] left-1/2 -translate-x-1/2	-translate-y-1/2 bg-slate-500 w-[75vw] h-[75vw] border-2 border-black"
//           >
//             {showParams &&
//               [
//                 { param: "topBarSize", label: "Taille barre sup." },
//                 { param: "bottomBarSize", label: "Taille barre inf." },
//               ].map((barParam, i) => (
//                 <div key={i} className="w-full flex justify-around">
//                   <label htmlFor={`slider-${barParam}`} className="w-[40%]">
//                     {barParam.label}
//                   </label>
//                   <input
//                     type="range"
//                     id={`slider-${barParam.param}`}
//                     name={`slider-${barParam.param}`}
//                     min="0"
//                     max={possibleBarValues.length - 1}
//                     value={possibleBarValues?.indexOf(
//                       (barValues && barValues[barParam.param]) ||
//                         possibleBarValues[0]
//                     )}
//                     onChange={(event) => {
//                       const valueIndex = event.target.value;
//                       const value = possibleBarValues[valueIndex];
//                       setBarValues((prevValues) => ({
//                         ...prevValues,
//                         [barParam.param]: value,
//                       }));
//                     }}
//                   />
//                   <span>{barValues && barValues[barParam.param]}</span>
//                 </div>
//               ))}

//             {showQrCode && location && (
//               <QRCode
//                 value={`id=${user.id};mail=${user.email};name=${user.name};{"latitude":"${location?.latitude}","longitude":"${location?.longitude}"}`}
//                 className="w-full h-full"
//               />
//             )}
//             {QrCodeScanner}

//             {showInvitations && (
//               <>
//                 <div
//                   onClick={async () => {
//                     setPublicRooms(await getPublicRooms());
//                     updateLastCP({ userId: user.id }); //no await
//                   }}
//                   className="flex justify-center items-center border text-center text-slate-300"
//                 >
//                   Parties de tes amis
//                   <ArrowPathIcon className="ml-2 h-4 w-4" />
//                 </div>

//                 {!invitations.length && !Object.keys(publicRooms).length && (
//                   <div className="text-center text-black">
//                     Aucune partie disponible
//                   </div>
//                 )}
//                 {invitations.map((invitation, i) => (
//                   <Link
//                     key={i}
//                     onClick={async () => {
//                       resetPermissions();
//                       await updateLastCP({ userId: user.id, out: true });
//                     }}
//                     href={invitation.link}
//                   >
//                     <div className="border border-slate-700 bg-slate-300 text-center">
//                       {invitation.userName} pour{" "}
//                       {`${
//                         invitation.mode || gamesRefs[invitation.gameName].name
//                       }`}
//                     </div>
//                   </Link>
//                 ))}
//                 {Object.entries(publicRooms).map((room) => {
//                   const { friendName, gameName, gamersNumber } = room[1];
//                   return (
//                     <Link key={room[0]} href={`${room[1].link}`}>
//                       <div className="border border-slate-700 bg-slate-300 text-center">
//                         {friendName}
//                         {gamersNumber > 1 && `(+${gamersNumber - 1})`} pour{" "}
//                         {gameName}
//                       </div>
//                     </Link>
//                   );
//                 })}
//               </>
//             )}
//             <div className="flex justify-center w-full">
//               <div className="flex flex-col w-full text-white">
//                 {serverMessage}
//               </div>
//             </div>
//           </div>

//           <div
//             className="z-30 absolute bg-red-100 w-[12.6vw] h-36 -skew-y-[45deg] translate-y-[6.1vw] border-t-2 border-black"
//             style={{ top: `${bottomRect}px` }}
//           />
//           <div
//             className="z-30 absolute bg-red-100 w-[12.6vw] h-36 skew-y-[45deg] translate-y-[6.1vw] border-t-2 border-black"
//             style={{ top: `${bottomRect}px`, right: "0px" }}
//           />

//           <div
//             id="bottom"
//             className="z-30 absolute bg-red-100 w-[75vw] h-36 translate-x-[12.5vw] flex flex-col justify-between items-center"
//             style={{ top: `${bottomRect}px` }}
//           >
//             <div className="flex flex-row m-2">
//               <button
//                 onClick={async () => {
//                   resetPermissions();
//                   updateLastCP({ userId: user.id }); //no await
//                   setShowParams(false);
//                   setShowQrCode(false);
//                   setScanning(false);
//                   setShowInvitations(true);
//                   setServerMessage("");
//                 }}
//                 className={classNames("p-2", {
//                   "outline outline-black": showInvitations,
//                 })}
//               >
//                 Parties de tes amis
//               </button>
//               <Link
//                 onClick={async () => {
//                   resetPermissions();
//                   await updateLastCP({ userId: user.id, out: true });
//                 }}
//                 href="/categories/grouping/grouping"
//                 className="text-center p-2"
//               >
//                 Crée un groupe
//               </Link>
//             </div>

//             <div className="flex flex-row m-3">
//               <button
//                 className={classNames("p-2", {
//                   "outline outline-black": showQrCode,
//                 })}
//                 onClick={async () => {
//                   resetPermissions();
//                   updateLastCP({ userId: user.id }); //no await
//                   try {
//                     setLocation(await getLocation());
//                     setServerMessage("QR code généré !");
//                   } catch (error) {
//                     console.error(error.message);
//                     const errorInformations = getErrorInformations({
//                       window,
//                       fail: "location_permission",
//                     }).map((info, i) => (
//                       <div key={i} className={`${i === 0 && "font-bold"}`}>
//                         {i !== 0 && "=>"}
//                         {info}
//                       </div>
//                     ));
//                     setServerMessage(errorInformations);
//                     setLocation();
//                   }
//                   setShowParams(false);
//                   setShowQrCode(true);
//                   setScanning(false);
//                   setShowInvitations(false);
//                 }}
//               >
//                 Génère ton QRCode
//               </button>
//               <button
//                 onClick={() => {
//                   resetPermissions();
//                   updateLastCP({ userId: user.id }); //no await
//                   setShowParams(false);
//                   setShowQrCode(false);
//                   setScanning(!scanning);
//                   setShowInvitations(false);
//                   setServerMessage("");
//                 }}
//                 className={classNames("p-2 bg-red-100", {
//                   "outline outline-black": scanning,
//                 })}
//               >
//                 Ajoute un ami
//               </button>
//             </div>
//           </div>

//           <div
//             className={`z-20 absolute bg-red-100 w-full bottom-0`}
//             style={{
//               height: `${bottomSpace}px`,
//               height: "20dvh",
//             }}
//           />
//         </div>

//         {hasLoaded && (
//           <div
//             className={classNames(
//               {
//                 "m-auto transition-opacity ease-in-out duration-500 opacity-100":
//                   !togglingParameters,
//               },
//               {
//                 "m-auto transition-opacity ease-in-out duration-500 opacity-0":
//                   togglingParameters,
//               }
//             )}
//           >
//             {categories.map((categorie, index) => {
//               const isLast = index === 6;
//               return (
//                 <Link
//                   key={index}
//                   onClick={async () => {
//                     resetPermissions();
//                     await updateLastCP({ userId: user.id, out: true });
//                   }}
//                   href={`${categorie.href}${isGroup ? "?group=true" : ""}`}
//                   className={classNames(`z-20 absolute  max-h-[15dvh]`, {
//                     hidden: togglingParameters && toggledParameters,
//                   })}
//                   style={{
//                     top: `${Math.floor(index / 2) * 20 + 12.5}dvh`,
//                     left: !isLast ? index % 2 === 0 && "8%" : "33%",
//                     right: index % 2 === 1 && "8%",
//                     width: "33.333333%",
//                     aspectRatio: !isLast ? "1 / 1" : "auto",
//                   }}
//                 >
//                   <div className="flex items-center justify-center h-[15dvh] p-1">
//                     <Image
//                       src={categorie.src}
//                       alt={`${categorie.name} image`}
//                       className="max-h-full aspect-square"
//                       style={{ objectFit: "contain" }}
//                       width={500}
//                       height={500}
//                     />
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>
//         )}

//         <div
//           className={`absolute top-0 w-full bg-black z-40 flex justify-center items-center`}
//           style={{ height: `${barValues?.topBarSize / 4}rem` }}
//         />
//         <div
//           className={`absolute bottom-0 w-full bg-black z-40 flex justify-center items-center`}
//           style={{ height: `${barValues?.bottomBarSize / 4}rem` }}
//         />
//       </main>
//     </>
//   );
// }

// const SettingsButtons = ({ setSetting, setScanning, resetPermissions }) => {
// const SettingsButtons = ({ setSetting, setScanning }) => {

import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { ImExit } from "react-icons/im";
import { FaUserFriends, FaPlay } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { LiaQrcodeSolid } from "react-icons/lia";
import { IoPersonAdd } from "react-icons/io5";
import { GoTools } from "react-icons/go";
import { FaRegFloppyDisk } from "react-icons/fa6";

import Spinner from "@/components/spinners/Spinner";

const SettingsButtons = ({
  setSetting,
  setLocation,
  updateLastCP,
  user,
  setServerMessage,
  resetPermissions,
  setScanning,
}) => {
  return (
    <>
      <div className="absolute top-[0%] left-[24%] h-[20vw] w-[20vw] z-10 flex items-start justify-center mt-2">
        <div
          onClick={(event) => {
            setSetting("friends");
            // setScanning(false);
            resetPermissions();
            event.stopPropagation();
          }}
          className="border-black z-10"
        >
          <FaUserFriends className="w-8 h-8 text-purple-100" />
        </div>
      </div>
      <div className="absolute bottom-[0%] left-[24%] h-[20vw] w-[20vw] z-10 flex items-end justify-center mb-2">
        <div
          onClick={async (event) => {
            setSetting("qrCode");
            // setScanning(false);
            resetPermissions();
            event.stopPropagation();
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
          }}
        >
          <LiaQrcodeSolid className="w-8 h-8 text-purple-100" />
        </div>
      </div>
      <div className="absolute bottom-[0%] right-[24%] h-[20vw] w-[20vw] z-10 flex items-end justify-center mb-2">
        <div
          onClick={(event) => {
            setSetting("camera");
            // setScanning((prevScanning) => !prevScanning);
            setScanning(true);
            // resetPermissions();
            event.stopPropagation();
          }}
          className="border-black z-10"
        >
          <IoPersonAdd className="w-8 h-8 text-purple-100" />
        </div>
      </div>

      <div className="absolute top-[0%] right-[24%] h-[20vw] w-[20vw] z-10 flex items-start justify-center mt-2">
        <div
          onClick={(event) => {
            setSetting("params");
            // setScanning(false);
            resetPermissions();
            event.stopPropagation();
          }}
          className="border-black z-10"
        >
          <IoIosSettings className="w-8 h-8 text-purple-100" />
        </div>
      </div>
    </>
  );
};

const OctagonBackground = ({ handleBgClick }) => {
  return (
    <>
      <div
        className="absolute w-[26.3vw] h-[36vw] -skew-y-[45deg] translate-y-[-22.7vw] translate-x-[-1px] left-0 z-20 bg-black"
        onClick={handleBgClick}
      />
      <div
        className="absolute w-[26.3vw] h-[36vw] skew-y-[45deg] translate-y-[-22.7vw] translate-x-[1px] right-0 z-20 bg-black"
        onClick={handleBgClick}
      />
      <div
        className="absolute w-[26.3vw] h-[36vw] skew-y-[45deg] translate-y-[25.7vw] translate-x-[-1px] left-0 bottom-0 z-20 bg-black"
        onClick={handleBgClick}
      />
      <div
        className="absolute w-[26.3vw] h-[36vw] -skew-y-[45deg] translate-y-[25.7vw] translate-x-[1px] right-0 bottom-0 z-20 bg-black"
        onClick={handleBgClick}
      />

      <div
        className="absolute w-[26.3vw] h-[36vw] -skew-y-[45deg] translate-y-[-13.4vw] translate-x-[-1px] right-0 bottom-0 z-10 bg-transparent"
        style={{ boxShadow: "6px 10px 7px #a855f7" }}
      />
      <div
        className="absolute w-[26.3vw] h-[6vw] translate-y-[26vw] translate-x-[0px] right-0 top-0 z-10 bg-transparent"
        style={{ boxShadow: "9px 0px 7px -6px #a855f7" }}
      />
      <div
        className="absolute w-[25vw] h-[20vw] -skew-y-[45deg] translate-y-[2.6vw] translate-x-[-4.6vw] left-1/2 bottom-0 z-10 bg-transparent rotate-45"
        style={{
          boxShadow: "6px 9px 7px #a855f7",
        }}
      />
      <div
        className="absolute w-[25vw] h-[6vw] -skew-y-[45deg] translate-y-[-9.5vw] translate-x-[4.4vw] left-0 bottom-0 z-10 bg-transparent rotate-[-90deg]"
        style={{ boxShadow: "-5px -10px 7px #a855f7" }}
      />
      <div
        className="absolute w-[26.3vw] h-[6vw] translate-y-[-31vw] translate-x-[-2vw] left-0 bottom-0 z-10 bg-transparent rotate-[-45deg]"
        style={{ boxShadow: "-11px 0px 10px -8px #a855f7" }}
      />

      <div className="absolute top-1/2 translate-y-[-50%] bg-transparent w-[90vw] h-[90vw] z-10 flex items-center">
        <div className="relative w-full h-full">
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-10 h-[37vw]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-10 h-[37vw] rotate-45"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-10 h-[37vw] rotate-90"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-10 h-[37vw] rotate-[-45deg]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-10 h-[37vw] rotate-[-45deg]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-10 h-[37vw] rotate-[-90deg]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-10 h-[37vw]"
            style={{
              boxShadow: "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-10 h-[37vw] rotate-45"
            style={{
              boxShadow: "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-10 h-[37vw] rotate-[-45deg]"
            style={{
              boxShadow: "inset -9px 0px 5px -6px #581c87",
            }}
          />
        </div>
      </div>
    </>
  );
};

const CentralZone = ({ children, onClick }) => {
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        onClick && onClick(event);
      }}
      className="central-zone absolute top-[18.2%] left-[11.4%] h-[57.1vw] w-[69.3vw] z-10"
    >
      {children}
    </div>
  );
};

const Friends = ({ friendList, user, deleteFriend, updateLastCP }) => {
  return (
    <div className="py-6">
      {friendList.map((friend) => (
        <div
          key={friend.friendId}
          className="relative border border-purple-950 bg-purple-300 p-1 my-1"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="text-center text-purple-950">{friend.customName}</div>
          <div
            onClick={async () => {
              // event.stopPropagation();
              await deleteFriend({
                userId: user.id,
                friendId: friend.friendId,
              });
              updateLastCP({ userId: user.id }); //no await
            }}
            className="absolute left-full top-1"
          >
            <XMarkIcon className="ml-1 pb-1.5 w-8 h-8 text-red-500" />
          </div>
        </div>
      ))}
    </div>
  );
};

// const Params = ({ user, updateParams, updateLastCP, signOut, fetchUser }) => {
const Params = ({ updateParams, updateLastCP, signOut, fetchUser }) => {
  const possibleBarValues = [8, 12, 14, 16, 18, 20];
  const [barValues, setBarValues] = useState();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const get = async () => {
      const user = await fetchUser();
      setUser(user);
    };
    get();
  }, [fetchUser]);

  useEffect(() => {
    if (!user) return;
    if (!user?.params) {
      setBarValues({ bottomBarSize: 8, topBarSize: 8 });
      return;
    }
    const userParams = user.params || {};
    setBarValues({
      bottomBarSize: userParams.bottomBarSize,
      topBarSize: userParams.topBarSize,
    });
  }, [user]);

  useEffect(() => {
    if (!barValues || !user) return;
    const update = async () => {
      await updateParams({
        userId: user.id,
        param: "topBarSize",
        value: barValues.topBarSize,
      });
      await updateParams({
        userId: user.id,
        param: "bottomBarSize",
        value: barValues.bottomBarSize,
      });
    };
    update();
  }, [barValues, user, updateParams]);

  console.log("barValues", barValues);
  console.log("user", user);

  if (!barValues)
    // return (
    //   <div className="h-full w-full flex justify-center items-center">
    //     <Spinner />
    //   </div>
    // );
    return null;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative">
      {[
        { param: "topBarSize", label: "Taille barre supérieure" },
        {
          param: "bottomBarSize",
          label: "Taille barre inférieure",
        },
      ].map((barParam, i) => (
        <div
          key={i}
          onClick={(event) => event.stopPropagation()}
          className="relative border border-purple-200 bg-purple-400 p-1 my-1 w-full text-center flex items-center text-purple-950"
        >
          {barValues && barValues[barParam.param] !== possibleBarValues[0] && (
            <div className="absolute right-full mx-1">
              <ChevronLeftIcon
                onClick={() => {
                  const index = possibleBarValues?.indexOf(
                    (barValues && barValues[barParam.param]) ||
                      possibleBarValues[0]
                  );
                  const newIndex = index === 0 ? index : index - 1;
                  setBarValues((prevValues) => ({
                    ...prevValues,
                    [barParam.param]: possibleBarValues[newIndex],
                  }));
                }}
                className="w-8 h-8"
              />
            </div>
          )}
          <div className="text-center w-full">
            {barParam.label} : {barValues && barValues[barParam.param]}
          </div>
          {barValues &&
            barValues[barParam.param] !==
              possibleBarValues[possibleBarValues.length - 1] && (
              <div
                className="absolute left-full mx-1"
                onClick={() => {
                  const index = possibleBarValues?.indexOf(
                    (barValues && barValues[barParam.param]) ||
                      possibleBarValues[0]
                  );
                  const newIndex =
                    index >= possibleBarValues.length - 1 ? index : index + 1;
                  setBarValues((prevValues) => ({
                    ...prevValues,
                    [barParam.param]: possibleBarValues[newIndex],
                  }));
                }}
              >
                <ChevronRightIcon className="w-8 h-8" />
              </div>
            )}
        </div>
      ))}

      {/* <Link href="/categories/categorie1/">TEST</Link> */}
      <div
        onClick={async (event) => {
          event.stopPropagation();
          await updateLastCP({ userId: user.id, out: true });
          await signOut();
          window.location.reload();
        }}
        // className="absolute bottom-0"
        className="mt-2"
      >
        <div className="relative">
          <div className="py-1 px-2 border border-purple-950 bg-purple-600 text-purple-950">
            Déconnexion
          </div>
          <div className="absolute left-full top-1/2 translate-y-[-50%] pl-2">
            <ImExit className="w-6 h-6 text-purple-950" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Invitations = ({
  user,
  router,
  updateLastCP,
  getPublicRooms,
  publicRooms,
  setPublicRooms,
  invitations,
  setInvitations,
}) => {
  // const [publicRooms, setPublicRooms] = useState({});
  // const [invitations, setInvitations] = useState([]);

  // useEffect(() => {
  //   const channel = pusher.subscribe(`user-${user.email}`);
  //   channel.bind("user-event", function (data) {
  //     if (data.message) {
  //       setServerMessage(data.message);
  //       router.refresh();
  //     }
  //     if (data.invitation) {
  //       if (data.invitation.deleted) {
  //         setPublicRooms((prevPublics) => {
  //           const prevPubs = { ...prevPublics };
  //           let deletedId;
  //           Object.entries(prevPubs).find((pub) => {
  //             if (pub[1].link === data.invitation.link) deletedId = pub[0];
  //           });
  //           if (deletedId) delete prevPubs[deletedId];
  //           return prevPubs;
  //         });
  //       }
  //       setInvitations((prevInvitations) => {
  //         const prevInvs = [...prevInvitations];
  //         if (data.invitation.deleted) {
  //           const deletedInvs = prevInvs.filter(
  //             (inv) => inv.link !== data.invitation.link
  //           );
  //           return deletedInvs;
  //         }

  //         const alreadyInviterIndex = prevInvs.findIndex(
  //           (inv) => inv.userName === data.invitation.userName
  //         );
  //         if (alreadyInviterIndex !== -1) {
  //           prevInvs.splice(alreadyInviterIndex, 1);
  //           return [...prevInvs, data.invitation];
  //         }

  //         const sameInvLink = prevInvs.some(
  //           (inv) => inv.link === data.invitation.link
  //         );
  //         if (sameInvLink) return [...prevInvs];

  //         return [...prevInvs, data.invitation];
  //       });
  //     }
  //   });

  //   updateLastCP({ userId: user.id }); //no await

  //   return () => {
  //     pusher.unsubscribe(`user-${user.email}`);
  //   };
  // }, [user, router, updateLastCP]);

  useEffect(() => {
    setPublicRooms((prevPublics) => {
      const alreadyInInvitations = [];
      Object.entries(prevPublics).forEach((pub) => {
        invitations.forEach((inv) => {
          if (inv.link === pub[1].link) alreadyInInvitations.push(pub[0]);
        });
      });
      if (!alreadyInInvitations.length) return prevPublics;
      const publics = { ...prevPublics };
      alreadyInInvitations.forEach((already) => delete publics[already]);
      return publics;
    });
  }, [publicRooms, invitations]);

  useEffect(() => {
    const getRooms = async () => {
      setPublicRooms(await getPublicRooms());
    };
    getRooms();
  }, [getPublicRooms]);

  return (
    <div className="w-full h-full flex flex-col justify-start items-center relative py-6">
      <div
        onClick={async (event) => {
          event.stopPropagation();
          setPublicRooms(await getPublicRooms());
          updateLastCP({ userId: user.id }); //no await
        }}
        className="flex justify-center items-center text-center text-purple-800 mb-2 absolute bottom-full"
      >
        <ArrowPathIcon className="ml-2 h-6 w-6" />
      </div>

      {!invitations.length && !Object.keys(publicRooms).length && (
        <div className="text-center text-purple-800 absolute top-1/2 translate-y-[-50%]">
          Aucune partie disponible
        </div>
      )}

      {invitations.map((invitation, i) => (
        <div
          key={i}
          onClick={async (event) => {
            event.stopPropagation();
            // resetPermissions();
            await updateLastCP({ userId: user.id, out: true });
            window.location.href = invitation.link;
          }}
          // href={invitation.link}
          className="w-[90%]"
        >
          <div
            style={{
              boxShadow: "2px 2px 2px black",
              borderRadius: "100%",
              animation: "float 4s ease-in-out infinite",
            }}
          >
            <div
              className="bg-purple-300 text-purple-950 rounded-full h-12 flex items-center justify-center"
              style={{
                border: "solid 1px black",
                borderRadius: "100%",
                clipPath: "ellipse(closest-side farthest-side)",
              }}
            >
              {invitation.userName} pour{" "}
              {`${invitation.mode || gamesRefs[invitation.gameName].name}`}
            </div>
          </div>
        </div>
      ))}
      {Object.entries(publicRooms).map((room) => {
        const { friendName, gameName, gamersNumber } = room[1];
        return (
          <div
            key={room[0]}
            // href={`${room[1].link}`}
            onClick={async (event) => {
              event.stopPropagation();
              await updateLastCP({ userId: user.id, out: true });
              window.location.href = room[1].link;
            }}
            className="w-[90%]"
          >
            <div
              style={{
                boxShadow: "2px 2px 2px black",
                borderRadius: "100%",
                animation: "float 4s ease-in-out infinite",
              }}
            >
              <div
                className="bg-purple-300 text-purple-950 rounded-full h-12 flex items-center justify-center"
                style={{
                  border: "solid 1px black",
                  borderRadius: "100%",
                  clipPath: "ellipse(closest-side farthest-side)",
                }}
              >
                {friendName}
                {gamersNumber > 1 && `(+${gamersNumber - 1})`} pour {gameName}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const QrCodeScanner = ({
  setting,
  // onNewScanResult,
  setStopScan,
  setServerMessage,
}) => {
  // if (!scanning) return;

  const onNewScanResult = () =>
    throttle(async (decodedText) => {
      console.log("coucou");
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
      }, 1000);
    }, 1000);

  const requestCameraAccess = useCallback(async () => {
    // if (setting !== "camera") return;
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
      // setScanning(false);
    }
  }, [setServerMessage]);

  useEffect(() => {
    // if (!requestCameraAccess) return;
    const requestCameraAccess = async () => {
      // if (setting !== "camera") return;
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
        // setScanning(false);
      }
    };
    requestCameraAccess();
    // }, [requestCameraAccess]);
  }, [setServerMessage]);

  return (
    <>
      <div
        onClick={(event) => event.stopPropagation()}
        className="h-full w-full"
      >
        <Html5QrcodePlugin
          // scanning={setting === "camera"}
          fps={10}
          qrCodeSuccessCallback={onNewScanResult}
          setStopScan={setStopScan}
        />
        <div
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          test
        </div>
      </div>
    </>
  );
  // }, [onNewScanResult, scanning]);
};

export default function Categories({
  user,
  updateParams,
  friendList,
  addFriend,
  deleteFriend,
  getPublicRooms,
  getCurrentGame,
  updateLastCP,
  signOut,
}) {
  const { isSupported, isVisible, released, request, release } = useWake();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlControl = searchParams.get("control") === "true";
  const isGroup = searchParams.get("group") === "true";

  const [toggledSettings, setToggledSettings] = useState(false);
  const [setting, setSetting] = useState("");
  const [toggledPrelobby, setToggledPrelobby] = useState(false);

  const [location, setLocation] = useState(null);
  const [scanLocked, setScanLocked] = useState(false);
  const [stopScan, setStopScan] = useState();
  const [scanning, setScanning] = useState(false);

  const [serverMessage, setServerMessage] = useState();

  const [publicRooms, setPublicRooms] = useState({});
  const [invitations, setInvitations] = useState([]);
  const [currentGame, setCurrentGame] = useState();

  const fetchUser = async () => {
    const user = await getUser();
    return user;
  };

  console.log("serverMessage", serverMessage);
  useEffect(() => {
    const channel = pusher.subscribe(`user-${user.email}`);
    channel.bind("user-event", function (data) {
      if (data.message) {
        setServerMessage(data.message);
        router.refresh();
      }
      if (data.invitation) {
        if (data.invitation.deleted) {
          setPublicRooms((prevPublics) => {
            const prevPubs = { ...prevPublics };
            let deletedId;
            Object.entries(prevPubs).find((pub) => {
              if (pub[1].link === data.invitation.link) deletedId = pub[0];
            });
            if (deletedId) delete prevPubs[deletedId];
            return prevPubs;
          });
        }
        setInvitations((prevInvitations) => {
          const prevInvs = [...prevInvitations];
          if (data.invitation.deleted) {
            const deletedInvs = prevInvs.filter(
              (inv) => inv.link !== data.invitation.link
            );
            return deletedInvs;
          }

          const alreadyInviterIndex = prevInvs.findIndex(
            (inv) => inv.userName === data.invitation.userName
          );
          if (alreadyInviterIndex !== -1) {
            prevInvs.splice(alreadyInviterIndex, 1);
            return [...prevInvs, data.invitation];
          }

          const sameInvLink = prevInvs.some(
            (inv) => inv.link === data.invitation.link
          );
          if (sameInvLink) return [...prevInvs];

          return [...prevInvs, data.invitation];
        });
      }
    });

    updateLastCP({ userId: user.id }); //no await

    return () => {
      pusher.unsubscribe(`user-${user.email}`);
    };
  }, [user, router, updateLastCP]);

  // const onNewScanResult = () =>
  //   throttle(async (decodedText) => {
  //     console.log("coucou");
  //     if (scanLocked) return;
  //     let userLocation;
  //     setScanLocked(true);
  //     userLocation = await getLocation();
  //     const { error: addFriendError } = await addFriend({
  //       userLocation,
  //       friendCode: decodedText,
  //     });
  //     if (addFriendError) setServerMessage(addFriendError);
  //     setTimeout(() => {
  //       setScanLocked(false);
  //     }, 1000);
  //   }, 1000);

  const onNewScanResult = throttle(async (decodedText) => {
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
    }, 1000);
  }, 1000);

  const QrCodeScanner = useMemo(() => {
    if (setting !== "camera") return;
    if (!scanning || !setting) return;
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
      <div
        onClick={(event) => event.stopPropagation()}
        className="h-full w-full"
      >
        <Html5QrcodePlugin
          // scanning={setting === "camera"}
          fps={10}
          qrCodeSuccessCallback={onNewScanResult}
          setStopScan={setStopScan}
        />
      </div>
    );
    // }, [onNewScanResult, scanning]);
    // }, [setting, onNewScanResult, scanning]);
  }, [setting, scanning]);

  const resetPermissions = useCallback(() => {
    stopScan && stopScan();
    setStopScan();
  }, [stopScan]);

  useEffect(() => {
    if (setting !== "camera") resetPermissions();
  }, [setting, resetPermissions]);

  const handleBgClick = useCallback(
    (event) => {
      resetPermissions();
      event.stopPropagation();
      setToggledSettings(!toggledSettings);
    },
    // [toggledSettings]
    [toggledSettings, resetPermissions]
  );

  const handleOctaClick = useCallback(
    (event) => {
      resetPermissions();
      event.stopPropagation();
      !toggledSettings && setToggledPrelobby(!toggledPrelobby);
      toggledSettings && setToggledSettings(false);
    },
    [toggledPrelobby, toggledSettings, resetPermissions]
  );

  useEffect(() => {
    const backToRoom = async () => {
      const current = await getCurrentGame();
      current && setCurrentGame(current);
    };
    backToRoom();
  }, [getCurrentGame, router]);

  const showInvitations = !toggledSettings && !toggledPrelobby;

  console.log("friendList", friendList);
  console.log("stopScan", stopScan);
  console.log("showInvitations", showInvitations);
  console.log("urlControl", urlControl);

  return (
    <div
      onClick={(event) => {
        handleBgClick(event);
      }}
      className={`h-screen flex items-center ${
        !isGroup ? "bg-black" : "bg-white"
      } text-white`}
    >
      {!isGroup ? (
        <main className="relative h-[100dvh] w-screen">
          <div
            onClick={handleOctaClick}
            className="octagon left-5 top-[50dvh] translate-y-[-50%] relative z-0"
          >
            <OctagonBackground handleBgClick={handleBgClick} />

            {toggledSettings && (
              <>
                <SettingsButtons
                  updateLastCP={updateLastCP}
                  user={user}
                  setSetting={setSetting}
                  setLocation={setLocation}
                  setServerMessage={setServerMessage}
                  resetPermissions={resetPermissions}
                  setScanning={setScanning}
                />

                {setting === "friends" && (
                  <CentralZone onClick={handleOctaClick}>
                    <Friends
                      friendList={friendList}
                      user={user}
                      deleteFriend={deleteFriend}
                      updateLastCP={updateLastCP}
                    />
                  </CentralZone>
                )}

                {setting === "params" && (
                  <CentralZone onClick={handleOctaClick}>
                    <Params
                      updateParams={updateParams}
                      // user={user}
                      updateLastCP={updateLastCP}
                      signOut={signOut}
                      fetchUser={fetchUser}
                    />
                  </CentralZone>
                )}

                {setting === "qrCode" && (
                  <CentralZone onClick={handleOctaClick}>
                    {
                      location ? (
                        <QRCode
                          value={`id=${user.id};mail=${user.email};name=${user.name};{"latitude":"${location?.latitude}","longitude":"${location?.longitude}"}`}
                          className="mx-auto w-fit h-full border border-black"
                          onClick={(event) => event.stopPropagation()}
                        />
                      ) : null

                      // (
                      //   <div className="h-full w-full flex justify-center items-center">
                      //     <Spinner />
                      //   </div>
                      // )
                    }
                  </CentralZone>
                )}

                {setting === "camera" && (
                  <CentralZone onClick={handleOctaClick}>
                    {QrCodeScanner}
                    {/* <QrCodeScanner
                    setting={setting}
                    // onNewScanResult={onNewScanResult}
                    setStopScan={setStopScan}
                    setServerMessage={setServerMessage}
                  /> */}
                  </CentralZone>
                )}
              </>
            )}

            {showInvitations && (
              <CentralZone onClick={handleOctaClick}>
                <Invitations
                  user={user}
                  router={router}
                  updateLastCP={updateLastCP}
                  getPublicRooms={getPublicRooms}
                  publicRooms={publicRooms}
                  setPublicRooms={setPublicRooms}
                  invitations={invitations}
                  setInvitations={setInvitations}
                />
              </CentralZone>
            )}

            {toggledPrelobby && !toggledSettings && (
              <CentralZone onClick={handleOctaClick}>
                <div className="flex w-full h-full justify-around items-center">
                  <div onClick={(event) => event.stopPropagation()}>
                    <GoTools className="w-8 h-8 text-purple-100" />
                  </div>
                  {/* <div onClick={(event) => event.stopPropagation()}>
                    <Link
                      onClick={async () => {
                        resetPermissions();
                        await updateLastCP({ userId: user.id, out: true });
                      }}
                      href="/categories/grouping/grouping"
                    >
                      <FaPlay className="w-8 h-8 text-purple-100" />
                    </Link>
                  </div> */}
                  <div
                    onClick={async (event) => {
                      event.stopPropagation();
                      resetPermissions();
                      await updateLastCP({ userId: user.id, out: true });
                      window.location.href = "/categories/grouping/grouping";
                    }}
                  >
                    <FaPlay className="w-8 h-8 text-purple-100" />
                  </div>
                  {/* <div onClick={(event) => event.stopPropagation()}>
                    <Link href="/post-game/">
                      <FaRegFloppyDisk className="w-8 h-8 text-purple-100" />
                    </Link>
                  </div> */}

                  <div
                    onClick={async (event) => {
                      event.stopPropagation();
                      resetPermissions();
                      await updateLastCP({ userId: user.id, out: true });
                      window.location.href = "/post-game/";
                    }}
                  >
                    <FaRegFloppyDisk className="w-8 h-8 text-purple-100" />
                  </div>
                </div>
              </CentralZone>
            )}

            {currentGame && (
              <Modal
                isOpen={true}
                onClose={() => {
                  setCurrentGame();
                  cancelBack({ userId: user.id }); //no await
                  return;
                }}
              >
                <div className="flex flex-col items-center gap-2 text-2xl p-2 text-black">
                  <div className="w-full">Vous avez une partie en cours !</div>
                  <div>
                    Admin :{" "}
                    <span className="font-semibold">{currentGame.admin}</span>
                  </div>
                  {currentGame.game === "grouping" ? (
                    <div>Nouveau groupe de joueurs</div>
                  ) : (
                    <div>
                      Jeu :{" "}
                      <span className="font-semibold">
                        {currentGame.mode || currentGame.game}
                      </span>
                    </div>
                  )}

                  <div className="w-full flex justify-evenly m-2">
                    <Link
                      href={currentGame.path}
                      className="border border-blue-300 bg-blue-100 p-2 rounded-md"
                    >
                      Rejoindre
                    </Link>
                    <button
                      onClick={async () => {
                        setCurrentGame();
                        await cancelBack({ userId: user.id });
                      }}
                      className="border border-red-300 bg-red-100 p-2 rounded-md"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </Modal>
            )}

            <div className="absolute top-full z-10 left-1/2 translate-x-[-50%]">
              {serverMessage}
            </div>
          </div>
        </main>
      ) : (
        <main>
          <div
            onClick={() => router.push("/categories/grouping/grouping")}
            className="z-10 absolute h-[100dvh] w-screen max-h-full"
          />
          <div className="m-auto">
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
                  className={classNames(`z-20 absolute  max-h-[15dvh]`)}
                  style={{
                    top: `${Math.floor(index / 2) * 20 + 12.5}dvh`,
                    left: !isLast ? index % 2 === 0 && "8%" : "33%",
                    right: index % 2 === 1 && "8%",
                    width: "33.333333%",
                    aspectRatio: !isLast ? "1 / 1" : "auto",
                  }}
                >
                  <div className="flex items-center justify-center h-[15dvh] p-1">
                    <Image
                      src={categorie.src}
                      alt={`${categorie.name} image`}
                      className="max-h-full aspect-square"
                      style={{ objectFit: "contain" }}
                      width={500}
                      height={500}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
}
