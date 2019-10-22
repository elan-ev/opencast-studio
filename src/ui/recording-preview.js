//; -*- mode: rjsx;-*-
import React from 'react';
import styled from "styled-components/macro";

const RecordingPreview = ({ className, deviceType, title, type, url }) => {
  const flavor = deviceType === 'desktop' ? 'Presentation' : 'Presenter';
  const downloadName = `${flavor} ${type} - ${title || 'Recording'}.webm`;

  if (!url) {
    return (
      <a className={className} target="_blank" href={url} download={downloadName} rel="noopener noreferrer">
        {deviceType}
      </a>
    );
  }

  return (
    <a className={className} target="_blank" download={downloadName} href={url} rel="noopener noreferrer">
      {deviceType}
      <video src={url}></video>
    </a>
  );
};

const StyledRecordingPreview = styled(RecordingPreview)`
  width: 8rem;
  height: 4.5rem;
  position: relative;
  background: #ddd;
  text-align: center;
  padding: 0.5rem;
  margin: 0 0.5rem 0.5rem 0;

  video {
    position: absolute;
    max-width: 100%;
    max-height: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;


export default StyledRecordingPreview;
