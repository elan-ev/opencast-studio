class Compositor extends EventEmitter {

  constructor(opts) {
    super();

    this.streams = [];
    this.streamOrder = [];

    this.codecs = [
                    'video/webm;codecs="vp9,opus"',
                    'video/webm;codecs="vp9.0,opus"',
                    'video/webm;codecs="avc1"',
                    'video/x-matroska;codecs="avc1"',
                    'video/webm;codecs="vp8,opus"'
                  ].filter(codec => MediaRecorder.isTypeSupported(codec));
    this.recorder = null;
    this.recData = [];

    this.width = (opts ? (opts.width || 1280) : 1280);
    this.height = (opts ? (opts.height || 720) : 720);
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');

    let _stream = null;

    Object.defineProperty(this, 'stream', {
      get: function() {
        return _stream;
      },
      set: function(stream) {
        if (stream instanceof MediaStream) {
          _stream = stream;
          this.emit('stream', stream);
        }
      }
    });

    this.rafToken = null;

    Object.defineProperty(this, 'dimensions', {
      get: function() {
        return {width: this.width, height: this.height};
      }
    });

    let _browser = window.hasOwnProperty('InstallTrigger') ? 'firefox' : (
                     window.hasOwnProperty('chrome') && chrome.app ? 'chrome' : 'other'
                   );

    this.isChrome = _browser === 'chrome';
  }

  addStream(stream, opts) {
    let streamIndex = this.streams.map(curStream => curStream.stream.id).indexOf(stream.id);
    if (streamIndex > -1) {
      this.streams[streamIndex].active = true;
      return;
    }

    if (this.streams.length > 4) {
      throw new Error('max streams attached');
    }

    let video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;

    video.onloadedmetadata = () => {
      let position = this.getPosition(video, opts);

      this.streams.push({
        stream: stream,
        video: video,
        active: true,
        offsetX: position.offsetX,
        offsetY: position.offsetY,
        width: position.width,
        height: position.height
      });
      if (typeof opts == 'string' && opts == 'desktop') {
        this.streamOrder.unshift(stream.id);
      }
      else {
        this.streamOrder.push(stream.id);
      }
    };
    video.srcObject = stream;

    if (this.stream && stream.getAudioTracks().length) {
      this.addAudioTrack(stream.getAudioTracks()[0]);
    }
  }

  getPosition(video, opts) {
    if (typeof opts == 'string') {
      switch (opts) {
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
          let width = (isLandscape) ? this.width / 3 : this.height / 3 * aspectRatio; 
          let height = (isLandscape) ? (this.width / 3) / aspectRatio : this.height / 3;
          return {
              width: width,
             height: height,
            offsetX: this.width - width,
            offsetY: this.height - height
          };
      }
    }
  }

  draw() {
    this.streams
      .sort((a, b) => this.streamOrder.indexOf(a.stream.id) - this.streamOrder.indexOf(b.stream.id))
      .filter(stream => stream.active)
      .forEach(stream => {
        this.ctx.drawImage(stream.video, stream.offsetX, stream.offsetY, stream.width, stream.height);
      });
  }

  start() {
    this.emit('subscribe.raf', this.draw, function(token) {
      this.rafToken = token;
    });

    this.stream = this.canvas.captureStream(30);
    this.streams.forEach(streamObj => {
      if (streamObj.stream.getAudioTracks().length) {
        this.addAudioTrack(streamObj.stream.getAudioTracks()[0]);
      }
    });
    this.emit('compositestream', this.stream);
  }

  stop() {
    this.emit('unsubscribe.raf', token, () => this.rafToken = null);
  }

  addAudioTrack(track) {
    if (this.isChrome) {
      this.stream.addTrack(track);
    }
    else {
      this.stream = new MediaStream([track, ...this.stream.getVideoTracks(), ...this.stream.getAudioTracks()])
    }
    this.emit('stream.mute');
  }

  record() {
    if (!this.recorder) {
      if (!this.stream) {
        throw new Error("Can't record as stream is not active");
      }

      this.recorder = new Recorder(this.stream);
      this.recorder.on('record.complete', media => {
        media.id = 'compositor';
        this.emit('record.complete', media);
        this.recorder = null;
      });
      this.recorder.start(1000);
    }
    else {
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
    this.recorder.pause();
  }
}
