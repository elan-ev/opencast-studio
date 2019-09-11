import EventEmitter from './eventemitter';
import Recorder from './recorder';

class Compositor extends EventEmitter {
  constructor(opts) {
    super();

    this.streams = {};
    this.streamOrder = [];

    this.codecs =
      'MediaRecorder' in window
        ? [
            'video/webm;codecs="vp9,opus"',
            'video/webm;codecs="vp9.0,opus"',
            'video/webm;codecs="avc1"',
            'video/x-matroska;codecs="avc1"',
            'video/webm;codecs="vp8,opus"'
          ].filter(codec => MediaRecorder.isTypeSupported(codec))
        : [];

    this.recorder = null;
    this.recData = [];
    this.canvas = document.createElement('canvas');
    this.width = 1280;
    this.height = 720;
    this.setDimensions(opts);

    let _stream = null;

    Object.defineProperty(this, 'stream', {
      get: function() {
        return _stream;
      },
      set: function(stream) {
        if (stream === null || stream instanceof MediaStream) {
          _stream = stream;
          if (stream) {
            this.emit('stream', { stream: stream, id: 'composite' });
          }
        }
      }
    });

    this.rafToken = null;

    Object.defineProperty(this, 'dimensions', {
      get: function() {
        return { width: this.width, height: this.height };
      }
    });

    let _browser = window.hasOwnProperty('InstallTrigger')
      ? 'firefox'
      : window.hasOwnProperty('chrome') && chrome.app
      ? 'chrome'
      : 'other';

    this.isChrome = _browser === 'chrome';
  }

  setDimensions(opts) {
    let activeState = false;
    let oldWidth = this.width;
    let oldHeight = this.height;
    if (this.stream) {
      activeState = true;
      this.stop();
    }
    this.width = opts ? opts.width || 1280 : 1280;
    this.height = opts ? opts.height || 720 : 720;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    if (activeState) {
      for (let id in this.streams) {
        this.streams[id].offsetX = Math.floor((this.streams[id].offsetX / oldWidth) * this.width);
        this.streams[id].offsetY = Math.floor((this.streams[id].offsetY / oldHeight) * this.height);
        this.streams[id].width = Math.floor((this.streams[id].width / oldWidth) * this.width);
        this.streams[id].height = Math.floor((this.streams[id].height / oldHeight) * this.height);
      }
      this.start();
    }
  }

  addStream(streamObj) {
    if (this.streams.hasOwnProperty(streamObj.id)) {
      this.streams[streamObj.id].active = true;
      if (this.streams[streamObj.id].stream.id != streamObj.stream.id) {
        this.streams[streamObj.id].stream = streamObj.stream;
        this.streams[streamObj.id].video.srcObject = streamObj.stream;
      }
      return;
    }
    if (Object.keys(this.streams).length > 4) {
      throw new Error('max streams attached');
    }

    let video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;

    video.onloadedmetadata = () => {
      let position = this.getPosition(video, streamObj.id);

      this.streams[streamObj.id] = {
        id: streamObj.id,
        stream: streamObj.stream,
        video: video,
        active: true,
        offsetX: position.offsetX,
        offsetY: position.offsetY,
        width: position.width,
        height: position.height
      };
      if (streamObj.id == 'desktop') {
        this.streamOrder.unshift(streamObj.id);
      } else {
        this.streamOrder.push(streamObj.id);
      }
    };
    video.srcObject = streamObj.stream;

    if (typeof video.play === 'function') {
      video.play();
    }

    if (this.stream && streamObj.stream.getAudioTracks().length) {
      this.addAudioTrack(streamObj.stream.getAudioTracks()[0]);
    }
  }

  removeStream(id) {
    return new Promise((resolve, reject) => {
      if (!this.streams.hasOwnProperty(id)) {
        reject('no such stream');
        return;
      }

      delete this.streams[id];
    });
  }

  getPosition(video, id) {
    switch (id) {
      case 'desktop':
        return {
          width: Math.min(video.videoWidth, this.width),
          height: Math.min(video.videoHeight, this.height),
          offsetX: 0,
          offsetY: (this.height - Math.min(video.videoHeight, this.height)) / 2
        };

      default:
        let aspectRatio = video.videoWidth / video.videoHeight;
        let isLandscape = aspectRatio > 1;
        let width = isLandscape ? this.width / 4 : (this.height / 4) * aspectRatio;
        let height = isLandscape ? this.width / 4 / aspectRatio : this.height / 4;
        let offsets = this.getDefaultOffsets(width, height);
        return {
          width: width,
          height: height,
          offsetX: offsets.x,
          offsetY: offsets.y
        };
    }
  }

  getDefaultOffsets(width, height) {
    let x = this.width - width;
    let y = this.height - height;

    for (let key in this.streams) {
      if (key !== 'desktop') {
        let stream = this.streams[key];
        if (
          x >= stream.offsetX &&
          x < stream.offsetX + stream.width &&
          y >= stream.offsetY &&
          y < stream.offsetY + stream.height
        ) {
          x = Math.max(0, stream.offsetX - width);
        }
      }
    }

    return { x: x, y: y };
  }

  draw() {
    this.streamOrder
      .filter(id => this.streams[id].active)
      .map(id => this.streams[id])
      .forEach(stream => {
        this.ctx.drawImage(
          stream.video,
          stream.offsetX,
          stream.offsetY,
          stream.width,
          stream.height
        );
      });
  }

  start() {
    this.emit('subscribe.raf', this.draw, function(token) {
      this.rafToken = token;
    });

    this.stream = this.canvas.captureStream(30);
    for (let key in this.streams) {
      let streamObj = this.streams[key];
      if (streamObj.stream.getAudioTracks().length) {
        this.addAudioTrack(streamObj.stream.getAudioTracks()[0]);
      }
    }
  }

  stop() {
    this.emit('unsubscribe.raf', this.rafToken, () => (this.rafToken = null));
    this.stream = null;
    this.emit('stream.remove', 'composite');
  }

  addAudioTrack(track) {
    if (this.isChrome) {
      this.stream.addTrack(track);
    } else {
      this.stream = new MediaStream([
        track,
        ...this.stream.getVideoTracks(),
        ...this.stream.getAudioTracks()
      ]);
    }
    this.emit('stream.mute');
  }

  record() {
    if (!this.stream) {
      return;
    }

    if (!this.recorder) {
      this.recorder = new Recorder(this.stream);
      this.recorder.on('record.complete', media => {
        media.id = 'compositor';
        this.emit('record.complete', media);
        this.recorder = null;
      });
      this.recorder.start(1000);
    } else if (this.recorder.state === 'paused') {
      this.recorder.resume();
    }
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stop();
      this.emit('record.prepare', {
        label: 'compositor',
        id: 'compositor',
        flavor: 'Composite'
      });
    }
  }

  pauseRecording() {
    if (this.recorder) {
      this.recorder.pause();
    }
  }

  changeResolution(res) {
    let height = parseInt(res);
    let width = Math.ceil((height / 9) * 16);
    return new Promise((resolve, reject) => {
      this.setDimensions({ width: width, height: height });
      resolve({ stream: this.stream });
    });
  }
}

export default Compositor;
