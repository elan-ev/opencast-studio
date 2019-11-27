//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { faDesktop, faVideo } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import MediaDevice from './media-device';

import { useRecordingState } from '../../../recording-context';

export default function MediaDevices(props) {
  const { t } = useTranslation();
  const { displayStream, userStream } = useRecordingState();

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
        <MediaDevice title={t('share-desktop')} icon={faDesktop} stream={displayStream} />
      )}

      {userStream && <MediaDevice title={t('share-camera')} icon={faVideo} stream={userStream} />}
    </div>
  );
}
