//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Themed } from 'theme-ui';

import { Flex, Heading, Spinner, Text } from '@theme-ui/components';
import { useEffect, Fragment } from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faMicrophone,
  faMicrophoneSlash,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

import {
  useDispatch,
  useStudioState,
  AUDIO_SOURCE_MICROPHONE,
  AUDIO_SOURCE_NONE,
} from '../../../studio-state';
import { startAudioCapture, stopAudioCapture } from '../capturer';
import { ActionButtons, StepContainer } from '../elements';
import Notification from '../../notification';
import { queryMediaDevices, getUniqueDevices } from '../../../util';
import PreviewAudio from './preview-audio';
import { recordShortcuts } from '../../../shortcuts';
import { StepProps } from '../steps';


const LAST_AUDIO_DEVICE_KEY = 'ocStudioLastAudioDevice';


// The audio setup page. This component manages the state (either 'none
// selected' or 'microphone selected') and renders the correct component.
export default function AudioSetup(props: StepProps) {
  const dispatch = useDispatch();
  const { audioStream, audioChoice } = useStudioState();

  const backToVideoSetup = () => props.previousStep();
  const enterStudio = () => props.nextStep();

  const selectNoAudio = () => enterStudio();
  const selectMicrophone = async() => {
    dispatch({ type: 'CHOOSE_AUDIO', choice: 'microphone' });
    const deviceId = window.localStorage.getItem(LAST_AUDIO_DEVICE_KEY);
    await startAudioCapture(dispatch, deviceId ? { ideal: deviceId } : undefined);
    await queryMediaDevices(dispatch);
  };
  const reselectSource = () => {
    if (audioStream) {
      stopAudioCapture(audioStream, dispatch);
    }
    dispatch({ type: 'CHOOSE_AUDIO', choice: 'none' });
  };

  const body = (() => {
    switch (audioChoice) {
      case AUDIO_SOURCE_NONE:
        return <SourceSelection {...{ selectNoAudio, selectMicrophone, backToVideoSetup }} />;
      case AUDIO_SOURCE_MICROPHONE:
        return <MicrophonePreview {...{ reselectSource, enterStudio }} />;
      default:
        return 'internal error :-(';
    }
  })();

  return <StepContainer>{ body }</StepContainer>;
}

// The two large option buttons for "no audio" and "Microphone".
const SourceSelection = ({ selectNoAudio, selectMicrophone, backToVideoSetup }) => {
  const { t } = useTranslation();

  const handlers = {
    RECORD_AUDIO: selectMicrophone,
    NO_AUDIO: selectNoAudio,
  };

  return (
    <GlobalHotKeys keyMap={recordShortcuts} handlers={handlers}>
      <Fragment>
        <Themed.h1>{t('sources-audio-question')}</Themed.h1>

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
            onClick={selectMicrophone}
          />
          <OptionButton
            icon={faMicrophoneSlash}
            label={t('sources-audio-without-audio')}
            onClick={selectNoAudio}
          />
        </Flex>

        <ActionButtons prev={{ onClick: backToVideoSetup }} />
      </Fragment>
    </GlobalHotKeys>
  );
};

// Once the microphone is selected, this is shown. Renders an
// audio-visualization and a device-selector.
const MicrophonePreview = ({ reselectSource, enterStudio }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const state = useStudioState();
  const { audioStream, audioAllowed, audioUnexpectedEnd } = state;

  // Get current device ID and all possible audio input devices.
  const currentDeviceId = audioStream?.getAudioTracks()?.[0]?.getSettings()?.deviceId;
  const devices = getUniqueDevices(state.mediaDevices, 'audioinput');

  // We write the currently used device ID to local storage to remember it
  // between visits of Studio.
  useEffect(() => {
    if (currentDeviceId) {
      window.localStorage.setItem(LAST_AUDIO_DEVICE_KEY, currentDeviceId);
    }
  });

  const changeDevice = async(deviceId: string) => {
    // The stream is only falsy if it unexpectedly ended.
    if (audioStream) {
      stopAudioCapture(audioStream, dispatch);
    }

    await startAudioCapture(dispatch, { exact: deviceId });
  };

  const Spacer = ({ min, max }) => <div sx={{ flex: 1, maxHeight: max, minHeight: min }} />;

  let body: JSX.Element;
  if (audioStream) {
    body = <Fragment>
      <PreviewAudio stream={audioStream} />
      <div sx={{
        display: 'flex',
        width: '80%',
        my: 3,
        fontSize: '18px',
        minWidth: '285px',
        'align-items': 'center'
      }}>
        <label htmlFor="sources-audio-device"
          sx={{
            mr: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>{ t('sources-audio-device') }:</label>
        <select
          id="sources-audio-device"
          sx={{ variant: 'styles.select', flex: '1 0 0', minWidth: 0 }}
          value={currentDeviceId}
          onChange={e => changeDevice(e.target.value)}
        >
          {
            devices.map((d, i) => (
              <option key={i} value={d.deviceId}>{ d.label || "unlabeled microphone" }</option>
            ))
          }
        </select>
      </div>
    </Fragment>;
  } else if (audioAllowed === false) {
    body = <Fragment>
      <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
      <Spacer min="16px" max="48px" />
      <Notification isDanger>
        <Heading as="h3" mb={2}>
          {t('source-audio-not-allowed-title')}
        </Heading>
        <Text variant="text">{t('source-audio-not-allowed-text')}</Text>
      </Notification>
    </Fragment>;
  } else if (audioUnexpectedEnd === true) {
    body = <Fragment>
      <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
      <Spacer min="16px" max="48px" />
      <Notification isDanger>
        <Text variant="text">{t('error-lost-audio-stream')}</Text>
      </Notification>
    </Fragment>;
  } else {
    body = <Spinner size="75"/>;
  }

  return (
    <Fragment>
      <Themed.h1>{ t('sources-audio-microphone-selected') }</Themed.h1>

      <div sx={{
        maxWidth: 850,
        width: '100%',
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '1 0 auto',
        maxHeight: '400px',
      }}>{ body }</div>

      <ActionButtons
        prev={{ label: 'sources-audio-reselect-audio', onClick: reselectSource }}
        next={{ onClick: enterStudio }}
      />
    </Fragment>
  );
};

type OptionButtonProps = React.PropsWithChildren<{
  icon: IconProp;
  label: string;
  onClick: () => void;
}>;

const OptionButton: React.FC<OptionButtonProps> = ({ children, icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      sx={{
        fontFamily: 'inherit',
        color: 'gray.0',
        backgroundColor: 'gray.4',
        border: '2px solid black',
        borderRadius: '8px',
        flex: '0 1 50%',
        p: 2,
        '&:hover': {
          boxShadow: theme => `0 0 10px ${theme.colorz.gray[2]}`,
          filter: 'brightness(1.2)',
        },
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
