import { cookies } from "next/headers";
import { setCookieToken } from "./utils/setCookieToken";

import { LoginForm } from "./LoginForm";
import GuestLink from "./GuestLink";
import PwaDownloader from "./PwaDownloader";
import { jwtVerify } from "./utils/jwtVerify";

export default async function Home() {
  const cookieStore = cookies();
  const SGPrev = cookieStore.get("SG_prev");
  const { userMail, password } = await jwtVerify(SGPrev);
  const prevUser = { prevMail: userMail, prevPassword: password };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <LoginForm prevUser={prevUser} />
      <GuestLink setCookieToken={setCookieToken} />
      <PwaDownloader />
    </main>
  );
}
