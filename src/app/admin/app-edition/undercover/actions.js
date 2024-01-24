"use server";

import prisma from "@/utils/prisma";

export async function addTheme(prevState, formData) {
  const theme = formData.get("theme");

  try {
    await prisma.undercovertheme.create({
      data: {
        theme,
      },
    });
    return {
      status: 200,
      message: "Thème créé avec succès",
    };
  } catch (error) {
    console.error("addTheme error:", error);
    return {
      status: 500,
      message: "Erreur interne du serveur",
    };
  }
}

export async function addWord(themeId, prevState, formData) {
  const word = formData.get("word");

  try {
    await prisma.undercoverword.create({
      data: {
        word,
        themeId,
      },
    });
    return {
      status: 200,
      message: "Mot ajouté avec succès",
    };
  } catch (error) {
    console.error("addWord error:", error);
    return {
      status: 500,
      message: "Erreur interne du serveur",
    };
  }
}
