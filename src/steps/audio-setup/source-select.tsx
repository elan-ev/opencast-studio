import { useTranslation } from "react-i18next";
import { FiMic, FiMicOff } from "react-icons/fi";
import { screenWidthAtMost } from "@opencast/appkit";

import { SourceOptionButton } from "../../ui/SourceOptionButton";
import { SHORTCUTS, useShortcut, useShowAvailableShortcuts } from "../../shortcuts";
import { BREAKPOINTS } from "../../util";


type Props = {
  selectNoAudio: () => void;
  selectMicrophone: () => void;
};

/** The two large option buttons for "no audio" and "Microphone". */
export const SourceSelection: React.FC<Props> = ({ selectNoAudio, selectMicrophone }) => {
  const { t } = useTranslation();
  const showShortcuts = useShowAvailableShortcuts();
  useShortcut(SHORTCUTS.audioSetup.withAudio, selectMicrophone);
  useShortcut(SHORTCUTS.audioSetup.withoutAudio, selectNoAudio);

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
        label={t("steps.audio.microphone")}
        onClick={selectMicrophone}
        shortcut={showShortcuts ? SHORTCUTS.audioSetup.withAudio : undefined}
      />
      <SourceOptionButton
        icon={<FiMicOff />}
        label={t("steps.audio.without-audio")}
        onClick={selectNoAudio}
        shortcut={showShortcuts ? SHORTCUTS.audioSetup.withoutAudio : undefined}
      />
    </div>
  );
};
