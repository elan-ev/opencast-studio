//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { Flex, Heading, Spinner, Text } from '@theme-ui/components';
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
import { ActionButtons, StepContainer } from '../elements';
import Notification from '../../notification';
import { queryMediaDevices } from '../../../util';

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

  const selectMicrophone = async () => {
    dispatch({ type: 'CHOOSE_AUDIO', payload: MICROPHONE_REQUEST });
    const success = await startAudioCapture(dispatch);
    dispatch({ type: 'CHOOSE_AUDIO', payload: success ? MICROPHONE : NONE });

    await queryMediaDevices(dispatch);
  };

  const selectNoAudio = () => {
    dispatch({ type: 'CHOOSE_AUDIO', payload: NO_AUDIO });
    if (audioStream) {
      stopAudioCapture(audioStream, dispatch);
    }
  };

  const currentDeviceId = audioStream?.getAudioTracks()?.[0]?.getSettings()?.deviceId;
  let devices = [];
  for (const d of state.mediaDevices) {
    // Only intersted in audio inputs
    if (d.kind !== 'audioinput') {
      continue;
    }

    // If we already have a device with that device ID, we ignore it.
    if (devices.some(od => od.deviceId === d.deviceId)) {
      continue;
    }

    devices.push(d);
  }

  const changeDevice = async deviceId => {
    dispatch({ type: 'CHOOSE_AUDIO', payload: MICROPHONE_REQUEST });
    if (audioStream) {
      stopAudioCapture(audioStream, dispatch);
    }

    const success = await startAudioCapture(dispatch, { exact: deviceId });
    dispatch({ type: 'CHOOSE_AUDIO', payload: success ? MICROPHONE : NONE });
  }

  return (
    <StepContainer>
      <Styled.h1>{t('sources-audio-question')}</Styled.h1>
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
          { audioStream && devices.length > 0 && (
            <select
              sx={{ variant: 'styles.select' }}
              value={currentDeviceId}
              onChange={e => changeDevice(e.target.value)}
            >
              {
                devices.map((d, i) => (
                  <option key={i} value={d.deviceId}>{ d.label }</option>
                ))
              }
            </select>
          )}
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
    </StepContainer>
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
