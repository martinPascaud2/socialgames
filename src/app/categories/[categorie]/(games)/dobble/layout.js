export default function DobbleLayout({ children }) {
  return (
    <>
      <div className="flex justify-center">Dobble</div>
      <div className="border">{children}</div>
    </>
  );
}
