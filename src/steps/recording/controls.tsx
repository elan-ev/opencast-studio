import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { WithTooltip, match, useColorScheme } from "@opencast/appkit";
import { FiPause, FiPlay } from "react-icons/fi";

import { RecordingState } from ".";
import { SHORTCUTS, ShortcutKeys, useShortcut, useShowAvailableShortcuts } from "../../shortcuts";
import { COLORS } from "../../util";




type Props = {
  recordingState: RecordingState;
  startRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
};

export const RecordingControls: React.FC<Props> = ({
  recordingState,
  startRecording,
  pauseRecording,
  resumeRecording,
}) => {
  const { t } = useTranslation();
  const isLight = useColorScheme().scheme === "light";
  const { isHighContrast } = useColorScheme();
  const fgColor = isLight ? COLORS.neutral05 : COLORS.neutral90;

  const showAvailableShortcuts = useShowAvailableShortcuts();
  useShortcut(SHORTCUTS.recording.startPauseResume, () => {
    match(recordingState, {
      "inactive": () => startRecording(),
      "paused": () => resumeRecording(),
      "recording": () => pauseRecording(),
    });
  }, {
    ignoreEventWhen: e => e.code === "Space" && e.target instanceof HTMLButtonElement,
  }, [recordingState]);
  const label = match(recordingState, {
    "inactive": () => t("steps.record.record-button-title"),
    "paused": () => t("steps.record.resume-button-title"),
    "recording": () => t("steps.record.pause-button-title"),
  });

  return (
    <div css={{
      margin: "0 auto",
      width: 180,
      height: 85,
      display: "flex",
      gap: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isLight ? COLORS.neutral70 : COLORS.neutral05,
      border: `1px solid ${isLight ? COLORS.neutral50 : COLORS.neutral25}`,
      boxShadow: isHighContrast ? "none" : "0 4px 16px rgba(0, 0, 0, 0.2)",
      borderRadius: 12,
      color: fgColor,
      ...isHighContrast && {
        backgroundColor: COLORS.neutral05,
        border: `2px solid ${COLORS.neutral25}`,
      },
    }}>
      <WithTooltip tooltip={label}>
        <button
          onClick={match(recordingState, {
            "inactive": () => startRecording,
            "paused": () => resumeRecording,
            "recording": () => pauseRecording,
          })}
          aria-label={label}
          aria-live="polite"
          css={{
            position: "relative",
            width: 50,
            height: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 28,
            padding: 0,

            boxShadow: isHighContrast ? "none" : "0 4px 4px rgba(0, 0, 0, 0.12)",
            cursor: "pointer",
            color: (isHighContrast || isLight) ? "white" : "#D6D6D6",
            borderRadius: "50%",
            backgroundColor: isLight ? "#E42D43" : "#b8012d",
            border: `${isHighContrast ? "2px" : "1px"} solid ${fgColor}`,
            ":hover, :focus-visible": {
              backgroundColor: isLight ? "#c40a31" : "#8f0121",
            },
            ":focus-visible": {
              outline: `4px solid ${fgColor}`,
            },
          }}
        >
          {match(recordingState, {
            "inactive": () => null,
            "paused": () => <FiPlay css={{ marginLeft: 4 }} />,
            "recording": () => <FiPause />,
          })}
          {showAvailableShortcuts && (
            <div css={{ position: "absolute", right: -4, bottom: -4 }}>
              <ShortcutKeys shortcut={SHORTCUTS.recording.startPauseResume.split(";")[0]} />
            </div>
          )}
        </button>
      </WithTooltip>
      <Timer isRecording={recordingState === "recording"} />
    </div>
  );
};


type TimerProps = {
  isRecording: boolean;
};

const Timer: React.FC<TimerProps> = ({ isRecording }) => {
  const [formatted, setFormatted] = useState("00:00");
  const millisPassed = useRef(0);

  useEffect(() => {
    let lastTick = new Date();
    const tick = () => {
      const newInstant = new Date();
      if (isRecording) {
        millisPassed.current += newInstant.valueOf() - lastTick.valueOf();

        const ms = millisPassed.current;
        let segments = [
          Math.floor(ms / (60 * 60 * 1000)),
          Math.floor(ms / (60 * 1000)) % 60,
          Math.floor(ms / 1000) % 60,
        ];
        if (segments[0] === 0) {
          segments = segments.slice(1);
        }
        setFormatted(segments.map(unit => (unit < 10 ? "0" : "") + unit).join(":"));
      }
      lastTick = newInstant;
    };
    const counterId = setInterval(tick, 100);
    return () => clearInterval(counterId);
  }, [isRecording]);




  return <div>{formatted}</div>;
};
