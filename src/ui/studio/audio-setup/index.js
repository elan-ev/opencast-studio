//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { faCaretLeft, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Container } from '@theme-ui/components';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useDispatch, useRecordingState } from '../../../recording-context';

import { stopAudioCapture } from '../capturer';
import { ActionButtons, PromptAndProceed } from '../elements';

import AudioMedia from './audio-media';

export default function AudioSetup(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const state = useRecordingState();

  const hasAudio = !!state.audioStream;

  const backToSetupVideo = useCallback(() => {
    stopAudioCapture(state.audioStream, dispatch);
    props.previousStep();
  }, [dispatch, props, state.audioStream]);

  const enterStudio = useCallback(() => {
    // TODO: combine audio, user, display ?
      props.nextStep()
  }, [props]);

  const BackButton = ({ handlePrev }) => (
    <Button onClick={handlePrev}>
      <FontAwesomeIcon icon={faCaretLeft} />
      {t('back-button-label')}
    </Button>
  );

  return (
    <Container>
      <PromptAndProceed
        prev={<BackButton handlePrev={backToSetupVideo} />}
        next={
          hasAudio ? (
            <Button onClick={enterStudio}>{t('enter-studio')}</Button>
          ) : (
            <Button variant="danger" onClick={enterStudio}>
              <FontAwesomeIcon icon={faMicrophoneSlash}/>
              {t('sources-enter-studio-without-audio')}
            </Button>
          )
        }
        sx={{ py: 3 }}
      >
        {hasAudio ? t('sources-audio-selection-done') : t('sources-audio-selection-prompt')}
      </PromptAndProceed>

      <AudioMedia />

      <ActionButtons
        prev={{ onClick: backToSetupVideo }}
        next={{ onClick: enterStudio }}
      />
    </Container>
  );
}
