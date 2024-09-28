import { vampiro } from "@/assets/fonts";

export default function WrittenCard({ data }) {
  return (
    <div className="w-[90%] rounded-md border border-lime-800 my-3 py-2 px-4 flex flex-col items-center shadow-lg shadow-lime-900 bg-lime-700">
      <label className="font-bold text-slate-100 tracking-wide">
        {data.label}
      </label>
      <div
        className={`${vampiro.className} w-full p-2 m-2 text-center text-red-900 text-lg bg-lime-100 border-4 border-double border-lime-800`}
      >
        {data.action}
      </div>
    </div>
  );
}
