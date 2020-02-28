import { dimensionsOf } from './util.js';

export default class Recorder {
  constructor(stream, options = {}) {
    const mimeType = options.mimeType || undefined;

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
      const mimeType = _recData[0].type || this.recorder.mimeType;
      const media = new Blob(_recData, { type: mimeType });
      const url = URL.createObjectURL(media);
      const dimensions = dimensionsOf(stream);
      this.recorder = null;
      options.onStop && options.onStop({ url, media, mimeType, dimensions });
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
