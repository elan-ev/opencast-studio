//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import Clock from './clock';

const RecordingState = props => {
  const { t } = useTranslation();
  return (
      <div sx={{ display: "flex", alignItems: 'center', visibility: props.recordingState === 'inactive' ? 'hidden' : 'visible' }}>
      <Clock recordingState={props.recordingState} />
        <p sx={{ px: 2, color: props.recordingState === 'paused' ? 'gray.1' : 'transparent' }}>
        {props.recordingState === 'recording'
          ? t('Recording')
          : props.recordingState === 'paused'
          ? t('Paused')
          : t('Waiting')}
      </p>
    </div>
  );
};

export default RecordingState;
