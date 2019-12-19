//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { faChalkboardTeacher, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Card, Flex, Heading, Text } from '@theme-ui/components';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useDispatch, useRecordingState } from '../../../recording-context';

import Notification from '../../notification';

import {
  startDisplayCapture,
  startUserCapture,
  stopDisplayCapture,
  stopUserCapture
} from '../capturer';
import { ShareButton, SplitPane } from '../elements';

import PreviewVideo from './preview-video';

export default function SourceDisplayAndUserMedia() {
  const { t } = useTranslation();
  const state = useRecordingState();
  const dispatch = useDispatch();

  const handleShare = useCallback(
    event => {
      startDisplayCapture(dispatch).then(() => {
        const userConstraints = {
          video: { height: { ideal: 1080 }, facingMode: 'user' },
          audio: false
        };
        startUserCapture(dispatch, userConstraints);
      });
    },
    [dispatch]
  );

  const handleUnshare = useCallback(
    event => {
      stopDisplayCapture(state.displayStream, dispatch);
      stopUserCapture(state.userStream, dispatch);
    },
    [state.displayStream, state.userStream, dispatch]
  );

  return (
    <Box>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Styled.h2>{t('source-display-and-user-title')}</Styled.h2>
        {(state.displayStream || state.userStream) && (
          <Box>
            <UnshareButton handleClick={handleUnshare}>Stop sharing</UnshareButton>
          </Box>
        )}
      </Flex>

      {state.displayAllowed === false && (
        <Notification isDanger>
          <Heading as="h3" mb={2}>
            {t('source-display-not-allowed-title')}
          </Heading>
          <Text>{t('source-display-not-allowed-text')}</Text>
        </Notification>
      )}
      {state.userAllowed === false && (
        <Notification isDanger>
          <Heading as="h3" mb={2}>
            {t('source-user-not-allowed-title')}
          </Heading>
          <Text>{t('source-user-not-allowed-text')}</Text>
        </Notification>
      )}

      {!(state.displayStream || state.userStream) ? (
        <Box>
          <Text pb={4}>
            {t('source-display-and-user-usage')}
          </Text>
          <ShareButton handleClick={handleShare} icon={faChalkboardTeacher}>
            {t('source-share-prompt')}
          </ShareButton>
        </Box>
      ) : (
        <SplitPane
          left={
            state.displayStream ? (
              <PreviewStream
                stream={state.displayStream}
                text={t('sources-select-display')}
              ></PreviewStream>
            ) : null
          }
          right={
            state.userStream ? (
              <PreviewStream
                stream={state.userStream}
                text={t('sources-select-user')}
              ></PreviewStream>
            ) : null
          }
        />
      )}
    </Box>
  );
}

function PreviewStream({ children, stream, text }) {
  const track = stream?.getVideoTracks()?.[0];
  const { width, height } = track?.getSettings();

  return (
    <Card>
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
