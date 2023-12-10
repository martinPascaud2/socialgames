"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import { connect } from "@/actions";

const initialState = {
  message: null,
  srMessage: "Rentrez vos identifiants",
  status: 100,
};

export function LoginForm() {
  const [state, formAction] = useFormState(connect, initialState);

  return (
    <>
      <form
        action={formAction}
        className="flex flex-col justify-center items-center"
      >
        <label htmlFor="mail">Adresse mail</label>
        <input
          type="mail"
          name="mail"
          id="mail"
          autoFocus
          className="border focus:outline-none focus:border-2"
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          name="password"
          id="password"
          className="border focus:outline-none focus:border-2"
        />

        <div className="text-justify font-bold">{state.message}</div>

        <button type="submit">Se connecter</button>

        <p aria-live="polite" className="sr-only">
          {state?.srMessage}
        </p>
        <Link href="/signin">Créer un compte</Link>
      </form>
    </>
  );
}
