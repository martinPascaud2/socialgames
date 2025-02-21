"use client";

import "./room.css";

import { CornerTriangle } from "../Triangle";

export default function AnimatedOctagon({ user, hasAnimated, setHasAnimated }) {
  const userParams = user.params;
  const barsSizes = {
    bottom: userParams?.bottomBarSize || 8,
    top: userParams?.topBarSize || 8,
  };
  return (
    // <div className="h-screen w-screen flex justify-center items-center">
    //   <div onClick={() => setHasAnimated(!hasAnimated)} className="">
    //     coucou
    //   </div>
    // </div>

    <div className="bg-black w-screen h-screen">
      <div className="absolute h-[100dvh] w-full px-2 overflow-x-hidden">
        {/* <div className="absolute h-[100dvh] w-[calc(100%-1rem)] overflow-x-hidden animate-[expandSize_10s_ease-in-out] top-1/2 translate-y-[-50%] left-1/2 translate-x-[-50%]"> */}
        {/* <div
          // className={`px-2 absolute w-full overflow-x-hidden animate-[expandSize_2s_ease-in-out] top-1/2 translate-y-[-50%] left-1/2 translate-x-[-50%]`}
          className={`absolute overflow-x-hidden animate-[expandSize_2s_ease-in-out] top-1/2 translate-y-[-50%] left-1/2 translate-x-[-50%]`}
          style={{
            height: `calc(90vw + ${barsSizes.top / 4}rem + ${
              barsSizes.bottom / 4
            }rem + 2rem)`,
            width: `calc(100% - 1.5rem)`,
          }}
        > */}
        {/* <UserContext.Provider value={{ userParams }}> */}
        <div className={`relative h-full w-full`}>
          <div
            className="absolute top-0 w-full bg-black z-50"
            style={{ height: `${barsSizes.top / 4}rem` }}
          />
          <div
            className="absolute bottom-0 w-full bg-black z-50"
            style={{ height: `${barsSizes.bottom / 4}rem` }}
          />

          <div
            className="absolute left-0 translate-x-[-50%] translate-y-[-1rem] z-10"
            style={{ top: `${barsSizes.top / 4}rem` }}
          >
            <CornerTriangle direction={{ y: "bottom", x: "left" }} />
          </div>
          <div
            className="absolute right-0 translate-x-[50%] translate-y-[-1rem] z-10"
            style={{ top: `${barsSizes.top / 4}rem` }}
          >
            <CornerTriangle direction={{ y: "bottom", x: "right" }} />
          </div>
          <div
            className="absolute left-0 translate-x-[-50%] translate-y-[1rem] z-10"
            style={{ bottom: `${barsSizes.bottom / 4}rem` }}
          >
            <CornerTriangle direction={{ y: "top", x: "left" }} />
          </div>
          <div
            className="absolute right-0 translate-x-[50%] translate-y-[1rem] z-10"
            style={{ bottom: `${barsSizes.bottom / 4}rem` }}
          >
            <CornerTriangle direction={{ y: "top", x: "right" }} />
          </div>
          <div className="absolute right-full w-2.5 bg-black h-full z-10" />
          <div className="absolute left-full w-2.5 bg-black h-full z-10" />
          <div
            className="h-full w-full relative bg-purple-600"
            style={{
              paddingTop: `${barsSizes.top / 4}rem`,
              paddingBottom: `${barsSizes.bottom / 4}rem`,
            }}
          >
            <div
              className="absolute left-0 w-full bg-transparent"
              style={{
                top: `${barsSizes.top / 4}rem`,
                height: `calc(100% - ${barsSizes.top / 4}rem - ${
                  barsSizes.bottom / 4
                }rem)`,
                boxShadow:
                  "inset -9px 0px 5px -6px #581c87, inset 9px 0px 5px -6px #581c87, inset 0px 9px 5px -6px #581c87, inset 0px -9px 5px -6px #581c87",
              }}
            />
          </div>
        </div>
        {/* {isAdmin && gameName !== "grouping" && (
              <div onClick={async () => await deleteInvs()}>
                <NextStep onClick={() => launchRoom()}>
                  <div>Lancer</div>
                </NextStep>
              </div>
            )} */}

        <div
          className="h-full w-full absolute top-0 left-0 z-20 px-2"
          // className="h-full w-full absolute top-0 left-0 z-20"
          style={{
            paddingTop: `${barsSizes.top / 4}rem`,
            paddingBottom: `${barsSizes.bottom / 4}rem`,
          }}
        >
          <div className="relative h-full w-full">
            <div className="absolute left-1/2 translate-x-[-50%] h-[10dvh] w-full">
              {/* <div className="w-full flex justify-center translate-y-[1rem]">
                {categorie !== "grouping" && (
                  <div className="flex items-center">
                    <div>
                      {options?.mode
                        ? modesRules[options?.mode].limits.min
                        : gamesRefs[gameName].limits.min}
                      &nbsp;
                    </div>
                    <FaLongArrowAltRight className="mr-1 w-6 h-6" />
                    <div className="text-2xl text-amber-400">
                      {options?.mode
                        ? modesRules[options?.mode].limits.opti
                        : gamesRefs[gameName].limits.opti}
                    </div>
                    <FaLongArrowAltLeft className="ml-1 w-6 h-6" />
                    <div>
                      &nbsp;
                      {options?.mode
                        ? modesRules[options?.mode].limits.max
                        : gamesRefs[gameName].limits.max}
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute top-[7dvh] w-full flex justify-center items-center">
                {categorie !== "grouping" &&
                categoriesIcons &&
                !gameData.isSearching ? (
                  <Image
                    src={categoriesIcons[categorie]}
                    alt={`${categorie} image`}
                    className="max-h-[4dvh] max-w-[4dvh] aspect-square"
                    style={{ objectFit: "contain" }}
                    width={500}
                    height={500}
                  />
                ) : (
                  <div className="h-[4dvh] w-[4dvh]" />
                )}

                {isAdmin ? (
                  <div className="text-center text-amber-700 text-3xl flex justify-center items-center border border-amber-700 bg-amber-100 p-2 mx-2 min-w-[15dvh]">
                    {gamesRefs[gameName].categorie === "grouping" ? (
                      <div
                        onClick={async () => {
                          await deleteInvs();
                          launchRoom();
                        }}
                        className="w-full h-full"
                      >
                        +
                      </div>
                    ) : (
                      gameName !== "grouping" && (
                        <ChooseAnotherGame
                          group={group}
                          roomId={roomId}
                          roomToken={roomToken}
                          gameData={gameData}
                          lastPosition={geoLocation}
                          deleteInvs={deleteInvs}
                        >
                          {gamesRefs[gameName].name}
                        </ChooseAnotherGame>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center text-amber-400 text-3xl flex justify-center items-center mx-2 min-w-[15dvh]">
                    {!gameData.isSearching ? (
                      gamesRefs[gameName].categorie === "grouping" ? (
                        <span>Lobby</span>
                      ) : (
                        gamesRefs[gameName].name
                      )
                    ) : (
                      <AnimatedDots color="#fbbf24" text="5xl" /> // text-amber-400
                    )}
                  </div>
                )}
                <div className="rounded-full h-[4dvh] w-[4dvh] border border-amber-700 bg-amber-100 flex justify-center items-center">
                  <FaInfo className="h-[2.5dvh] w-[2.5dvh] text-amber-700" />
                </div>
              </div> */}
            </div>
          </div>
        </div>
        {/* </UserContext.Provider> */}
      </div>
    </div>
  );
}
