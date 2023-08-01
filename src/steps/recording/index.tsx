import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

import { useStudioState, useDispatch } from "../../studio-state";
import { useOpencast } from "../../opencast";

import { stopCapture } from "../../capturer";
import { StepProps } from "..";
import { ErrorBox } from "../../ui/ErrorBox";
import { StepContainer } from "../elements";
import { VideoBox, VideoBoxProps, useVideoBoxResize } from "../../ui/VideoBox";
import { COLORS, dimensionsOf } from "../../util";
import { FiAlertTriangle, FiPauseCircle } from "react-icons/fi";
import { keyframes } from "@emotion/react";
import { RecordingControls } from "./controls";
import { useBeforeunload } from "react-beforeunload";


export type RecordingState = "inactive" | "paused" | "recording";


export const Recording: React.FC<StepProps> = ({ goToNextStep, goToPrevStep }) => {
  const { t } = useTranslation();
  const recordingDispatch = useDispatch();
  const opencast = useOpencast();
  const state = useStudioState();
  const {
    displayStream, userStream, displayUnexpectedEnd, userUnexpectedEnd, audioUnexpectedEnd,
  } = state;

  const [recordingState, setRecordingState] = useState<RecordingState>("inactive");

  const handleRecorded = () => {
    opencast.refreshConnection();
    stopCapture(state, recordingDispatch);
    goToNextStep();
  };

  const paused = recordingState === "paused";
  const previews: VideoBoxProps["children"] = [];
  if (displayStream || displayUnexpectedEnd) {
    previews.push({
      body: <StreamPreview stream={displayStream} paused={paused} />,
      dimensions: () => dimensionsOf(displayStream),
    });
  }
  if (userStream || userUnexpectedEnd) {
    previews.push({
      body: <StreamPreview stream={userStream} paused={paused} />,
      dimensions: () => dimensionsOf(userStream),
    });
  }

  useBeforeunload(event => {
    if (recordingState !== "inactive") {
      event.preventDefault();
    }
  });

  return (
    <StepContainer
      title={t("steps.record.label")}
      prevButton={{
        onClick: goToPrevStep,
        disabled: recordingState !== "inactive",
      }}
      nextButton={{
        onClick: handleRecorded,
        disabled: recordingState !== "paused",
        label: t("stop-button-title"),
      }}
    >
      {(displayUnexpectedEnd || userUnexpectedEnd) && (
        <ErrorBox body={t("error-lost-video-stream")} />
      )}
      {audioUnexpectedEnd && (
        <ErrorBox body={t("error-lost-audio-stream")} />
      )}

      <VideoBox gap={20}>{previews}</VideoBox>
      <div css={{ position: "absolute", bottom: 32, width: "100%" }}>
        <RecordingControls
          onRecordingStop={handleRecorded}
          {...{ recordingState, setRecordingState }}
        />
      </div>
    </StepContainer>
  );
};


type StreamPreviewProps = {
  stream: MediaStream | null;
  paused: boolean;
};

const StreamPreview: React.FC<StreamPreviewProps> = ({ stream, paused }) => {
  const resizeVideoBox = useVideoBoxResize();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (v && stream) {
      if (!v.srcObject) {
        v.srcObject = stream;
      }
      v.addEventListener("resize", resizeVideoBox);

      if (paused) {
        v.pause();
      } else {
        v.play();
      }

      return () => v.removeEventListener("resize", resizeVideoBox);
    }
  });

  if (!stream) {
    return (
      <div css={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: COLORS.danger4,
      }}>
        <FiAlertTriangle size={48} />
      </div>
    );
  }

  return (
    <div
      css={{
        position: "relative",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.35)",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {paused && <PauseOverlay />}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        tabIndex={-1}
        css={{
          outline: "none",
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      ></video>
    </div>
  );
};

const PauseOverlay: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      css={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(50, 50, 50, 0.7)",
      }}
    >
      <div css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        gap: 8,
        fontSize: 20,
        marginTop: 32,
        textShadow: "0 0 12px rgba(0, 0, 0, 0.6)",
        animation: `2s ease-in-out infinite none ${keyframes({
          "0%": { opacity: 1 },
          "50%": { opacity: 0.7 },
          "100%": { opacity: 1 },
        })}`,
      }}>
        <FiPauseCircle css={{ fontSize: 26 }} />
        {t("steps.record.is-paused")}
      </div>
    </div>
  );
};
