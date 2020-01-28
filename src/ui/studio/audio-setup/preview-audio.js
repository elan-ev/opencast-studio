//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, useThemeUI } from 'theme-ui';

import Oscilloscope from 'oscilloscope';
import { useEffect, useRef } from 'react';

export default function PreviewAudio({ stream, ...props }) {
  const canvasRef = useRef();
  const { theme } = useThemeUI();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 1;
      ctx.strokeStyle = theme.colors.primary;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const scope = new Oscilloscope(source, { fftSize: 1024 });
      scope.animate(ctx);

      return () => scope.stop();
    }
    return () => {};
  }, [theme.colors, stream]);

  return (
    <canvas
      ref={canvasRef}
      sx={{
        width: '100%',
        height: '100%',
        bg: 'gray.3',
        minHeight: 0,
        flex: '1 0 0',
       }}
    />
  );
}
