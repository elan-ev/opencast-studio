//; -*- mode: rjsx;-*-
import React, { useState } from 'react';
import Modal from 'react-modal';

import languages from './languages';
import GlobalStyle from './style/global-style';

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

function App() {
  const [chosenLanguage, setChosenLanguage] = useState('en');
  const [uploadSettings, setUploadSettings] = useState(defaultUploadSettings);
  const [isModalOpen, setModalOpen] = useState(false);

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
