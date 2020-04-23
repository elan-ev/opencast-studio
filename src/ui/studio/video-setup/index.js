//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { faChalkboard, faChalkboardTeacher, faUser } from '@fortawesome/free-solid-svg-icons';
import { Container, Flex, Heading, Text } from '@theme-ui/components';
import { Styled } from 'theme-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useDispatch, useStudioState } from '../../../studio-state';
import { useSettings } from '../../../settings';

import Notification from '../../notification';

import {
  startDisplayCapture,
  startUserCapture,
  stopDisplayCapture,
  stopUserCapture
} from '../capturer';
import { ActionButtons } from '../elements';
import { SourcePreview } from './preview';


export default function VideoSetup(props) {
  const { t } = useTranslation();

  const settings = useSettings();
  const dispatch = useDispatch();
  const state = useStudioState();
  const { displayStream, userStream, displaySupported, userSupported } = state;

  const hasStreams = displayStream || userStream;
  const anySupported = displaySupported || userSupported;
  const bothSupported = displaySupported && userSupported;

  const BOTH = 'both';
  const DISPLAY = 'display';
  const USER = 'user';
  const NONE = 'none';

  const [activeSource, setActiveSource] = useState(
    (displayStream && userStream && BOTH)
      || (displayStream && DISPLAY)
      || (userStream && USER)
      || NONE
  );


  const clickUser = async () => {
    setActiveSource(USER);
    await startUserCapture(dispatch, settings);
  };
  const clickDisplay = async () => {
    setActiveSource(DISPLAY);
    await startDisplayCapture(dispatch, settings);
  };
  const clickBoth = async () => {
    setActiveSource(BOTH);
    await startUserCapture(dispatch, settings);
    await startDisplayCapture(dispatch, settings);
  };

  const reselectSource = () => {
    setActiveSource(NONE);
    stopUserCapture(state.userStream, dispatch);
    stopDisplayCapture(state.displayStream, dispatch);
  };

  const userHasWebcam = props.userHasWebcam;

  const nextDisabled = activeSource === NONE
    || activeSource === BOTH ? (!displayStream || !userStream) : !hasStreams;

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
  switch (activeSource) {
    case NONE:
      title = t('sources-video-question');
      hideActionButtons = true;
      if (anySupported) {
        body = <React.Fragment>
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
            { bothSupported && <OptionButton
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
      } else {
        body = <Notification isDanger>{t('sources-video-none-available')}</Notification>;
      }
      break;

    case USER:
      title = t('sources-video-user-selected');
      hideActionButtons = !state.userStream && state.userAllowed !== false;
      body = <SourcePreview
        reselectSource={reselectSource}
        warnings={[userWarning, unexpectedEndWarning]}
        inputs={[{
          kind: t('sources-user'),
          stream: state.userStream,
          allowed: state.userAllowed,
          unexpectedEnd: state.userUnexpectedEnd,
        }]}
      />;
      break;

    case DISPLAY:
      title = t('sources-video-display-selected');
      hideActionButtons = !state.displayStream && state.displayAllowed !== false;
      body = <SourcePreview
        reselectSource={reselectSource}
        warnings={[displayWarning, unexpectedEndWarning]}
        inputs={[{
          kind: t('sources-display'),
          stream: state.displayStream,
          allowed: state.displayAllowed,
          unexpectedEnd: state.displayUnexpectedEnd,
        }]}
      />;
      break;

    case BOTH:
      title = t('sources-video-display-and-user-selected');
      hideActionButtons = (!state.userStream && state.userAllowed !== false)
        || (!state.displayStream && state.displayAllowed !== false);
      body = <SourcePreview
        reselectSource={reselectSource}
        warnings={[displayWarning, userWarning, unexpectedEndWarning]}
        inputs={[
          {
            kind: t('sources-display'),
            stream: state.displayStream,
            allowed: state.displayAllowed,
            unexpectedEnd: state.displayUnexpectedEnd,
          },
          {
            kind: t('sources-user'),
            stream: state.userStream,
            allowed: state.userAllowed,
            unexpectedEnd: state.userUnexpectedEnd,
          },
        ]}
      />;
      break;
    default:
      return <p>Something went very wrong</p>;
  };


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
        {title}
      </Styled.h1>

      { body }

      {activeSource !== NONE && <div sx={{ mb: 3 }}></div>}

      {activeSource !== NONE && <ActionButtons
        next={hideActionButtons ? null : { onClick: () => props.nextStep(), disabled: nextDisabled }}
        prev={hideActionButtons ? null : {
          onClick: reselectSource,
          disabled: false,
          label: 'sources-video-reselect-source',
        }}
      />}
    </Container>
  );
}

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
