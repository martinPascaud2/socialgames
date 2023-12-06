import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>home</div>
      <Link href="/categories">go categories</Link>
    </main>
  );
}
