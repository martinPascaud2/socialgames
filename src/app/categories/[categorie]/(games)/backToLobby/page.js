import BackToLobby from "./BackToLobby";

export default async function BackToLobbyPage({ searchParams }) {
  const { path } = searchParams;

  return <BackToLobby path={path} />;
}
