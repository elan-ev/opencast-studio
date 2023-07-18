import { useEffect, useState } from "react";
import { COLORS } from "./util";


export const SHORTCUTS = {
  general: {
    showAvailableShortcuts: "Alt",
  },
  videoSetup: {
    selectScreen: "1",
    selectBoth: "2",
    selectUser: "3",
  },
};

/**
 * Helper to show an overlay of active shortcuts when Alt is pressed. Returns
 * `true` if the overlay should be shown.
 */
export const useShowAvailableShortcuts = () => {
  const [active, setActive] = useState(false);
  const enable = (event: KeyboardEvent) => {
    if (event.key === SHORTCUTS.general.showAvailableShortcuts) {
      setActive(true);
    }
  };
  const disable = (event: KeyboardEvent) => {
    if (event.key === SHORTCUTS.general.showAvailableShortcuts) {
      setActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", enable);
    document.addEventListener("keyup", disable);
    return () => {
      document.removeEventListener("keydown", enable);
      document.removeEventListener("keyup", disable);
    };
  });

  return active;
};

type ShortcutKeysProps = {
  shortcut: string;
  large?: boolean;
};

export const ShortcutKeys: React.FC<ShortcutKeysProps> = ({ shortcut, large = false }) => {
  return <>
    {shortcut.split("+").map((key, i) => <SingleKey large={large} key={i}>{key}</SingleKey>)}
  </>;
};

type SingleKeyProps = React.PropsWithChildren<{
  large: boolean;
}>;

const SingleKey: React.FC<SingleKeyProps> = ({ large, children }) => (
  <div css={{
    border: `1px solid ${COLORS.neutral50}`,
    borderRadius: 4,
    padding: "2px 8px",
    height: large ? 40 : 30,
    minWidth: large ? 40 : 30,
    fontSize: large ? 18 : 16,
    boxShadow: "0 0 8px var(--shadow-color)",
    backgroundColor: COLORS.neutral10,
    color: COLORS.neutral80,
  }}>
    {children}
  </div>
);
