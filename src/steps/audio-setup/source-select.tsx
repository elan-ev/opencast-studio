import { useTranslation } from "react-i18next";
import { SourceOptionButton } from "../../ui/SourceOptionButton";
import { FiMic, FiMicOff } from "react-icons/fi";
import { SHORTCUTS, useShowAvailableShortcuts } from "../../shortcuts";
import { screenWidthAtMost } from "@opencast/appkit";
import { BREAKPOINTS } from "../../util";
import { useHotkeys } from "react-hotkeys-hook";


/** The two large option buttons for "no audio" and "Microphone". */
export const SourceSelection = ({ selectNoAudio, selectMicrophone }) => {
  const { t } = useTranslation();
  const showShortcuts = useShowAvailableShortcuts();
  useHotkeys(SHORTCUTS.audioSetup.withAudio, selectMicrophone);
  useHotkeys(SHORTCUTS.audioSetup.withoutAudio, selectNoAudio);

  return (
    <div
      css={{
        display: "flex",
        gap: 24,
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
        flex: "1",
        [screenWidthAtMost(BREAKPOINTS.medium)]: {
          flexDirection: "column",
        },
      }}
    >
      <SourceOptionButton
        icon={<FiMic />}
        label={t("sources-audio-microphone")}
        onClick={selectMicrophone}
        shortcut={showShortcuts ? SHORTCUTS.audioSetup.withAudio : undefined}
      />
      <SourceOptionButton
        icon={<FiMicOff />}
        label={t("sources-audio-without-audio")}
        onClick={selectNoAudio}
        shortcut={showShortcuts ? SHORTCUTS.audioSetup.withoutAudio : undefined}
      />
    </div>
  );
};
