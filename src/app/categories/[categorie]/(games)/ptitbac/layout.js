export default function PtitbacLayout({ children }) {
  return (
    <>
      <div className="flex justify-center">P'tit bac</div>
      <div className="border">{children}</div>
    </>
  );
}
