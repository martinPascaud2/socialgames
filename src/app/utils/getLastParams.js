"use server";

const getNormalizedPrismaField = ({ mode }) => {
  return `${mode
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")}LastParams`
    .replace(" ", "")
    .replace("'", "")
    .replace(/[()]/g, "_");
};

export async function saveLastParams({ userId, options }) {
  console.log("passé par save");
  // const toUpdate = `${options.mode
  //   .toLowerCase()
  //   .normalize("NFD")
  //   .replace(/[\u0300-\u036f]/g, "")}LastParams`;
  const toUpdate = getNormalizedPrismaField({ mode: options.mode });

  await prisma.user.update({
    where: { id: userId },
    data: {
      [toUpdate]: options,
    },
  });
}

export default async function getLastParams({ userId, mode }) {
  console.log("passé par get");
  // const paramsToGet = `${mode
  //   .toLowerCase()
  //   .normalize("NFD")
  //   .replace(/[\u0300-\u036f]/g, "")}LastParams`
  //   .replace(" ", "")
  //   .replace("'", "");
  const paramsToGet = getNormalizedPrismaField({ mode });

  console.log("paramsToGet", paramsToGet);

  const lastParams = (
    await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        [paramsToGet]: true,
      },
    })
  )[paramsToGet];

  return lastParams;
}
