"use client";

import { useMemo, useState, useEffect, useCallback } from "react";

import { getAllThemes } from "./gameActions";

import Modal from "@/components/Modal";

export default function PtitbacThemeOption({ setOptions, max, lastParams }) {
  const defaultThemes = useMemo(
    () => [
      { theme: "Animal", selected: true },
      { theme: "Pays/ville", selected: true },
      { theme: "Métier", selected: true },
      { theme: "Prénom", selected: true },
      { theme: "Sport/loisir", selected: true },
      { theme: "Végétal", selected: true },
    ],
    []
  );
  const [themes, setThemes] = useState([]);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [random, setRandom] = useState(0);
  const [allRandomLength, setAllRandomLength] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (!defaultThemes) return;
    const fetchThemes = async () => {
      const allThemes = await getAllThemes();

      const lastThemes = lastParams?.themes;
      const statusAllThemes = allThemes.map((theme) => ({
        theme,
        selected: lastThemes?.some((last) => last === theme) || false,
      }));
      const unselectedDefaults = lastThemes
        ? defaultThemes.map((def) => ({
            ...def,
            selected: lastThemes.some((last) => last === def.theme),
          }))
        : defaultThemes;

      setThemes(
        [...statusAllThemes, ...unselectedDefaults].sort((a, b) =>
          a.theme.localeCompare(b.theme)
        )
      );
      setAllRandomLength(statusAllThemes.length);
      lastParams && lastParams.random && setRandom(lastParams.random);
    };
    setTimeout(() => fetchThemes(), 1000); // tricky
  }, [defaultThemes, lastParams]);

  useEffect(() => {
    if (!themes || !setOptions) return;
    const newSelected = themes.filter((theme) => theme.selected);
    setSelectedThemes(
      newSelected.sort((a, b) => a.theme.localeCompare(b.theme))
    );
    setOptions((options) => ({
      ...options,
      themes: newSelected.map((sel) => sel.theme),
      allRandomLength,
    }));
  }, [themes, allRandomLength]);

  const closeModal = () => {
    setShowModal(false);
  };

  const handleCheck = useCallback(
    (theme) => {
      if (!theme.selected && selectedThemes.length + random === max) {
        setModalMessage("Nombre maximal de catégories atteint");
        return;
      }
      const themeIndex = themes.findIndex((th) => th.theme === theme.theme);
      const newTheme = {
        ...themes[themeIndex],
        selected: !themes[themeIndex].selected,
      };
      const newThemes = [...themes];
      newThemes[themeIndex] = newTheme;
      setThemes(newThemes.sort((a, b) => a.theme.localeCompare(b.theme)));
      setModalMessage("");
    },
    [max, selectedThemes, themes, random]
  );

  useEffect(() => {
    if (!setOptions) return;
    setOptions((options) => ({
      ...options,
      random,
    }));
  }, [random]);

  return (
    <div className="flex flex-col justify-center items-center mb-4">
      <button
        onClick={() => setShowModal(true)}
        className="flex justify-center border border-blue-300 bg-blue-100 w-2/3"
      >
        <div className="">
          {selectedThemes.length} catégorie
          {selectedThemes.length >= 2 ? "s" : ""}
        </div>
      </button>

      <Modal isOpen={showModal} onClose={closeModal} message={modalMessage}>
        <div className="py-2">
          <div
            onClick={() => closeModal()}
            className="flex justify-center border border-blue-300 bg-blue-100 w-full py-1"
          >
            <button className="">
              {selectedThemes.length} catégorie
              {selectedThemes.length >= 2 ? "s" : ""}
            </button>
          </div>
          <div className="text-center">
            <div className="border border-blue-300 w-full flex flex-col items-center">
              <div className="columns-2 gap-0">
                {themes.map((theme, i) => {
                  const isSelected = selectedThemes.some(
                    (sel) => sel.theme === theme.theme
                  );
                  return (
                    <div
                      key={i}
                      className={`w-full flex items-center py-2 ${
                        selectedThemes.length + random === max &&
                        !isSelected &&
                        "bg-gray-100"
                      }`}
                    >
                      <div className="w-full">
                        {theme.theme.split().map((lettre) => lettre)}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheck(theme)}
                        className="mr-2"
                        disabled={
                          selectedThemes.length + random === max && !isSelected
                        }
                      />
                    </div>
                  );
                })}
              </div>

              <div className="font-semibold border-t-2 border-black w-full py-2 relative h-12">
                <div className="flex gap-2 absolute right-2 top-2">
                  <div className="mr-2">Aléatoires : {random}</div>
                  <button
                    onClick={() => {
                      setRandom((prevRan) => (prevRan !== 0 ? prevRan - 1 : 0));
                      setModalMessage("");
                    }}
                    className="border border-blue-300 bg-blue-100 w-6"
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      if (random + selectedThemes.length === max)
                        setModalMessage("Nombre maximal de catégories atteint");
                      else {
                        setRandom((prevRan) => prevRan + 1);
                        setModalMessage("");
                      }
                    }}
                    className="border border-blue-300 bg-blue-100 w-6"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center h-0">{modalMessage}</div>
        </div>
      </Modal>
    </div>
  );
}
