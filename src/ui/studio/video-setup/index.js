//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { faChalkboard, faChalkboardTeacher, faUser } from '@fortawesome/free-solid-svg-icons';
import { Container, Flex, Heading, Text } from '@theme-ui/components';
import { Styled } from 'theme-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  useDispatch,
  useStudioState,
  VIDEO_SOURCE_BOTH,
  VIDEO_SOURCE_DISPLAY,
  VIDEO_SOURCE_USER,
  VIDEO_SOURCE_NONE,
} from '../../../studio-state';
import { useSettings } from '../../../settings';
import { deviceIdOf } from '../../../util';

import Notification from '../../notification';

import {
  startDisplayCapture,
  startUserCapture,
  stopDisplayCapture,
  stopUserCapture
} from '../capturer';
import { ActionButtons } from '../elements';
import { SourcePreview } from './preview';


const LAST_VIDEO_DEVICE_KEY = 'ocStudioLastVideoDevice';
const CAMERA_ASPECT_RATIO_KEY = 'ocStudioCameraAspectRatio';


export default function VideoSetup({ nextStep, userHasWebcam }) {
  const { t } = useTranslation();

  const settings = useSettings();
  const dispatch = useDispatch();
  const state = useStudioState();
  const { displayStream, userStream, videoChoice: activeSource } = state;
  const hasStreams = displayStream || userStream;
  const setActiveSource = s => dispatch({ type: 'CHOOSE_VIDEO', payload: s });

  // Handle user preferences regarding the camera stream. Defaults are loaded
  // from local storage. That's also why we don't need to uplift this into
  // studio state.
  const [cameraPreferences, setVideoPreferences] = useState({
    deviceId: window.localStorage.getItem(LAST_VIDEO_DEVICE_KEY),
    aspectRatio: window.localStorage.getItem(CAMERA_ASPECT_RATIO_KEY) || 'auto',
  });

  // Creates a valid constraints object from the user preferences. The mapping
  // is as follows:
  //
  // - deviceId: falsy (-> ignored) or string (-> passed on)
  // - aspectRatio: '16:9' or '4:3' (-> passed on), ignored on any other value
  const prefsToConstraints = prefs => ({
    ...(prefs.deviceId && { deviceId: { ideal: prefs.deviceId }}),
    ...(() => {
      switch (prefs.aspectRatio) {
        case '4:3': return { aspectRatio: { ideal: 4 / 3 }};
        case '16:9': return { aspectRatio: { ideal: 16 / 9 }};
        default: return {};
      }
    })(),
  });
  const userConstraints = prefsToConstraints(cameraPreferences);

  // Callback passed to the components that allow the user to change the
  // preferences. `newPrefs` is merged into the existing preferences, the
  // resulting preferences are set and the webcam stream is re-requested with
  // the updated constraints.
  const updateCameraPrefs = newPrefs => {
    // Merge and update preferences.
    const merged = { ...cameraPreferences, ...newPrefs };
    const constraints = prefsToConstraints(merged);
    setVideoPreferences(merged);

    // Update preferences in local storage. We don't update the device ID
    // though, as that is done below in the `useEffect` invocation.
    window.localStorage.setItem(CAMERA_ASPECT_RATIO_KEY, merged.aspectRatio);

    // Apply new preferences by rerequesting camera stream.
    stopUserCapture(userStream, dispatch);
    startUserCapture(dispatch, settings, constraints);
  };

  // Store the camera device ID in local storage. We do this here, as we also
  // want to remember the device the user initially selected.
  useEffect(() => {
    const cameraDeviceId = deviceIdOf(userStream);
    if (cameraDeviceId) {
      window.localStorage.setItem(LAST_VIDEO_DEVICE_KEY, cameraDeviceId);
    }
  });

  const reselectSource = () => {
    setActiveSource(VIDEO_SOURCE_NONE);
    stopUserCapture(state.userStream, dispatch);
    stopDisplayCapture(state.displayStream, dispatch);
  };


  const nextDisabled = activeSource === VIDEO_SOURCE_NONE
    || activeSource === VIDEO_SOURCE_BOTH ? (!displayStream || !userStream) : !hasStreams;

  // The warnings if we are not allowed to capture a stream.
  const userWarning = (state.userAllowed === false) && (
    <Notification key="user-stream-warning" isDanger>
      <Heading as="h3" mb={2}>
        {t('source-user-not-allowed-title')}
      </Heading>
      <Text>{t('source-user-not-allowed-text')}</Text>
    </Notification>
  );
  const displayWarning = (state.displayAllowed === false) && (
    <Notification key="display-stream-warning" isDanger>
      <Heading as="h3" mb={2}>
        {t('source-display-not-allowed-title')}
      </Heading>
      <Text>{t('source-display-not-allowed-text')}</Text>
    </Notification>
  );
  const unexpectedEndWarning = (state.userUnexpectedEnd || state.displayUnexpectedEnd) && (
    <Notification key="unexpexted-stream-end-warning" isDanger>
      <Text>{t('error-lost-video-stream')}</Text>
    </Notification>
  );

  // The body depends on which source is currently selected.
  let hideActionButtons;
  let title;
  let body;

  const userInput = {
    isDesktop: false,
    stream: state.userStream,
    allowed: state.userAllowed,
    prefs: cameraPreferences,
    updatePrefs: updateCameraPrefs,
    unexpectedEnd: state.userUnexpectedEnd,
  };
  const displayInput = {
    isDesktop: true,
    stream: state.displayStream,
    allowed: state.displayAllowed,
    prefs: null, // TODO
    updatePrefs: null, // TODO
    unexpectedEnd: state.displayUnexpectedEnd,
  };
  switch (activeSource) {
    case VIDEO_SOURCE_NONE:
      title = t('sources-video-question');
      hideActionButtons = true;
      body = <SourceSelection {...{ setActiveSource, userConstraints, userHasWebcam }} />;
      break;

    case VIDEO_SOURCE_USER:
      title = t('sources-video-user-selected');
      hideActionButtons = !state.userStream && state.userAllowed !== false;
      body = <SourcePreview
        warnings={[userWarning, unexpectedEndWarning]}
        inputs={[userInput]}
      />;
      break;

    case VIDEO_SOURCE_DISPLAY:
      title = t('sources-video-display-selected');
      hideActionButtons = !state.displayStream && state.displayAllowed !== false;
      body = <SourcePreview
        warnings={[displayWarning, unexpectedEndWarning]}
        inputs={[displayInput]}
      />;
      break;

    case VIDEO_SOURCE_BOTH:
      title = t('sources-video-display-and-user-selected');
      hideActionButtons = (!state.userStream && state.userAllowed !== false)
        || (!state.displayStream && state.displayAllowed !== false);
      body = <SourcePreview
        warnings={[displayWarning, userWarning, unexpectedEndWarning]}
        inputs={[displayInput, userInput]}
      />;
      break;
    default:
      console.error('bug: active source has an unexpected value');
      return <p>Something went very wrong (internal error) :-(</p>;
  };

  const hideReselectSource = hideActionButtons
    && !state.userUnexpectedEnd && !state.displayUnexpectedEnd;

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
      }}
    >
      <Styled.h1 sx={{ textAlign: 'center', fontSize: ['26px', '30px', '32px'] }}>
        { title }
      </Styled.h1>

      { body }

      { activeSource !== VIDEO_SOURCE_NONE && <div sx={{ mb: 3 }} /> }

      { activeSource !== VIDEO_SOURCE_NONE && <ActionButtons
        next={hideActionButtons ? null : { onClick: () => nextStep(), disabled: nextDisabled }}
        prev={hideReselectSource ? null : {
          onClick: reselectSource,
          disabled: false,
          label: 'sources-video-reselect-source',
        }}
      /> }
    </Container>
  );
}

