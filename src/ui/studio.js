//; -*- mode: rjsx;-*-
import React, { useState } from 'react';

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
    <>
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
    </>
  );
}

export default Studio;
