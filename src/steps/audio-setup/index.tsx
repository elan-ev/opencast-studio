import { useTranslation } from "react-i18next";
import { match } from "@opencast/appkit";

import { useDispatch, useStudioState } from "../../studio-state";
import { startAudioCapture, stopAudioCapture } from "../../capturer";
import { StepContainer } from "../elements";
import { queryMediaDevices } from "../../util";
import { StepProps } from "..";
import { SourceSelection } from "./source-select";
import { MicrophonePreview } from "./mic-preview";


export const LAST_AUDIO_DEVICE_KEY = "ocStudioLastAudioDevice";


// The audio setup page. This component manages the state (either 'none
// selected' or 'microphone selected') and renders the correct component.
export const AudioSetup: React.FC<StepProps> = ({ goToNextStep, goToPrevStep }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { audioStream, audioChoice } = useStudioState();


  return match(audioChoice, {
    "none": () => {
      const selectMicrophone = async () => {
        dispatch({ type: "CHOOSE_AUDIO", choice: "microphone" });
        const deviceId = window.localStorage.getItem(LAST_AUDIO_DEVICE_KEY);
        await startAudioCapture(dispatch, deviceId ? { ideal: deviceId } : undefined);
        await queryMediaDevices(dispatch);
      };

      return (
        <StepContainer
          title={t("sources-audio-question")}
          prevButton={{ onClick: goToPrevStep }}
          nextButton={{ disabled: true }}
        >
          <SourceSelection
            selectNoAudio={goToNextStep}
            selectMicrophone={selectMicrophone}
          />
        </StepContainer>
      );
    },

    "microphone": () => {
      const reselectSource = () => {
        if (audioStream) {
          stopAudioCapture(audioStream, dispatch);
        }
        dispatch({ type: "CHOOSE_AUDIO", choice: "none" });
      };

      return (
        <StepContainer
          title={t("sources-audio-microphone-selected")}
          prevButton={{
            label: t("sources-audio-reselect-audio"),
            onClick: reselectSource,
          }}
          nextButton={{ disabled: !audioStream, onClick: goToNextStep }}
        >
          <MicrophonePreview />
        </StepContainer>
      );
    },
  });
};
