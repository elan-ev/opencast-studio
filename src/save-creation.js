//; -*- mode: rjsx;-*-
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components/macro';
import { faDownload, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';

function Field(props) {
  return (
    <div className="field">
      <label className="label">{props.label}</label>
      <div className="control">{props.children}</div>
    </div>
  );
}

const Recording = ({ className, deviceType, title, type, url }) => {
  const flavor = deviceType === 'desktop' ? 'Presentation' : 'Presenter';
  const downloadName = `${flavor} ${type} - ${title || 'Recording'}.webm`;

  if (!url) {
    return (
      <a className={className} download={downloadName}>
        {deviceType}
      </a>
    );
  }

  return (
    <a className={className} target="_blank" download={downloadName} href={url}>
      {deviceType}
      <video src={url}></video>
    </a>
  );
};

const StyledRecording = styled(Recording)`
  width: 8rem;
  height: 6rem;
  position: relative;
  background: #ddd;
  text-align: center;
  padding: 0.5rem;
  margin: 0 0.5rem 0.5rem 0;

  video {
    position: absolute;
    max-width: 100%;
    max-height: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

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
          <Field label="Title">
            <input
              name="title"
              autoComplete="off"
              value={this.props.recordingData.title}
              onChange={this.handleInputChange}
            />
          </Field>

          <Field label="Presenter">
            <input
              name="presenter"
              autoComplete="off"
              value={this.props.recordingData.presenter}
              onChange={this.handleInputChange}
            />
          </Field>
        </main>

        <header>
          <h1>Media</h1>
        </header>

        <main>
          <div id="recordingList">
            {this.props.desktopRecording && (
              <StyledRecording
                deviceType="desktop"
                title={this.props.recordingData.title}
                type="video"
                url={this.props.desktopRecording.url}
              />
            )}
            {this.props.videoRecording && (
              <StyledRecording
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

  .field:not(:last-child) {
    margin-bottom: 0.75rem;
  }

  .control {
    box-sizing: border-box;
    clear: both;
    font-size: 1rem;
    position: relative;
    text-align: left;
  }

  .label {
    color: #363636;
    display: block;
    font-size: 1rem;
    font-weight: 700;
  }

  .label:not(:last-child) {
    margin-bottom: 0.5em;
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
