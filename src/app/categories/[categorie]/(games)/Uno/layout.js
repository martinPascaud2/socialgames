export default function UnoLayout({ children }) {
  return (
    <>
      <div className="flex justify-center">Uno</div>
      <div className="border">{children}</div>
    </>
  );
}
