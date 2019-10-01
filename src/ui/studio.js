//; -*- mode: rjsx;-*-
import React, { useState } from 'react';
import styled from 'styled-components/macro';

import MediaDevices from './media-devices';
import RecordingControls from './recording-controls';
import Toolbar from './toolbar';

const defaultRecordingData = {
  title: '',
  presenter: ''
};

function Studio(props) {
  const [desktopStream, setDesktopStream] = useState();
  const [videoStream, setVideoStream] = useState();
  const [recordingData, setRecordingData] = useState(defaultRecordingData);

  return (
      <main className={props.className}>
      <Toolbar
        uploadSettings={props.uploadSettings}
        handleOpenUploadSettings={props.handleOpenUploadSettings}
      />
      <MediaDevices
        desktopStream={desktopStream}
        setDesktopStream={setDesktopStream}
        videoStream={videoStream}
        setVideoStream={setVideoStream}
      />
      <RecordingControls
        desktopStream={desktopStream}
        setDesktopStream={setDesktopStream}
        videoStream={videoStream}
        setVideoStream={setVideoStream}
        uploadSettings={props.uploadSettings}
        recordingData={recordingData}
        setRecordingData={setRecordingData}
        handleOpenUploadSettings={props.handleOpenUploadSettings}
      />
    </main>
  );
}

const StyledStudio = styled(Studio)``

export default StyledStudio;