const SourceSelection = ({ setActiveSource, userConstraints, userHasWebcam }) => {
  const { t } = useTranslation();

  const settings = useSettings();
  const dispatch = useDispatch();
  const state = useStudioState();
  const { displaySupported, userSupported } = state;

  const clickUser = async () => {
    setActiveSource(VIDEO_SOURCE_USER);
    await startUserCapture(dispatch, settings, userConstraints);
    await queryMediaDevices(dispatch);
  };
  const clickDisplay = async () => {
    setActiveSource(VIDEO_SOURCE_DISPLAY);
    await startDisplayCapture(dispatch, settings);
  };
  const clickBoth = async () => {
    setActiveSource(VIDEO_SOURCE_BOTH);
    await startUserCapture(dispatch, settings, userConstraints);
    await Promise.all([
      queryMediaDevices(dispatch),
      startDisplayCapture(dispatch, settings),
    ]);
  };


  if (!displaySupported && !userSupported) {
    return <Notification isDanger>{t('sources-video-none-available')}</Notification>;
  }

  return <React.Fragment>
    <Spacer />
    <Flex
      sx={{
        flexDirection: ['column', 'row'],
        maxWidth: [270, 850],
        width: '100%',
        mx: ['auto', 'none'],
        mb: 3,
        flex: '4 1 auto',
        maxHeight: ['none', '270px'],
        justifyContent: 'center',
        '& > :not(:last-of-type)': {
          mb: [3, 0],
          mr: [0, 3],
        },
      }}
    >
      { displaySupported && <OptionButton
        label={t('sources-scenario-display')}
        icon={faChalkboard}
        onClick={clickDisplay}
      />}
      { displaySupported && userSupported && <OptionButton
        label={t('sources-scenario-display-and-user')}
        icon={faChalkboardTeacher}
        onClick={clickBoth}
        disabledText={userHasWebcam ? false : t('sources-video-no-cam-detected')}
      />}
      { userSupported && <OptionButton
        label={t('sources-scenario-user')}
        icon={faUser}
        onClick={clickUser}
        disabledText={userHasWebcam ? false : t('sources-video-no-cam-detected')}
      />}
    </Flex>
    <Spacer />
  </React.Fragment>;
};

const OptionButton = ({ icon, label, onClick, disabledText = false }) => {
  const disabled = disabledText !== false;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      sx={{
        fontFamily: 'inherit',
        color: disabled ? 'gray.2' : 'gray.0',
        border: theme => `2px solid ${disabled ? theme.colors.gray[2] : 'black'}`,
        backgroundColor: 'gray.4',
        borderRadius: '8px',
        flex: ['1 1 auto', '0 1 100%'],
        minWidth: '180px',
        maxWidth: '300px',
        minHeight: '120px',
        maxHeight: '250px',
        p: 2,
        '&:hover': disabled ? {} : {
          boxShadow: theme => `0 0 10px ${theme.colors.gray[2]}`,
          backgroundColor: 'white',
        },
      }}
    >
      <div sx={{ display: 'block', textAlign: 'center', mb: 3 }}>
        <FontAwesomeIcon icon={icon} size="3x"/>
      </div>
      <div sx={{ fontSize: 4 }}>{label}</div>
      <div sx={{ fontSize: 2, mt: 1 }}>{disabledText}</div>
    </button>
  );
};

const Spacer = (rest) => <div sx={{ flex: '1 0 0' }} {...rest}></div>;

const queryMediaDevices = async (dispatch) => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  dispatch({ type: 'UPDATE_MEDIA_DEVICES', payload: devices });
};
