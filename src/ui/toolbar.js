//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';

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
  return (
    <div className={className}>
      <a href={uploadSettings.serverUrl} title="Go to Opencast">
        <Icon icon={faPlayCircle} />
      </a>

      <label
        title="Open Upload Settings"
        id="ocUploadSettingsOpenButton"
        onClick={handleOpenUploadSettings}
      >
        <Icon icon={faCog} />
      </label>

      <a
        href="https://github.com/elan-ev/opencast-studio/issues"
        title="Report Issue"
        id="ocUploadIssueButton"
      >
        <Icon icon={faExclamationCircle} />
      </a>

      <a href="/about.html" title="About Opencast Studio">
        <Icon icon={faQuestionCircle} />
      </a>
    </div>
  );
}

const StyledToolbar = styled(Toolbar)`
  height: 4rem;
  line-height: 4rem;
  text-align: right;
  margin-right: 2rem;
  font-size: 1.6rem;

  > * {
    margin-left: 6px;
  }

  #ocUploadIssueButton {
    padding-left: 10px;
  }
`;

export default StyledToolbar;
