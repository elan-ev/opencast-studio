//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { faDesktop, faVideo } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import MediaDevice from './media-device';
import { STATE_PAUSED } from './index.js';

import { useRecordingState } from '../../../recording-context';

export default function MediaDevices({ recordingState }) {
  const { t } = useTranslation();
  const { displayStream, userStream } = useRecordingState();

  const paused = recordingState === STATE_PAUSED;

  return (
    <div
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: ['column', 'row'],
        justifyContent: 'center',
        flexWrap: 'wrap',
        '& > *': {
          flex: '1 0 50%'
        }
      }}
    >
      {displayStream && (
        <MediaDevice title={t('share-desktop')} stream={displayStream} paused={paused} />
      )}

      {userStream && (
        <MediaDevice title={t('share-camera')} stream={userStream} paused={paused} />
      )}
    </div>
  );
}
