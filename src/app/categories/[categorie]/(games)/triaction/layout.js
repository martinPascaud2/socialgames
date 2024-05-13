export default function TriactionLayout({ children }) {
  return (
    <div className="h-[100vh] flex flex-col">
      <div className="border grow">{children}</div>
    </div>
  );
}
