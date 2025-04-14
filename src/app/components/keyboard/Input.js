"use client";

export default function Input({ input, openKeyboard, active, placeholder }) {
  return (
    <div
      onClick={() => openKeyboard()}
      className={`w-full h-fit min-h-full outline rounded flex justify-center items-center relative`}
      style={{
        backgroundColor: !active ? "#f3f4f6" : "#fef3c7", // gray-100 amber-100
        outlineColor: !active ? "#374151" : "#b45309", // gray-700 amber-700
      }}
    >
      <span
        className="z-10 p-1 text-amber-700 rounded-full"
        style={{
          backgroundColor: !active ? "white" : "#fef3c7", // amber-100
        }}
      >
        {input}
      </span>
      <div
        className="absolute right-0 bottom-0 text-sm z-0 pr-1"
        style={{ color: !active ? "#9ca3af" : "#38bdf8" }} // gray-400 sky-400
      >
        {placeholder}
      </div>
    </div>
  );
}
