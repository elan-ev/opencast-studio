//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, useThemeUI } from 'theme-ui';
import { keyframes } from '@emotion/core';

const spin = keyframes`
 0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const circleCover = keyframes`
  0% {
    stroke-dashoffset: 0;
    transform: rotateX(180deg) rotateZ(90deg);
  }
  50% {
    stroke-dashoffset: 515;
    transform: rotateX(180deg) rotateZ(90deg);
  }
  50.01% {
    transform: rotateX(0deg) rotateZ(-90deg);
  }
  100% {
    stroke-dashoffset: 0;
    transform: rotateX(0deg) rotateZ(-90deg);
  }
`;

const Loading = () => {
  const { theme } = useThemeUI();

  return (
    <div
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        width: '12rem',
        height: '12rem',
        transition: 'opacity 0.5s 0.5s, visibility 0s 1s'
      }}
    >
      <svg
        width="192"
        height="192"
        sx={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          opacity: 1,
          animation: `${spin} 6s infinite linear`
        }}
      >
        <circle
          r="82"
          cx="96"
          cy="96"
          fill="none"
          stroke={theme.colors.primary}
          strokeWidth="8"
          strokeDashoffset="0"
          strokeDasharray="515"
        ></circle>
        <circle
          r="82"
          cx="96"
          cy="96"
          fill="none"
          stroke="white"
          strokeWidth="14"
          strokeDashoffset="20"
          strokeDasharray="515"
          sx={{
            animation: `${circleCover} 3s infinite linear`,
            transformOrigin: '50% 50%'
          }}
        ></circle>
      </svg>{' '}
      <span
        sx={{
          textAlign: 'center',
          position: 'absolute',
          maxWidth: '80%',
          maxHeight: '80%',
          transform: 'translate(-50%, -50%)',
          top: '50%',
          left: '50%',
          fontStyle: 'italic',
          fontSize: '1.25rem',
          color: 'gray.1'
        }}
      >
        Loading...
      </span>
    </div>
  );
};

export default Loading;
