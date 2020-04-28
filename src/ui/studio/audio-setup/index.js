//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { Container, Flex, Heading, Spinner, Text } from '@theme-ui/components';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

import {
  useDispatch,
  useStudioState,
  MICROPHONE,
  MICROPHONE_REQUEST,
  NO_AUDIO,
  NONE,
} from '../../../studio-state';

import { startAudioCapture, stopAudioCapture } from '../capturer';
import { ActionButtons } from '../elements';
import Notification from '../../notification';

import PreviewAudio from './preview-audio';

export default function AudioSetup(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const state = useStudioState();
  const { audioStream, audioAllowed, audioUnexpectedEnd } = state;

  const nextIsDisabled = state.audioChoice === NONE
    || state.audioChoice === MICROPHONE_REQUEST
    || (state.audioChoice === MICROPHONE && !audioStream);

  const backToSetupVideo = () => props.previousStep();
  const enterStudio = () => props.nextStep();

  const selectMicrophone = () => {
    dispatch({ type: 'CHOOSE_AUDIO', payload: MICROPHONE_REQUEST });
    startAudioCapture(dispatch).then(success => {
      const payload = success ? MICROPHONE : NONE;
      dispatch({ type: 'CHOOSE_AUDIO', payload });
    });
  };

  const selectNoAudio = () => {
    dispatch({ type: 'CHOOSE_AUDIO', payload: NO_AUDIO });
    if (audioStream) {
      stopAudioCapture(audioStream, dispatch);
    }
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        justifyContent: 'space-between',
      }}
    >
      <Styled.h1 sx={{ textAlign: 'center' }}>{t('sources-audio-question')}</Styled.h1>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          maxWidth: 850,
          width: '100%',
          mx: 'auto',
          mb: 3,
          flex: '1 0 auto',
          maxHeight: ['none', '350px'],
          '& > :first-of-type': {
            mb: [3, 0],
            mr: [0, 3],
          },
        }}
      >
        <OptionButton
          icon={faMicrophone}
          label={t('sources-audio-microphone')}
          selected={state.audioChoice === MICROPHONE && !audioUnexpectedEnd}
          onClick={selectMicrophone}
        >
          { state.audioChoice === MICROPHONE_REQUEST && <Spinner size="75"/> }
          { audioStream && <PreviewAudio stream={audioStream} /> }
          { audioAllowed === false && state.audioChoice !== MICROPHONE_REQUEST && (
            <Notification isDanger sx={{ mt: 2 }}>
              <Heading as="h3" mb={2}>
                {t('source-audio-not-allowed-title')}
              </Heading>
              <Text variant='text'>{t('source-audio-not-allowed-text')}</Text>
            </Notification>
          )}
          { audioUnexpectedEnd && (
            <Notification isDanger sx={{ mt: 2 }}>
              <Text variant='text'>{t('error-lost-audio-stream')}</Text>
            </Notification>
          )}
        </OptionButton>
        <OptionButton
          icon={faMicrophoneSlash}
          label={t('sources-audio-without-audio')}
          selected={state.audioChoice === NO_AUDIO}
          onClick={selectNoAudio}
        >
        </OptionButton>
      </Flex>

      <ActionButtons
        prev={{ onClick: backToSetupVideo }}
        next={{ onClick: enterStudio, disabled: nextIsDisabled }}
      />
    </Container>
  );
}

const OptionButton = ({ children, icon, label, selected, onClick }) => {
  const selectedStyle = !selected ? {} : {
    backgroundColor: 'highlight',
  };

  return (
    <button
      onClick={() => selected || onClick() }
      title={label}
      sx={{
        fontFamily: 'inherit',
        color: 'gray.0',
        backgroundColor: 'gray.4',
        border: '2px solid black',
        borderRadius: '8px',
        flex: '0 1 50%',
        p: 2,
        '&:hover': selected ? {} : {
          boxShadow: theme => `0 0 10px ${theme.colors.gray[2]}`,
          backgroundColor: 'white',
        },
        ...selectedStyle
      }}
    >
      <div sx={{ display: 'block', textAlign: 'center', mb: 3 }}>
        <FontAwesomeIcon icon={icon} size="3x"/>
      </div>
      <div sx={{ fontSize: 4 }}>{label}</div>
      {children}
    </button>
  );
};
