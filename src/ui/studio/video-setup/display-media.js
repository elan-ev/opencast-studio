//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { faChalkboard, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Card, Flex, Heading, Text } from '@theme-ui/components';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useDispatch, useRecordingState } from '../../../recording-context';

import Notification from '../../notification';

import { startDisplayCapture, stopDisplayCapture } from '../capturer';
import { ShareButton } from '../elements';

import PreviewVideo from './preview-video';

export default function SourceDisplayMedia() {
  const { t } = useTranslation();
  const state = useRecordingState();
  const dispatch = useDispatch();

  const handleShare = useCallback(() => {
    startDisplayCapture(dispatch);
  }, [dispatch]);

  const handleUnshare = useCallback(
    event => {
      stopDisplayCapture(state.displayStream, dispatch);
    },
    [state.displayStream, dispatch]
  );

  return (
    <Box>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Styled.h2>{t('source-display-title')}</Styled.h2>
        {state.displayStream && (
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

      {!state.displayStream ? (
        <Box>
          <Text pb={4}>
            {t('source-display-usage')}
          </Text>
          <ShareButton handleClick={handleShare} icon={faChalkboard}>
            {t('source-share-prompt')}
          </ShareButton>
        </Box>
      ) : (
        <PreviewStream
          stream={state.displayStream}
          text={t('sources-select-display')}
        ></PreviewStream>
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
