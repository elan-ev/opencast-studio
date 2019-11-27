//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useEffect, useRef } from 'react';

export default function MediaDevice({ onClick, title, icon, stream }) {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && typeof stream != 'undefined') {
      videoRef.current.srcObject = stream;
    }
  });

  return (
    <div
      onClick={stream ? null : onClick}
      data-title={title}
      sx={{
        backgroundColor: 'gray.3',
        boxShadow: '0 2px 2px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        zIndex: '0',
        cursor: stream ? 'initial' : 'pointer',
        position: 'relative',

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        sx={{
          outline: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          background: 'transparent'
        }}
      ></video>
    </div>
  );
}
