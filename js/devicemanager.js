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

    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        ['audio', 'video'].forEach(deviceType => {
          this[deviceType] = devices.filter(device => device.kind === `${deviceType}input`)
                               .reduce((result, info) => {
                                 result[info.deviceId] = new Device(info);
                                 result[info.deviceId].on('stream', stream => {
                                   this.emit('stream', {id: info.deviceId, stream: stream});
                                 });
                                 return result;
                               }, {});
        });

        this.emit('enumerated', this.devices);
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

  listenForChromeDesktop() {
    window.addEventListener('message', e => {
    });
  }
}

class Device extends EventEmitter {

  constructor(device) {
    super();

    let _stream = null;

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
    let _vidConstraints = {audio: true, video: {exact: device.deviceId}};
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
      return this.connectChromeDesktop();
    }

    return new Promise((resolve, reject) => {
      opts = opts || {};
      navigator.mediaDevices.getUserMedia(this.constraints)
        .then(stream => {
          this.stream = stream;
          resolve(stream);
        })
        .catch(err => reject(err));
    });
  }

  connectChromeDesktop() {
    return new Promise((resolve, reject) => {
      this.once('streamId', {
        fn: function(id) {
          this.constraints.video.mandatory.chromeMediaSourceId = id;
          navigator.mediaDevices.getUserMedia(this.constraints)
            .then(stream => {
              this.stream = stream;
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
}
