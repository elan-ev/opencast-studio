//; -*- mode: rjsx;-*-
import React from 'react';
import Modal from 'react-responsive-modal';
import styled from 'styled-components/macro';
import { withTranslation } from 'react-i18next';
import { Beforeunload } from 'react-beforeunload';

import downloadBlob from '../download-blob';
import OpencastUploader from '../opencast-uploader';
import Recorder from '../recorder';

import PauseButton from './recording-buttons/pause';
import RecordButton from './recording-buttons/record';
import ResumeButton from './recording-buttons/resume';
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
      countdown: false,
      recordingState: 'inactive',
      showModal: false,
      desktopRecording: null,
      videoRecording: null
    };

    this.desktopRecorder = null;
    this.videoRecorder = null;

    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleResume = this.handleResume.bind(this);
    this.handleSaveCreationSave = this.handleSaveCreationSave.bind(this);
    this.handleSaveCreationUpload = this.handleSaveCreationUpload.bind(this);
    this.handleRecord = this.handleRecord.bind(this);
    this.handleStop = this.handleStop.bind(this);
  }

  hasRecording() {
    return this.state.desktopRecording || this.state.videoRecording;
  }

  hasStreams() {
    return this.props.desktopStream || this.props.videoStream;
  }

  record() {
    const streams = ['desktop', 'video'];

    streams.map(deviceType => {
      const recorder = `${deviceType}Recorder`;
      const stream = this.props[`${deviceType}Stream`];

      if (!stream) {
        return;
      }

      this[recorder] = new Recorder(stream);

      this[recorder].on('record.complete', () => {
        this[recorder] = null;
      });

      this[recorder].on('record.complete', ({ media, url }) => {
        this.setState({ [`${deviceType}Recording`]: { deviceType, media, url } });
      });

      this[recorder].start();
    });
  }

  resume() {
    const streams = ['desktop', 'video'];

    streams.forEach(deviceType => {
      const recorder = `${deviceType}Recorder`;
      this[recorder] && this[recorder].resume();
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
    this.setState({ recordingState: 'paused' });
    this.pause();
  }

  handleResume() {
    this.resume();
  }

  handleRecord() {
    if (!this.hasStreams()) {
      return;
    }
    this.setState({ countdown: true });
    setTimeout(() => {
      this.record();
      this.setState({ recordingState: 'recording' });
      this.setState({ countdown: false });
    }, 1000);
  }

  handleStop() {
    this.setState({ recordingState: 'inactive' });
    this.stop();
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
    const { t } = this.props;
    const { title, presenter } = this.props.recordingData;

    if (title !== '' && presenter !== '') {
      new OpencastUploader(this.props.uploadSettings).loginAndUploadFromAnchor(
        // recording,
        [this.state.desktopRecording, this.state.videoRecording],

        // onsuccess
        () => {
          alert(t('message-upload-complete'));
          this.handleDialogClose();
        },

        // onloginfailed
        () => {
          alert(t('message-login-failed'));
          this.props.handleOpenUploadSettings();
        },

        // onserverunreachable
        err => {
          alert(t('message-server-unreachable'));
          console.error('Server unreachable: ', err);
          this.props.handleOpenUploadSettings();
        },

        // oninetorpermfailed
        err => {
          alert(t('message-conn-failed'));
          console.error('Inet fail or Missing Permission: ', err);
          this.props.handleOpenUploadSettings();
        },

        title,
        presenter
      );
    } else {
      alert(t('save-creation-form-invalid'));
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
    const { t } = this.props;

    return (
      <div className={this.props.className}>
        {this.hasRecording() && <Beforeunload onBeforeunload={event => event.preventDefault()} />}

        <RecordingState recordingState={this.state.recordingState} />

        <div className="buttons">
          <div className="left">
            {this.state.recordingState === 'recording' && (
              <PauseButton
                title={t('pause-button-title')}
                recordingState={this.state.recordingState}
                onClick={this.handlePause}
              />
            )}

            {this.state.recordingState === 'paused' && (
              <ResumeButton
                title={t('resume-button-title')}
                recordingState={this.state.recordingState}
                onClick={this.handleResume}
              />
            )}
          </div>

          <div className="center">
            {this.state.recordingState === 'inactive' ? (
              <RecordButton
                large
                title={t('record-button-title')}
                recordingState={this.state.recordingState}
                onClick={this.handleRecord}
                disabled={!this.hasStreams()}
                countdown={this.state.countdown}
              />
            ) : (
              <StopButton
                large
                title={t('stop-button-title')}
                recordingState={this.state.recordingState}
                onClick={this.handleStop}
              />
            )}
          </div>

          <div className="right"></div>
        </div>

        <Modal
          open={this.state.showModal}
          onClose={this.handleDialogClose}
          ariaLabelledBy="save-creation-modal-label"
          closeOnEsc={true}
          closeOnOverlayClick={true}
        >
          <div
            id="save-creation-modal-label"
            css={`
              display: none;
            `}
          >
            {t('save-creation-modal-title')}
          </div>

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
  margin: 0;
  position: relative;

  .buttons {
    display: flex;
  }

  .left,
  .right {
    flex: 1;
  }

  .left {
    text-align: right;
  }

  ${RecordingState} {
    text-align: center;
  }
`;

export default withTranslation()(StyledRecordingControls);
