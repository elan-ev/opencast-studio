//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Fragment, useEffect, useRef } from 'react';
import { Card, Spinner } from '@theme-ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { VideoBox, useVideoBoxResize, VideoBoxChild } from '../elements';
import { dimensionsOf } from '../../../util';
import { StreamSettings } from './prefs';
import { Input } from '.';



type SourcePreviewProps = {
  inputs: Input[];
  warnings: JSX.Element[];
}

// Shows the preview for one or two input streams. The previews also show
// preferences allowing the user to change the webcam and the like.
export const SourcePreview: React.FC<SourcePreviewProps> = ({ warnings, inputs }) => {
  let children: VideoBoxChild[];
  switch (inputs.length) {
    case 1:
      children = [{
        body: <StreamPreview input={inputs[0]} />,
        dimensions: () => dimensionsOf(inputs[0].stream),
      }];
      break;
    case 2:
      children = [
        {
          body: <StreamPreview input={inputs[0]} />,
          dimensions: () => dimensionsOf(inputs[0].stream),
        },
        {
          body: <StreamPreview input={inputs[1]} />,
          dimensions: () => dimensionsOf(inputs[1].stream),
        },
      ];
      break;
    default:
      return <p>Something went very wrong</p>;
  }

  // Below this value, the video preference menu looks awful.
  const minWidth = 300;

  return (
    <Fragment>
      { warnings }
      <VideoBox minWidth={minWidth} gap={20}>{ children }</VideoBox>
    </Fragment>
  );
};

const StreamPreview: React.FC<{ input: Input }> = ({ input }) => (
  <Card sx={{ height: '100%', overflow: 'hidden', backgroundColor: 'element_bg' }}>
    <PreviewVideo input={input} />
    <StreamSettings isDesktop={input.isDesktop} stream={input.stream} />
  </Card>
);

const PreviewVideo: React.FC<{ input: Input }> = ({ input }) => {
  const { allowed, stream, unexpectedEnd } = input;
  const resizeVideoBox = useVideoBoxResize();

  const videoRef = useRef<HTMLVideoElement>(null);
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
    let inner: JSX.Element;
    if (allowed === false || unexpectedEnd) {
      inner = <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />;
    } else {
      inner = <Spinner size="75"/>;
    }

    return (
      <div tabIndex={-1}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: '120px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        { inner }
      </div>
    );
  }

  return (
    <video tabIndex={-1}
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
