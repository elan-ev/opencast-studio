//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Container } from '@theme-ui/components';
import { useCallback } from 'react';

import { useDispatch, useRecordingState } from '../../../recording-context';

import { stopAudioCapture } from '../capturer';
import { ActionButtons } from '../elements';

import AudioMedia from './audio-media';

export default function AudioSetup(props) {
  const dispatch = useDispatch();
  const state = useRecordingState();

  const backToSetupVideo = useCallback(() => {
    stopAudioCapture(state.audioStream, dispatch);
    props.previousStep();
  }, [dispatch, props, state.audioStream]);

  const enterStudio = useCallback(() => {
    // TODO: combine audio, user, display ?
    props.nextStep();
  }, [props]);

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        pt: 3
      }}
    >
      <AudioMedia />

      <ActionButtons prev={{ onClick: backToSetupVideo }} next={{ onClick: enterStudio }} />
    </Container>
  );
}
