//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import MediaDevice from './media-device';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause } from '@fortawesome/free-solid-svg-icons';

import { useRecordingState } from '../../../recording-context';
import { STATE_PAUSED } from './index.js';

export default function MediaDevices({ recordingState }) {
  const { t } = useTranslation();
  const { displayStream, userStream } = useRecordingState();

  const paused = recordingState === STATE_PAUSED;

  return (
    <div
      sx={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        flexDirection: ['column', 'row'],
        justifyContent: 'center',
        minHeight: 0,
        flexWrap: 'wrap',
        '& > *': {
          flex: '1 0 50%'
        }
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

      {displayStream && (
        <MediaDevice title={t('share-desktop')} stream={displayStream} paused={paused} />
      )}

      {userStream && (
        <MediaDevice title={t('share-camera')} stream={userStream} paused={paused} />
      )}
    </div>
  );
}
