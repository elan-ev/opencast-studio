//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { faMicrophone, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Card, Flex, Heading, Text } from '@theme-ui/components';
import { Fragment, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useDispatch, useRecordingState } from '../../../recording-context';
import Notification from '../../notification';

import { startAudioCapture, stopAudioCapture } from '../capturer';
import { ShareButton } from '../elements';

import PreviewAudio from './preview-audio';

export default function SourceAudioMedia() {
  const { t } = useTranslation();
  const { audioStream, audioAllowed } = useRecordingState();
  const dispatch = useDispatch();

  const handleShare = useCallback(
    event => {
      startAudioCapture(dispatch);
    },
    [dispatch]
  );

  const handleUnshare = useCallback(
    event => {
      stopAudioCapture(audioStream, dispatch);
    },
    [audioStream, dispatch]
  );

  return (
    <Fragment>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Styled.h2>{t('source-audio-title')}</Styled.h2>
        {audioStream && (
          <Box>
            <UnshareButton handleClick={handleUnshare}>Stop sharing</UnshareButton>
          </Box>
        )}
      </Flex>

      {audioAllowed === false && (
        <Notification isDanger>
          <Heading as="h3" mb={2}>
            {t('source-audio-not-allowed-title')}
          </Heading>
          <Text>{t('source-audio-not-allowed-text')}</Text>
        </Notification>
      )}

      {!audioStream ? (
        <Box>
          <Text pb={4}>
            {
              'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
            }
          </Text>
          <ShareButton handleClick={handleShare} icon={faMicrophone}>
            {t('source-share-prompt')}
          </ShareButton>
        </Box>
      ) : (
        <PreviewStream stream={audioStream} text={t('sources-select-audio')}></PreviewStream>
      )}
    </Fragment>
  );
}

function PreviewStream({ children, stream, text }) {
  return (
    <Card sx={{
      maxWidth: [400, 600],
      mx: 'auto',
      display: 'flex',
      flexDirection: 'column' ,
      width: '100%',
      maxHeight: '350px',
      flex: '1 0 auto',
    }}>
      <PreviewAudio stream={stream} />
      <Text p={2} color="muted">
        {text}
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
