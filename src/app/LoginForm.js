"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import { connect } from "@/actions";

const initialState = {
  message: null,
  srMessage: "Rentrez vos identifiants",
  status: 100,
};

export function LoginForm({ prevUser }) {
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
          autoComplete="email"
          defaultValue={prevUser?.prevMail || ""}
          className="border focus:outline-none focus:border-2"
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          name="password"
          id="password"
          autoComplete="current-password"
          defaultValue={prevUser?.prevPassword || ""}
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
