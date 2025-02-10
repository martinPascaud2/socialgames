"use client";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { throttle } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import classNames from "classnames";
import QRCode from "react-qr-code";
import Pusher from "pusher-js";

import { ArrowPathIcon, CameraIcon } from "@heroicons/react/24/outline";

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

//     updateLastCP({ userId: user.id }); // no await

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
//                   updateLastCP({ userId: user.id }); // no await
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
//                 updateLastCP({ userId: user.id }); // no await
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
//                     updateLastCP({ userId: user.id }); // no await
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
//                   updateLastCP({ userId: user.id }); // no await
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
//                   updateLastCP({ userId: user.id }); // no await
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
//                   updateLastCP({ userId: user.id }); // no await
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

import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { ImExit } from "react-icons/im";
import { FaUserFriends, FaPlay } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { LiaQrcodeSolid } from "react-icons/lia";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { IoPersonAddOutline } from "react-icons/io5";
import { GoTools } from "react-icons/go";
import { FaRegFloppyDisk } from "react-icons/fa6";
import { IoGameControllerOutline } from "react-icons/io5";
import { MdOutlineVideogameAsset } from "react-icons/md";
import { IoIosRefresh } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";
import FriendsSettingsIcon from "./FriendsSettingsIcon";
import { MdOutlineAccountTree } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";

import { updatePassword } from "@/signin/actions";
import ReactDOM, { useFormState } from "react-dom";

import Spinner from "@/components/spinners/Spinner";

import { useWakeLock } from "react-screen-wake-lock";

const OnlyShadows = () => {
  return (
    <>
      <div className="absolute z-30 w-full h-full">
        <div className="relative w-full h-full">
          {/* left top */}
          <div // square
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] left-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: "1vw 1vw 2vw -1vw #7e22ce, 2vw 2vw 2vw -1vw #7e22ce",
              backgroundColor: "transparent",
            }}
          />
          <div // border filler
            className="absolute h-[5vw] w-[24vw] top-[15.55vw] left-[7vw] z-30"
            style={{
              boxShadow: "0vw 2vw 2vw -1vw #7e22ce",
              backgroundColor: "transparent",
            }}
          />

          {/* left middle */}
          <div // skew top
            className="absolute h-[10vw] w-[5.7vw] top-[23.9vw] -skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
            }}
          />
          <div // middle top
            className="absolute h-[28.4vw] w-[14.8vw] top-[54.7%] translate-y-[-100%] left-[5.7vw] z-40"
            style={{
              backgroundColor: "transparent",
              boxShadow: "3.1vw -2vw 1vw -2vw #7e22ce",
            }}
          />
          <div // middle bottom
            className="absolute h-[28.4vw] w-[14.8vw] bottom-[54.7%] translate-y-[100%] left-[5.7vw] z-40"
            style={{
              backgroundColor: "transparent",
              boxShadow: "3.1vw 2vw 1vw -2vw #7e22ce",
            }}
          />
          <div // skew bottom
            className="absolute h-[10vw] w-[5.7vw] bottom-[23.9vw] skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
            }}
          />

          {/* left bottom */}
          <div // square
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] left-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: "1vw -1vw 2vw -1vw #7e22ce, 2vw -2vw 2vw -1vw #7e22ce",
              backgroundColor: "transparent",
            }}
          />
          <div // border filler
            className="absolute h-[5vw] w-[24vw] bottom-[15.55vw] left-[7vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: "0vw -2vw 2vw -1vw #7e22ce",
            }}
          />

          {/* right top */}
          <div // square
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] right-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: "-1vw 1vw 2vw -1vw #7e22ce, -2vw 2vw 2vw -1vw #7e22ce",
            }}
          />
          <div // border filler
            className="absolute h-[5vw] w-[24vw] top-[15.55vw] right-[7vw] z-30"
            style={{
              boxShadow: "0vw 2vw 2vw -1vw #7e22ce",
              backgroundColor: "transparent",
            }}
          />

          {/* right middle */}
          <div // skew top
            className="absolute h-[10vw] w-[5.7vw] top-[23.9vw] skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
            }}
          />
          <div // middle top
            className="absolute h-[28.4vw] w-[14.8vw] top-[54.7%] translate-y-[-100%] right-[5.7vw] z-40"
            style={{
              backgroundColor: "transparent",
              boxShadow: "-3.1vw -2vw 1vw -2vw #7e22ce",
            }}
          />
          <div // middle bottom
            className="absolute h-[28.4vw] w-[14.8vw] bottom-[54.7%] translate-y-[100%] right-[5.7vw] z-40"
            style={{
              backgroundColor: "transparent",
              boxShadow: "-3.1vw 2vw 1vw -2vw #7e22ce",
            }}
          />
          <div // skew bottom
            className="absolute h-[10vw] w-[5.7vw] bottom-[23.9vw] -skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: "transparent",
            }}
          />

          {/* right bottom */}
          <div // square
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] right-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow:
                "-1vw -1vw 2vw -1vw #7e22ce, -2vw -2vw 2vw -1vw #7e22ce",
              backgroundColor: "transparent",
            }}
          />
          <div // border filler
            className="absolute h-[5vw] w-[24vw] bottom-[15.55vw] right-[7vw] z-30"
            style={{
              backgroundColor: "transparent",
              boxShadow: "0vw -2vw 2vw -1vw #7e22ce",
            }}
          />
        </div>
      </div>
    </>
  );
};

