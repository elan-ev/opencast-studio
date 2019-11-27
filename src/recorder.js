import { isRecordingSupported } from './util';

const findSupportedMimeType = list =>
  isRecordingSupported() && 'isTypeSupported' in MediaRecorder
    ? list.find(mimeType => MediaRecorder.isTypeSupported(mimeType)) || ''
    : '';

export default class Recorder {
  constructor(stream, options = {}) {
    const mimeType =
      options.mimeType ||
      (stream.getVideoTracks().length
        ? findSupportedMimeType([
            'video/webm;codecs="vp9,opus"',
            'video/webm;codecs="vp9.0,opus"',
            'video/webm;codecs="avc1"',
            'video/x-matroska;codecs="avc1"',
            'video/webm;codecs="vp8,opus"'
          ])
        : findSupportedMimeType(['audio/ogg;codecs=opus', 'audio/webm;codecs=opus']));

    const _recData = [];
    this.recorder = new MediaRecorder(stream, { mimeType });
    this.recorder.ondataavailable = function(e) {
      if (e.data.size > 0) {
        _recData.push(e.data);
      }
    };

    this.recorder.onerror = error => {
      options.onError && options.onError(error);
    };

    this.recorder.onstop = () => {
      const media = new Blob(_recData, { type: this.recorder.mimeType });
      let url = URL.createObjectURL(media);
      this.recorder = null;
      options.onStop && options.onStop({ url, media });
    };

    this.isRecording = false;
    this.isPaused = false;
  }

  start() {
    if (!this.isRecording) {
      this.recorder.start();
      this.isRecording = true;
    }
  }

  pause() {
    if (!this.isPaused) {
      this.recorder.pause();
      this.isPaused = true;
    }
  }

  resume() {
    if (this.isPaused) {
      this.recorder.resume();
      this.isPaused = false;
    }
  }

  stop() {
    this.recorder.stop();
    this.isRecording = false;
  }
}
