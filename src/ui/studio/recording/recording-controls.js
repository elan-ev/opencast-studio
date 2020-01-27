//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useEffect, useRef, useState } from 'react';
import { Beforeunload } from 'react-beforeunload';
import { useTranslation } from 'react-i18next';

import Recorder from '../../../recorder';
import { useDispatch, useRecordingState } from '../../../recording-context';

import { PauseButton, RecordButton, ResumeButton, StopButton } from './recording-buttons';
import RecordingState from './recording-state';

function addRecordOnStop(dispatch, deviceType) {
  return ({ media, url }) => {
    dispatch({ type: 'ADD_RECORDING', payload: { deviceType, media, url } });
  };
}

function mixAudioIntoVideo(audioStream, videoStream) {
  if (!audioStream || audioStream.getAudioTracks().length === 0) {
    return videoStream;
  }
  return new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);
}

export default function RecordingControls({ handleRecorded }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { audioStream, displayStream, userStream } = useRecordingState();

  const [countdown, setCountdown] = useState(false);
  const [recordingState, setRecordingState] = useState('inactive');

  const desktopRecorder = useRef(null);
  const videoRecorder = useRef(null);

  const hasStreams = displayStream || userStream;

  // reset after mounting
  useEffect(() => {
    dispatch({ type: 'CLEAR_RECORDINGS' });
    desktopRecorder.current = null;
    videoRecorder.current = null;
  }, [dispatch]);

  const record = () => {
    if (displayStream) {
      const onStop = addRecordOnStop(dispatch, 'desktop');
      const stream = mixAudioIntoVideo(audioStream, displayStream);
      desktopRecorder.current = new Recorder(stream, { onStop });
      desktopRecorder.current.start();
    }

    if (userStream) {
      const onStop = addRecordOnStop(dispatch, 'video');
      const stream = mixAudioIntoVideo(audioStream, userStream);
      videoRecorder.current = new Recorder(stream, { onStop });
      videoRecorder.current.start();
    }
  };

  const resume = () => {
    desktopRecorder.current && desktopRecorder.current.resume();
    videoRecorder.current && videoRecorder.current.resume();
  };

  const pause = () => {
    desktopRecorder.current && desktopRecorder.current.pause();
    videoRecorder.current && videoRecorder.current.pause();
  };

  const stop = () => {
    desktopRecorder.current && desktopRecorder.current.stop();
    videoRecorder.current && videoRecorder.current.stop();
    handleRecorded();
  };

  const handlePause = () => {
    setRecordingState('paused');
    pause();
  };

  const handleResume = () => {
    setRecordingState('recording');
    resume();
  };

  const handleRecord = () => {
    if (!hasStreams) {
      return;
    }
    setCountdown(true);
    setTimeout(() => {
      setRecordingState('recording');
      setCountdown(false);
      record();
    }, 1000);
  };

  const handleStop = () => {
    setRecordingState('inactive');
    stop();
  };

  return (
    <div sx={{ m: 0, mt: 2, width: '290px' }}>
      {recordingState !== 'inactive' && (
        <Beforeunload onBeforeunload={event => event.preventDefault()} />
      )}

      <div className="buttons" sx={{ display: 'flex', alignItems: 'center' }}>
        <div sx={{ flex: 1, textAlign: 'right' }}>
          {recordingState === 'recording' && (
            <PauseButton
              title={t('pause-button-title')}
              recordingState={recordingState}
              onClick={handlePause}
            />
          )}

          {recordingState === 'paused' && (
            <ResumeButton
              title={t('resume-button-title')}
              recordingState={recordingState}
              onClick={handleResume}
            />
          )}
        </div>

        <div className="center">
          {recordingState === 'inactive' ? (
            <RecordButton
              large
              title={t('record-button-title')}
              recordingState={recordingState}
              onClick={handleRecord}
              disabled={!hasStreams}
              countdown={countdown}
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

        <div sx={{ flex: 1 }}>
          <RecordingState recordingState={recordingState} />
        </div>
      </div>
    </div>
  );
}
