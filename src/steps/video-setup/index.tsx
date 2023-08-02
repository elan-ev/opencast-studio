import React from "react";
import { useTranslation } from "react-i18next";
import { match } from "@opencast/appkit";

import { useDispatch, useStudioState, VideoSource } from "../../studio-state";
import { stopDisplayCapture, stopUserCapture } from "../../capturer";
import { SourcePreview } from "./preview";
import { loadCameraPrefs, loadDisplayPrefs, prefsToConstraints } from "./prefs";
import { StepProps } from "..";
import { StepContainer } from "../elements";
import { SourceSelection } from "./source-select";
import { ErrorBox } from "../../ui/ErrorBox";
import { isRecordingSupported, onSafari } from "../../util";


export type Input = {
  isDesktop: boolean;
  stream: MediaStream | null;
  allowed: boolean | null;
  unexpectedEnd: boolean | null;
};

export const VideoSetup: React.FC<StepProps> = ({ goToNextStep }) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const state = useStudioState();
  const { displayStream, userStream, videoChoice: activeSource } = state;
  const hasStreams = !!displayStream || !!userStream;

  const setActiveSource = (s: VideoSource) => dispatch({ type: "CHOOSE_VIDEO", choice: s });
  const reselectSource = () => {
    setActiveSource("none");
    stopUserCapture(userStream, dispatch);
    stopDisplayCapture(displayStream, dispatch);
  };


  const userInput = {
    isDesktop: false,
    stream: userStream,
    allowed: state.userAllowed,
    unexpectedEnd: state.userUnexpectedEnd,
  };
  const displayInput = {
    isDesktop: true,
    stream: displayStream,
    allowed: state.displayAllowed,
    unexpectedEnd: state.displayUnexpectedEnd,
  };

  const buttons = {
    prevButton: {
      onClick: reselectSource,
      disabled: false,
      label: t("sources-video-reselect-source"),
    },
    nextButton: {
      onClick: () => goToNextStep(),
      disabled: activeSource === "both" ? (!displayStream || !userStream) : !hasStreams,
    },
  };

  return match(activeSource, {
    "none": () => {
      return (
        <StepContainer title={t("sources-video-question")}>
          <Warnings />
          <SourceSelection
            displayConstraints={prefsToConstraints(loadDisplayPrefs())}
            userConstraints={prefsToConstraints(loadCameraPrefs())}
            setActiveSource={setActiveSource}
          />
        </StepContainer>
      );
    },

    "user": () => {
      const showButtons = userStream || state.userAllowed === false;
      return (
        <StepContainer
          title={t("sources-video-user-selected")}
          {...showButtons && buttons}
        >
          <SourcePreview inputs={[userInput]} />
        </StepContainer>
      );
    },

    "display": () => {
      const showButtons = displayStream || state.displayAllowed === false;
      return (
        <StepContainer
          title={t("sources-video-display-selected")}
          {...showButtons && buttons}
        >
          <SourcePreview inputs={[displayInput]} />
        </StepContainer>
      );
    },

    "both": () => {
      const showButtons = (userStream || state.userAllowed === false)
        && (displayStream || state.displayAllowed === false);
      return (
        <StepContainer
          title={t("sources-video-display-and-user-selected")}
          {...showButtons && buttons}
        >
          <SourcePreview inputs={[displayInput, userInput]} />
        </StepContainer>
      );
    },
  });
};



/** Conditionally shows a number of warnings to help the user identify problems. */
const Warnings = () => {
  const { t } = useTranslation();

  const warnings: JSX.Element[] = [];

  // We allow HTTP connections to localhost, as most browsers also seem to allow
  // video capture in those cases.
  const usingUnsecureConnection = window.location.protocol !== "https:" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";
  if (usingUnsecureConnection) {
    warnings.push(
      <ErrorBox body={t("warning-https")} />
    );
  }

  // Warning about missing `MediaRecorder` support
  if (!isRecordingSupported()) {
    let msg = t("warning-recorder-not-supported");
    if (onSafari()) {
      msg += " " + t("warning-recorder-safari-hint");
    }
    warnings.push(<ErrorBox body={msg} />);
  }


  return warnings.length > 0
    ? <div>{ warnings }</div>
    : null;
};
