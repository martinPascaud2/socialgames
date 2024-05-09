export default function ToggleCheckbox({ checked, onChange }) {
  return (
    <button
      onClick={async () => await onChange(checked)}
      className={`rounded-[4rem] h-8 w-16 relative transition-all bg-${
        checked ? "blue-300" : "green-300"
      }	`}
      style={{
        backgroundColor: checked ? "rgb(147 197 253)" : "rgb(134 239 172)",
      }}
    >
      <div
        className={`bg-white rounded-[4rem] h-7 w-7 top-0.5 absolute transition-all`}
        style={{ left: checked ? "0.2rem" : "2.1rem" }}
      />
    </button>
  );
}
