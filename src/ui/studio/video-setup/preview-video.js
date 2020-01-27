//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useEffect, useRef } from 'react';

export default function PreviewVideo({ stream, ...props }) {
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
}
