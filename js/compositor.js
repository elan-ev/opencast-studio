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

    video.onloadedmetadata = function() {
      let height = this.height / 3;
      let width = video.videoWidth / video.videoHeight * height;
      let offsetX = 0;
      let offsetY = 0;

      this.streams.push({
        stream: stream,
        video: video,
        active: true,
        offsetX: offsetX,
        offsetY: offsetY,
        width: width,
        height: height
      });
      this.streamOrder.push(stream.id);
    }.bind(this);
    video.srcObject = stream;
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
    this.emit('compositestream', this.stream);
  }

  stop() {
    this.emit('unsubscribe.raf', token, () => this.rafToken = null);
  }

  addAudioTrack(track) {
    this.stream.addTrack(track instanceof MediaStream ? track.getAudioTracks()[0] : track);
  }
}
