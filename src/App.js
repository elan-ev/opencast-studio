//; -*- mode: rjsx;-*-
import React, { useState } from 'react';
import Modal from 'react-modal';

import languages from './languages';
import GlobalStyle from './style/global-style';

import Footer from './ui/footer';
import MediaDevices from './ui/media-devices';
import OpencastHeader from './ui/opencast-header';
import RecordingControls from './ui/recording-controls';
import Toolbar from './ui/toolbar';
import UploadSettings from './ui/upload-settings';

const modalCustomStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

const defaultUploadSettings = {
  serverUrl: 'https://develop.opencast.org/',
  workflowId: 'fast',
  loginName: 'admin',
  loginPassword: 'opencast'
};

const defaultRecordingData = {
  title: '',
  presenter: ''
};

function App() {
  const [chosenLanguage, setChosenLanguage] = useState('en');
  const [uploadSettings, setUploadSettings] = useState(defaultUploadSettings);
  const [recordingData, setRecordingData] = useState(defaultRecordingData);

  const [isModalOpen, setModalOpen] = useState(false);

  const [desktopStream, setDesktopStream] = useState();
  const [videoStream, setVideoStream] = useState();

  const handleOpenUploadSettings = e => {
    setModalOpen(true);
  };

  const handleCloseUploadSettings = e => {
    setModalOpen(false);
  };

  const handleUpdateUploadSettings = settings => {
    setUploadSettings(settings);

    handleCloseUploadSettings();
  };

  return (
    <div className="App">
      <GlobalStyle />

      <OpencastHeader
        languages={languages}
        chosenLanguage={chosenLanguage}
        onSelectLanguage={setChosenLanguage}
      />
      <Toolbar
        uploadSettings={uploadSettings}
        handleOpenUploadSettings={handleOpenUploadSettings}
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
        uploadSettings={uploadSettings}
        recordingData={recordingData}
        setRecordingData={setRecordingData}
        handleOpenUploadSettings={handleOpenUploadSettings}
      />
      <Footer />

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseUploadSettings}
        contentLabel="Opencast Upload Settings"
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        style={modalCustomStyles}
      >
        <UploadSettings
          uploadSettings={uploadSettings}
          updateUploadSettings={handleUpdateUploadSettings}
        />
      </Modal>
    </div>
  );
}

export default App;
