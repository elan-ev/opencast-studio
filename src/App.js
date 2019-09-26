//; -*- mode: rjsx;-*-
import React, { useState } from 'react';
import Modal from 'react-modal';

import languages from './languages';
import GlobalStyle from './style/global-style';
import useLocalStorage from './use-local-storage';

import Footer from './ui/footer';
import OpencastHeader from './ui/opencast-header';
import Studio from './ui/studio';
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

const UPLOAD_SETTINGS_KEY = 'uploadSettings';

function App() {
  const [chosenLanguage, setChosenLanguage] = useState('en');
  const [isModalOpen, setModalOpen] = useState(!window.localStorage.getItem(UPLOAD_SETTINGS_KEY));
  const [uploadSettings, setUploadSettings] = useLocalStorage(
    UPLOAD_SETTINGS_KEY,
    defaultUploadSettings
  );

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

      <Studio uploadSettings={uploadSettings} handleOpenUploadSettings={handleOpenUploadSettings} />

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
