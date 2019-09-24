//; -*- mode: rjsx;-*-
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDesktop, faVideo } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';

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

class MediaDevices extends React.Component {
  constructor(props) {
    super(props);

    this.requestDisplayMedia = this.requestDisplayMedia.bind(this);
    this.requestUserMedia = this.requestUserMedia.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.desktopStream !== prevProps.desktopStream) {
      this.desktopRef.srcObject = this.props.desktopStream;
    }

    if (this.props.videoStream !== prevProps.videoStream) {
      this.videoRef.srcObject = this.props.videoStream;
    }
  }

  requestDisplayMedia() {
    startDisplayCapture({ video: true, audio: false }).then(desktopStream => {
      this.desktopRef.srcObject = desktopStream;
      this.props.setDesktopStream(desktopStream);
    });
  }

  requestUserMedia() {
    startUserCapture({ video: true, audio: true }).then(videoStream => {
      console.log(videoStream);
      this.videoRef.srcObject = videoStream;
      this.props.setVideoStream(videoStream);
    });
  }

  render() {
    return (
      <div className={this.props.className}>
        <div
          onClick={this.requestDisplayMedia}
          data-title="Share desktop (no audio)"
          className="mediadevice action desktopDevice"
        >
          <video
            ref={desktopRef => {
              this.desktopRef = desktopRef;
            }}
            autoPlay
            muted
          ></video>
          <span className="placeholder">
            <FontAwesomeIcon icon={faDesktop} />
          </span>
        </div>

        <div
          onClick={this.requestUserMedia}
          className="mediadevice action videoDevice"
          data-title="Share webcam (with microphone audio)"
        >
          <video
            ref={videoRef => {
              this.videoRef = videoRef;
            }}
            autoPlay
            muted
          ></video>
          <span className="placeholder">
            <FontAwesomeIcon icon={faVideo} className="fad" />
          </span>
        </div>
      </div>
    );
  }
}

const StyledMediaDevices = styled(MediaDevices)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 2rem;
  position: relative;
  // pointer-events: none;
  min-height: calc(22.5vw - 4rem);
  transition: min-height 1s;

  video {
    outline: none;
  }

  .mediadevice {
    background: #ddd;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    visibility: visible;
    max-height: calc(100vh - 14rem);
    z-index: 0;
    width: 45%;
    transition: width 0.5s 0.5s;
  }

  .action {
    cursor: pointer;
  }

  .mediadevice:after {
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

  .mediadevice:before {
    display: block;
    margin-top: 75%;
    content: '';
  }

  .mediadevice video,
  .mediadevice audio {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 2;
    background: transparent;
  }

  .desktopDevice.active {
    background: black;
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

  .active .placeholder {
    display: none;
  }
`;

export default StyledMediaDevices;
