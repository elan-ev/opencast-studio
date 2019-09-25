//; -*- mode: rjsx;-*-
import React from 'react';
import styled, { keyframes } from 'styled-components/macro';

const Loading = props => {
  return (
    <div className={props.className}>
      <svg width="192" height="192">
        <circle
          r="82"
          cx="96"
          cy="96"
          fill="none"
          stroke="#00bdc4"
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
        ></circle>
      </svg>
      <span>Loading...</span>
    </div>
  );
};

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const StyledLoading = styled(Loading)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 12rem;
  height: 12rem;
  transition: opacity 0.5s 0.5s, visibility 0s 1s;

  svg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    opacity: 1;
    animation: ${rotate} 6s infinite linear;
  }

  svg circle {
    position: absolute;
    top: 0;
    left: 0;
    position: absolute;
  }

  circle:nth-of-type(2) {
    animation: circleCover1 3s infinite linear;
    transform-origin: 50% 50%;
  }

  circle:nth-of-type(3) {
    transform-origin: 50% 50%;
    transform: rotateX(180deg) rotateZ(-16deg);
  }

  span {
    text-align: center;
    position: absolute;
    max-width: 80%;
    max-height: 80%;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    position: absolute;
    font-style: italic;
    font-size: 1.25rem;
    color: #666;
  }
`;

export default StyledLoading;