const SettingsButtons = ({
  setSetting,
  setLocation,
  updateLastCP,
  user,
  setServerMessage,
  resetPermissions,
  setScanning,
  setting,
  signOut,
}) => {
  const [locked, setLocked] = useState(true);
  const [isAccountPressed, setIsAccountPressed] = useState(false);
  const [isParamsPressed, setIsParamsPressed] = useState(false);
  const [isCameraPressed, setIsCameraPressed] = useState(false);
  const [isDiscoPressed, setIsDiscoPressed] = useState(false);
  const [isFriendsPressed, setIsFriendsPressed] = useState(false);
  const [isQrcodePressed, setIsQrcodePressed] = useState(false);

  // const handleAccountPressed = useCallback(
  //   (event) => {
  //     setIsAccountPressed(false);
  //     if (locked) return;
  //     setSetting("password");
  //     setServerMessage("");
  //     // setScanning(false);
  //     resetPermissions();
  //     event.stopPropagation();
  //     updateLastCP({ userId: user.id }); // no await
  //   },
  //   [
  //     setIsAccountPressed,
  //     locked,
  //     setSetting,
  //     setServerMessage,
  //     resetPermissions,
  //     updateLastCP,
  //   ]
  // );
  const handleAccountPressed = useCallback(
    (event) => {
      setIsAccountPressed(false);
      if (locked) return;
      // setSetting("password");
      setServerMessage("");
      // setScanning(false);
      resetPermissions();
      event.stopPropagation();
      updateLastCP({ userId: user.id }); // no await
      window.open(
        "https://socialgames.vercel.app/categories/",
        "_blank",
        "noopener,noreferrer"
      );
    },
    [
      setIsAccountPressed,
      locked,
      setSetting,
      setServerMessage,
      resetPermissions,
      updateLastCP,
    ]
  );

  const handleParamsPressed = useCallback(
    (event) => {
      setIsParamsPressed(false);
      if (locked || setting === "params") return;
      setSetting("params");
      setServerMessage("");
      // setScanning(false);
      resetPermissions();
      event.stopPropagation();
      updateLastCP({ userId: user.id }); // no await
    },
    [
      setIsParamsPressed,
      locked,
      setSetting,
      setServerMessage,
      resetPermissions,
      updateLastCP,
    ]
  );

  const handleCameraPressed = useCallback(
    (event) => {
      setIsCameraPressed(false);
      if (locked || setting === "camera") return;
      setSetting("camera");
      setServerMessage("");
      setScanning(true);
      // resetPermissions();
      event.stopPropagation();
      updateLastCP({ userId: user.id }); // no await
    },
    [
      setIsCameraPressed,
      locked,
      setSetting,
      setServerMessage,
      setScanning,
      updateLastCP,
    ]
  );

  const handleDiscoPressed = useCallback(
    async (event) => {
      setIsDiscoPressed(false);
      if (locked) return;
      event.stopPropagation();
      await updateLastCP({ userId: user.id, out: true });
      await signOut();
      window.location.reload();
    },
    [setIsDiscoPressed, locked, updateLastCP, signOut]
  );

  const handleFriendsPressed = useCallback(
    (event) => {
      setIsFriendsPressed(false);
      if (locked || setting === "friends") return;
      setSetting("friends");
      setServerMessage("");
      // setScanning(false);
      resetPermissions();
      event.stopPropagation();
      updateLastCP({ userId: user.id }); // no await
    },
    [
      setIsFriendsPressed,
      locked,
      setSetting,
      setServerMessage,
      resetPermissions,
      updateLastCP,
    ]
  );

  const handleQrcodePressed = useCallback(
    async (event) => {
      setIsQrcodePressed(false);
      if (locked || setting === "qrCode") return;
      setSetting("qrCode");
      // setScanning(false);
      resetPermissions();
      event.stopPropagation();
      updateLastCP({ userId: user.id }); // no await

      try {
        // setLocation(await getLocation());
        setLocation({ latitude: "", longitude: "" });
        setServerMessage("");
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
    },
    [
      setIsQrcodePressed,
      locked,
      setSetting,
      resetPermissions,
      updateLastCP,
      setLocation,
      setServerMessage,
      getErrorInformations,
    ]
  );

  useEffect(() => {
    setLocked(false);
  }, []);

  if (setting !== "") {
    if (setting === "camera" || setting === "qrCode") return <OnlyShadows />;
    if (setting !== "params" && setting !== "friends") return null;
  }

  return (
    <>
      <div className="absolute z-30 w-full h-full">
        <div className="relative w-full h-full">
          {/* left top */}
          <div // square
            onTouchStart={() => setIsAccountPressed(true)}
            onTouchEnd={handleAccountPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] left-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: !isAccountPressed
                ? "1vw 1vw 2vw -1vw #7e22ce, 2vw 2vw 2vw -1vw #7e22ce"
                : "inset 0px 9px 5px -6px #581c87",
              borderBottom: isAccountPressed ? "1px solid #581c87" : "",
              borderRight: isAccountPressed ? "1px solid #581c87" : "",
              backgroundColor: isAccountPressed ? "#7e22ce" : "transparent",
            }}
          >
            <MdOutlineAccountTree className="mr-2 w-10 h-10 text-purple-800" />
          </div>
          <div // skew
            onTouchStart={() => setIsAccountPressed(true)}
            onTouchEnd={handleAccountPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.4vw] -skew-x-[45deg] bg-transparent left-[16.5vw] z-30"
            style={{
              backgroundColor: isAccountPressed ? "#7e22ce" : "transparent",
              boxShadow: !isAccountPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87",
              borderBottom: isAccountPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsAccountPressed(true)}
            onTouchEnd={handleAccountPressed}
            className="absolute h-[5vw] w-[24vw] top-[15.55vw] left-[7vw] z-30"
            style={{
              boxShadow: !isAccountPressed ? "0vw 2vw 2vw -1vw #7e22ce" : "",
              borderBottom: isAccountPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // small BF
            onTouchStart={() => setIsAccountPressed(true)}
            onTouchEnd={handleAccountPressed}
            className="absolute h-[5vw] w-[17vw] top-[15.5vw] left-[16.5vw] z-30"
            style={{
              backgroundColor: isAccountPressed ? "#7e22ce" : "transparent",
              borderBottom: isAccountPressed ? "1px solid #581c87" : "",
            }}
          />

          {/* left middle */}
          <div // skew top
            onTouchStart={() => setIsParamsPressed(true)}
            onTouchEnd={handleParamsPressed}
            className="absolute h-[10vw] w-[5.7vw] top-[23.9vw] -skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor:
                isParamsPressed || setting === "params"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isParamsPressed && setting !== "params"
                  ? ""
                  : "inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // middle right
            onTouchStart={() => setIsParamsPressed(true)}
            onTouchEnd={handleParamsPressed}
            className="absolute h-[37vw] w-[20.5vw] top-[50%] translate-y-[-50%] left-[0vw] z-50 bg-transparent flex justify-center items-center"
            style={{
              backgroundColor:
                isParamsPressed || setting === "params"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isParamsPressed && setting !== "params"
                  ? ""
                  : "inset 9px 0px 5px -6px #581c87",
              borderRight:
                isParamsPressed || setting === "params"
                  ? "1px solid #581c87"
                  : "",
            }}
          >
            <IoIosSettings className="w-11 h-11 text-purple-800" />
          </div>
          <div // middle
            onTouchStart={() => setIsParamsPressed(true)}
            onTouchEnd={handleParamsPressed}
            className="absolute h-[47.6vw] w-[14.8vw] top-[50%] translate-y-[-50%] left-[5.7vw] z-40"
            style={{
              backgroundColor:
                isParamsPressed || setting === "params"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isParamsPressed &&
                setting !== "params" &&
                setting !== "friends"
                  ? "3vw -2vw 1vw -2vw #7e22ce, 3vw 2vw 1vw -2vw #7e22ce"
                  : "",
              borderTop:
                isParamsPressed || setting === "params"
                  ? "1px solid #581c87"
                  : "",
              borderRight:
                isParamsPressed || setting === "params"
                  ? "1px solid #581c87"
                  : setting === "friends"
                  ? "1px solid #7e22ce"
                  : "",
              borderBottom:
                isParamsPressed || setting === "params"
                  ? "1px solid #581c87"
                  : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsParamsPressed(true)}
            onTouchEnd={handleParamsPressed}
            className="absolute h-[10vw] w-[5.7vw] bottom-[23.9vw] skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor:
                isParamsPressed || setting === "params"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isParamsPressed && setting !== "params"
                  ? ""
                  : "inset 9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          {/* left bottom */}
          <div // square
            onTouchStart={() => setIsCameraPressed(true)}
            onTouchEnd={handleCameraPressed}
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] left-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: !isCameraPressed
                ? "1vw -1vw 2vw -1vw #7e22ce, 2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isCameraPressed ? "1px solid #581c87" : "",
              borderRight: isCameraPressed ? "1px solid #581c87" : "",
              backgroundColor: isCameraPressed ? "#7e22ce" : "transparent",
            }}
          >
            <CameraIcon className="w-10 h-10 text-purple-800 mb-1 mr-1.5" />
          </div>
          <div // skew
            onTouchStart={() => setIsCameraPressed(true)}
            onTouchEnd={handleCameraPressed}
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] skew-x-[45deg] bg-transparent left-[16.5vw] z-30"
            style={{
              backgroundColor: isCameraPressed ? "#7e22ce" : "transparent",
              boxShadow: !isCameraPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87",
              borderTop: isCameraPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsCameraPressed(true)}
            onTouchEnd={handleCameraPressed}
            className="absolute h-[5vw] w-[24vw] bottom-[15.55vw] left-[7vw] z-30"
            style={{
              boxShadow: !isCameraPressed ? "0vw -2vw 2vw -1vw #7e22ce" : "",
              borderTop: isCameraPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // small BF
            onTouchStart={() => setIsCameraPressed(true)}
            onTouchEnd={handleCameraPressed}
            className="absolute h-[5vw] w-[17vw] bottom-[15.6vw] left-[16.5vw] z-30"
            style={{
              backgroundColor: isCameraPressed ? "#7e22ce" : "transparent",
              borderTop: isCameraPressed ? "1px solid #581c87" : "",
            }}
          />

          {/* right top */}
          <div // square
            onTouchStart={() => setIsDiscoPressed(true)}
            onTouchEnd={handleDiscoPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] right-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: !isDiscoPressed
                ? "-1vw 1vw 2vw -1vw #7e22ce, -2vw 2vw 2vw -1vw #7e22ce"
                : "inset 0px 9px 5px -6px #581c87",
              borderBottom: isDiscoPressed ? "1px solid #581c87" : "",
              borderLeft: isDiscoPressed ? "1px solid #581c87" : "",
              backgroundColor: isDiscoPressed ? "#7e22ce" : "transparent",
            }}
          >
            <ImExit className="ml-2 w-8 h-8 text-purple-800" />
          </div>
          <div // skew
            onTouchStart={() => setIsDiscoPressed(true)}
            onTouchEnd={handleDiscoPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.4vw] skew-x-[45deg] bg-transparent right-[16.5vw] z-30"
            style={{
              backgroundColor: isDiscoPressed ? "#7e22ce" : "transparent",
              boxShadow: !isDiscoPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87",
              borderBottom: isDiscoPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsDiscoPressed(true)}
            onTouchEnd={handleDiscoPressed}
            className="absolute h-[5vw] w-[24vw] top-[15.55vw] right-[7vw] z-30"
            style={{
              boxShadow: !isDiscoPressed ? "0vw 2vw 2vw -1vw #7e22ce" : "",
              borderBottom: isDiscoPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // small BF
            onTouchStart={() => setIsDiscoPressed(true)}
            onTouchEnd={handleDiscoPressed}
            className="absolute h-[5vw] w-[17vw] top-[15.5vw] right-[16.5vw] z-30"
            style={{
              backgroundColor: isDiscoPressed ? "#7e22ce" : "transparent",
              borderBottom: isDiscoPressed ? "1px solid #581c87" : "",
            }}
          />

          {/* right middle */}
          <div // skew top
            onTouchStart={() => setIsFriendsPressed(true)}
            onTouchEnd={handleFriendsPressed}
            className="absolute h-[10vw] w-[5.7vw] top-[23.9vw] skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor:
                isFriendsPressed || setting === "friends"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isFriendsPressed && setting !== "friends"
                  ? ""
                  : "inset -9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // middle left
            onTouchStart={() => setIsFriendsPressed(true)}
            onTouchEnd={handleFriendsPressed}
            className="absolute h-[37vw] w-[20.5vw] top-[50%] translate-y-[-50%] right-[0vw] z-50 bg-transparent flex justify-center items-center"
            style={{
              backgroundColor:
                isFriendsPressed || setting === "friends"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isFriendsPressed && setting !== "friends"
                  ? ""
                  : "inset -9px 0px 5px -6px #581c87",
              borderLeft:
                isFriendsPressed || setting === "friends"
                  ? "1px solid #581c87"
                  : "",
            }}
          >
            <FaUserFriends className={`w-11 h-11 text-purple-800 z-50`} />
          </div>
          <div // middle
            onTouchStart={() => setIsFriendsPressed(true)}
            onTouchEnd={handleFriendsPressed}
            className="absolute h-[47.6vw] w-[14.8vw] top-[50%] translate-y-[-50%] right-[5.7vw] z-40"
            style={{
              backgroundColor:
                isFriendsPressed || setting === "friends"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isFriendsPressed &&
                setting !== "friends" &&
                setting !== "params"
                  ? "-3vw -2vw 1vw -2vw #7e22ce, -3vw 2vw 1vw -2vw #7e22ce"
                  : "",
              borderTop:
                isFriendsPressed || setting === "friends"
                  ? "1px solid #581c87"
                  : "",
              borderLeft:
                isFriendsPressed || setting === "friends"
                  ? "1px solid #581c87"
                  : setting === "params"
                  ? "1px solid #7e22ce"
                  : "",
              borderBottom:
                isFriendsPressed || setting === "friends"
                  ? "1px solid #581c87"
                  : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsFriendsPressed(true)}
            onTouchEnd={handleFriendsPressed}
            className="absolute h-[10vw] w-[5.7vw] bottom-[23.9vw] -skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor:
                isFriendsPressed || setting === "friends"
                  ? "#7e22ce"
                  : "transparent",
              boxShadow:
                !isFriendsPressed && setting !== "friends"
                  ? ""
                  : "inset -9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          {/* right bottom */}
          <div // square
            onTouchStart={() => setIsQrcodePressed(true)}
            onTouchEnd={handleQrcodePressed}
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] right-[26.5vw] z-40 flex justify-center items-center"
            style={{
              boxShadow: !isQrcodePressed
                ? "-1vw -1vw 2vw -1vw #7e22ce, -2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isQrcodePressed ? "1px solid #581c87" : "",
              borderLeft: isQrcodePressed ? "1px solid #581c87" : "",
              backgroundColor: isQrcodePressed ? "#7e22ce" : "transparent",
            }}
          >
            <LiaQrcodeSolid className={`w-11 h-11 text-purple-800 ml-2 mb-1`} />
          </div>
          <div // skew
            onTouchStart={() => setIsQrcodePressed(true)}
            onTouchEnd={handleQrcodePressed}
            className="absolute h-[20.2vw] w-[17vw] bottom-[0.4vw] -skew-x-[45deg] bg-transparent right-[16.5vw] z-30"
            style={{
              backgroundColor: isQrcodePressed ? "#7e22ce" : "transparent",
              boxShadow: !isQrcodePressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87",
              borderTop: isQrcodePressed ? "1px solid #581c87" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsQrcodePressed(true)}
            onTouchEnd={handleQrcodePressed}
            className="absolute h-[5vw] w-[24vw] bottom-[15.55vw] right-[7vw] z-30"
            style={{
              boxShadow: !isQrcodePressed ? "0vw -2vw 2vw -1vw #7e22ce" : "",
              borderTop: isQrcodePressed ? "1px solid #581c87" : "",
            }}
          />
          <div // small BF
            onTouchStart={() => setIsQrcodePressed(true)}
            onTouchEnd={handleQrcodePressed}
            className="absolute h-[5vw] w-[17vw] bottom-[15.5vw] right-[16.5vw] z-30"
            style={{
              backgroundColor: isQrcodePressed ? "#7e22ce" : "transparent",
              borderTop: isQrcodePressed ? "1px solid #581c87" : "",
            }}
          />
        </div>
      </div>
    </>
  );
};

const MainButtons = ({ setToggledSettings, setToggledPrelobby }) => {
  const [isSettingsPressed, setIsSettingsPressed] = useState(false);
  const [isPrelobbyPressed, setIsPrelobbyPressed] = useState(false);

  const handleSettingsPressed = useCallback(() => {
    setIsSettingsPressed(false);
    setToggledSettings(true);
  }, [setIsSettingsPressed, setToggledSettings]);

  const handlePrelobbyPressed = useCallback(() => {
    setIsPrelobbyPressed(false);
    setToggledPrelobby(true);
  }, [setIsPrelobbyPressed, setToggledPrelobby]);

  return (
    <>
      <div className="absolute z-30 w-full h-full">
        <div className="relative w-full h-full">
          {/* left */}
          <div // square
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] left-[26.5vw] z-30"
            style={{
              boxShadow: !isSettingsPressed
                ? "1vw 1vw 2vw -1vw #7e22ce, 2vw 2vw 2vw -1vw #7e22ce"
                : "",
              borderBottom: isSettingsPressed ? "1px solid #581c87" : "",
              borderRight: isSettingsPressed ? "1px solid #581c87" : "",
              backgroundColor: isSettingsPressed ? "#7e22ce" : "transparent",
            }}
          />
          <div // skew
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[20vw] w-[17vw] top-[0.1vw] -skew-x-[45deg] bg-transparent left-[16.5vw] z-30"
            style={{
              backgroundColor: isSettingsPressed ? "#7e22ce" : "transparent",
              boxShadow: !isSettingsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[5vw] w-[12.7vw] top-[15.5vw] left-[18.7vw] z-30"
            style={{
              boxShadow: !isSettingsPressed ? "0vw 3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[5vw] w-[16.5vw] top-[15.5vw] left-[17vw] z-30"
            style={{
              backgroundColor: isSettingsPressed ? "#7e22ce" : "transparent",
              borderBottom: isSettingsPressed ? "1px solid #581c87" : "",
            }}
          />

          <div // skew top
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[30vw] w-[20.5vw] top-[16.1vw] -skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: isSettingsPressed ? "#7e22ce" : "transparent",
              boxShadow: !isSettingsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // border filler + icon
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[49.2vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent left-[0.1vw] z-40 flex justify-center items-center"
            style={{
              borderRight: isSettingsPressed ? "1px solid #581c87" : "",
            }}
          >
            <div className="ml-2 mb-3">
              <FriendsSettingsIcon color="#6b21a8" />
            </div>
          </div>
          <div // background filler
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[20vw] w-[20.5vw] top-1/2 translate-y-[-50%] left-[0.1vw] z-30 flex justify-center items-center"
            style={{
              backgroundColor: isSettingsPressed ? "#7e22ce" : "transparent",
            }}
          />
          <div // middle shadow
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[52vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent left-[0.1vw] z-30"
            style={{
              boxShadow: !isSettingsPressed ? "3vw 0vw 2vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[30vw] w-[20.5vw] bottom-[16.1vw] skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: isSettingsPressed ? "#7e22ce" : "transparent",
              boxShadow: !isSettingsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          <div // border filler
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[5vw] w-[16.5vw] bottom-[15.5vw] left-[20.5vw] z-30"
            style={{
              backgroundColor: isSettingsPressed ? "#7e22ce" : "transparent",
              borderTop: isSettingsPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[5vw] w-[12.7vw] bottom-[15.5vw] left-[18.7vw] z-30"
            style={{
              boxShadow: !isSettingsPressed ? "0vw -3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[20vw] w-[17vw] bottom-[0.2vw] skew-x-[45deg] left-[16.2vw] z-30"
            style={{
              backgroundColor: isSettingsPressed ? "#7e22ce" : "transparent",
              boxShadow: !isSettingsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div // square
            onTouchStart={() => setIsSettingsPressed(true)}
            onTouchEnd={handleSettingsPressed}
            className="absolute h-[20.2vw] w-[17vw] bg-transparent bottom-[0.3vw] left-[26.5vw] z-30"
            style={{
              boxShadow: !isSettingsPressed
                ? "1vw -1vw 2vw -1vw #7e22ce, 2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isSettingsPressed ? "1px solid #581c87" : "",
              borderRight: isSettingsPressed ? "1px solid #581c87" : "",
              backgroundColor: isSettingsPressed ? "#7e22ce" : "transparent",
            }}
          />

          {/* right */}
          <div // square
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] right-[26.5vw] z-30"
            style={{
              boxShadow: !isPrelobbyPressed
                ? "-1vw 1vw 2vw -1vw #7e22ce, -2vw 2vw 2vw -1vw #7e22ce"
                : "",
              borderBottom: isPrelobbyPressed ? "1px solid #581c87" : "",
              borderLeft: isPrelobbyPressed ? "1px solid #581c87" : "",
              backgroundColor: isPrelobbyPressed ? "#7e22ce" : "transparent",
            }}
          />
          <div // skew
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[20vw] w-[17vw] top-[0.1vw] skew-x-[45deg] bg-transparent right-[16.5vw] z-30"
            style={{
              backgroundColor: isPrelobbyPressed ? "#7e22ce" : "transparent",
              boxShadow: !isPrelobbyPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[5vw] w-[12.7vw] top-[15.5vw] right-[18.7vw] z-30"
            style={{
              boxShadow: !isPrelobbyPressed ? "0vw 3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[5vw] w-[16.5vw] top-[15.5vw] right-[17vw] z-30"
            style={{
              backgroundColor: isPrelobbyPressed ? "#7e22ce" : "transparent",
              borderBottom: isPrelobbyPressed ? "1px solid #581c87" : "",
            }}
          />

          <div // skew top
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[30vw] w-[20.5vw] top-[16.1vw] skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: isPrelobbyPressed ? "#7e22ce" : "transparent",
              boxShadow: !isPrelobbyPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // border filler + icon
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[49.2vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent right-[0.1vw] z-40 flex justify-center items-center"
            style={{
              borderLeft: isPrelobbyPressed ? "1px solid #581c87" : "",
            }}
          >
            <MdOutlineVideogameAsset className="w-14 h-20 rotate-90 mb-3 text-purple-800" />
          </div>
          <div // background filler
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[20vw] w-[20.5vw] top-1/2 translate-y-[-50%] right-[0.1vw] z-30 flex justify-center items-center"
            style={{
              backgroundColor: isPrelobbyPressed ? "#7e22ce" : "transparent",
              borderLeft: isPrelobbyPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // middle shadow
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[52vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent right-[0.1vw] z-30"
            style={{
              boxShadow: !isPrelobbyPressed ? "-3vw 0vw 2vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[30vw] w-[20.5vw] bottom-[16.1vw] -skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: isPrelobbyPressed ? "#7e22ce" : "transparent",
              boxShadow: !isPrelobbyPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          <div // border filler
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[5vw] w-[16.5vw] bottom-[15.5vw] right-[20.5vw] z-30"
            style={{
              backgroundColor: isPrelobbyPressed ? "#7e22ce" : "transparent",
              borderTop: isPrelobbyPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[5vw] w-[12.7vw] bottom-[15.5vw] right-[18.7vw] z-30"
            style={{
              boxShadow: !isPrelobbyPressed ? "0vw -3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[20vw] w-[17vw] bottom-[0.2vw] -skew-x-[45deg] right-[16.2vw] z-30"
            style={{
              backgroundColor: isPrelobbyPressed ? "#7e22ce" : "transparent",
              boxShadow: !isPrelobbyPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div // square
            onTouchStart={() => setIsPrelobbyPressed(true)}
            onTouchEnd={handlePrelobbyPressed}
            className="absolute h-[20.2vw] w-[17vw] bg-transparent bottom-[0.3vw] right-[26.5vw] z-30"
            style={{
              boxShadow: !isPrelobbyPressed
                ? "-1vw -1vw 2vw -1vw #7e22ce, -2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isPrelobbyPressed ? "1px solid #581c87" : "",
              borderLeft: isPrelobbyPressed ? "1px solid #581c87" : "",
              backgroundColor: isPrelobbyPressed ? "#7e22ce" : "transparent",
            }}
          />
        </div>
      </div>
    </>
  );
};

const PostButtons = ({ resetPermissions, updateLastCP, user }) => {
  const [isToolsPressed, setIsToolsPressed] = useState(false);
  const [isPostgamesPressed, setIsPostgamesPressed] = useState(false);

  const handleToolsPressed = useCallback(
    async (event) => {
      event.stopPropagation();
      resetPermissions();
      await updateLastCP({ userId: user.id, out: true });
      window.location.href = "/tools/";
    },
    [resetPermissions, updateLastCP]
  );

  const handlePostgamesPressed = useCallback(
    async (event) => {
      event.stopPropagation();
      resetPermissions();
      await updateLastCP({ userId: user.id, out: true });
      window.location.href = "/post-game/";
    },
    [resetPermissions, updateLastCP]
  );

  return (
    <>
      <div className="absolute z-30 w-full h-full">
        <div className="relative w-full h-full">
          {/* left */}
          <div // square
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] left-[26.5vw] z-30"
            style={{
              boxShadow: !isToolsPressed
                ? "1vw 1vw 2vw -1vw #7e22ce, 2vw 2vw 2vw -1vw #7e22ce"
                : "",
              borderBottom: isToolsPressed ? "1px solid #581c87" : "",
              borderRight: isToolsPressed ? "1px solid #581c87" : "",
              backgroundColor: isToolsPressed ? "#7e22ce" : "transparent",
            }}
          />
          <div // skew
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[20vw] w-[17vw] top-[0.1vw] -skew-x-[45deg] bg-transparent left-[16.5vw] z-30"
            style={{
              backgroundColor: isToolsPressed ? "#7e22ce" : "transparent",
              boxShadow: !isToolsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[5vw] w-[12.7vw] top-[15.5vw] left-[18.7vw] z-30"
            style={{
              boxShadow: !isToolsPressed ? "0vw 3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[5vw] w-[16.5vw] top-[15.5vw] left-[17vw] z-30"
            style={{
              backgroundColor: isToolsPressed ? "#7e22ce" : "transparent",
              borderBottom: isToolsPressed ? "1px solid #581c87" : "",
            }}
          />

          <div // skew top
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[30vw] w-[20.5vw] top-[16.1vw] -skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: isToolsPressed ? "#7e22ce" : "transparent",
              boxShadow: !isToolsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // border filler + icon
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[49.2vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent left-[0.1vw] z-40 flex justify-center items-center"
            style={{
              borderRight: isToolsPressed ? "1px solid #581c87" : "",
            }}
          >
            <div className="ml-2 mb-3">
              <GoTools className="w-12 h-12 text-purple-800 mt-2" />
            </div>
          </div>
          <div // background filler
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[20vw] w-[20.5vw] top-1/2 translate-y-[-50%] left-[0.1vw] z-30 flex justify-center items-center"
            style={{
              backgroundColor: isToolsPressed ? "#7e22ce" : "transparent",
            }}
          />
          <div // middle shadow
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[52vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent left-[0.1vw] z-30"
            style={{
              boxShadow: !isToolsPressed ? "3vw 0vw 2vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[30vw] w-[20.5vw] bottom-[16.1vw] skew-y-[45deg] bg-transparent left-[0.1vw] z-30"
            style={{
              backgroundColor: isToolsPressed ? "#7e22ce" : "transparent",
              boxShadow: !isToolsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          <div // border filler
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[5vw] w-[16.5vw] bottom-[15.5vw] left-[20.5vw] z-30"
            style={{
              backgroundColor: isToolsPressed ? "#7e22ce" : "transparent",
              borderTop: isToolsPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[5vw] w-[12.7vw] bottom-[15.5vw] left-[18.7vw] z-30"
            style={{
              boxShadow: !isToolsPressed ? "0vw -3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[20vw] w-[17vw] bottom-[0.2vw] skew-x-[45deg] left-[16.2vw] z-30"
            style={{
              backgroundColor: isToolsPressed ? "#7e22ce" : "transparent",
              boxShadow: !isToolsPressed
                ? ""
                : "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div // square
            onTouchStart={() => setIsToolsPressed(true)}
            onTouchEnd={handleToolsPressed}
            className="absolute h-[20.2vw] w-[17vw] bg-transparent bottom-[0.3vw] left-[26.5vw] z-30"
            style={{
              boxShadow: !isToolsPressed
                ? "1vw -1vw 2vw -1vw #7e22ce, 2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isToolsPressed ? "1px solid #581c87" : "",
              borderRight: isToolsPressed ? "1px solid #581c87" : "",
              backgroundColor: isToolsPressed ? "#7e22ce" : "transparent",
            }}
          />

          {/* right */}
          <div // square
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[20.2vw] w-[17vw] top-[0.3vw] right-[26.5vw] z-30"
            style={{
              boxShadow: !isPostgamesPressed
                ? "-1vw 1vw 2vw -1vw #7e22ce, -2vw 2vw 2vw -1vw #7e22ce"
                : "",
              borderBottom: isPostgamesPressed ? "1px solid #581c87" : "",
              borderLeft: isPostgamesPressed ? "1px solid #581c87" : "",
              backgroundColor: isPostgamesPressed ? "#7e22ce" : "transparent",
            }}
          />
          <div // skew
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[20vw] w-[17vw] top-[0.1vw] skew-x-[45deg] bg-transparent right-[16.5vw] z-30"
            style={{
              backgroundColor: isPostgamesPressed ? "#7e22ce" : "transparent",
              boxShadow: !isPostgamesPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[5vw] w-[12.7vw] top-[15.5vw] right-[18.7vw] z-30"
            style={{
              boxShadow: !isPostgamesPressed ? "0vw 3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // border filler
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[5vw] w-[16.5vw] top-[15.5vw] right-[17vw] z-30"
            style={{
              backgroundColor: isPostgamesPressed ? "#7e22ce" : "transparent",
              borderBottom: isPostgamesPressed ? "1px solid #581c87" : "",
            }}
          />

          <div // skew top
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[30vw] w-[20.5vw] top-[16.1vw] skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: isPostgamesPressed ? "#7e22ce" : "transparent",
              boxShadow: !isPostgamesPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87",
            }}
          />
          <div // border filler + icon
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[49.2vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent right-[0.1vw] z-40 flex justify-center items-center"
            style={{
              borderLeft: isPostgamesPressed ? "1px solid #581c87" : "",
            }}
          >
            <FaRegFloppyDisk className="w-12 h-12 text-purple-800" />
          </div>
          <div // background filler
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[20vw] w-[20.5vw] top-1/2 translate-y-[-50%] right-[0.1vw] z-30 flex justify-center items-center"
            style={{
              backgroundColor: isPostgamesPressed ? "#7e22ce" : "transparent",
              borderLeft: isPostgamesPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // middle shadow
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[52vw] w-[20.5vw] top-1/2 translate-y-[-50%] bg-transparent right-[0.1vw] z-30"
            style={{
              boxShadow: !isPostgamesPressed ? "-3vw 0vw 2vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew bottom
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[30vw] w-[20.5vw] bottom-[16.1vw] -skew-y-[45deg] bg-transparent right-[0.1vw] z-30"
            style={{
              backgroundColor: isPostgamesPressed ? "#7e22ce" : "transparent",
              boxShadow: !isPostgamesPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
            }}
          />

          <div // border filler
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[5vw] w-[16.5vw] bottom-[15.5vw] right-[20.5vw] z-30"
            style={{
              backgroundColor: isPostgamesPressed ? "#7e22ce" : "transparent",
              borderTop: isPostgamesPressed ? "1px solid #581c87" : "",
            }}
          />
          <div // shadow filler
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[5vw] w-[12.7vw] bottom-[15.5vw] right-[18.7vw] z-30"
            style={{
              boxShadow: !isPostgamesPressed ? "0vw -3vw 1vw -2vw #7e22ce" : "",
            }}
          />
          <div // skew
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[20vw] w-[17vw] bottom-[0.2vw] -skew-x-[45deg] right-[16.2vw] z-30"
            style={{
              backgroundColor: isPostgamesPressed ? "#7e22ce" : "transparent",
              boxShadow: !isPostgamesPressed
                ? ""
                : "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div // square
            onTouchStart={() => setIsPostgamesPressed(true)}
            onTouchEnd={handlePostgamesPressed}
            className="absolute h-[20.2vw] w-[17vw] bg-transparent bottom-[0.3vw] right-[26.5vw] z-30"
            style={{
              boxShadow: !isPostgamesPressed
                ? "-1vw -1vw 2vw -1vw #7e22ce, -2vw -2vw 2vw -1vw #7e22ce"
                : "inset 0px -9px 5px -6px #581c87",
              borderTop: isPostgamesPressed ? "1px solid #581c87" : "",
              borderLeft: isPostgamesPressed ? "1px solid #581c87" : "",
              backgroundColor: isPostgamesPressed ? "#7e22ce" : "transparent",
            }}
          />
        </div>
      </div>
    </>
  );
};

const OctagonBackground = ({ handleBgClick, discreet }) => {
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

      {/* {!discreet && ( */}
      <>
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[-13.3vw] translate-x-[0vw] right-0 bottom-0 z-20 bg-transparent"
          style={{ boxShadow: "13px 20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[5.6vw] translate-x-[-17.6vw] right-0 bottom-0 z-20 bg-transparent rotate-45"
          style={{ boxShadow: "13px 20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[6.7vw] translate-x-[20vw] left-0 bottom-0 z-20 bg-transparent rotate-90"
          style={{ boxShadow: "13px 20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[39vw] translate-x-[1vw] left-0 top-0 z-20 bg-transparent rotate-[-45deg]"
          style={{ boxShadow: "-13px -20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[13.3vw] translate-x-[0vw] left-0 top-0 z-20 bg-transparent rotate-[0deg]"
          style={{ boxShadow: "-13px -20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[-5.6vw] translate-x-[17.7vw] left-0 top-0 z-20 bg-transparent rotate-[-135deg]"
          style={{ boxShadow: "13px 20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[-6.5vw] translate-x-[43.6vw] left-0 top-0 z-20 bg-transparent rotate-[90deg]"
          style={{ boxShadow: "-13px -20px 15px -2px #3b0764" }}
        />
        <div
          className="absolute w-[26.5vw] h-[40vw] -skew-y-[45deg] translate-y-[11vw] translate-x-[-1.2vw] right-0 top-0 z-20 bg-transparent rotate-[135deg]"
          style={{ boxShadow: "-13px -20px 15px -2px #3b0764" }}
        />
      </>
      {/* )} */}

      <div className="absolute top-1/2 translate-y-[-50%] bg-transparent w-[90vw] h-[90vw] z-10 flex items-center">
        <div className="relative">
          <div className="absolute w-[90.1vw] h-[90.1vw] bg-transparent translate-x-[0vw] translate-y-[-50%] z-0">
            <div className="relative h-full w-full bg-transparent">
              <div className="absolute w-full h-full bg-transparent border border-black"></div>
            </div>
          </div>
        </div>

        <div className="relative w-full h-full">
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-45"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-90"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-[-45deg]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-[-45deg]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-[-90deg]"
            style={{
              boxShadow: "inset 9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw]"
            style={{
              boxShadow: "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-45"
            style={{
              boxShadow: "inset -9px 0px 5px -6px #581c87",
            }}
          />
          <div
            className="absolute top-1/2 translate-y-[-50%] w-full bg-transparent z-0 h-[37vw] rotate-[-45deg]"
            style={{
              boxShadow: "inset -9px 0px 5px -6px #581c87",
            }}
          />
        </div>
      </div>
    </>
  );
};

const CentralZone = ({ children, onClick, zIndex }) => {
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        onClick && onClick(event);
      }}
      className={`central-zone absolute top-[18.2%] left-[11.4%] h-[57.1vw] w-[69.3vw] z-[${zIndex}]`}
    >
      {children}
    </div>
  );
};

const SwipableDiv = ({ onConfirmedSwipe, height, margin, children }) => {
  const divRef = useRef(null);
  const [divHeight, setDivHeight] = useState(0);
  const startX = useRef(0);
  const swipeDistance = useRef(0);
  const [swipedWidth, setSwipedWidth] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);

  useEffect(() => {
    if (!divRef?.current) return;
    setDivHeight(divRef.current.getBoundingClientRect().height);
  }, [divRef]);

  const handleTouchStart = (e) => {
    if (isSwiped) return;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (isSwiped) return;
    const currentX = e.touches[0].clientX;
    swipeDistance.current = Math.max(0, currentX - startX.current);
    setSwipedWidth(swipeDistance.current);
  };

  const handleTouchEnd = () => {
    if (!divRef?.current) return;
    const widthThreshold = divRef.current.getBoundingClientRect().width / 2;
    if (swipeDistance.current >= widthThreshold) {
      setIsSwiped(true);
    }
    setSwipedWidth(0);
    startX.current = 0;
  };

  return (
    <div
      className={`relative w-full h-${height} m-${margin} overflow-hidden touch-none`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`absolute top-0 left-0 border border-red-900 bg-red-500 flex justify-center items-center transition-none z-10 ${
          !startX?.current && "hidden"
        }`}
        style={{
          width: `${swipedWidth}px`,
          height: divRef?.current?.getBoundingClientRect().height,
        }}
      >
        <FaRegTrashAlt className="w-8 h-8 text-red-900 py-1" />
      </div>

      <div
        ref={divRef}
        className="w-full h-full flex items-center justify-center"
      >
        {!isSwiped ? (
          children
        ) : (
          <div
            className="w-full flex gap-1 border border-purple-950 bg-purple-300 p-1"
            style={{ height: `${divHeight}px` }}
          >
            <div
              onClick={() => setIsSwiped(false)}
              className="h-full w-full flex justify-center items-center border border-red-800 bg-red-300"
            >
              <XMarkIcon
                className="text-red-800 py-1"
                style={{ height: `${divHeight}px` }}
              />
            </div>
            <div
              onClick={async () => await onConfirmedSwipe()}
              className="h-full w-full flex justify-center items-center border border-green-800 bg-green-300"
            >
              <FaCheck
                className="text-green-800"
                style={{ height: `${divHeight}px` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Friends = ({ friendList, user, deleteFriend, updateLastCP }) => {
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    setLocked(false);
  }, []);

  const onDeleteFriend = useCallback(
    async (friend) => {
      // event.stopPropagation();
      if (locked) return;
      await deleteFriend({
        userId: user.id,
        friendId: friend.friendId,
      });
      updateLastCP({ userId: user.id }); // no await
    },
    [locked, deleteFriend, user]
  );

  return (
    <div className="h-full aspect-square flex flex-col items-center justify-center relative z-30">
      <div className="h-full w-full py-1 flex flex-col justify-center gap-1">
        {friendList.map((friend) => (
          <div
            key={friend.friendId}
            className="flex justify-center items-center"
          >
            <SwipableDiv
              onConfirmedSwipe={() => onDeleteFriend(friend)}
              height={8}
              margin={0.5}
            >
              <div className="border border-purple-950 bg-purple-300 w-full h-full">
                <div className="h-full w-full text-purple-950 flex items-center justify-center">
                  {friend.customName}
                </div>
              </div>
            </SwipableDiv>
          </div>
        ))}
      </div>
    </div>
  );
};

const PasswordForm = ({ user }) => {
  const updateWithUserId = updatePassword.bind(null, user.id);
  const [state, formAction] = useFormState(updateWithUserId, {
    status: 200,
    message: null,
  });

  return (
    <div className="w-full h-full flex justify-center py-9">
      <form
        action={(formData) => formAction(formData)}
        className="flex flex-col items-center"
      >
        <label className="text-purple-900">Ancien mot de passe</label>
        <input
          type="password"
          name="oldPassword"
          id="oldPassword"
          className="text-purple-900 focus:outline-none"
          style={{ backgroundColor: "#f3e8ff" }}
          autoComplete=""
        />

        <label className="text-purple-900">Nouveau mot de passe</label>
        <input
          type="password"
          name="newPassword"
          id="newPassword"
          className="text-purple-900 focus:outline-none"
          style={{ backgroundColor: "#f3e8ff" }}
          autoComplete=""
        />

        <label className="text-purple-900">Confirmer</label>
        <input
          type="password"
          name="confirmedPassword"
          id="confirmedPassword"
          className="text-purple-900 focus:outline-none"
          style={{ backgroundColor: "#f3e8ff" }}
          autoComplete=""
        />

        <button
          type="submit"
          className="border border-purple-200 bg-purple-400 text-purple-900 mt-2 p-1"
        >
          Valider
        </button>

        <div style={{ color: "#581c87" }}>{state.message}</div>
      </form>
    </div>
  );
};

const BarParam = ({ style, borderPosition }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [style]);

  return ReactDOM.createPortal(
    <>
      <style jsx>
        {`
          @keyframes colorWipeTop {
            0% {
              border-top: 2px solid #f3f4f6; // gray 100
            }
            100% {
              border-top: 2px solid #000000;
            }
          }
          @keyframes colorWipeBottom {
            0% {
              border-bottom: 2px solid #f3f4f6; // gray 100
            }
            100% {
              border-bottom: 2px solid #000000;
            }
          }
        `}
      </style>
      <div
        key={key}
        className="absolute w-full"
        style={{
          ...style,
          animation:
            borderPosition === "top" ? "colorWipeTop 7s" : "colorWipeBottom 7s",
        }}
      />
    </>,
    document.body
  );
};

const Params = ({
  updateParams,
  updateLastCP,
  user,
  barValues,
  setBarValues,
}) => {
  const possibleBarValues = [4, 6, 8, 12, 14, 16, 18, 20];

  useEffect(() => {
    if (!user || barValues) return;
    if (!user?.params) {
      setBarValues({ bottomBarSize: 8, topBarSize: 8 });
      return;
    }
    const userParams = user.params || {};
    setBarValues({
      bottomBarSize: userParams.bottomBarSize,
      topBarSize: userParams.topBarSize,
    });
  }, [user, barValues]);

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

  if (!barValues) return null;

  return (
    <div className="h-full aspect-square flex flex-col items-center justify-center relative">
      <BarParam
        style={{ top: 0, height: `${barValues.topBarSize / 4}rem` }}
        borderPosition="bottom"
      />
      <BarParam
        style={{ bottom: 0, height: `${barValues.bottomBarSize / 4}rem` }}
        borderPosition="top"
      />
      {[
        { param: "topBarSize", label: "Barre supérieure" },
        {
          param: "bottomBarSize",
          label: "Barre inférieure",
        },
      ].map((barParam, i) => (
        <div
          key={i}
          onClick={(event) => event.stopPropagation()}
          className="relative border border-purple-200 bg-purple-400 p-1 my-1 w-[95%] text-center flex items-center text-purple-900"
        >
          <div className="text-center w-full relative">
            <div
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
              className="absolute left-0 top-0 w-1/2 bg-white h-full z-30 opacity-0"
            />
            {barParam.label} : {barValues && barValues[barParam.param]}
            <div
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
              className="absolute right-0 top-0 w-1/2 bg-white h-full z-30 opacity-0"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const Invitations = ({
  user,
  updateLastCP,
  getPublicRooms,
  publicRooms,
  setPublicRooms,
  invitations,
  currentGame,
}) => {
  const [threeFirsts, setThreeFirsts] = useState([]);

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
  }, [publicRooms, invitations, setPublicRooms]);

  useEffect(() => {
    const getRooms = async () => {
      setPublicRooms(await getPublicRooms());
    };
    getRooms();
  }, [getPublicRooms, setPublicRooms]);

  useEffect(() => {
    let newThreeFirsts = [];
    newThreeFirsts = invitations.slice(-3);

    const freeSpotsNumber = 3 - newThreeFirsts.length;
    if (freeSpotsNumber && Object.keys(publicRooms).length) {
      const formattedPublicRooms = Object.values(publicRooms)
        .slice(-freeSpotsNumber)
        .map((publicRoom) => ({
          ...publicRoom,
          userName: publicRoom.friendName,
        }));
      newThreeFirsts = [...newThreeFirsts, ...formattedPublicRooms];
    }

    if (currentGame) {
      newThreeFirsts = [
        {
          gameName: currentGame.game,
          link: `${process.env.NEXT_PUBLIC_APP_URL}${currentGame.path}`,
          userName: currentGame.admin,
          isCurrentGame: true,
        },
      ];
    }

    setThreeFirsts(newThreeFirsts);
  }, [invitations, publicRooms, currentGame]);

  return (
    <div className="w-full h-full flex flex-col justify-start items-center relative py-5 gap-1">
      {!invitations.length &&
        !Object.keys(publicRooms).length &&
        !currentGame && (
          <div className="text-center text-purple-800 absolute top-1/2 translate-y-[-50%]">
            <div>Aucune partie</div>
            <div>disponible</div>
          </div>
        )}

      {/* tricky: translate */}
      <div className="h-full aspect-square flex flex-col gap-0.5 translate-x-[0.14vw] translate-y-[0.1vw] z-30">
        {threeFirsts.map((invitation, i) => (
          <div key={i} className="relative z-30 opacity-60 flex-1">
            <div
              onClick={async (event) => {
                event.stopPropagation();
                // resetPermissions();
                await updateLastCP({ userId: user.id, out: true });
                window.location.href = invitation.link;
              }}
              className="w-full z-30 h-full"
            >
              <div className="h-full flex items-center justify-center border border-2 border-purple-800 text-lg font-semibold text-purple-900 bg-purple-500">
                {!invitation.isCurrentGame ? (
                  invitation.userName
                ) : (
                  <IoIosRefresh className="w-8 h-8" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
  returnLobby,
}) {
  const { isSupported, isVisible, released, request, release } = useWake();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGroup = searchParams.get("group") === "true";

  const [toggledSettings, setToggledSettings] = useState(false);
  const [setting, setSetting] = useState("");
  const [toggledPrelobby, setToggledPrelobby] = useState(
    searchParams.get("prelobby") === "true"
  );

  const [location, setLocation] = useState(null);
  const [scanLocked, setScanLocked] = useState(false);
  const [stopScan, setStopScan] = useState();
  const [scanning, setScanning] = useState(false);

  const [barValues, setBarValues] = useState();

  const [serverMessage, setServerMessage] = useState();

  const [publicRooms, setPublicRooms] = useState({});
  const [invitations, setInvitations] = useState([]);
  const [currentGame, setCurrentGame] = useState();

  const cancelAndReturnLobby = useCallback(async () => {
    const group = JSON.parse(localStorage.getItem("group"));
    const path = await returnLobby({ group });
    localStorage.removeItem("group");
    router.push(path);
  }, [router]);

  useEffect(() => {
    const channel = pusher.subscribe(`user-${user.email}`);
    channel.bind("user-event", function (data) {
      if (data.message) {
        setServerMessage(data.message);
        if (data.message.includes("ajouté")) setSetting("friends");
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
          if (!data.invitation.isPublicDel) {
            setInvitations((prevInvitations) => {
              const prevInvs = [...prevInvitations];
              const deletedInvs = prevInvs.filter(
                (inv) => inv.link !== data.invitation.link
              );
              return deletedInvs;
            });
          }
        } else {
          if (data.invitation.isPublic) {
            setPublicRooms((prevPublics) => {
              const publicRooms = { ...prevPublics };
              publicRooms[data.invitation.roomId] = {
                friendName: data.invitation.userName,
                gameName: data.invitation.gameName,
                link: data.invitation.link,
              };
              return publicRooms;
            });
          } else {
            setInvitations((prevInvitations) => {
              const prevInvs = [...prevInvitations];

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
        }
      }
    });

    updateLastCP({ userId: user.id }); // no await

    return () => {
      pusher.unsubscribe(`user-${user.email}`);
    };
  }, [user, router, updateLastCP]);

  const onNewScanResult = throttle(
    async (decodedText) => {
      if (scanLocked) return;
      let userLocation;
      setScanLocked(true);
      // userLocation = await getLocation();
      const { error: addFriendError } = await addFriend({
        userLocation,
        friendCode: decodedText,
      });
      if (addFriendError) {
        setServerMessage(addFriendError);
        setSetting("");
      }
      setTimeout(() => {
        setScanLocked(false);
      }, 1000);
    },
    1000,
    { leading: true, trailing: false }
  );

  const QrCodeScanner = useMemo(() => {
    const requestCameraAccess = async () => {
      if (setting !== "camera" || stopScan) return;

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
      <div className="h-full flex items-center justify-center">
        <div
          onClick={(event) => event.stopPropagation()}
          className="h-[45vw] flex items-center"
        >
          <Html5QrcodePlugin
            scanning={setting === "camera"}
            fps={60}
            qrCodeSuccessCallback={onNewScanResult}
            setStopScan={setStopScan}
          />
        </div>
      </div>
    );
    // }, [onNewScanResult, scanning]);
    // }, [setting, onNewScanResult, scanning]);
  }, [setting, scanning]);

  const resetPermissions = useCallback(() => {
    stopScan && setting === "camera" && stopScan();
    setStopScan();
  }, [stopScan, setting]);

  const handleBgClick = useCallback(
    (event) => {
      event.stopPropagation();
      resetPermissions();
      // toggledPrelobby && setToggledPrelobby(false);
      // !toggledPrelobby && setToggledSettings(true);
      // if (toggledSettings) {
      //   if (setting === "") setToggledSettings(false);
      //   else setSetting("");
      // }
      setToggledPrelobby(false);
      // if (param === "bars") {
      //   setToggledSettings(false);
      //   setSetting("");
      // } else setParam("bars");
      if (setting !== "") {
        // setParam("")
        setSetting("");
      } else {
        setToggledSettings(false);
      }
      setServerMessage("");
    },
    [toggledSettings, resetPermissions, toggledPrelobby, setting]
  );

  const handleOctaClick = useCallback(
    (event) => {
      // resetPermissions();
      event.stopPropagation();
      // !toggledSettings && setToggledPrelobby(true);
      // toggledSettings && setToggledSettings(false);
      // setSetting("");
      // setServerMessage("");
    },
    [toggledSettings, resetPermissions]
  );

  useEffect(() => {
    const backToRoom = async () => {
      const current = await getCurrentGame();
      current && setCurrentGame(current);
    };
    backToRoom();
  }, [getCurrentGame, router]);

  const showInvitations = !toggledSettings && !toggledPrelobby;

  useEffect(() => {
    const dynamicColor =
      setting === "camera" || setting === "qrCode" ? "black" : "#9333ea";
    document.documentElement.style.setProperty(
      "--dynamic-border-color",
      dynamicColor
    );
  }, [setting]);

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
            <OctagonBackground
              handleBgClick={handleBgClick}
              discreet={setting === "camera" || setting === "qrCode"}
            />

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
                  setting={setting}
                  signOut={signOut}
                />

                {setting === "friends" && (
                  <CentralZone>
                    <div className="flex w-full h-full justify-center items-center py-5">
                      <Friends
                        friendList={friendList}
                        user={user}
                        deleteFriend={deleteFriend}
                        updateLastCP={updateLastCP}
                      />
                    </div>
                  </CentralZone>
                )}

                {setting === "params" && (
                  <CentralZone>
                    <div className="flex w-full h-full justify-center items-center py-5">
                      <Params
                        updateParams={updateParams}
                        updateLastCP={updateLastCP}
                        user={user}
                        barValues={barValues}
                        setBarValues={setBarValues}
                      />
                    </div>
                  </CentralZone>
                )}

                {setting === "password" && (
                  <CentralZone onClick={handleOctaClick} zIndex={60}>
                    <PasswordForm user={user} />
                  </CentralZone>
                )}

                {setting === "qrCode" && (
                  <CentralZone onClick={handleOctaClick} zIndex={60}>
                    {
                      location ? (
                        <div className="w-full h-full flex justify-center items-center">
                          <QRCode
                            value={`id=${user.id};mail=${user.email};name=${user.name};{"latitude":"${location?.latitude}","longitude":"${location?.longitude}"}`}
                            onClick={(event) => event.stopPropagation()}
                            className="h-[41vw] w-auto"
                            style={{
                              background: "white",
                              boxShadow: "0px 0px 5px 5px white",
                            }}
                          />
                        </div>
                      ) : null

                      // (
                      //   <div className="h-full w-full flex justify-center items-center">
                      //     <Spinner />
                      //   </div>
                      // )
                    }
                  </CentralZone>
                )}

                <div className={`${setting !== "camera" && "hidden"}`}>
                  <CentralZone onClick={handleOctaClick} zIndex={60}>
                    {QrCodeScanner}
                  </CentralZone>
                </div>
              </>
            )}

            {showInvitations && (
              <>
                <MainButtons
                  setToggledSettings={setToggledSettings}
                  setToggledPrelobby={setToggledPrelobby}
                />
                <CentralZone onClick={handleOctaClick}>
                  <Invitations
                    user={user}
                    updateLastCP={updateLastCP}
                    getPublicRooms={getPublicRooms}
                    publicRooms={publicRooms}
                    setPublicRooms={setPublicRooms}
                    invitations={invitations}
                    currentGame={currentGame}
                  />
                </CentralZone>
              </>
            )}

            {toggledPrelobby && !toggledSettings && (
              <>
                <PostButtons
                  resetPermissions={resetPermissions}
                  updateLastCP={updateLastCP}
                  user={user}
                />
                <CentralZone>
                  <div className="flex w-full h-full justify-center items-center py-5">
                    <div
                      className="h-full aspect-square flex justify-center items-center bg-purple-600 z-30"
                      style={{
                        background:
                          "radial-gradient(circle, #a855f7 0%, #7e22ce 100%)",
                      }}
                    >
                      <div
                        style={{
                          width: "23vw",
                          height: "23vw",
                          borderRadius: "50%",
                          background:
                            "radial-gradient(circle, #7e22ce 0%, #9333ea 100%)",
                          boxShadow: `inset 5px 5px 10px rgba(255, 255, 255, 0.3), inset -5px -5px 15px rgba(0, 0, 0, 0.3), 5px 5px 15px rgba(0, 0, 0, 0.3), 5px 5px 15px rgba(255, 255, 255, 0.1)`,
                        }}
                        className="flex justify-center items-center border border-purple-800"
                      >
                        <div
                          onClick={async (event) => {
                            event.stopPropagation();
                            resetPermissions();
                            await updateLastCP({ userId: user.id, out: true });
                            window.location.href =
                              user.lastPlayed ||
                              "/categories/grouping/grouping";
                          }}
                          className="z-30"
                        >
                          <FaPlay className="ml-1.5 w-10 h-10 text-purple-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CentralZone>
              </>
            )}

            <div className="absolute top-full z-20 w-full mt-4 text-center text-purple-100">
              {serverMessage}
            </div>
          </div>
        </main>
      ) : (
        <main>
          <div
            onClick={() => cancelAndReturnLobby()}
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
