import {
  forwardRef, useState, useRef, useImperativeHandle, SyntheticEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { notNullish, useColorScheme } from "@opencast/appkit";

import { useStudioState } from "../../studio-state";
import CutOutIcon from "./cut-out-icon.svg";
import { VideoBox } from "../../ui/VideoBox";
import { SHORTCUTS, useShortcut } from "../../shortcuts";


type PreviewProps = {
  onTimeUpdate: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onPausePlay: (paused: boolean) => void;
  onReady: () => void;
};

export type PreviewHandle = {
  currentTime: number;
  readonly duration: number;
  readonly isPlaying: boolean;
  readonly isReadyToPlay: boolean;
  play(): void;
  pause(): void;
};

export const Preview = forwardRef<PreviewHandle, PreviewProps>((
  { onTimeUpdate, onReady, onPausePlay },
  ref,
) => {
  const { recordings, start, end } = useStudioState();
  const { t } = useTranslation();
  const { isHighContrast } = useColorScheme();

  const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const allVideos = videoRefs.slice(0, recordings.length);


  // When updating the currenTime, i.e. the play position, we want to throttle
  // this somehow. Just always setting `currentTime` is not ideal: consider
  // `onMouseMove`, which would set a new value very frequently. Chrome and
  // Firefox don't seem to handle that very well: every new time set will
  // cancel the in-progress seeking, leading to quite large delays.
  //
  // What we do instead is: if we are not currently seeking, just set the time
  // as normal. But if a seek operation is in progress, we just queue the time.
  // Further below, the `onSeeked` event handler is the second part of the
  // solution: when a seek operation has ended and a new time is queued, we
  // seek to that time again. Put simply: we just wait for seek operations to
  // finish before changing `currenTime` again.
  const queuedSeek = useRef<number | null>(null);
  const setTime = (newTime: number) => {
    const isSeeking = allVideos.some(v => v.current?.seeking);
    if (isSeeking) {
      queuedSeek.current = newTime;
    } else {
      allVideos.forEach(r => {
        if (r.current) {
          r.current.currentTime = Math.max(0, Math.min(newTime, r.current.duration));
        }
      });
    }
  };

  useImperativeHandle(ref, () => ({
    get currentTime() {
      return notNullish(videoRefs[0].current?.currentTime);
    },
    set currentTime(newTime) {
      setTime(newTime);
    },
    get duration() {
      return notNullish(videoRefs[0].current?.duration);
    },
    get isPlaying() {
      const v = videoRefs[0].current;
      return v != null && v.currentTime > 0 && !v.paused && !v.ended;
    },
    get isReadyToPlay() {
      // State 2 means "at least enough data to play one frame"
      return allVideos.every(r => (r.current?.readyState ?? 0) >= 2);
    },
    play() {
      allVideos.forEach(r => r.current?.play());
      onPausePlay(false);
    },
    pause() {
      allVideos.forEach(r => r.current?.pause());
      onPausePlay(true);
    },
  }));

  // Some logic to decide whether we currently are in a part of the video that
  // will be removed. The state will be updated in `onTimeUpdate` below and is
  // only here to trigger a rerender: the condition for rendering the overlay is
  // below.
  const isInCutRegion = (time: number) =>
    (start !== null && time < start) || (end !== null && time > end);
  const currentTime = videoRefs[0].current?.currentTime || 0;
  const overlayVisible = isInCutRegion(currentTime);
  const [, setOverlayVisible] = useState(overlayVisible);


  const jumpInTime = (diff: number) =>
    setTime(notNullish(videoRefs[0].current?.currentTime) + diff);

  // TODO: This is obviously not always correct. Finding out the FPS of the
  // recording is surprisingly tricky. And actually, browsers seem to record
  // with 30fps almost all of the time right now anway.
  const fps = 30;
  useShortcut(SHORTCUTS.review.forwards5secs, () => jumpInTime(5));
  useShortcut(SHORTCUTS.review.backwards5secs, () => jumpInTime(-5));
  useShortcut(SHORTCUTS.review.forwardsFrame, () => jumpInTime(1 / fps), { useKey: true });
  useShortcut(SHORTCUTS.review.backwardsFrame, () => jumpInTime(-1 / fps), { useKey: true });


  const children = recordings.map((recording, index) => ({
    dimensions: () => recording.dimensions,
    body: (
      <div css={{ position: "relative", width: "100%", height: "100%" }}>
        {overlayVisible && (
          <div css={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "start",
            paddingTop: 16,
            pointerEvents: "none",
          }}>
            <CutOutIcon css={{ fontSize: "3em" }}/>
            <p css={{ margin: "8px 0" }}>{t("steps.review.part-will-be-removed")}</p>
          </div>
        )}
        <video
          ref={videoRefs[index]}
          key={index}
          src={recording.url}
          onLoadedData={() => onReady()}
          onSeeked={() => {
            const isOtherSeeking = videoRefs[index == 0 ? 1 : 0].current?.seeking;
            const queued = queuedSeek.current;
            if (!isOtherSeeking && queued != null) {
              allVideos.forEach(r => {
                if (r.current) {
                  r.current.currentTime = queued;
                }
              });
              queuedSeek.current = null;
            }
          }}
          onTimeUpdate={event => {
            setOverlayVisible(isInCutRegion(event.currentTarget.currentTime));
            onTimeUpdate(event);
          }}

          // For iOS: without the autoplay attribute, the `loadeddata` event is
          // never fired for some reason. Adding this does not seem to actually
          // cause Safari to autoplay.
          autoPlay={/iPad|iPhone|iPod/.test(navigator.userAgent)}

          // Also for iOS: without this, the video maximizes automatically.
          playsInline

          preload="auto"
          tabIndex={-1}
          css={{
            width: "100%",
            height: "100%",
            outline: "none",
            boxShadow: isHighContrast ? "none" : "0 4px 16px var(--shadow-color)",
            borderRadius: 16,
          }}
        />
      </div>
    ),
  }));

  return <VideoBox gap={20}>{children}</VideoBox>;
});
