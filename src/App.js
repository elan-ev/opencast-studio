import React, { useState } from 'react';
import languages from './languages';
import GlobalStyle from './global-style';
import MediaDevices from './media-devices';
import OpencastHeader from './opencast-header';
import RecordingControls from './recording-controls';
import Toolbar from './toolbar';
import Footer from './footer';

const defaultUploadSettings = {
  serverUrl: 'https://develop.opencast.org/',
  workflowId: 'fast',
  loginName: 'admin',
  loginPassword: 'opencast'
};

const defaultRecordingData = {
  title: 'lorem',
  presenter: 'iüsum'
};

function App() {
  const [chosenLanguage, setChosenLanguage] = useState('en');
  const [uploadSettings, setUploadSettings] = useState(defaultUploadSettings);
  const [recordingData, setRecordingData] = useState(defaultRecordingData);

  const [desktopStream, setDesktopStream] = useState();
  const [videoStream, setVideoStream] = useState();

  return (
    <div className="App">
      <GlobalStyle />
      <OpencastHeader
        languages={languages}
        chosenLanguage={chosenLanguage}
        onSelectLanguage={setChosenLanguage}
      />
      <Toolbar uploadSettings={uploadSettings} setUploadSettings={setUploadSettings} />
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
        uploadSettings={uploadSettings}
        recordingData={recordingData}
        setRecordingData={setRecordingData}
      />
      <Footer />
    </div>
  );
}

export default App;
