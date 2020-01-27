//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { faUser, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Card, Flex, Heading, Text } from '@theme-ui/components';
import { Fragment, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useDispatch, useRecordingState } from '../../../recording-context';

import Notification from '../../notification';

import { startUserCapture, stopUserCapture } from '../capturer';
import { ShareButton } from '../elements';

import PreviewVideo from './preview-video';

export default function SourceUserMedia() {
  const { t } = useTranslation();
  const state = useRecordingState();
  const dispatch = useDispatch();

  const handleShare = useCallback(() => {
    const userConstraints = {
      video: { height: { ideal: 1080 }, facingMode: 'user' },
      audio: false
    };
    startUserCapture(dispatch, userConstraints);
  }, [dispatch]);

  const handleUnshare = useCallback(
    event => {
      stopUserCapture(state.userStream, dispatch);
    },
    [state.userStream, dispatch]
  );

  return (
    <Fragment>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Styled.h2>{t('source-user-title')}</Styled.h2>
        {state.userStream && (
          <Box>
            <UnshareButton handleClick={handleUnshare}>Stop sharing</UnshareButton>
          </Box>
        )}
      </Flex>

      {state.userAllowed === false && (
        <Notification isDanger>
          <Heading as="h3" mb={2}>
            {t('source-user-not-allowed-title')}
          </Heading>
          <Text>{t('source-user-not-allowed-text')}</Text>
        </Notification>
      )}

      {!state.userStream ? (
        <Box>
          <Text pb={4}>
            {t('source-user-usage')}

          </Text>
          <ShareButton handleClick={handleShare} icon={faUser}>
            {t('source-share-prompt')}
          </ShareButton>
        </Box>
      ) : (
        <PreviewStream stream={state.userStream} text={t('sources-select-user')}></PreviewStream>
      )}
    </Fragment>
  );
}

function PreviewStream({ children, stream, text }) {
  const track = stream?.getVideoTracks()?.[0];
  const { width, height } = track?.getSettings();

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: '0 1 auto', minHeight: 0 }}>
      <PreviewVideo stream={stream} />
      <Text p={2} color="muted">
        {text}
        {track && `: ${width}×${height}`}
      </Text>
      {children && <Box p={2}>{children}</Box>}
    </Card>
  );
}

function UnshareButton({ children, handleClick }) {
  return (
    <Button onClick={handleClick} variant="text">
      <FontAwesomeIcon icon={faTimes} />
      {children}
    </Button>
  );
}
