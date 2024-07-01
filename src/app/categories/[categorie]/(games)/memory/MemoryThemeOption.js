"use client";

import { useState, useEffect, useCallback } from "react";

export default function MemoryThemeOption({
  setOptions,
  selectedThemes,
  setSelectedThemes,
  max,
  setServerMessage,
  lastParams,
}) {
  const [themes, setThemes] = useState([
    { theme: "ObjectBall", label: "Ballons", selected: true },
    { theme: "AnimalDog", label: "Chiens", selected: true },
    { theme: "ObjectAll", label: "Objets divers", selected: true },
  ]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!lastParams) return;

    setThemes((prevThemes) => {
      const lastThemes = lastParams.themes;
      const newThemes = prevThemes.map((theme) => {
        if (lastThemes.some((lastTheme) => lastTheme === theme.theme)) {
          return theme;
        } else {
          return { ...theme, selected: false };
        }
      });
      const themesChanged =
        JSON.stringify(prevThemes) !== JSON.stringify(newThemes);
      return themesChanged ? newThemes : prevThemes;
    });
  }, [lastParams]);

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
      const newThemes = [...themes];

      newThemes[themeIndex] = newTheme;
      setThemes(newThemes.sort((a, b) => a.label.localeCompare(b.label)));

      setServerMessage("");
    },
    [setServerMessage, themes]
  );

  return (
    <div className="flex flex-col justify-center items-center mb-4">
      <button
        onClick={() => setShow(!show)}
        className="flex justify-center border border-blue-300 bg-blue-100 w-4/5"
      >
        <div className="">
          {selectedThemes.length} catégorie
          {selectedThemes.length >= 2 ? "s" : ""}
        </div>
      </button>

      {show && (
        <div className="border border-blue-300 border-t-0 w-4/5 flex justify-center items-center px-2">
          {themes &&
            themes.map((theme, i) => {
              const isSelected = selectedThemes.some(
                (sel) => sel.theme === theme.theme
              );
              return (
                <div
                  key={i}
                  className={`w-full flex ml-2 py-2 ${
                    selectedThemes.length === max && "bg-gray-100"
                  }`}
                >
                  <div className="w-full">
                    {theme.label.split().map((lettre) => lettre)}
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheck(theme)}
                    className="mr-2"
                    disabled={selectedThemes.length === max && !isSelected}
                  />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
