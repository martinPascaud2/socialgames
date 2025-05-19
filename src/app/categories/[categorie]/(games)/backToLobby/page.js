import BackToLobby from "./BackToLobby";

export default async function BackToLobbyPage({ searchParams }) {
  //   const { categorie, game, path } = searchParams;
  const { path } = searchParams;

  // no path when admin
  //   const href = !path ? `/categories/${categorie}/${game}/` : path;

  return <BackToLobby path={path} />;
}
