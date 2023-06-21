import React, { useContext, useState } from "react";
import { bug } from "./util/err";


/** All colors used throughout Opencast Studio. */
export const COLORS = {
  neutral0: "var(--color-neutral0)",
  neutral1: "var(--color-neutral1)",
  neutral2: "var(--color-neutral2)",
  neutral3: "var(--color-neutral3)",
  neutral4: "var(--color-neutral4)",
  neutral5: "var(--color-neutral5)",
  neutral6: "var(--color-neutral6)",
  neutral7: "var(--color-neutral7)",
  neutral8: "var(--color-neutral8)",
  neutral9: "var(--color-neutral9)",
};


// ----- Color scheme context ------------------------------------------------------------

type ColorScheme = {
  scheme: "light" | "dark";
  isAuto: boolean;
  update: (pref: "light" | "dark" | "auto") => void;
};

const LOCAL_STORAGE_KEY = "ocStudioColorScheme";

const ColorSchemeContext = React.createContext<ColorScheme | null>(null);

/** Returns current information about the color scheme and a way to change it. */
export const useColorScheme = (): ColorScheme => useContext(ColorSchemeContext)
  ?? bug("missing color scheme context provider");

export const ColorSchemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Retrieve the scheme that was selected when the page was loaded. This is
  // set inside `index.html`.
  const initialScheme = document.documentElement.dataset.colorScheme === "dark"
    ? "dark" as const
    : "light" as const;
  const [scheme, setScheme] = useState(initialScheme);

  // Next, check whether there are some preferences stored in local storage.
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  const [isAuto, setIsAuto] = useState(stored !== "dark" && stored !== "light");

  const context: ColorScheme = {
    scheme,
    isAuto,
    update: pref => {
      // Update preference in local storage
      window.localStorage.setItem(LOCAL_STORAGE_KEY, pref);

      // Update the two states `isAuto` and `scheme` (for other JS code),
      // but also the attribute on `<html>` (for CSS code).
      setIsAuto(pref === "auto");
      const scheme = (pref === "dark" || pref === "light")
        ? pref
        : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      setScheme(scheme);
      document.documentElement.dataset.colorScheme = scheme;
    },
  };

  return (
    <ColorSchemeContext.Provider value={context}>
      {children}
    </ColorSchemeContext.Provider>
  );
};
