export default function TriactionLayout({ children }) {
  return (
    <div className="h-[100vh] flex flex-col">
      <div className="grow">{children}</div>
    </div>
  );
}
