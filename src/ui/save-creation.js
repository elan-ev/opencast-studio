//; -*- mode: rjsx;-*-
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components/macro';
import { faDownload, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';

import FormField from './form-field';
import RecordingPreview from './recording-preview';


class SaveCreationDialog extends React.Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    console.log('SaveCreationDialog mounted', this.props);
  }

  componentDidUpdate(...oldStuff) {
    console.log('SaveCreationDialog updated', this.props, oldStuff);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.props.setRecordingData({ ...this.props.recordingData, [name]: value });
  }

  render() {
    return (
      <div className={this.props.className}>
        <header>
          <h1>Production details</h1>
        </header>

        <main>
          <FormField label="Title">
            <input
              name="title"
              autoComplete="off"
              value={this.props.recordingData.title}
              onChange={this.handleInputChange}
            />
          </FormField>

          <FormField label="Presenter">
            <input
              name="presenter"
              autoComplete="off"
              value={this.props.recordingData.presenter}
              onChange={this.handleInputChange}
            />
          </FormField>
        </main>

        <header>
          <h1>Media</h1>
        </header>

        <main>
          <div id="recordingList">
            {this.props.desktopRecording && (
              <RecordingPreview
                deviceType="desktop"
                title={this.props.recordingData.title}
                type="video"
                url={this.props.desktopRecording.url}
              />
            )}
            {this.props.videoRecording && (
              <RecordingPreview
                deviceType="video"
                title={this.props.recordingData.title}
                type="video"
                url={this.props.videoRecording.url}
              />
            )}
          </div>
        </main>

        <footer>
          <button onClick={this.props.handleUpload}>
            <FontAwesomeIcon icon={faUpload} />
            <span>Upload to Opencast</span>
          </button>

          <button onClick={this.props.handleSave}>
            <FontAwesomeIcon icon={faDownload} />
            <span>Save media</span>
          </button>

          <button onClick={this.props.handleCancel}>
            <FontAwesomeIcon icon={faTrash} />
            <span>Discard</span>
          </button>
        </footer>
      </div>
    );
  }
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

  footer {
    margin-top: 1.5em;
  }

  header h1 {
    font-weight: 300;
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
`;

export default StyledSaveCreationDialog;
