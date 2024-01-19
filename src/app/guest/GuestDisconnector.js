"use client";

export default function GuestDisconnector({ signOut }) {
  return (
    <button
      onClick={async () => {
        await signOut();
        window.location.reload();
      }}
      className="w-1/2 self-center border border-blue-300 bg-blue-100 mt-20"
    >
      Retour à l&apos;écran de connexion
    </button>
  );
}
