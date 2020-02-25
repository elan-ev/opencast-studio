//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef } from 'react';

import { useRecordingState } from '../../../recording-context';
import { STATE_PAUSED } from './index.js';
import { VideoBox } from '../elements.js';
import { aspectRatioOf } from '../../../util.js';

export default function MediaDevices({ recordingState }) {
  const { t } = useTranslation();
  const { displayStream, userStream } = useRecordingState();

  const paused = recordingState === STATE_PAUSED;

  let children = [];
  if (displayStream) {
    children.push({
      body: <MediaDevice title={t('share-desktop')} stream={displayStream} paused={paused} />,
      aspectRatio: aspectRatioOf(displayStream),
    });
  }
  if (userStream) {
    children.push({
      body: <MediaDevice title={t('share-camera')} stream={userStream} paused={paused} />,
      aspectRatio: aspectRatioOf(userStream),
    });
  }

  return <VideoBox gap={20}>{ children }</VideoBox>;
}

function MediaDevice({ title, stream, paused }) {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && typeof stream != 'undefined') {
      if (!videoRef.current.srcObject) {
        videoRef.current.srcObject = stream;
      }
      if (paused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  });

  return (
    <div
      sx={{
        position: 'relative',
        backgroundColor: 'gray.3',
        boxShadow: '0 2px 2px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        height: '100%',
        cursor: stream ? 'initial' : 'pointer',
      }}
    >
      {paused && (
        <div
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <FontAwesomeIcon
            icon={faPause}
            sx={{
              fontSize: '140px',
              maxWidth: '40%',
              maxHeight: '40%',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              margin: 'auto',
              animation: '3s ease-in-out infinite none pulse',
            }}
          />
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        muted
        sx={{
          outline: 'none',
          width: '100%',
          height: '100%',
          background: 'transparent'
        }}
      ></video>
    </div>
  );
}
