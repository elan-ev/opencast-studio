import React, { RefObject, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ProtoButton, WithTooltip, notNullish } from "@opencast/appkit";
import { FiPause, FiPlay } from "react-icons/fi";

import { useStudioState, useDispatch, Dispatcher } from "../../studio-state";
import { useSettings } from "../../settings";
import CutHereIcon from "./cut-here-icon.svg";
import CutMarkerIcon from "./cut-marker.svg";
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
  const dispatch = useDispatch();
  const { start, end } = useStudioState();
  const ref = useRef<HTMLDivElement>(null);

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

  const height = 6;
  const borderRadius = 3;

  const cutStyle = {
    position: "absolute",
    backgroundColor: COLORS.danger1,
    height: "100%",
    borderRadius,
    boxSizing: "content-box",
    background: "repeating-linear-gradient(45deg,"
      + `${COLORS.danger2}, ${COLORS.danger2} 4px,`
      + `${COLORS.danger1} 4px, ${COLORS.danger1} 8px)`,
  } as const;

  return (
    <div css={{ padding: 4 }}>
      <div ref={ref} css={{ padding: "2px 0", position: "relative" }}>
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
          backgroundColor: "#71B4F9", // TODO
          height,
          width: "100%",
          borderRadius,
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

          <Draggable
            scrubberRef={ref}
            previewController={previewController}
            initialTime={start ?? 0}
            onDrag={time => dispatch({ type: "UPDATE_START", time })}
          ><CutMarker side="left" /></Draggable>
          <Draggable
            scrubberRef={ref}
            previewController={previewController}
            initialTime={end ?? duration}
            onDrag={time => dispatch({ type: "UPDATE_END", time })}
          ><CutMarker side="right" /></Draggable>

          <div css={{
            position: "absolute",
            left: 0,
            width: `${(currentTime / duration) * 100}%`,
            backdropFilter: "brightness(0.75)",
            height: "100%",
            borderRadius,
          }} />
        </div>
      </div>
    </div>
  );
};

type CutMarkerProps = {
  side: "left" | "right";
};

const CutMarker: React.FC<CutMarkerProps> = ({ side }) => {

  return (
    <div css={{
      width: 14,
      height: 20,
      backgroundColor: COLORS.neutral05,
      color: COLORS.neutral70,
      border: `1px solid ${COLORS.neutral40}`,
      borderRadius: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 1px 2px var(--shadow-color)",
    }}>
      <CutMarkerIcon css={{
        transform: `scale(1.2) ${side == "right" ? "scaleX(-1)" : ""}`,
      }} />
    </div>
  );
};

type DraggableProps = React.PropsWithChildren<{
  previewController: RefObject<PreviewHandle>;
  scrubberRef: RefObject<HTMLDivElement>;
  initialTime: number;
  onDrag?: (time: number) => void;
}>;

const Draggable: React.FC<DraggableProps> = ({
  previewController,
  scrubberRef,
  initialTime,
  onDrag,
  children,
}) => {
  const duration = previewController.current?.duration || Infinity;

  const initialPos = initialTime / duration;
  const pos = useRef<number>(initialPos);
  const scrubberRect = useRef<DOMRect>();
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const leftValue = (v: number) => `${Math.min(1.0, Math.max(0.0, v)) * 100}%`;

  useEffect(() => {
    const onMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        onDrag?.(pos.current * duration);
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const rect = notNullish(scrubberRect.current);
        pos.current = (e.pageX - rect.left) / rect.width;
        notNullish(ref.current).style.left = leftValue(pos.current);
        onDrag?.(pos.current * duration);
      }
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  });

  return (
    <div
      ref={ref}
      onMouseDown={() => {
        isDragging.current = true;
        scrubberRect.current = notNullish(scrubberRef.current).getBoundingClientRect();
      }}
      css={{
        position: "absolute",
        zIndex: 100,
        left: leftValue(initialPos),
        cursor: "grab",
        userSelect: "none",
        top: "50%",
        transform: "translateY(-50%) translateX(-50%)",
      }}
    >
      {children}
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
    ignoreEventWhen: e => e.code === "Space" && e.target instanceof HTMLButtonElement,
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
