//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import Oscilloscope from 'oscilloscope';
import { useEffect, useRef } from 'react';

export default function PreviewAudio({ stream }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f1c40f';

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const scope = new Oscilloscope(source, { fftSize: 1024 });
      scope.animate(ctx);

      return () => scope.stop();
    }
    return () => {};
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      width='800px'
      height='200px'
      sx={{
        width: '100%',
        maxHeight: '200px',
        minHeight: 0,
        flex: '1 0 70px',
        bg: 'rgba(0,0,0,0.8)',
        borderRadius: '7px',
       }}
    />
  );
}
