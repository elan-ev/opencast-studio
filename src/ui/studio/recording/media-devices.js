//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef } from 'react';

import { useRecordingState } from '../../../recording-context';
import { STATE_PAUSED } from './index.js';
import { VideoBox, useVideoBoxResize } from '../elements.js';
import { dimensionsOf } from '../../../util.js';

export default function MediaDevices({ recordingState }) {
  const { t } = useTranslation();
  const { displayStream, userStream } = useRecordingState();

  const paused = recordingState === STATE_PAUSED;

  let children = [];
  if (displayStream) {
    children.push({
      body: <MediaDevice title={t('share-desktop')} stream={displayStream} paused={paused} />,
      dimensions: () => dimensionsOf(displayStream),
    });
  }
  if (userStream) {
    children.push({
      body: <MediaDevice title={t('share-camera')} stream={userStream} paused={paused} />,
      dimensions: () => dimensionsOf(userStream),
    });
  }

  return <VideoBox gap={20}>{ children }</VideoBox>;
}

function MediaDevice({ title, stream, paused }) {
  const resizeVideoBox = useVideoBoxResize();
  const videoRef = useRef();

  useEffect(() => {
    const v = videoRef.current;
    if (v && typeof stream != 'undefined') {
      if (!v.srcObject) {
        v.srcObject = stream;
      }
      v.addEventListener('resize', resizeVideoBox);

      if (paused) {
        v.pause();
      } else {
        v.play();
      }
    }

    return () => v.removeEventListener('resize', resizeVideoBox);
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
