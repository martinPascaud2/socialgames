"use client";

import { useState, useEffect, useCallback } from "react";

export default function MemoryThemeOption({
  setOptions,
  selectedThemes,
  setSelectedThemes,
  max,
  setServerMessage,
  lastMode,
}) {
  const [themes, setThemes] = useState([
    { theme: "AnimalDog", label: "Chiens", selected: true },
    { theme: "ObjectAll", label: "Objets divers", selected: true },
    { theme: "ObjectBall", label: "Ballons", selected: true },
  ]);
  const [show, setShow] = useState(false);
  //   const [selectedThemes, setSelectedThemes] = useState([]);
  console.log("lastMode", lastMode);

  useEffect(() => {
    if (!lastMode) return;
    setThemes((prevThemes) => {
      const lastThemes = lastMode.options.themes;
      const newThemes = prevThemes.map((theme) => {
        if (lastThemes.some((lastTheme) => lastTheme === theme.theme)) {
          return theme;
        } else {
          return { ...theme, selected: false };
        }
      });
      return newThemes;
    });
  }, []);

  useEffect(() => {
    if (!themes || !setOptions) return;
    const newSelected = themes.filter((theme) => theme.selected);
    setSelectedThemes(
      newSelected.sort((a, b) => a.label.localeCompare(b.label))
    );
    setOptions((options) => ({
      ...options,
      themes: newSelected.map((sel) => sel.theme),
    }));
  }, [themes, setOptions]);

  const handleCheck = useCallback(
    (theme) => {
      const themeIndex = themes.findIndex((th) => th.theme === theme.theme);
      const newTheme = {
        ...themes[themeIndex],
        selected: !themes[themeIndex].selected,
      };

      //   if (newTheme.selected && selectedThemes.length === max) {
      //     setServerMessage("Limite atteinte: augmente le nombre de paires");
      //     return;
      //   }

      const newThemes = [...themes];
      newThemes[themeIndex] = newTheme;
      setThemes(newThemes.sort((a, b) => a.label.localeCompare(b.label)));

      setServerMessage("");
    },
    [setServerMessage, themes]
  );

  console.log("show", show);
  console.log("selectedThemes", selectedThemes);
  console.log("max", max);
  console.log("selectedThemes.length", selectedThemes.length);
  return (
    <div className="flex flex-col justify-center items-center mb-4">
      <button
        onClick={() => setShow(!show)}
        className="flex justify-center border border-blue-300 bg-blue-100 w-2/3"
      >
        <div className="">
          {selectedThemes.length} catégorie
          {selectedThemes.length >= 2 ? "s" : ""}
        </div>
      </button>

      {show && (
        <div className="border border-blue-300 border-t-0 w-2/3 flex flex-col items-center">
          {selectedThemes.map((theme, i) => (
            <div
              key={i}
              className={`${i !== 0 && "border-t"} w-full flex py-2`}
            >
              <div className="ml-8 w-full">
                {/* {theme.theme.split().map((lettre) => lettre)} */}
                {theme.label.split().map((lettre) => lettre)}
              </div>
              <input
                type="checkbox"
                checked
                onChange={() => handleCheck(theme)}
                className="mr-4"
              />
            </div>
          ))}
          {themes
            .filter((theme) => !theme.selected)
            .map((theme, i) => (
              <div
                key={i}
                className={`border-t w-full flex py-2 ${
                  selectedThemes.length === max && "bg-gray-100"
                }`}
              >
                <div className="ml-8 w-full">
                  {/* {theme.theme.split().map((lettre) => lettre)} */}
                  {theme.label.split().map((lettre) => lettre)}
                </div>
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => handleCheck(theme)}
                  className="mr-4"
                  disabled={selectedThemes.length === max}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
