//; -*- mode: rjsx;-*-
import React from 'react';
import Modal from 'react-modal';
import styled from 'styled-components/macro';

import downloadBlob from '../download-blob';
import OpencastUploader from '../opencast-uploader';
import Recorder from '../recorder';

import PauseButton from './recording-buttons/pause';
import RecordButton from './recording-buttons/record';
import RecordingState from './recording-state';
import SaveCreationDialog from './save-creation';
import StopButton from './recording-buttons/stop';

const getDownloadName = (deviceType, type, title) => {
  const flavor = deviceType === 'desktop' ? 'Presentation' : 'Presenter';
  return `${flavor} ${type} - ${title || 'Recording'}.webm`;
};

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
    this.resetRecordings();
  }

  handleSaveCreationSave() {
    this.handleDialogClose();
    if (this.state.desktopRecording) {
      downloadBlob(
        this.state.desktopRecording.media,
        getDownloadName('desktop', 'video', this.props.recordingData.title)
      );
    }
    if (this.state.videoRecording) {
      downloadBlob(
        this.state.videoRecording.media,
        getDownloadName('video', 'video', this.props.recordingData.title)
      );
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
          this.handleDialogClose();
        },

        // onloginfailed
        () => {
          alert('Login failed, Please check your Password!');
          this.props.handleOpenUploadSettings();
        },

        // onserverunreachable
        err => {
          alert(
            'Server unreachable: Check your Internet Connetion and the Server Url, ' +
              'also check whether your Opencast Instance supports this site.'
          );
          console.log('Server unreachable: ', err);
          this.props.handleOpenUploadSettings();
        },

        // oninetorpermfailed
        err => {
          alert('The Internet Connection failed or you are missing necessary permissions.');
          console.log('Inet fail or Missing Permission: ', err);
          this.props.handleOpenUploadSettings();
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

        <RecordingState paused={this.state.isPaused} recording={this.state.isRecording} />

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
            handleCancel={this.handleDialogClose}
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
