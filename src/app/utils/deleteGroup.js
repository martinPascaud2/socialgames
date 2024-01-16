"use server";

export default async function deleteGroup({ groupToken }) {
  //   "use server";
  await pusher.trigger(`room-${groupToken}`, "room-event", {
    gameData: {
      nextGame: "deleted group",
    },
  });
}
