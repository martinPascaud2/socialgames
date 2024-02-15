"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import { connect } from "@/actions";
import { useEffect, useState } from "react";

const initialState = {
  message: null,
  srMessage: "Rentrez vos identifiants",
  status: 100,
};

// export function LoginForm({ prevUser }) {
export function LoginForm({}) {
  const [state, formAction] = useFormState(connect, initialState);
  const [prevUser, setPrevUser] = useState({ prevMail: "", prevPassword: "" });
  // const getUserfromLocalStorage = window?.localStorage?.getItem("user")
  //   ? JSON.parse(localStorage.getItem("user"))
  //   : null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userFromLocalStorage = localStorage.getItem("prevUser");
      // ? JSON.parse(localStorage.getItem("prevUser"))
      // : null;
      if (userFromLocalStorage) {
        setPrevUser(JSON.parse(userFromLocalStorage));
      }
      console.log(
        "userFromLocalStorage",
        userFromLocalStorage,
        typeof userFromLocalStorage
      );
      // const test = JSON.parse(getUserfromLocalStorage);
      // console.log("test", test);
    }
  }, []);

  console.log("prevUser", prevUser);

  return (
    <>
      <form
        action={(FormData) => {
          formAction(FormData);
          console.log("FormData", FormData);
          const prevMail = FormData.get("mail");
          const prevPassword = FormData.get("password");
          console.log("prevMail", prevMail);
          console.log("prevPassword", prevPassword);
          localStorage.setItem(
            "prevUser",
            JSON.stringify({ prevMail, prevPassword })
          );
        }}
        className="flex flex-col justify-center items-center"
      >
        <label htmlFor="mail">Adresse mail</label>
        <input
          type="mail"
          name="mail"
          id="mail"
          autoComplete="email"
          defaultValue={prevUser.prevMail}
          className="border focus:outline-none focus:border-2"
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          name="password"
          id="password"
          autoComplete="current-password"
          defaultValue={prevUser.prevPassword}
          className="border focus:outline-none focus:border-2"
        />

        <div className="text-justify font-bold">{state.message}</div>

        <button type="submit" className="border border-blue-300 bg-blue-100">
          Se connecter
        </button>

        <p aria-live="polite" className="sr-only">
          {state?.srMessage}
        </p>
        <Link href="/signin" className="border border-blue-300 bg-blue-100">
          Créer un compte
        </Link>
      </form>
    </>
  );
}
