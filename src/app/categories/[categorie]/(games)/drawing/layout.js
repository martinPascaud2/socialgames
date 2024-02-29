export default function DrawingLayout({ children }) {
  return (
    <>
      <div className="flex justify-center">Dessin</div>
      <div className="border">{children}</div>
    </>
  );
}
