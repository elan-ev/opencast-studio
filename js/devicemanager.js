class DeviceManager extends EventEmitter {

  constructor() {
    super();
    this.video = {};
    this.audio = {};
    this.desktop = new Device({
      deviceId: 'desktop',
      groupId: '',
      kind: 'desktopinput',
      deviceType: 'desktop',
      label: 'Desktop'
    });

    this.desktop.on('stream', stream => {
      this.emit('stream', {id: 'desktop', stream: stream});
      if (this.isRecording) {
        this.desktop.record();
      }
    });

    Object.defineProperty(this, 'devices', {
      get: function() {
        let devices = {desktop: this.desktop};
        for (let key in this.video) {
          if (key !== 'default') {
            devices[key] = this.video[key];
          }
        }
        for (let key in this.audio) {
          if (key !== 'default') {
            devices[key] = this.audio[key];
          }
        }
        return devices;
      }
    });

    let _isRecording = false;

    Object.defineProperty(this, 'isRecording', {
      get: function() {
        return _isRecording;
      },
      set: function(bool) {
        if (typeof bool == 'boolean') {
          _isRecording = bool;
        }
        else {
          throw new Error('Please provide of a boolean value for assignment instead of this ' + (typeof bool));
        }
      }
    });

    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        ['audio', 'video'].forEach(deviceType => {
          this[deviceType] = devices.filter(device => device.kind === `${deviceType}input`)
                               .reduce((result, info) => {
                                 result[info.deviceId] = new Device(info);
                                 result[info.deviceId].on('stream', stream => {
                                   this.emit('stream', {id: info.deviceId, stream: stream});
                                   if (this.isRecording) {
                                     result[info.deviceId].record();
                                   }

                                   if (stream.getAudioTracks().length > 0) {
                                     this.desktop.attachAudioTrack(stream);
                                   }
                                 });
                                 return result;
                               }, {});
        });

        this.emit('enumerated', this.devices);

        for (let dev in this.devices) {
          this.devices[dev].on('record.prepare', label =>
            this.emit('record.prepare', {
               label: label,
                  id: dev,
              flavor: dev === 'desktop' ? 'Presentation' : 'Presenter'
            })
          );
          this.devices[dev].on('record.complete', obj =>
            this.emit('record.complete', {
               media: obj.media,
                 url: obj.url,
                  id: dev,
            })
          );
          this.devices[dev].on('stream.mute', () => this.emit('stream.mute', dev));
        }
      });
  }

  connect(id, opts) {
    if (id == 'desktop') {
      return this.desktop.connect();
    }

    if (this.video.hasOwnProperty(id)) {
      return this.video[id].connect(opts);
    }

    if (this.audio.hasOwnProperty(id)) {
      return this.audio[id].connect(opts);
    }

    return new Promise((resolve, reject) => reject("no such device"));
  }

  record() {
    for (var dev in this.devices) {
      if (this.devices[dev].stream) {
        this.devices[dev].record();
      }
    }
    this.isRecording = true;
  }

  pauseRecording() {
    for (var dev in this.devices) {
      if (this.devices[dev].stream) {
        this.devices[dev].pauseRecording();
      }
    }
  }

  stopRecording() {
    for (var dev in this.devices) {
      if (this.devices[dev].stream) {
        this.devices[dev].stopRecording();
      }
    }
    this.isRecording = false;
  }

  changeResolution(id, res) {
    return new Promise((resolve, reject) => {
      if (this.devices.hasOwnProperty(id)) {
        this.devices[id].changeResolution(res)
          .then(stream => resolve({id: id, stream: stream}))
          .catch(err => reject(err));
      }
      else {
        reject("no such device");
      }
    });
  }
}

class Device extends EventEmitter {

  constructor(device) {
    super();

    let _stream = null;
    this.recorder = null;
    this.cachedAudioTracks = [];

    Object.defineProperty(this, 'stream', {
      get: function() {
        return _stream;
      },
      set: function(stream) {
        if (stream instanceof MediaStream) {
          _stream = stream;
          this.emit('stream', _stream);
        }
      }
    });

    let _info = device;
    Object.defineProperty(this, 'info', {
      get: function() {
        return _info;
      },
      configurable: false,
      enumerable: false,
    });

    this.deviceType = device.deviceType || (device.kind === 'audioinput' ? 'audio' : 'video');

    let _audConstraints = {audio: {exact: device.deviceId}};
    let _vidConstraints = {audio: true, video: {exact: device.deviceId, facingMode: "user"}};
    let _desktop = {
      firefox: {
        video: {mediaSource: 'screen', frameRate: {ideal: 10, max: 15}}
      },
      chrome: {
        audio: false,
        video: { mandatory: {
                   chromeMediaSource: 'desktop',
                   chromeMediaSourceId: null,
                   maxWidth: window.screen.width,
                   maxHeight: window.screen.height
                 }
               }
      },
      other: null
    }
    let _browser = window.hasOwnProperty('InstallTrigger') ? 'firefox' : (
                     window.hasOwnProperty('chrome') && chrome.app ? 'chrome' : 'other'
                   );

    this.isChrome = _browser === 'chrome';

    Object.defineProperty(this, 'browser', {
      get: function() {
        return _browser;
      }
    });

    Object.defineProperty(this, 'constraints', {
      get: function() {
        switch(this.deviceType) {
          case 'audio':
            return _audConstraints;

          case 'video':
            return _vidConstraints;

          case 'desktop':
            return _desktop[_browser];
        }
      },
      enumerable: false
    });

    if (this.deviceType === 'desktop' && _browser === 'chrome') {
      window.addEventListener('message', e => {
        if (e.data.type && e.data.type == 'SS_DIALOG_SUCCESS') {
          this.emit('streamId', e.data.streamId);
        }
      });
    }
  }

