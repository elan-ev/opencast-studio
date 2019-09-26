//; -*- mode: rjsx;-*-
import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faVideo } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import { useTranslation } from 'react-i18next';

function startDisplayCapture(displayMediaOptions) {
  return navigator.mediaDevices.getDisplayMedia(displayMediaOptions).catch(err => {
    console.error('Error:' + err);
    return null;
  });
}

function startUserCapture(userMediaOptions) {
  return navigator.mediaDevices.getUserMedia(userMediaOptions).catch(err => {
    console.error('Error:' + err);
    return null;
  });
}

function UnstyledMediaDevice({ className, onClick, title, deviceType, icon, stream }) {
  const videoRef = useRef();
  useEffect(() => {
    videoRef.current.srcObject = stream;
  });
  return (
    <div onClick={onClick} data-title={title} className={`mediadevice action ${className}`}>
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  visibility: visible;
  max-height: calc(100vh - 14rem);
  z-index: 0;
  width: 45%;
  transition: width 0.5s 0.5s;
  cursor: pointer;

  :after {
    bottom: 0;
    color: #666;
    content: attr(data-title);
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
    margin-top: 75%;
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

function MediaDevices(props) {
  const { t } = useTranslation();

  function requestDisplayMedia() {
    startDisplayCapture({ video: true, audio: false }).then(desktopStream => {
      props.setDesktopStream(desktopStream);
    });
  }

  function requestUserMedia() {
    startUserCapture({ video: true, audio: true }).then(videoStream => {
      props.setVideoStream(videoStream);
    });
  }

  return (
    <div className={props.className}>
      <MediaDevice
        onClick={requestDisplayMedia}
        title={t('share-desktop')}
        deviceType="desktop"
        icon={faDesktop}
        stream={props.desktopStream}
      />

      <MediaDevice
        onClick={requestUserMedia}
        title={t('share-webcam')}
        deviceType="video"
        icon={faVideo}
        stream={props.videoStream}
      />
    </div>
  );
}

const StyledMediaDevices = styled(MediaDevices)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 2rem;
  position: relative;
  min-height: calc(22.5vw - 4rem);
  transition: min-height 1s;
`;

export default StyledMediaDevices;
