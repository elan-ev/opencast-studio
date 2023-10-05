import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { match, screenWidthAtMost, useColorScheme } from "@opencast/appkit";
import { LuArrowBigUp, LuOption } from "react-icons/lu";
import { FiArrowLeft, FiArrowRight, FiCommand } from "react-icons/fi";
import { Options, useHotkeys } from "react-hotkeys-hook";

import { COLORS } from "./util";
import { OverlayBox } from "./layout";


const onMac = () => navigator.userAgent.includes("Mac");

export const SHORTCUTS = {
  general: {
    showAvailableShortcuts: "Alt; s",
    showOverview: "?",
    closeOverlay: "Escape",
    tab: "Tab",
    prev: onMac() ? "Shift+Mod+left" : "Mod+left",
    next: onMac() ? "Shift+Mod+right" : "Mod+right",
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
  recording: {
    startPauseResume: "k; Space",
  },
  review: {
    playPause: "k; Space",
    forwards5secs: "l; right",
    backwards5secs: "j; left",
    forwardsFrame: ".",
    backwardsFrame: ",",
    cutLeft: "n",
    cutRight: "m",
    removeCutLeft: "Shift+n",
    removeCutRight: "Shift+m",
  },
  finish: {
    startNewRecording: "Shift+n",
    download: "d",
  },
} as const;

const SHORTCUT_TRANSLATIONS = {
  general: {
    showAvailableShortcuts: "shortcuts.show-available-shortcuts",
    showOverview: "shortcuts.show-overview",
    closeOverlay: "shortcuts.close-overlay",
    tab: "shortcuts.tab-elements",
    prev: "shortcuts.back-button",
    next: "shortcuts.next-button",
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
  recording: {
    startPauseResume: "shortcuts.start-pause-resume-recording",
  },
  review: {
    playPause: "shortcuts.review.play-pause",
    forwards5secs: "shortcuts.review.skip-five",
    backwards5secs: "shortcuts.review.back-five",
    forwardsFrame: "shortcuts.review.frame-forward",
    backwardsFrame: "shortcuts.review.frame-back",
    cutLeft: "shortcuts.review.cut-left",
    cutRight: "shortcuts.review.cut-right",
    removeCutLeft: "shortcuts.review.delete-left",
    removeCutRight: "shortcuts.review.delete-right",
  },
  finish: {
    startNewRecording: "shortcuts.finish.new-recording",
    download: "steps.finish.save-locally",
  },
} as const;

const KEY_TRANSLATIONS = {
  "Escape": "escape",
  "Space": "space",
  "Shift": "shift",
  "Alt": onMac() ? "option" : "alt",
  "Mod": onMac() ? "command" : "control",
} as const;


/** Like `useHotkeys` but with pre-set options. */
export const useShortcut = (
  keys: string,
  callback: () => void,
  options: Omit<Options, "splitKey"> = {},
  deps: unknown[] = [],
) => {
  return useHotkeys(keys, callback, { splitKey: ";", ...options }, deps);
};

/**
 * Helper to show an overlay of active shortcuts when Alt is pressed. Returns
 * `true` if the overlay should be shown.
 */
export const useShowAvailableShortcuts = () => {
  const [active, setActive] = useState(false);
  const enable = (event: KeyboardEvent) => {
    const correctKeyPressed = SHORTCUTS.general.showAvailableShortcuts.split(";")
      .some(s => s.trim().toLowerCase() == event.key.toLowerCase());
    if (correctKeyPressed) {
      setActive(true);
    }
  };
  const disable = () => setActive(false);

  useEffect(() => {
    document.addEventListener("keydown", enable);
    document.addEventListener("keyup", disable);
    document.addEventListener("mousedown", disable);
    window.addEventListener("blur", disable);
    return () => {
      document.removeEventListener("keydown", enable);
      document.removeEventListener("keyup", disable);
      document.removeEventListener("mousedown", disable);
      window.removeEventListener("blur", disable);
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
  return <div css={{ display: "flex", alignItems: "center", gap: 4, color: COLORS.neutral70 }}>
    {shortcut.split("+").map((key, i) => {
      let s = key;
      if (key in KEY_TRANSLATIONS) {
        const translationKey = KEY_TRANSLATIONS[key as keyof typeof KEY_TRANSLATIONS];
        s = t(`shortcuts.keys.${translationKey}`);
      }
      const child = match<string, JSX.Element>(key, {
        "left": () => <FiArrowLeft title={s} />,
        "right": () => <FiArrowRight title={s} />,
        "Mod": () => onMac() ? <FiCommand title={s} /> : <>{s}</>,
        "Alt": () => onMac() ? <LuOption title={s} /> : <>{s}</>,
        "Shift": () => <LuArrowBigUp size={20} title={s} />,
      }, () => <>{s}</>);
      return (
        <React.Fragment key={i}>
          {i !== 0 && "+"}
          <SingleKey large={large} monofont={key === "l"}>{child}</SingleKey>
        </React.Fragment>
      );
    })}
  </div>;
};

type SingleKeyProps = React.PropsWithChildren<{
  large: boolean;
  /** Whether to use `monospace` font for this one. Basically only useful for lowercase l. */
  monofont: boolean;
}>;

const SingleKey: React.FC<SingleKeyProps> = ({ large, monofont, children }) => {
  const isLight = useColorScheme().scheme === "light";
  const { scheme, isHighContrast } = useColorScheme();

  const bg = match(scheme, {
    "light": () => COLORS.neutral05,
    "dark": () => COLORS.neutral15,
    "light-high-contrast": () => COLORS.neutral05,
    "dark-high-contrast": () => COLORS.neutral15,
  });

  return (
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
      boxShadow: isHighContrast ? "none" : "0 0 6px var(--shadow-color)",
      backgroundColor: large ? bg : COLORS.neutral10,
      color: isHighContrast
        ? COLORS.neutral80
        : ((isLight || !large) ? COLORS.neutral80 : COLORS.neutral90),
      cursor: "default",
      ...monofont && { fontFamily: "monospace" },
    }}>
      {children}
    </div>
  );
};

type ShortCutOverviewProps = {
  close: () => void;
};

export const ShortcutOverview: React.FC<ShortCutOverviewProps> = ({ close }) => {
  const { t } = useTranslation();

  return <OverlayBox maxWidth={1000} close={close} title={t("shortcuts.label")}>
    {Object.entries(SHORTCUTS).map(([groupId, group]) => (
      <ShortcutGroupOverview
        key={groupId}
        groupId={groupId as keyof typeof SHORTCUTS}
        group={group}
      />
    ))}
  </OverlayBox>;
};


const GROUP_ID_TRANSLATIONS = {
  general: "shortcuts.general",
  videoSetup: "steps.video.label",
  audioSetup: "steps.audio.label",
  recording: "steps.record.label",
  review: "steps.review.label",
  finish: "steps.finish.label",
} as const satisfies Record<keyof typeof SHORTCUTS, string>;

type ShortcutGroupOverviewProps = {
  groupId: keyof typeof SHORTCUTS;
  group: typeof SHORTCUTS[keyof typeof SHORTCUTS];
};

const ShortcutGroupOverview: React.FC<ShortcutGroupOverviewProps> = ({ groupId, group }) => {
  const { t } = useTranslation();

  return (
    <section css={{
      margin: "32px 0",
      ":first-of-type": {
        marginTop: 16,
      },
    }}>
      <h2 css={{ fontSize: 18, marginBottom: 8 }}>{t(GROUP_ID_TRANSLATIONS[groupId])}</h2>
      <div css={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
      }}>
        {Object.entries(group).map(([name, keys], i) => (
          <div
            key={i}
            css={{
              width: "calc(33.33% - 24px / 3)",
              [screenWidthAtMost(1080)]: {
                width: "calc(50% - 12px / 2)",
              },
              [screenWidthAtMost(720)]: {
                width: "100%",
              },
              backgroundColor: COLORS.neutral10,
              borderRadius: 4,
              padding: "10px 16px",
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "start",
              gap: 8,
            }}
          >
            <div css={{ overflowWrap: "anywhere" }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t((SHORTCUT_TRANSLATIONS[groupId] as any)[name])}
            </div>
            <div css={{
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}>
              {keys.split(";").map((combination, i) => <React.Fragment key={i}>
                {i > 0 && t("shortcuts.sequence-seperator")}
                <ShortcutKeys shortcut={combination.trim()} large />
              </React.Fragment>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
