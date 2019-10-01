//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { useTranslation } from 'react-i18next';

import Clock from './clock';

const RecordingState = styled(props => {
  const { t } = useTranslation();
  return (
    <div className={props.className}>
      <p>
        {props.recordingState === 'recording'
          ? t('Recording')
          : props.recordingState === 'paused'
          ? t('Paused')
          : t('Waiting')}
      </p>
      <Clock recordingState={props.recordingState} />
    </div>
  );
})`
  p {
    color: ${props => (props.recordingState === 'paused' ? '#aaa' : 'transparent')};
  }
  visibility: ${props => (props.recordingState === 'inactive' ? 'hidden' : 'visible')};
`;

export default RecordingState;
