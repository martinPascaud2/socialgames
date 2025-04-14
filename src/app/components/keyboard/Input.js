"use client";

export default function Input({
  input,
  openKeyboard,
  active,
  placeholder,
  deactivated,
}) {
  let backgroundColor;
  if (deactivated) {
    backgroundColor = "#9ca3af"; // gray-400
  } else if (!active) {
    backgroundColor = "#f3f4f6"; // gray-100
  } else {
    backgroundColor = "#fef3c7"; // amber-100
  }

  return (
    <div
      onClick={() => !deactivated && openKeyboard()}
      className={`w-full h-fit min-h-full outline rounded flex justify-center items-center relative`}
      style={{
        backgroundColor,
        outlineColor: !active ? "#374151" : "#b45309", // gray-700 amber-700
      }}
    >
      <span
        className="z-10 p-1 text-amber-700 rounded-full"
        style={{
          backgroundColor,
          color: !active ? "#374151" : "#b45309", // gray-700 amber-700
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
