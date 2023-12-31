"use server";

import { redirect } from "next/navigation";
const bcrypt = require("bcrypt");
import { setCookieToken } from "./utils/setCookieToken";

import prisma from "@/utils/prisma";

// const setCookieToken = async (status, mail) => {
//   const secret = new TextEncoder().encode(process.env.PRIVATE_KEY);
//   const alg = "HS256";

//   const jwt = await new jose.SignJWT({
//     [process.env.NEXT_PUBLIC_APP_URL]: true,
//     mail,
//   })
//     .setProtectedHeader({ alg })
//     .setSubject(status)
//     .sign(secret);

//   cookies().set({
//     name: "SG_token",
//     value: jwt,
//     httpOnly: true,
//     path: "/",
//   });
// };

export async function connect(prevState, formData) {
  const mail = formData.get("mail");
  const password = formData.get("password");

  // const setCookieToken = async (status) => {
  //   const secret = new TextEncoder().encode(process.env.PRIVATE_KEY);
  //   const alg = "HS256";

  //   const jwt = await new jose.SignJWT({
  //     [process.env.NEXT_PUBLIC_APP_URL]: true,
  //     mail,
  //   })
  //     .setProtectedHeader({ alg })
  //     .setSubject(status)
  //     .sign(secret);

  //   cookies().set({
  //     name: "SG_token",
  //     value: jwt,
  //     httpOnly: true,
  //     path: "/",
  //   });
  // };

  let hashedPassword;
  try {
    hashedPassword = (
      await prisma.user.findUnique({
        where: {
          email: mail,
        },
        select: {
          password: true,
        },
      })
    ).password;
  } catch (error) {
    console.error("Find unique user error:", error);
    return {
      status: 424,
      message: "Identifiants incorrects ; veuillez réessayer.",
    };
  }

  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Bcrypt.compare error:", error);
    return {
      status: 424,
      message: "Une erreur s'est produite ; veuillez réessayer.",
    };
  }

  if (isValidPassword) {
    await setCookieToken("User", mail);
    redirect(`/categories`);
  } else {
    return {
      status: 401,
      message: "Mot de passe incorrect",
    };
  }
}
