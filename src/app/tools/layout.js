import ExternalBars from "@/components/ExternalBars";

export default function ToolsLayout({ children }) {
  return (
    <>
      {ExternalBars()}
      <div>{children}</div>
    </>
  );
}
