//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useEffect, useRef } from 'react';
import { Beforeunload } from 'react-beforeunload';
import { useTranslation } from 'react-i18next';
import { useHistory } from "react-router";

import Recorder from '../../../recorder';
import { useSettings } from '../../../settings';
import { useDispatch, useStudioState } from '../../../studio-state';

import { PauseButton, RecordButton, ResumeButton, StopButton } from './recording-buttons';
import Clock from './clock';
import { STATE_INACTIVE, STATE_PAUSED, STATE_RECORDING } from './index.js';

function addRecordOnStop(dispatch, deviceType) {
  return ({ media, url, mimeType, dimensions }) => {
    dispatch({ type: 'ADD_RECORDING', payload: { deviceType, media, url, mimeType, dimensions } });
  };
}

function mixAudioIntoVideo(audioStream, videoStream) {
  if (!(audioStream?.getAudioTracks().length)) {
    return videoStream;
  }
  return new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);
}

let unblockers = [];

export default function RecordingControls({
  handleRecorded,
  recordingState,
  setRecordingState,
}) {
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


  const desktopRecorder = useRef(null);
  const videoRecorder = useRef(null);

  const canRecord = (displayStream || userStream)
    && !userUnexpectedEnd && !displayUnexpectedEnd && !audioUnexpectedEnd;

  const history = useHistory();

  const record = () => {
    // In theory, we should never have recordings at this point. But just to be
    // sure, in case of a bug elsewhere, we clear the recordings here.
    dispatch({ type: 'CLEAR_RECORDINGS' });

    if (displayStream) {
      const onStop = addRecordOnStop(dispatch, 'desktop');
      const stream = mixAudioIntoVideo(audioStream, displayStream);
      desktopRecorder.current = new Recorder(stream, settings.recording, { onStop });
      desktopRecorder.current.start();
    }

    if (userStream) {
      const onStop = addRecordOnStop(dispatch, 'video');
      const stream = mixAudioIntoVideo(audioStream, userStream);
      videoRecorder.current = new Recorder(stream, settings.recording, { onStop });
      videoRecorder.current.start();
    }

    dispatch({ type: 'START_RECORDING' });
    unblockers.push(history.block(t('confirm-cancel-recording')));
  };

  const resume = () => {
    desktopRecorder.current?.resume();
    videoRecorder.current?.resume();
  };

  const pause = () => {
    desktopRecorder.current?.pause();
    videoRecorder.current?.pause();
  };

  const stop = (premature = false) => {
    desktopRecorder.current?.stop();
    videoRecorder.current?.stop();
    handleRecorded();
    dispatch({ type: premature ? 'STOP_RECORDING_PREMATURELY' : 'STOP_RECORDING' });
    unblockers.forEach(b => b());
    unblockers = [];
  };

  useEffect(() => {
    // Detect if a stream ended unexpectedly. In that case we want to stop the
    // recording completely.
    const unexpectedEnd = userUnexpectedEnd || displayUnexpectedEnd || audioUnexpectedEnd;
    if (unexpectedEnd && recordingState === STATE_RECORDING) {
      stop(true);
    }

    history.listen(() => {
      // This only happens when the user uses "back" or "forward" in their
      // browser and they confirm they want to discard the recording.
      if (recordingState !== 'STATE_INACTIVE') {
        dispatch({ type: 'STOP_RECORDING' });
      }

      unblockers.forEach(b => b());
      unblockers = [];
    });
  });


  const handlePause = () => {
    setRecordingState(STATE_PAUSED);
    pause();
  };

  const handleResume = () => {
    setRecordingState(STATE_RECORDING);
    resume();
  };

  const handleRecord = () => {
    if (!canRecord) {
      return;
    }
    setRecordingState(STATE_RECORDING);
    record();
  };

  const handleStop = () => {
    setRecordingState(STATE_INACTIVE);
    stop();
  };

  return (
    <div sx={{ m: 0, width: recordingState !== STATE_INACTIVE ? '280px' : 'auto' }}>
      {recordingState !== STATE_INACTIVE && (
        <Beforeunload onBeforeunload={event => event.preventDefault()} />
      )}

      <div className="buttons" sx={{ display: 'flex', alignItems: 'center' }}>
        {recordingState !== STATE_INACTIVE && <div sx={{ flex: 1, textAlign: 'right' }}>
          {recordingState === STATE_RECORDING && (
            <PauseButton
              title={t('pause-button-title')}
              recordingState={recordingState}
              onClick={handlePause}
            />
          )}

          {recordingState === STATE_PAUSED && (
            <ResumeButton
              title={t('resume-button-title')}
              recordingState={recordingState}
              onClick={handleResume}
            />
          )}
        </div>}

        <div className="center">
          {recordingState === STATE_INACTIVE ? (
            <RecordButton
              large
              title={t('record-button-title')}
              recordingState={recordingState}
              onClick={handleRecord}
              disabled={!canRecord}
            />
          ) : (
            <StopButton
              large
              title={t('stop-button-title')}
              recordingState={recordingState}
              onClick={handleStop}
            />
          )}
        </div>

        {recordingState !== STATE_INACTIVE && <div sx={{ flex: 1 }}>
          <Clock isPaused={recordingState === STATE_PAUSED} />
        </div>}
      </div>
    </div>
  );
}
