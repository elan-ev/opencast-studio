//; -*- mode: rjsx;-*-
import React, { useState } from 'react';
import styled from 'styled-components/macro';
import Modal from 'react-responsive-modal';
import { useTranslation } from 'react-i18next';

import languages from './languages';
import GlobalStyle from './style/global-style';
import useLocalStorage from './use-local-storage';

import Footer from './ui/footer';
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
    <div className={props.className}>
      <GlobalStyle />

      <OpencastHeader
        languages={languages}
        chosenLanguage={chosenLanguage}
        onSelectLanguage={selectLanguage}
      />

      <Studio uploadSettings={uploadSettings} handleOpenUploadSettings={handleOpenUploadSettings} />

      <Footer />

      <Modal
        open={isModalOpen}
        onClose={handleCloseUploadSettings}
        ariaLabelledBy="upload-settings-modal-label"
        center
        closeOnEsc={false}
        closeOnOverlayClick={false}
        showCloseIcon={false}
      >
        <div
          id="upload-settings-modal-label"
          css={`
            display: none;
          `}
        >
          {t('upload-settings-modal-title')}
        </div>

        <UploadSettings
          uploadSettings={uploadSettings}
          updateUploadSettings={handleUpdateUploadSettings}
        />
      </Modal>
    </div>
  );
}

const StyledApp = styled(App)`
  display: flex;
  flex-direction: column;
  height: 100%;

  ${Studio} {
    flex: 1 0 auto;
  }

  ${Footer} {
    flex-shrink: 0;
  }
`;

export default StyledApp;
