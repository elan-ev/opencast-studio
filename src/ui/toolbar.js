//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { useTranslation } from 'react-i18next';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faExclamationCircle,
  faPlayCircle,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';

const Icon = styled(FontAwesomeIcon)`
  color: black;
`;

function Toolbar({ className, uploadSettings, handleOpenUploadSettings }) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <a href={uploadSettings.serverUrl} title={t('toolbar-button-opencast')}>
        <Icon icon={faPlayCircle} />
      </a>

      <label
        title={t('toolbar-button-upload-settings')}
        id="ocUploadSettingsOpenButton"
        onClick={handleOpenUploadSettings}
      >
        <Icon icon={faCog} />
      </label>

      <a
        href="https://github.com/elan-ev/opencast-studio/issues"
        title={t('toolbar-button-issues')}
        id="ocUploadIssueButton"
      >
        <Icon icon={faExclamationCircle} />
      </a>

      <a href="/about.html" title={t('toolbar-button-about')}>
        <Icon icon={faQuestionCircle} />
      </a>
    </div>
  );
}

const StyledToolbar = styled(Toolbar)`
  height: 3rem;
  line-height: 3rem;
  text-align: right;

  padding-right: 2rem;
  box-shadow: 0 0px 4px 0px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;

  ${Icon} {
    font-size: 1.6rem;
    vertical-align: middle;
  }

  > * {
    margin-left: 6px;
  }

  #ocUploadIssueButton {
    padding-left: 10px;
  }
`;

export default StyledToolbar;
