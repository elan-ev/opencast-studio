//; -*- mode: rjsx;-*-
import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';

function UnstyledMediaDevice({ className, onClick, title, deviceType, icon, stream }) {
  const videoRef = useRef();
  useEffect(() => {
    videoRef.current.srcObject = stream;
  });
  return (
    <div
      onClick={stream ? null : onClick}
      data-title={title}
      className={`mediadevice action ${className}`}
    >
      <video ref={videoRef} autoPlay muted></video>
      <span className="placeholder">
        <FontAwesomeIcon icon={icon} />
      </span>
    </div>
  );
}

const MediaDevice = styled(UnstyledMediaDevice)`
  background: #ddd;
  position: relative;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  visibility: visible;
  max-height: calc(100vh - 14rem);
  z-index: 0;
  width: 45%;
  transition: width 0.5s 0.5s;
  cursor: ${props => (props.stream ? 'initial' : 'pointer')};

  :after {
    bottom: 0;
    color: #666;
    content: ${props => (props.stream ? '' : 'attr(data-title)')};
    font-size: 1.5rem;
    font-weight: 300;
    left: 0;
    line-height: 3rem;
    opacity: 1;
    position: absolute;
    text-align: center;
    transition: opacity 0.5s;
    width: 100%;
  }

  :before {
    display: block;
    margin-top: 56.25%;
    content: '';
  }

  video {
    outline: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 2;
    background: transparent;
  }

  .placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 15rem;
    height: 10rem;
    transform: translate(-50%, calc(-50% - 1rem));
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 5rem;
    color: white;
  }
`;

export default MediaDevice;
