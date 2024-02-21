export default function MemoryLayout({ children }) {
  return (
    <>
      <div className="flex justify-center">Memory</div>
      <div className="border">{children}</div>
    </>
  );
}
