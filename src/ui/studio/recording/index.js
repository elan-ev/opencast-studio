//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Container, Flex } from '@theme-ui/components';
import { useEffect } from 'react';

import { useRecordingState } from '../../../recording-context';

import Toolbar from '../../toolbar';

import MediaDevices from './media-devices';
import RecordingControls from './recording-controls';
import Warnings from './warnings';

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

  return (
    <Flex as="main" sx={{ flexDirection: 'column', height: '100%' }}>
      <Container sx={{ flex: 0 }}>
        <Toolbar settings={props.settings} />
        <Warnings />
      </Container>

      <MediaDevices />

      <RecordingControls handleRecorded={handleRecorded} />
    </Flex>
  );
}
