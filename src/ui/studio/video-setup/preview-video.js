//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { AspectRatio } from '@theme-ui/components';
import { useEffect, useRef } from 'react';

export default function PreviewVideo({ stream, ...props }) {
  const videoRef = useRef();

  useEffect(() => {
    videoRef.current.srcObject = stream;

    return () => {};
  }, [stream]);

  return (
    <AspectRatio
      ratio={16 / 9}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.3'
      }}
      {...props}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          overflow: 'hidden'
          // TODO: (mel) research this setting
          // transform: 'rotateY(180deg)'
        }}
      />
    </AspectRatio>
  );
}
