import React from "react";
import { useTranslation } from "react-i18next";
import { ProtoButton, WithTooltip } from "@opencast/appkit";
import { FiPause, FiPlay } from "react-icons/fi";

import { useStudioState, useDispatch, Dispatcher } from "../../studio-state";
import { useSettings } from "../../settings";
import CutHereIcon from "./cut-here-icon.svg";
import { COLORS } from "../../util";
import { ALMOST_ZERO } from ".";
import { PreviewHandle } from "./preview";
import { SHORTCUTS, ShortcutKeys, useShortcut, useShowAvailableShortcuts } from "../../shortcuts";


type SharedProps = {
  previewController: React.RefObject<PreviewHandle>;
  currentTime: number;
};

export const ControlBox: React.FC<SharedProps> = ({ previewController, currentTime }) => {
  const { t, i18n } = useTranslation();
  const duration = previewController.current?.duration;

  return (
    <div css={{
      backgroundColor: COLORS.neutral05,
      borderRadius: 8,
      padding: 16,
      boxShadow: "0 4px 4px var(--shadow-color)",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <Controls {...{ previewController, currentTime }} />
      <div css={{ textAlign: "center", color: COLORS.neutral70 }}>
        {t("review-player-progress", {
          currentTime: formatTime(currentTime, duration, i18n.language),
          duration: formatTime(duration, duration, i18n.language),
        })}
      </div>
      <Scrubber {...{ previewController, currentTime }} />
    </div>
  );
};

const formatTime = (
  seconds: number | undefined,
  totalDuration: number | undefined,
  lang: string,
): string => {
  const MINUTE = 60;
  const HOUR = 60 * MINUTE;

  if (seconds === undefined) {
    return "--:--";
  }

  const secondsPart = seconds % 60;
  const minutesPart = Math.floor(seconds / MINUTE) % 60;
  const hoursPart = Math.floor(seconds / HOUR);

  const secondsFormatted = secondsPart.toLocaleString(lang, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const lowerPart = `${minutesPart <= 9 ? "0" : ""}${minutesPart}`
    + `:${secondsPart <= 9 ? "0" : ""}${secondsFormatted}`;

  return (totalDuration && totalDuration >= HOUR)
    ? `${hoursPart}:${lowerPart}`
    : lowerPart;
};

const Scrubber: React.FC<SharedProps> = ({ previewController, currentTime }) => {
  const duration = previewController.current?.duration || Infinity;
  const { start, end } = useStudioState();

  const setTime = mouseEvent => {
    const rect = mouseEvent.target.getBoundingClientRect();
    const x = mouseEvent.clientX - rect.x;
    let progress = x / rect.width;
    if (progress < 0) {
      progress = 0;
    } else if (progress > 1) {
      progress = 1;
    }

    if (previewController.current) {
      previewController.current.currentTime = progress * duration;
    }
  };

  const cutStyle = {
    position: "absolute",
    backgroundColor: COLORS.neutral30,
    height: "100%",
    boxSizing: "content-box",
  } as const;

  return (
    <div css={{ padding: 4 }}>
      <div css={{ padding: "2px 0", position: "relative" }}>
        <div
          onClick={e => setTime(e)}
          onMouseMove={e => {
            // Ignore unless only the primary button is pressed (`buttons` is a
            // bitset).
            if (e.buttons === 1) {
              // TODO: maybe debounce this? Browsers seem to somewhat debounce
              // that already.
              setTime(e);
            }
          }}
          css={{
            position: "absolute",
            width: "100%",
            height: "100%",
            cursor: "pointer",
            top: 0,
            zIndex: 10,
          }}
        />
        <div css={{
          position: "relative",
          backgroundColor: "#6bc295",
          height: "12px",
          width: "100%",
          borderRadius: "6px",
          overflow: "hidden",
          "@media not (any-pointer: fine)": {
            height: "20px",
            borderRadius: "10px",
          },
        }}>
          { (start != null && start > 0) && <div css={{
            left: 0,
            borderRight: "2px solid black",
            width: `${(start / duration) * 100}%`,
            ...cutStyle,
          }} /> }
          { (end != null && end < duration) && <div css={{
            right: 0,
            borderLeft: "2px solid black",
            width: `${((duration - end) / duration) * 100}%`,
            ...cutStyle,
          }} /> }
          <div css={{
            position: "absolute",
            left: 0,
            width: `${(currentTime / duration) * 100}%`,
            backgroundColor: "black",
            height: "100%",
            opacity: 0.3,
          }} />
        </div>
      </div>
    </div>
  );
};

const Controls: React.FC<SharedProps> = ({ currentTime, previewController }) => {
  const { start, end } = useStudioState();
  const recordingDispatch = useDispatch();
  const settings = useSettings();
  const { t } = useTranslation();

  const togglePlayPause = () => {
    const controller = previewController.current;
    if (controller) {
      if (controller.isPlaying) {
        controller.pause();
      } else if (controller.isReadyToPlay) {
        controller.play();
      }
    }
  };

  useShortcut(SHORTCUTS.review.playPause, togglePlayPause, {
    ignoreEventWhen: e => e.target instanceof HTMLButtonElement,
  });
  const showShortcuts = useShowAvailableShortcuts();

  const isPlaying = previewController.current?.isPlaying;
  return (
    <div css={{
      display: "flex",
      gap: 16,
      justifyContent: "center",
      alignItems: "flex-end",
    }}>
      {/* Cut start */}
      {settings.review?.disableCutting || <CutControls
        marker="start"
        value={start}
        control={end}
        invariant={(start, end) => start < end}
        {...{ recordingDispatch, previewController, currentTime }}
      />}

      {/* Play/pause button */}
      <WithTooltip tooltip={isPlaying ? t("review-pause") : t("review-play")}>
        <ProtoButton
          css={{
            backgroundColor: "#3073B8", // TODO
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 24,
            "&:hover": {
              backgroundColor: "#215D99", // TODO
            },
          }}
          onClick={togglePlayPause}
          onMouseDown={e => e.preventDefault()}
        >
          {showShortcuts && (
            <div css={{
              position: "absolute",
              bottom: -20,
              padding: 2,
              borderRadius: 4,
              backgroundColor: COLORS.neutral05,
            }}><ShortcutKeys shortcut={SHORTCUTS.review.playPause.split(";")[0]} /></div>
          )}
          {isPlaying ? <FiPause /> : <FiPlay css={{ marginLeft: 3 }} />}
        </ProtoButton>
      </WithTooltip>

      {/* Cut end */}
      {settings.review?.disableCutting || <CutControls
        marker="end"
        value={end}
        control={start}
        invariant={(end, start) => start < end}
        {...{ recordingDispatch, previewController, currentTime }}
      />}
    </div>
  );
};

type CutControlsProps = SharedProps & {
  marker: "start" | "end",
  value: number | null,
  control: number | null,
  invariant: (self: number, control: number) => boolean;
  recordingDispatch: Dispatcher,
};

const CutControls: React.FC<CutControlsProps> = (
  { marker, value, control, invariant, currentTime, previewController, recordingDispatch }
) => {
  const { t, i18n } = useTranslation();


  const disabled = currentTime <= ALMOST_ZERO
    || (previewController.current && currentTime >= previewController.current.duration)
    || (control != null && !invariant(currentTime, control));

  const cut = () => {
    if (!previewController.current) {
      return;
    }

    let value = previewController.current.currentTime;
    // We disable the buttons when the generated values would be invalid,
    // but we rely on `timeupdate` events for that, which are not guaranteed
    // to be timely, so we still have to check the invariant when actually
    // updating the state. Here we decided to just clamp the value appropriately.
    if (control != null && !invariant(value, control)) {
      value = control;
    }
    recordingDispatch({
      type: marker === "start" ? "UPDATE_START" : "UPDATE_END",
      time: value,
    });
  };

  const shortcut = SHORTCUTS.review[marker === "start" ? "cutLeft" : "cutRight"];
  useShortcut(shortcut, cut, { enabled: !disabled });
  useShortcut(
    SHORTCUTS.review[marker === "start" ? "removeCutLeft" : "removeCutRight"],
    () => recordingDispatch({
      type: marker === "start" ? "UPDATE_START" : "UPDATE_END",
      time: null,
    }),
  );
  const showShortcuts = useShowAvailableShortcuts();

  const timestamp = (
    <div css={{ minWidth: 68, textAlign: marker == "start" ? "right" : "left" }}>
      { value !== null && (
        <WithTooltip tooltip={t("steps.review.jump-to-cut-point")}>
          <ProtoButton
            css={{
              padding: "4px 0",
              color: "#3E8AD8", // TODO
            }}
            onClick={event => {
              event.preventDefault();
              if (previewController.current) {
                previewController.current.currentTime = value;
              }
            }}
            onMouseDown={e => e.preventDefault()}
          >
            {formatTime(value, value, i18n.language)}
          </ProtoButton>
        </WithTooltip>
      )}
    </div>
  );

  const cutButton = (
    <WithTooltip tooltip={t(`review-set-${marker}`)}>
      <ProtoButton
        {...{ disabled }}
        onClick={cut}
        onMouseDown={e => e.preventDefault()}
        css={{
          lineHeight: 0,
          padding: "4px 8px",
          paddingTop: 4,
          borderRadius: 4,
          "&:disabled": {
            opacity: 0.3,
          },
          "&:not(:disabled):hover": {
            backgroundColor: COLORS.neutral10,
          },
        }}
      >
        <CutHereIcon css={{
          height: 36,
          width: 36,
          transform: marker === "end" ? "scaleX(-1)" : "",
        }} />
        {showShortcuts && !disabled && (
          <div css={{
            position: "absolute",
            bottom: -20,
            padding: 2,
            borderRadius: 4,
            backgroundColor: COLORS.neutral05,
          }}><ShortcutKeys shortcut={shortcut} /></div>
        )}
      </ProtoButton>
    </WithTooltip>
  );

  return marker === "start"
    ? <>{timestamp}{cutButton}</>
    : <>{cutButton}{timestamp}</>;
};
