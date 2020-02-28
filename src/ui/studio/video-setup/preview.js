//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Fragment, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Text, Spinner } from '@theme-ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

import { VideoBox, useVideoBoxResize } from '../elements.js';
import { dimensionsOf } from '../../../util.js';

const SUBBOX_HEIGHT = 40;

export function SourcePreview({ reselectSource, warnings, inputs }) {
  const { t } = useTranslation();

  let children;
  switch (inputs.length) {
    case 1:
      children = [{
        body: <StreamPreview input={inputs[0]} text={t('sources-select-user')} />,
        dimensions: () => dimensionsOf(inputs[0].stream),
        extraHeight: SUBBOX_HEIGHT,
      }];
      break;
    case 2:
      children = [
        {
          body: <StreamPreview input={inputs[0]} text={t('sources-select-display')} />,
          dimensions: () => dimensionsOf(inputs[0].stream),
          extraHeight: SUBBOX_HEIGHT,
        },
        {
          body: <StreamPreview input={inputs[1]} text={t('sources-select-user')} />,
          dimensions: () => dimensionsOf(inputs[1].stream),
          extraHeight: SUBBOX_HEIGHT,
        },
      ];
      break;
    default:
      return <p>Something went very wrong</p>;
  }

  return (
    <Fragment>
      { warnings }
      <VideoBox gap={20}>{ children }</VideoBox>
    </Fragment>
  );
}

function StreamPreview({ input, text }) {
  const stream = input.stream;
  const track = stream?.getVideoTracks()?.[0];
  const { width, height } = track?.getSettings() ?? {};

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <PreviewVideo allowed={input.allowed} stream={stream} />
      <Text p={2} color="muted" sx={{ height: `${SUBBOX_HEIGHT}px` }}>
        {text}
        {track && `: ${width}×${height}`}
      </Text>
    </Card>
  );
}

export const PreviewVideo = ({ allowed, stream, ...props }) => {
  const resizeVideoBox = useVideoBoxResize();

  const videoRef = useRef();
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      if (!v.srcObject) {
        v.srcObject = stream;
      }
      v.addEventListener('resize', resizeVideoBox);
    }

    return () => {
      if (v) {
        v.removeEventListener('resize', resizeVideoBox);
      }
    };
  }, [stream, resizeVideoBox]);

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
