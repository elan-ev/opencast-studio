//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Flex } from '@theme-ui/components';
import { useCallback, useEffect } from 'react';

import { useRecordingState } from '../../../recording-context';

import { ActionButtons } from '../elements';

import MediaDevices from './media-devices';
import RecordingControls from './recording-controls';

export default function Recording(props) {
  const state = useRecordingState();

  useEffect(() => {
    if (!(state.displayStream || state.userStream)) {
      props.firstStep();
    }
  }, [props, state.displayStream, state.userStream]);

  const handleRecorded = () => {
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
      <MediaDevices />

      <div sx={{ mx: 3 }}>
        <ActionButtons prev={{ onClick: backToAudio }}>
          <RecordingControls handleRecorded={handleRecorded} />
        </ActionButtons>
      </div>
    </Flex>
  );
}
