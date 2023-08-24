import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Spinner, match } from "@opencast/appkit";

import { StepContainer } from "../elements";
import { useStudioState, useDispatch } from "../../studio-state";
import { StepProps } from "..";
import { ErrorBox } from "../../ui/ErrorBox";
import { ControlBox } from "./control-box";
import { Preview, PreviewHandle } from "./preview";
import { FiTrash } from "react-icons/fi";


// In some situation we would like to set the current time to 0 or check for it.
// Thanks to a browser bug, setting the current time to 0 fails. Using a number
// slightly higher works though. So we use this 1ms time for now. Sigh.
export const ALMOST_ZERO = 0.001;

export const Review: React.FC<StepProps> = ({ goToFirstStep, goToNextStep }) => {
  const { t } = useTranslation();
  const recordingDispatch = useDispatch();
  const { recordings, prematureRecordingEnd, videoChoice } = useStudioState();
  const emptyRecording = recordings.some(rec => rec.media.size === 0);
  const previewController = useRef<PreviewHandle>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [previewReady, setPreviewReady] = useState(false);

  const expectedRecordings = match(videoChoice, {
    "both": () => 2,
    "display": () => 1,
    "user": () => 1,
    "none": () => 0,
  });

  return (
    <StepContainer
      title={t("steps.review.label")}
      note={t("steps.review.only-on-upload-note")}
      prevButton={{
        danger: true,
        icon: <FiTrash />,
        label: t("review-button-discard-and-record"),
        onClick: () => {
          const doIt = window.confirm(t("confirm-discard-recordings"));
          if (doIt) {
            recordingDispatch({ type: "RESET" });
            goToFirstStep();
          }
        },
      }}
      nextButton={{ onClick: goToNextStep }}
    >
      {prematureRecordingEnd && (
        <ErrorBox body={t("error-lost-stream-end-recording")} />
      )}

      {emptyRecording && (
        <ErrorBox body={t("review-error-empty-recording")} />
      )}

      {(!previewReady || recordings.length !== expectedRecordings) && (
        <div css={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 42,
        }}>
          <Spinner />
        </div>
      )}
      {recordings.length === expectedRecordings && (
        <div css={{
          display: previewReady ? "flex" : "none",
          flex: "1 1 auto",
          gap: 16,
          flexDirection: "column",
        }}>
          <Preview
            ref={previewController}
            onTimeUpdate={event => {
              setCurrentTime(event.currentTarget.currentTime);
            }}
            onReady={() => setPreviewReady(true)}
          />

          <ControlBox {...{ previewController, currentTime }} />
        </div>
      )}
    </StepContainer>
  );
};
