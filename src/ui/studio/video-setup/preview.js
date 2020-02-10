//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { Fragment, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Flex, Grid, Text, Spinner } from '@theme-ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';


export function SourcePreview({ reselectSource, title, warnings, inputs }) {
  const { t } = useTranslation();

  let preview;
  switch (inputs.length) {
    case 1:
      preview = (
        <StreamPreview input={inputs[0]} text={t('sources-select-user')} />
      );
      break;
    case 2:
      preview = <Grid gap={3} columns={[1, 2]} sx={{ minHeight: 0 }}>
        <StreamPreview input={inputs[0]} text={t('sources-select-display')} />
        <StreamPreview input={inputs[1]} text={t('sources-select-user')} />
      </Grid>
      break;
    default:
      return <p>Something went very wrong</p>;
  }

  return (
    <Fragment>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Styled.h2 sx={{ mt: 0 }}>{ title }</Styled.h2>
      </Flex>

      { warnings }
      { preview }
    </Fragment>
  );
}

function StreamPreview({ input, text }) {
  const stream = input.stream;
  const track = stream?.getVideoTracks()?.[0];
  const { width, height } = track?.getSettings() ?? {};

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: '0 1 auto', minHeight: 0 }}>
      <PreviewVideo allowed={input.allowed} stream={stream} />
      <Text p={2} color="muted">
        {text}
        {track && `: ${width}×${height}`}
      </Text>
    </Card>
  );
}

export const PreviewVideo = ({ allowed, stream, ...props }) => {
  const videoRef = useRef();
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    return () => {};
  }, [stream]);

  if (!stream) {
    let inner;
    if (allowed === false) {
      inner = <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />;
    } else {
      inner = <Spinner size="75"/>;
    }

    return (
      <div sx={{
        width: '100%',
        height: '100%',
        minHeight: '120px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        { inner }
      </div>
    );
  }

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
