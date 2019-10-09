//; -*- mode: rjsx;-*-
import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faVideo } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import { useTranslation } from 'react-i18next';
import MediaDevice from './media-device';

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

function MediaDevices(props) {
  const { t } = useTranslation();

  function requestDisplayMedia() {
    startDisplayCapture({ video: true, audio: true }).then(desktopStream => {
      props.setDesktopStream(desktopStream);
    });
  }

  function requestUserMedia() {
    startUserCapture({
      audio: true,
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 }
      }
    }).then(videoStream => {
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
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 0.5rem;
  flex-wrap: wrap;

  ${MediaDevice} {
    margin: 0 0.5rem;
    flex: 1 0 384px;
    max-height: 1080px;
  }

  @media (max-width: 768px) {
    ${MediaDevice} {
      margin-top: 0.5rem;
    }
  }

  /*
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 2rem;
  position: relative;
  min-height: calc(22.5vw - 4rem);
  transition: min-height 1s;
*/
`;

export default StyledMediaDevices;
