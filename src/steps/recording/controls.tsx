import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { WithTooltip, match } from "@opencast/appkit";
import { FiPause, FiPlay } from "react-icons/fi";

import Recorder, { OnStopCallback } from "./recorder";
import { useSettings } from "../../settings";
import { Dispatcher, Recording, useDispatch, useStudioState } from "../../studio-state";
import { RecordingState } from ".";
import { SHORTCUTS, ShortcutKeys, useShortcut, useShowAvailableShortcuts } from "../../shortcuts";


const addRecordOnStop = (
  dispatch: Dispatcher,
  deviceType: Recording["deviceType"],
): OnStopCallback => {
  return ({ media, url, mimeType, dimensions }) => {
    dispatch({
      type: "ADD_RECORDING",
      recording: { deviceType, media, url, mimeType, dimensions },
    });
  };
};

function mixAudioIntoVideo(audioStream: MediaStream | null, videoStream: MediaStream) {
  if (!(audioStream?.getAudioTracks().length)) {
    return videoStream;
  }
  return new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);
}


type Props = {
  onRecordingStop: () => void;
  recordingState: RecordingState;
  setRecordingState: (state: RecordingState) => void;
};

export const RecordingControls: React.FC<Props> = ({
  onRecordingStop,
  recordingState,
  setRecordingState,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const settings = useSettings();

  const {
    audioStream,
    displayStream,
    userStream,
    userUnexpectedEnd,
    displayUnexpectedEnd,
    audioUnexpectedEnd,
  } = useStudioState();


  const desktopRecorder = useRef<Recorder>();
  const videoRecorder = useRef<Recorder>();

  const canRecord = (displayStream || userStream)
    && !userUnexpectedEnd && !displayUnexpectedEnd && !audioUnexpectedEnd;

  const record = () => {
    // In theory, we should never have recordings at this point. But just to be
    // sure, in case of a bug elsewhere, we clear the recordings here.
    dispatch({ type: "CLEAR_RECORDINGS" });

    if (displayStream) {
      const onStop = addRecordOnStop(dispatch, "desktop");
      const stream = mixAudioIntoVideo(audioStream, displayStream);
      desktopRecorder.current = new Recorder(stream, settings.recording, onStop);
      desktopRecorder.current.start();
    }

    if (userStream) {
      const onStop = addRecordOnStop(dispatch, "video");
      const stream = mixAudioIntoVideo(audioStream, userStream);
      videoRecorder.current = new Recorder(stream, settings.recording, onStop);
      videoRecorder.current.start();
    }

    dispatch({ type: "START_RECORDING" });
  };

  const stop = (premature = false) => {
    desktopRecorder.current?.stop();
    videoRecorder.current?.stop();
    onRecordingStop();
    dispatch({ type: premature ? "STOP_RECORDING_PREMATURELY" : "STOP_RECORDING" });
  };

  useEffect(() => {
    // Detect if a stream ended unexpectedly. In that case we want to stop the
    // recording completely.
    const unexpectedEnd = userUnexpectedEnd || displayUnexpectedEnd || audioUnexpectedEnd;
    if (unexpectedEnd && (recordingState === "recording" || recordingState === "paused")) {
      stop(true);
    }
  });


  const handlePause = () => {
    setRecordingState("paused");
    desktopRecorder.current?.pause();
    videoRecorder.current?.pause();
  };

  const handleResume = () => {
    setRecordingState("recording");
    desktopRecorder.current?.resume();
    videoRecorder.current?.resume();
  };

  const handleRecord = () => {
    if (!canRecord) {
      return;
    }
    setRecordingState("recording");
    record();
  };

  const showAvailableShortcuts = useShowAvailableShortcuts();
  useShortcut(SHORTCUTS.recording.startPauseResume, () => {
    match(recordingState, {
      "inactive": () => handleRecord(),
      "paused": () => handleResume(),
      "recording": () => handlePause(),
    });
  }, {
    ignoreEventWhen: e => e.code === "Space" && e.target instanceof HTMLButtonElement,
  }, [recordingState]);

  return (
    <div css={{
      margin: "0 auto",
      width: 180,
      height: 85,
      display: "flex",
      gap: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#202020",
      border: "1px solid #868686",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
      borderRadius: 12,
      color: "white",
    }}>
      <WithTooltip tooltip={
        match(recordingState, {
          "inactive": () => t("record-button-title"),
          "paused": () => t("resume-button-title"),
          "recording": () => t("pause-button-title"),
        })
      }>
        <button
          onClick={match(recordingState, {
            "inactive": () => handleRecord,
            "paused": () => handleResume,
            "recording": () => handlePause,
          })}
          css={{
            position: "relative",
            width: 50,
            height: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 28,

            cursor: "pointer",
            borderRadius: "50%",
            backgroundColor: "#E42D43",
            color: "white",
            border: "1px solid white",
            ":hover, :focus-visible": {
              backgroundColor: "#c40a31",
            },
            ":focus-visible": {
              outline: "4px solid white",
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
              <ShortcutKeys shortcut={SHORTCUTS.recording.startPauseResume.split(",")[0]} />
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
