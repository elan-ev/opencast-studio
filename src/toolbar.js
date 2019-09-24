//; -*- mode: rjsx;-*-
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-modal";
import {
  faCog,
  faExclamationCircle,
  faPlayCircle,
  faQuestionCircle
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components/macro";
import UploadSettings from "./upload-settings";

const Icon = styled(FontAwesomeIcon)`
  color: black;
`;

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

function Toolbar({ className, uploadSettings, setUploadSettings }) {
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
    <div className={className}>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseUploadSettings}
        contentLabel="Opencast Upload Settings"
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        style={customStyles}
      >
        <UploadSettings
          uploadSettings={uploadSettings}
          updateUploadSettings={handleUpdateUploadSettings}
        />
      </Modal>

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
