import React from 'react';
import Modal from 'react-modal';
import styled from 'styled-components/macro';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faStopCircle, faPauseCircle } from '@fortawesome/free-solid-svg-icons';

import Clock from './clock';
import Recorder from './recorder';
import SaveCreationDialog from './save-creation';
import OpencastUploader from './opencast-uploader';

const Button = styled.button`
  border-radius: 0.25rem;
  border: none;
  position: relative;
  margin: 0 0.5rem;
  background: linear-gradient(to bottom, #ddd 0%, #f0f0f0 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-size: 2.5rem;
  line-height: 2.5rem;
  padding: 0.25rem;
  svg {
    margin: 0;
    padding: 0;
    outline: none;
  }
`;

const PauseButton = styled(function(props) {
  return (
    <Button className={props.className} onClick={props.onClick}>
      <span className="fa-layers fa-fw">
        <FontAwesomeIcon icon={faPauseCircle} />
      </span>
    </Button>
  );
})`
  border-color: ${props => (props.recording ? 'black' : '#888')};
  box-shadow: ${props => (props.paused ? 'inset 0 2px 3px rgba(0, 0, 0, 0.2)' : 'none')};
`;

const RecordButton = styled(function(props) {
  return (
    <Button className={props.className} onClick={props.onClick}>
      <span className="fa-layers fa-fw">
        <FontAwesomeIcon icon={faCircle} />
        <FontAwesomeIcon icon={faCircle} transform="shrink-6" />
      </span>
    </Button>
  );
})`
  color: #bd181c;
  svg + svg {
    color: #e22319;
  }

  box-shadow: ${props => (props.recording ? 'inset 0 2px 3px rgba(0, 0, 0, 0.2)' : 'none')};
`;

const StopButton = styled(function(props) {
  return (
    <Button className={props.className} onClick={props.onClick}>
      <FontAwesomeIcon icon={faStopCircle} />
    </Button>
  );
})``;

const RecorderState = styled(props => {
  return (
    <div className={props.className}>
      {props.recording ? (props.paused ? 'Paused' : 'Recording') : ' Waiting '}
    </div>
  );
})`
  font-style: ${props => (props.recording && !props.paused ? 'italic' : 'normal')};
  color: ${props => (props.recording ? (props.paused ? 'teal' : '#fe0001') : 'grey')};
`;

function click(node) {
  try {
    node.dispatchEvent(new MouseEvent('click'));
  } catch (e) {
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(
      'click',
      true,
      true,
      window,
      0,
      0,
      0,
      80,
      20,
      false,
      false,
      false,
      false,
      0,
      null
    );
    node.dispatchEvent(evt);
  }
}

function downloadBlob(blob, name) {
  var a = document.createElement('a');
  a.download = name;
  a.rel = 'noopener'; // tabnabbing
  a.href = URL.createObjectURL(blob);
  setTimeout(function() {
    URL.revokeObjectURL(a.href);
  }, 4e4); // 40s
  setTimeout(function() {
    click(a);
  }, 0);
}

class RecordingControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPaused: false,
      isRecording: false,
      showModal: false,
      desktopRecording: null,
      videoRecording: null
    };

    this.desktopRecorder = null;
    this.videoRecorder = null;

    [
      'handlePause',
      'handleStartResume',
      'handleStop',
      'handleDialogClose',
      'handleSaveCreationCancel',
      'handleSaveCreationSave',
      'handleSaveCreationUpload'
    ].forEach(method => (this[method] = this[method].bind(this)));
  }

  hasStreams() {
    return this.props.desktopStream || this.props.videoStream;
  }

  record() {
    const streams = ['desktop', 'video'];

    streams.forEach(deviceType => {
      const recorder = `${deviceType}Recorder`;
      const stream = this.props[`${deviceType}Stream`];

      if (!stream) {
        return;
      }

      if (!this[recorder]) {
        this[recorder] = new Recorder(stream);

        this[recorder].on('record.complete', () => {
          this[recorder] = null;
        });

        this[recorder].start(1000);
      } else {
        this[recorder].resume();
      }

      this[recorder].on('record.complete', ({ media, url }) => {
        this.setState({ [`${deviceType}Recording`]: { deviceType, media, url } });
      });
    });
  }

  pause() {
    this.desktopRecorder && this.desktopRecorder.pause();
    this.videoRecorder && this.videoRecorder.pause();
  }

  stop() {
    const streams = ['desktop', 'video'];

    streams.forEach(type => {
      if (this[`${type}Recorder`]) {
        this[`${type}Recorder`].stop();
        this.props[`${type}Stream`].getTracks().forEach(track => track.stop());
      }
    });

    this.setState({ showModal: true });
  }

  handlePause() {
    if (this.state.isRecording) {
      this.setState(state => ({ isPaused: !state.isPaused }));

      this.pause();
    }
  }

  handleStartResume() {
    if (!this.hasStreams()) {
      return;
    }
    this.setState({ isPaused: false, isRecording: true });
    this.record();
  }

  handleStop() {
    if (this.state.isRecording) {
      this.setState({ isPaused: false, isRecording: false });
      this.stop();
    }
  }

  handleDialogClose() {
    this.setState({ showModal: false });
  }

  handleSaveCreationCancel() {
    this.handleDialogClose();
    this.resetRecordings();
  }

  handleSaveCreationSave() {
    this.handleDialogClose();
    if (this.state.desktopRecording) {
      downloadBlob(this.state.desktopRecording.media, 'desktop.webm');
    }
    if (this.state.videoRecording) {
      downloadBlob(this.state.videoRecording.media, 'video.webm');
    }
    this.resetRecordings();
  }

  handleSaveCreationUpload() {
    const { title, presenter } = this.props.recordingData;

    if (title !== '' && presenter !== '') {
      new OpencastUploader(this.props.uploadSettings).loginAndUploadFromAnchor(
        // recording,
        [this.state.desktopRecording, this.state.videoRecording],

        // onsuccess
        () => {
          alert('Upload complete!');
          document.getElementById('toggleSaveCreationModal').checked = false;
        },

        // onloginfailed
        () => {
          alert('Login failed, Please check your Password!');
          // TODO(mel) ocUploaderSettings.show();
        },

        // onserverunreachable
        err => {
          alert(
            'Server unreachable: Check your Internet Connetion and the Server Url, ' +
              'also check whether your Opencast Instance supports this site.'
          );
          console.log('Server unreachable: ', err);
          // TODO(mel) ocUploaderSettings.show();
        },

        // oninetorpermfailed
        err => {
          alert('The Internet Connection failed or you are missing necessary permissions.');
          console.log('Inet fail or Missing Permission: ', err);
          // TODO(mel) ocUploaderSettings.show();
        },

        title,
        presenter
      );
    } else {
      alert('Please set Title and Presenter');
    }
  }

  resetRecordings() {
    this.desktopRecorder = null;
    this.videoRecorder = null;
    this.setState({ desktopRecording: null, videoRecording: null });
    this.props.setDesktopStream(null);
    this.props.setVideoStream(null);
  }

  componentDidUpdate(prevProps) {
    if (this.props.desktopStream !== prevProps.desktopStream) {
      // desktopStream changed
    }

    if (this.props.videoStream !== prevProps.videoStream) {
      // videoStream changed
    }
  }

  render() {
    return (
      <div className={this.props.className}>
        <div className="grouped-buttons">
          <PauseButton
            title="Pause recording"
            paused={this.state.isPaused}
            recording={this.state.isRecording}
            onClick={this.handlePause}
          />
          <RecordButton
            title="Start/resume recording"
            paused={this.state.isPaused}
            recording={this.state.isRecording}
            onClick={this.handleStartResume}
          />
          <StopButton
            title="Stop recording"
            paused={this.state.isPaused}
            recording={this.state.isRecording}
            onClick={this.handleStop}
          />
        </div>

        <div>
          <RecorderState paused={this.state.isPaused} recording={this.state.isRecording} />
          <Clock paused={this.state.isPaused} recording={this.state.isRecording} />
        </div>

        <Modal
          isOpen={this.state.showModal}
          onRequestClose={this.handleDialogClose}
          contentLabel="Production Details"
          shouldCloseOnOverlayClick={true}
          shouldCloseOnEsc={true}
        >
          <SaveCreationDialog
            desktopRecording={this.state.desktopRecording}
            videoRecording={this.state.videoRecording}
            recordingData={this.props.recordingData}
            setRecordingData={this.props.setRecordingData}
            handleCancel={this.handleSaveCreationCancel}
            handleSave={this.handleSaveCreationSave}
            handleUpload={this.handleSaveCreationUpload}
          />
        </Modal>
      </div>
    );
  }
}

const StyledRecordingControls = styled(RecordingControls)`
  text-align: center;
  margin: 2rem 0;
  position: relative;
`;

export default StyledRecordingControls;
