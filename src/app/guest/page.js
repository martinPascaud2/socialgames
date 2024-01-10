import { cookies } from "next/headers";

import GuestConnector from "./GuestConnector";
import GuestDisconnector from "./GuestDisconnector";

export default async function GuestPage() {
  const signOut = async () => {
    "use server";
    cookies().delete("SG_token");
  };
  return (
    <div className="h-screen flex flex-col justify-center	">
      <GuestConnector />
      <GuestDisconnector signOut={signOut} />
    </div>
  );
}
