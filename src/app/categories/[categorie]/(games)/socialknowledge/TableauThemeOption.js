"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

import Modal from "@/components/Modal";

export default function TableauThemeOption({
  isAdmin,
  options,
  setOptions,
  max,
  lastParams,
  setServerMessage,
}) {
  const defaultThemes = useMemo(
    () => [
      { theme: "Célébrité artistique", selected: false, enhanced: false },
      { theme: "Célébrité sportive", selected: false, enhanced: false },
      { theme: "Etudes", selected: false, enhanced: false },
      { theme: "Film", selected: false, enhanced: false },
      { theme: "Hobby 1", selected: false, enhanced: false },
      { theme: "Hobby 2", selected: false, enhanced: false },
      { theme: "Jeu de société", selected: false, enhanced: false },
      { theme: "Langue parlée", selected: false, enhanced: false },
      { theme: "Livre/manga", selected: false, enhanced: false },
      { theme: "Marque", selected: false, enhanced: false },
      { theme: "Métier", selected: false, enhanced: false },
      { theme: "Nourriture", selected: false, enhanced: false },
      { theme: "Parfum de glace", selected: false, enhanced: false },
      { theme: "Pays d'origine", selected: false, enhanced: false },
      { theme: "Série", selected: false, enhanced: false },
      { theme: "Signe astrologique", selected: false, enhanced: false },
      { theme: "Sport pratiqué", selected: false, enhanced: false },
      { theme: "Ville de naissance", selected: false, enhanced: false },
    ],
    []
  );

  const [themes, setThemes] = useState(
    options.themes || lastParams?.themes || defaultThemes
  );
  const [enhancedLength, setEnhancedLength] = useState();
  const [unenhancedLength, setUnenhancedLength] = useState();
  const [randoms, setRandoms] = useState(lastParams?.randoms || 0);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const getUnAndEnhancedLength = (themes) => {
    let unenhancedLength = 0;
    let enhancedLength = 0;
    themes?.forEach((theme) => {
      if (!theme.enhanced && theme.selected) unenhancedLength++;
      else if (theme.selected) enhancedLength++;
    });
    return { unenhancedLength, enhancedLength };
  };

  useEffect(() => {
    const { enhancedLength: enhanced, unenhancedLength: unenhanced } =
      getUnAndEnhancedLength(themes);
    setEnhancedLength(enhanced);
    setUnenhancedLength(unenhanced);
  }, [themes]);

  useEffect(() => {
    if (!themes || !setOptions || !isAdmin) return;
    setOptions((prevOptions) => ({ ...prevOptions, themes, randoms }));
  }, [themes, setOptions, isAdmin, randoms]);

  useEffect(() => {
    if (isAdmin) return;
    if (!options.themes) {
      setThemes(defaultThemes);
      return;
    }
    setThemes(options.themes);
    setRandoms(options.randoms);
  }, [options, isAdmin]);

  const closeModal = () => {
    setShowModal(false);
  };

  const handleCheck = useCallback(
    (theme) => {
      if (!isAdmin) return;

      const themeIndex = themes.findIndex((th) => th.theme === theme.theme);
      let isSelected =
        !themes[themeIndex].selected || !themes[themeIndex].enhanced;
      let isEnhanced =
        themes[themeIndex].selected && !themes[themeIndex].enhanced;
      let lowerRandoms = false;
      if (isEnhanced && enhancedLength + randoms >= max) {
        if (randoms === 0) {
          isSelected = false;
          isEnhanced = false;
        } else {
          lowerRandoms = true;
        }
      }

      const newTheme = {
        ...themes[themeIndex],
        selected: isSelected,
        enhanced: isEnhanced,
      };
      const newThemes = [...themes];
      newThemes[themeIndex] = newTheme;
      setThemes(newThemes);

      const { enhancedLength: enhanced, unenhancedLength: unenhanced } =
        getUnAndEnhancedLength(newThemes);
      setEnhancedLength(enhanced);
      setUnenhancedLength(unenhanced);

      if (isSelected && !isEnhanced)
        setRandoms((prevRan) => {
          if (prevRan + 1 + enhanced > max || prevRan + 1 === unenhanced)
            return prevRan;
          return prevRan + 1;
        });
      else
        setRandoms((prevRan) => {
          if (unenhanced === 0) return 0;
          else if (unenhanced <= prevRan) return unenhanced - 1;
          else if (lowerRandoms) return prevRan - 1;
          else return prevRan;
        });

      setServerMessage("");
      setModalMessage("");
    },
    [max, themes, randoms, isAdmin, setServerMessage]
  );

  return (
    <div className="flex flex-col justify-center items-center my-4">
      <button
        onClick={() => setShowModal(true)}
        className="flex justify-center border border-gray-950 text-gray-950 bg-blue-100 w-2/3"
      >
        {enhancedLength + randoms} catégorie
        {enhancedLength + randoms >= 2 ? "s" : ""}
      </button>

      <Modal isOpen={showModal} onClose={closeModal} message={modalMessage}>
        <div className="py-2 bg-gray-100">
          <div
            onClick={() => closeModal()}
            className="flex justify-center border border-2 border-b-0 border-gray-950 bg-gray-100 w-full py-1 rounded-t-lg"
          >
            <button className="font-semibold text-gray-950">
              {enhancedLength + randoms} catégorie
              {enhancedLength + randoms >= 2 ? "s" : ""}
            </button>
          </div>

          <div className="text-center bg-gray-100">
            <div className="border border-2 border-gray-950 w-full flex flex-col items-center rounded-b-lg">
              <div className="columns-2 gap-2 bg-[#848b98] (gray-450)">
                {themes?.map((theme, i) => {
                  const isSelected = theme.selected;
                  const isEnhanced = theme.enhanced;

                  return (
                    <div key={i} className="p-2">
                      <div
                        className={`w-full flex items-center p-0 rounded-full ${
                          !isSelected && "text-gray-100"
                        } ${
                          isEnhanced && "bg-green-700 text-gray-950 bg-gray-100"
                        }
                      `}
                      >
                        <div
                          className={`w-full flex justify-center p-[3px] ${
                            isSelected && !isEnhanced && "text-green-600"
                          } ${isEnhanced && "text-green-700"}`}
                        >
                          <div
                            onClick={() => {
                              handleCheck(theme);
                            }}
                            className={`w-full p-1.5 ${
                              isSelected &&
                              "bg-gray-100 shadow-[inset_0_0_0_2px_#16a34a] (green 600) rounded-full"
                            }`}
                          >
                            {theme.theme}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="font-semibold border-t-2 border-black w-full py-2 relative h-12 text-sm flex items-center bg-gray-100 rounded-b-lg">
                <div className="flex absolute left-2 items-center h-full">
                  Constants : {enhancedLength}
                </div>
                <div className="flex gap-2 absolute right-2 items-center h-full">
                  <div className="text-gray-950">
                    Aléatoires : {randoms} parmi {unenhancedLength}
                  </div>
                  <button
                    onClick={() => {
                      setRandoms((prevRan) =>
                        prevRan !== 0 ? prevRan - 1 : 0
                      );
                      setModalMessage("");
                      setServerMessage("");
                    }}
                    className={`border border-gray-950 bg-blue-100 w-6 ${
                      !isAdmin ? "hidden" : ""
                    }`}
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      if (randoms + enhancedLength === max)
                        setModalMessage("Nombre maximal de catégories atteint");
                      else {
                        setRandoms((prevRan) =>
                          prevRan + 2 > unenhancedLength ? prevRan : prevRan + 1
                        );
                        setModalMessage("");
                        setServerMessage("");
                      }
                    }}
                    className={`border border-gray-950 bg-blue-100 w-6 ${
                      !isAdmin ? "hidden" : ""
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
