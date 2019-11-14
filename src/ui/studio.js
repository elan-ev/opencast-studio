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
          settings={props.settings}
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
        settings={props.settings}
        recordingData={recordingData}
        setRecordingData={setRecordingData}
      />
    </Flex>
  );
}

export default Studio;
