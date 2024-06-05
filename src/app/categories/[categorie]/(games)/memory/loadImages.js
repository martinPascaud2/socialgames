"use server";

import shuffleArray from "@/utils/shuffleArray";

export async function loadImages({ prefixes, pairsNumber }) {
  const imageContext = require.context("./icons", false, /\.(png)$/);
  const images = {};
  const imagesNames = [];
  let imageLength = 0;

  const numberByTheme = Math.floor(pairsNumber / prefixes.length);
  const remainings = {};
  prefixes.forEach((theme) => {
    remainings[theme] = numberByTheme;
  });
  console.log("remainings avant", remainings);
  const shufflePrefixes = shuffleArray(prefixes);

  let missings = pairsNumber % prefixes.length;
  let index = 0;
  while (missings > 0) {
    remainings[shufflePrefixes[index]]++;
    index++;
    missings--;
  }
  console.log("remainings après", remainings);

  const shuffledImageContextKeys = shuffleArray(imageContext.keys());

  //   imageContext.keys().forEach((path) => {
  shuffledImageContextKeys.forEach((path) => {
    const imageName = path.replace(/^\.\/(.*)\.png$/, "$1");

    console.log("imageName", imageName);
    console.log(
      'remainings[imageName.split(" ")[0]]',
      remainings[imageName.split(" ")[0]]
    );

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

  //     !imageName.startsWith("src") &&
  //       (imagesNames.push(imageName),
  //       (images[imageName] = imageContext(path).default),
  //       imageLength++);
  //   });
  console.log("imagesNames", imagesNames);

  return { images, imagesNames, imageLength };
}
