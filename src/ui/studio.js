//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useState } from 'react';
import { Box, Flex } from '@theme-ui/components';

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
    <Flex as="main" sx={{ flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 0 }}>
        <Toolbar
          uploadSettings={props.uploadSettings}
          handleOpenUploadSettings={props.handleOpenUploadSettings}
        />
      </Box>

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
    </Flex>
  );
}

export default Studio;
