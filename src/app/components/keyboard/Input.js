"use client";

export default function Input({
  input,
  openKeyboard,
  active,
  placeholder,
  deactivated,
  outlineColor = { unactive: "#374151", active: "#b45309" }, // gray-700 amber-700
  backgroundColor = {
    deactivated: "#9ca3af",
    unactive: "#f3f4f6",
    active: "#fef3c7",
  }, // gray-400 gray-100 // amber-100
  placeholderColor = {
    unactive: "#9ca3af",
    active: "#38bdf8",
  }, // gray-400 sky-400
  inputColor = { unactive: "#374151", active: "#b45309" }, // gray-700 amber-700
  font,
  rounded = "",
  minHeight = "2rem",
}) {
  let bgColor;
  if (deactivated) {
    bgColor = backgroundColor.deactivated;
  } else if (!active) {
    bgColor = backgroundColor.unactive;
  } else {
    bgColor = backgroundColor.active;
  }

  return (
    <div
      onClick={() => !deactivated && openKeyboard()}
      className={`w-full rounded${rounded} flex justify-center items-center relative ${font?.className}`}
      style={{
        backgroundColor: bgColor,
        outlineStyle: outlineColor !== null ? "solid" : "",
        outlineColor: outlineColor
          ? !active
            ? outlineColor.unactive
            : outlineColor.active
          : "", // gray-700 amber-700
        minHeight,
      }}
    >
      <span
        className="z-10 p-1 text-amber-700 rounded-full"
        style={{
          backgroundColor: bgColor,
          color: !active ? inputColor.unactive : inputColor.active, // gray-700 amber-700
        }}
      >
        {input}
      </span>
      <div
        className="absolute right-0 bottom-0 text-sm z-0 pr-1"
        style={{
          color: !active ? placeholderColor.unactive : placeholderColor.active,
        }} // gray-400 sky-400
      >
        {placeholder}
      </div>
    </div>
  );
}
