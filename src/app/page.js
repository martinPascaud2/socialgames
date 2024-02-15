import { setCookieToken } from "./utils/setCookieToken";

import { LoginForm } from "./LoginForm";
import GuestLink from "./GuestLink";
import PwaDownloader from "./PwaDownloader";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <LoginForm />
      <GuestLink setCookieToken={setCookieToken} />
      <PwaDownloader />
    </main>
  );
}
