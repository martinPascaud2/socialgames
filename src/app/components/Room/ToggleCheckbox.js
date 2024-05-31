export default function ToggleCheckbox({ checked, onChange, colors, size }) {
  const defaultSize = 100;
  const scale = size ? size / defaultSize : 1;

  return (
    <button
      onClick={async () => await onChange(checked)}
      className={`rounded-[4rem] relative transition-all`}
      style={{
        backgroundColor: checked
          ? colors?.yes || "rgb(147 197 253)"
          : colors?.no || "rgb(134 239 172)",
        height: `${2.5 * scale}rem`,
        width: `${5 * scale}rem`,
      }}
    >
      <div
        className={`bg-white rounded-[4rem] absolute transition-all`}
        style={{
          height: `${2.3 * scale}rem`,
          width: `${2.3 * scale}rem`,
          top: `${0.1 * scale}rem`,
          left: checked ? `${0.1 * scale}rem` : `${2.6 * scale}rem`,
        }}
      />
    </button>
  );
}
