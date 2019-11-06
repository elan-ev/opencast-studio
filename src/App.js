//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, ThemeProvider } from 'theme-ui';
import { Flex } from '@theme-ui/components';

import { Global } from '@emotion/core';
import { Router } from '@reach/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-responsive-modal';

import languages from './languages';
import GlobalStyle from './style/global-style';
import theme from './theme';
import useLocalStorage from './use-local-storage';

import About from './ui/about';
import Impressum from './ui/impressum';
import NotFound from './ui/not-found';
import OpencastHeader from './ui/opencast-header';
import Studio from './ui/studio';
import UploadSettings from './ui/upload-settings';

const defaultUploadSettings = {
  serverUrl: 'https://develop.opencast.org/',
  workflowId: 'fast',
  loginName: 'admin',
  loginPassword: 'opencast'
};

const UPLOAD_SETTINGS_KEY = 'uploadSettings';

function App(props) {
  const { t, i18n } = useTranslation();

  const [chosenLanguage, setChosenLanguage] = useState('en');
  const [isModalOpen, setModalOpen] = useState(!window.localStorage.getItem(UPLOAD_SETTINGS_KEY));
  const [uploadSettings, setUploadSettings] = useLocalStorage(
    UPLOAD_SETTINGS_KEY,
    defaultUploadSettings
  );

  const selectLanguage = language => {
    setChosenLanguage(language);
    i18n.changeLanguage(language);
  };

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
    <ThemeProvider theme={theme}>
      <Global styles={GlobalStyle} />

      <Flex
        sx={{
          flexDirection: 'column',
          minHeight: '100%'
        }}
      >
        <OpencastHeader
          languages={languages}
          chosenLanguage={chosenLanguage}
          onSelectLanguage={selectLanguage}
        />

        <Router sx={{ flex: 1 }}>
          <Studio
            path="/"
            uploadSettings={uploadSettings}
            handleOpenUploadSettings={handleOpenUploadSettings}
          />
          <About path="/about" />
          <Impressum path="/impressum" />
          <NotFound default />
        </Router>
      </Flex>

      <Modal
        open={isModalOpen}
        onClose={handleCloseUploadSettings}
        ariaLabelledBy="upload-settings-modal-label"
        center
        closeOnEsc={false}
        closeOnOverlayClick={false}
        showCloseIcon={false}
      >
        <div id="upload-settings-modal-label" sx={{ display: 'none' }}>
          {t('upload-settings-modal-title')}
        </div>

        <UploadSettings
          uploadSettings={uploadSettings}
          updateUploadSettings={handleUpdateUploadSettings}
        />
      </Modal>
    </ThemeProvider>
  );
}

export default App;
