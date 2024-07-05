import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  manifest: "/manifest.json",
  title: "Social Games",
  description: "Application de jeux sociaux",
};

export const viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <meta name="apple-mobile-web-app-capable" content="yes"></meta>
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      ></meta>
      <body className={`${inter.className}`}>
        <div className="fixed top-0 w-full bg-black z-40 h-20" />
        <div className="h-screen">{children}</div>
        <div className="fixed bottom-0 w-full bg-black z-0 h-20" />
      </body>
    </html>
  );
}
