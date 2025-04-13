import ExternalBars from "@/components/ExternalBars";

export default function ToolsLayout({ children }) {
  return (
    <div className="h-full w-full bg-black">
      {ExternalBars()}
      <div className="w-full h-full">{children}</div>
    </div>
  );
}
