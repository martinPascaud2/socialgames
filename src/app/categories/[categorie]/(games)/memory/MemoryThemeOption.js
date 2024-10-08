"use client";

import { useState, useEffect, useCallback } from "react";
import compareState from "@/utils/compareState";

export default function MemoryThemeOption({
  isAdmin,
  setOptions,
  selectedThemes,
  setSelectedThemes,
  max,
  setServerMessage,
  lastParams,
}) {
  const [themes, setThemes] = useState([
    { theme: "ObjectBall", label: "Ballons", selected: true, enhanced: false },
    { theme: "AnimalDog", label: "Chiens", selected: true, enhanced: false },
    {
      theme: "ObjectAll",
      label: "Objets divers",
      selected: true,
      enhanced: false,
    },
  ]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!lastParams || !isAdmin) return;

    setThemes((prevThemes) => {
      const lastThemes = lastParams.themes;
      const newThemes = prevThemes.map((prevTheme) => {
        const lastTheme = lastThemes?.find(
          (lastTheme) => lastTheme.theme === prevTheme.theme
        );
        if (lastTheme) return lastTheme;
        else return { ...prevTheme, selected: false };
      });
      return compareState(prevThemes, newThemes);
    });
  }, [lastParams, isAdmin]);

  useEffect(() => {
    if (!themes || !setOptions || !isAdmin) return;

    const newSelected = themes.filter((theme) => theme.selected);
    setSelectedThemes((prevSelectedThemes) => {
      const newSelectedThemes = newSelected.sort((a, b) =>
        a.label.localeCompare(b.label)
      );
      return compareState(prevSelectedThemes, newSelectedThemes);
    });

    setOptions((prevOptions) => {
      const newOptions = {
        ...prevOptions,
        themes: newSelected,
      };
      return compareState(prevOptions, newOptions);
    });
  }, [themes, setOptions, isAdmin, setSelectedThemes]);

  const handleCheck = useCallback(
    (theme) => {
      if (!isAdmin) return;

      const themeIndex = themes.findIndex((th) => th.theme === theme.theme);
      const newTheme = {
        ...themes[themeIndex],
        selected: !themes[themeIndex].selected || !themes[themeIndex].enhanced,
        enhanced: themes[themeIndex].selected && !themes[themeIndex].enhanced,
      };
      const newThemes = [...themes];

      newThemes[themeIndex] = newTheme;
      setThemes(newThemes.sort((a, b) => a.label.localeCompare(b.label)));

      setServerMessage("");
    },
    [setServerMessage, themes, isAdmin]
  );

  return (
    <div className="flex flex-col justify-center items-center mb-4">
      <button
        onClick={() => setShow(!show)}
        className="flex justify-center border border-blue-400 bg-blue-100 w-4/5"
      >
        <div className="">
          {selectedThemes?.length} catégorie
          {selectedThemes?.length >= 2 ? "s" : ""}
        </div>
      </button>

      {show && (
        <div className="border border-blue-400 border-t-0 w-4/5 flex justify-center items-center px-2 bg-gray-500">
          {themes &&
            themes.map((theme, i) => {
              const selected =
                (isAdmin &&
                  selectedThemes.find((sel) => sel.theme === theme.theme)) ||
                (!isAdmin &&
                  selectedThemes.find((sel) => sel.theme === theme.theme));
              const isSelected = !!selected;
              const isEnhanced = selected?.enhanced;

              return (
                <div
                  key={i}
                  className={`m-1 p-0.5 flex justify-center ${
                    isSelected &&
                    "bg-white shadow-[inset_0_0_0_1px_black] bg-white"
                  }`}
                >
                  <div
                    onClick={() => handleCheck(theme)}
                    className={`w-full flex text-center m-1 p-1 ${
                      isEnhanced && "bg-white shadow-[inset_0_0_0_1px_black]"
                    } ${selectedThemes.length === max && "bg-gray-100"}`}
                  >
                    <div
                      className={`w-full p-0.5 ${
                        !isSelected ? "text-white" : "text-black"
                      }`}
                    >
                      {theme.label}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
