//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { Fragment, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, Flex, Grid, Text } from '@theme-ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';


export function SourcePreview({ reselectSource, title, warnings, streams }) {
  const { t } = useTranslation();

  let preview;
  switch (streams.length) {
    case 1:
      preview = streams[0] && (
        <StreamPreview stream={streams[0]} text={t('sources-select-user')} />
      );
      break;
    case 2:
      preview = <Grid gap={3} columns={[1, 2]} sx={{ minHeight: 0 }}>
        <StreamPreview text={t('sources-select-display')} stream={streams[0]} />
        <StreamPreview text={t('sources-select-user')} stream={streams[1]} />
      </Grid>
      break;
    default:
      return <p>Something went very wrong</p>;
  }

  return (
    <Fragment>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Styled.h2>{ title }</Styled.h2>
        <Box>
          <UnshareButton handleClick={reselectSource} />
        </Box>
      </Flex>

      { warnings }
      { preview }
    </Fragment>
  );
}

function StreamPreview({ stream, text }) {
  const track = stream?.getVideoTracks()?.[0];
  const { width, height } = track?.getSettings() ?? {};

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: '0 1 auto', minHeight: 0 }}>
      <PreviewVideo stream={stream} />
      <Text p={2} color="muted">
        {text}
        {track && `: ${width}×${height}`}
      </Text>
    </Card>
  );
}

export const PreviewVideo = ({ stream, ...props }) => {
  const videoRef = useRef();

  useEffect(() => {
    videoRef.current.srcObject = stream;

    return () => {};
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      sx={{
        minHeight: 0,
        display: 'block',
        width: '100%',
        height: '100%',
        // TODO: (mel) research this setting
        // transform: 'rotateY(180deg)'
      }}
    />
  );
};

export const UnshareButton = ({ handleClick }) => {
  const { t } = useTranslation();

  return (
    <Button onClick={handleClick} variant="text">
      <FontAwesomeIcon icon={faTimes} />
      {t('sources-video-reselect-source')}
    </Button>
  );
};
