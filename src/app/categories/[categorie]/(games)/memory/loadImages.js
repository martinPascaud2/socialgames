"use server";

import pusher from "@/utils/pusher";
import shuffleArray from "@/utils/shuffleArray";

export async function loadImages({
  prefixes,
  pairsNumber,
  gameData,
  roomToken,
}) {
  "use server";
  const imageContext = require.context("./icons", false, /\.(png)$/);
  const images = {};
  const imagesNames = [];
  let imageLength = 0;
  const shufflePrefixes = shuffleArray(prefixes);

  const numberByTheme = Math.floor(pairsNumber / prefixes.length);
  const remainings = {};
  prefixes.forEach((theme) => {
    remainings[theme] = numberByTheme;
  });

  let missings = pairsNumber % prefixes.length;
  let index = 0;
  while (missings > 0) {
    remainings[shufflePrefixes[index]]++;
    index++;
    missings--;
  }

  const shuffledImageContextKeys = shuffleArray(imageContext.keys());

  shuffledImageContextKeys.forEach((path) => {
    const imageName = path.replace(/^\.\/(.*)\.png$/, "$1");

    if (
      !imageName.startsWith("src") &&
      prefixes.some((prefix) => imageName.startsWith(prefix)) &&
      remainings[imageName.split(" ")[0]] > 0
    ) {
      imagesNames.push(imageName);
      images[imageName] = imageContext(path).default;
      imageLength++;
      remainings[imageName.split(" ")[0]]--;
    }
  });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      adminLoad: { images, imagesNames, imageLength },
    },
  });

  return { images, imagesNames, imageLength };
}
