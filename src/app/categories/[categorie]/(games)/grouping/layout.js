export default function GroupingLayout({ children }) {
  return (
    <>
      <div className="flex justify-center">Lobby</div>
      <div className="border">{children}</div>
    </>
  );
}
