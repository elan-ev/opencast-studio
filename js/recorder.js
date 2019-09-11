import EventEmitter from './eventemitter';

class Recorder extends EventEmitter {
  constructor(stream, chosenCodec) {
    super();

    let _vidCodecs = [
      'video/webm;codecs="vp9,opus"',
      'video/webm;codecs="vp9.0,opus"',
      'video/webm;codecs="avc1"',
      'video/x-matroska;codecs="avc1"',
      'video/webm;codecs="vp8,opus"'
    ].filter(codec => MediaRecorder.isTypeSupported(codec));

    let _audioCodecs = ['audio/ogg;codecs=opus', 'audio/webm;codecs=opus'];

    let _recData = [];

    chosenCodec = chosenCodec || stream.getVideoTracks().length ? _vidCodecs[0] : _audioCodecs[0];
    this.recorder = new MediaRecorder(stream, { mimeType: chosenCodec });
    this.recorder.ondataavailable = function(e) {
      if (e.data.size > 0) {
        _recData.push(e.data);
      }
    };

    this.recorder.onerror = e => {
      this.emit('record.error', e);
    };

    this.recorder.onstart = e => {
      this.emit('record.start', true);
    };

    this.result = null;

    this.recorder.onstop = e => {
      let mimeType = (this.deviceType == 'audio' ? 'audio' : 'video') + '/webm';
      this.result = new Blob(_recData, { type: mimeType });
      let url = URL.createObjectURL(this.result);
      this.emit('record.complete', { url: url, media: this.result });
      this.recorder = null;
    };

    Object.defineProperty(this, 'recData', {
      get: function() {
        return _recData;
      }
    });

    this.isRecording = false;
    this.isPaused = false;
  }

  start(delay) {
    delay = delay || 0;
    if (!this.isRecording) {
      setTimeout(() => {
        this.recorder.start();
      }, delay);
      this.isRecording = true;
    } else if (this.isPaused) {
      this.resume();
    }
  }

  pause() {
    if (!this.isPaused) {
      this.recorder.pause();
    } else {
      this.resume();
    }
    this.isPaused = !this.isPaused;
  }

  resume() {
    if (this.recorder.state === 'paused') {
      this.recorder.resume();
    }
  }

  stop() {
    this.recorder.stop();
    this.isRecording = false;
  }
}

export default Recorder;