  connect(opts) {
    if (this.deviceType === 'desktop' && this.isChrome) {
      return this.connectChromeDesktop(opts);
    }

    return new Promise((resolve, reject) => {
      opts = opts || {};
      for (var key in opts) {
        if (this.deviceType === 'desktop') {
          this.constraints.video[key] = opts[key];
        }
        else {
          this.constraints[this.deviceType][key] = opts[key];
        }
      }

      navigator.mediaDevices.getUserMedia(this.constraints)
        .then(stream => {
          if (!this.isChrome && this.deviceType === 'desktop') {
            this.cachedAudioTracks.forEach(track =>
              stream = new MediaStream([track, ...stream.getVideoTracks(), ...stream.getAudioTracks()])
            );
          }
          this.stream = stream;

          resolve(stream);
        })
        .catch(err => reject(err));
    });
  }

  connectChromeDesktop(opts) {
    return new Promise((resolve, reject) => {
      this.once('streamId', {
        fn: function(id) {
          this.constraints.video.mandatory.chromeMediaSourceId = id;
          opts = opts || {};
          for (var key in opts) {
            this.constraints.video.mandatory['max' + key.charAt(0).toUpperCase() + key.substring(1)] = opts[key];
          }
          navigator.mediaDevices.getUserMedia(this.constraints)
            .then(stream => {
              this.stream = stream;
              this.cachedAudioTracks.forEach(track => this.stream.addTrack(track));
              resolve(stream);
            })
            .catch(err => reject(err));
        },
        scope: this
      });
      window.postMessage({
        type: 'SS_UI_REQUEST',
        text: 'start',
         url: location.origin
      }, '*');
    });
  }

  attachAudioTrack(streamOrTrack) {
    if (!(streamOrTrack instanceof MediaStream) &&
        !(streamOrTrack instanceof MediaStreamTrack)) {
      return;
    }

    try {
      let audioTrack = streamOrTrack instanceof MediaStreamTrack ?
                         streamOrTrack :
                         streamOrTrack.getAudioTracks()[0];

      if (!this.stream) {
        this.cachedAudioTracks.push(audioTrack);
      }
      else {
        if (this.isChrome) {
          this.stream.addTrack(audioTrack);
        }
        else {
          this.stream = new MediaStream([audioTrack, ...this.stream.getVideoTracks(), ...this.stream.getAudioTracks()])
        }
        this.emit('stream.mute');
      }
    } catch(e) {
      //MediaStream has no audio tracks
    }
  }

  changeResolution(res) {
    if (typeof res === 'string') {
      res = {width: parseInt(res) * 4 / 3, height: parseInt(res)};
    }

    this.stream.getVideoTracks().forEach(track => track.stop());
    this.stream = null;
    return this.connect(res);
  }

  record() {
    if (!this.recorder) {
      if (!this.stream) {
        throw new Error("Can't record as stream is not active");
      }

      this.recorder = new Recorder(this.stream);
      this.recorder.on('record.complete', media => {
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
      this.emit('record.prepare', this.info.label);
    }
  }

  pauseRecording() {
    this.recorder.pause();
  }
}

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

    let _audioCodecs = [
                         'audio/ogg;codecs=opus',
                         'audio/webm;codecs=opus'
                       ]

    let _recData = [];

    chosenCodec = chosenCodec || stream.getVideoTracks().length ? _vidCodecs[0] : _audioCodecs[0];
    this.recorder = new MediaRecorder(stream, {mimeType: chosenCodec});
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
      this.result = new Blob(_recData, {type: mimeType});
      let url = URL.createObjectURL(this.result);
      this.emit('record.complete', {url: url, media: this.result});
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
    }
    else if (this.isPaused) {
      this.resume();
    }
  }

  pause() {
    if (!this.isPaused) {
      this.recorder.pause();
    }
    else {
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
