export default function TriactionLayout({ children }) {
  return (
    <div className="h-[100vh] flex flex-col">
      <div className="flex justify-center">Triaction</div>
      <div className="border grow">{children}</div>
    </div>
  );
}
