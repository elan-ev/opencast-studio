//; -*- mode: rjsx;-*-
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components/macro';
import { faDownload, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

import FormField from './form-field';
import RecordingPreview from './recording-preview';

function SaveCreationDialog(props) {
  const { t } = useTranslation();

  function handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    props.setRecordingData({ ...props.recordingData, [name]: value });
  }

  return (
    <div className={props.className}>
      <header>
        <h1>Production details</h1>
      </header>

      <main>
        <FormField label={t('save-creation-label-title')}>
          <input
            name="title"
            autoComplete="off"
            value={props.recordingData.title}
            onChange={handleInputChange}
          />
        </FormField>

        <FormField label={t('save-creation-label-presenter')}>
          <input
            name="presenter"
            autoComplete="off"
            value={props.recordingData.presenter}
            onChange={handleInputChange}
          />
        </FormField>
      </main>

      <header>
        <h1>{t('save-creation-label-media')}</h1>
      </header>

      <main>
        <div id="recordingList">
          {props.desktopRecording && (
            <RecordingPreview
              deviceType="desktop"
              title={props.recordingData.title}
              type="video"
              url={props.desktopRecording.url}
            />
          )}
          {props.videoRecording && (
            <RecordingPreview
              deviceType="video"
              title={props.recordingData.title}
              type="video"
              url={props.videoRecording.url}
            />
          )}
        </div>
      </main>

      <footer>
        <button onClick={props.handleUpload}>
          <FontAwesomeIcon icon={faUpload} />
          <span>{t('save-creation-button-upload')}</span>
        </button>

        <button onClick={props.handleSave}>
          <FontAwesomeIcon icon={faDownload} />
          <span>{t('save-creation-button-save')}</span>
        </button>

        <button onClick={props.handleCancel}>
          <FontAwesomeIcon icon={faTrash} />
          <span>{t('save-creation-button-discard')}</span>
        </button>
      </footer>
    </div>
  );
}

const StyledSaveCreationDialog = styled(SaveCreationDialog)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  header,
  footer {
    flex: 0;
  }
  main {
    flex: 1;
  }

  input { 
    width: 100%;
  }

  footer {
    margin-top: 1.5em;
  }

  header h1 {
    font-weight: 300;
    cursor: default;
  }

  button {
    min-width: 100px;
    padding: 5px;
  }

  button + button {
    margin-left: 0.5em;
  }

  button svg {
    margin-right: 0.25em;
  }

  #recordingList {
    display: flex;
    max-height: 6.5rem;
    overflow-y: auto;
    flex-wrap: wrap;
  }

  @media screen and (max-width: 420px) {
    
    footer {
      button {
        width: 100%;
        
        + button { 
          margin-left: 0; 
          margin-top: 1em;
        }
      }
    }

  }
`;

export default StyledSaveCreationDialog;
