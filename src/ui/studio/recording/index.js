//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import { Flex, Text } from '@theme-ui/components';
import { useCallback, useState } from 'react';

import { useStudioState, useDispatch } from '../../../studio-state';
import { useOpencast } from '../../../opencast';

import { ActionButtons } from '../elements';

import MediaDevices from './media-devices';
import RecordingControls from './recording-controls';
import { stopCapture } from '../capturer';
import Notification from '../../notification';


export const STATE_INACTIVE = 'inactive';
export const STATE_PAUSED = 'paused';
export const STATE_RECORDING = 'recording';


export default function Recording(props) {
  const { t } = useTranslation();
  const state = useStudioState();
  const recordingDispatch = useDispatch();
  const opencast = useOpencast();

  const [recordingState, setRecordingState] = useState(STATE_INACTIVE);

  const handleRecorded = () => {
    opencast.refreshConnection();
    stopCapture(state, recordingDispatch);
    props.nextStep();
  };

  const backToAudio = useCallback(() => {
    props.previousStep();
  }, [props]);

  return (
    <Flex sx={{
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      flexGrow: 1,
    }}>
      { (state.displayUnexpectedEnd || state.userUnexpectedEnd) && (
        <Notification isDanger>
          <Text>{t('error-lost-video-stream')}</Text>
        </Notification>
      )}
      { state.audioUnexpectedEnd && (
        <Notification isDanger>
          <Text>{t('error-lost-audio-stream')}</Text>
        </Notification>
      )}

      <MediaDevices recordingState={recordingState} />

      <div sx={{ m: 3 }}>
        <ActionButtons prev={recordingState === STATE_INACTIVE && { onClick: backToAudio }}>
          <RecordingControls
            handleRecorded={handleRecorded}
            recordingState={recordingState}
            setRecordingState={setRecordingState}
          />
        </ActionButtons>
      </div>
    </Flex>
  );
}
