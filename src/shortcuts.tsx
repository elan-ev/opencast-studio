import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { screenWidthAtMost, useColorScheme } from "@opencast/appkit";

import { COLORS } from "./util";


export const SHORTCUTS = {
  general: {
    showAvailableShortcuts: "Alt",
    showOverview: "?",
    closeOverlay: "Escape",
    tab: "Tab",
  },
  videoSetup: {
    selectScreen: "1",
    selectBoth: "2",
    selectUser: "3",
  },
  audioSetup: {
    withAudio: "1",
    withoutAudio: "2",
  },
} as const;

const SHORTCUT_TRANSLATIONS = {
  general: {
    showAvailableShortcuts: "shortcuts.show-available-shortcuts",
    showOverview: "shortcuts.show-overview",
    closeOverlay: "shortcuts.close-overlay",
    tab: "shortcuts.tab-elements",
  },
  videoSetup: {
    selectScreen: "shortcuts.select-display",
    selectBoth: "shortcuts.select-both",
    selectUser: "shortcuts.select-camera",
  },
  audioSetup: {
    withAudio: "shortcuts.select-microphone",
    withoutAudio: "shortcuts.select-no-audio",
  },
} as const;

const KEY_TRANSLATIONS = {
  "Escape": "escape",
  "Control": "control",
  "Space": "space",
  "ArrowRight": "right",
  "ArrowLeft": "left",
  "Shift": "shift",
} as const;

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
  const { t } = useTranslation();
  return <>
    {shortcut.split("+").map((key, i) => {
      let s = key;
      if (key in KEY_TRANSLATIONS) {
        const translationKey = KEY_TRANSLATIONS[key] as typeof KEY_TRANSLATIONS[keyof typeof KEY_TRANSLATIONS];
        s = t(`shortcuts.keys.${translationKey}`);
      }
      return <SingleKey large={large} key={i}>{s}</SingleKey>;
    })}
  </>;
};

type SingleKeyProps = React.PropsWithChildren<{
  large: boolean;
}>;

const SingleKey: React.FC<SingleKeyProps> = ({ large, children }) => (
  <div css={{
    border: `1px solid ${COLORS.neutral50}`,
    borderRadius: 4,
    padding: "2px 6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: large ? 36 : 30,
    minWidth: large ? 36 : 30,
    fontSize: 16,
    boxShadow: "0 0 8px var(--shadow-color)",
    backgroundColor: COLORS.neutral10,
    color: COLORS.neutral80,
    cursor: "default",
  }}>
    {children}
  </div>
);

export const ShortcutOverview: React.FC = () => {
  const { t } = useTranslation();

  return <>
    <h1>{t("shortcuts.label")}</h1>
    {Object.entries(SHORTCUTS).map(([groupId, group]) => (
      <ShortcutGroupOverview
        key={groupId}
        groupId={groupId as keyof typeof SHORTCUTS}
        group={group}
      />
    ))}
  </>;
};


const GROUP_ID_TRANSLATIONS = {
  general: "shortcuts.general",
  videoSetup: "steps.video.label",
  audioSetup: "steps.audio.label",
} as const satisfies Record<keyof typeof SHORTCUTS, string>;

type ShortcutGroupOverviewProps = {
  groupId: keyof typeof SHORTCUTS;
  group: typeof SHORTCUTS[keyof typeof SHORTCUTS],
};

const ShortcutGroupOverview: React.FC<ShortcutGroupOverviewProps> = ({ groupId, group }) => {
  const { t } = useTranslation();
  const isLight = useColorScheme().scheme === "light";

  return (
    <section css={{ margin: "24px 0" }}>
      <h2 css={{ fontSize: 18 }}>{t(GROUP_ID_TRANSLATIONS[groupId])}</h2>
      <div css={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
      }}>
        {Object.entries(group).map(([name, keys], i) => (
          <div
            key={i}
            css={{
              minWidth: 210,
              width: "calc(33.33% - 12px)",
              [screenWidthAtMost(860)]: {
                width: "calc(50% - 6px)",
              },
              [screenWidthAtMost(600)]: {
                width: "100%",
              },
              border: `1px dashed ${isLight ? COLORS.neutral15 : COLORS.neutral25}`,
              borderRadius: 4,
              padding: "6px 8px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div css={{ flex: "1" }}>{t(SHORTCUT_TRANSLATIONS[groupId][name])}</div>
            <div>
              <ShortcutKeys shortcut={keys} large />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
