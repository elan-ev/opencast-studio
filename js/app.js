const deviceMgr = new DeviceManager();
const compositor = new Compositor();
const rafLoop = new RAFLoop();
const audAnalyser = new AudioAnalyser();
const peers = {};

function App() {
  let deviceEls = document.querySelectorAll('.mediadevice[data-target]');
  this.mediaElements = [...deviceEls]
                         .reduce((result, current) => {
                           result[current.getAttribute('data-target')] = current.querySelector(':first-child');
                           return result;
                         }, {});

  this.mediaToggles = [...document.querySelectorAll('.streamToggle')]
                        .reduce((result, current) => {
                           result[current.name] = current;
                           return result;
                        }, {});

  this.addDeviceToggle = document.getElementById('addDevice');
  this.cover = document.getElementById('cover');

  this.deviceList = document.querySelector('#streams .list');
  this.audioCanvas = document.querySelector('#audio ~ canvas');

  this.userView = document.querySelector('select[name=createView]');
  this.simpleUserView = document.getElementById('simpleUserView');
  this.advancedUserView = document.getElementById('advancedUserView');

  this.recordButton = document.getElementById('startRecord');
  this.pauseButton = document.getElementById('pauseRecord');
  this.stopButton = document.getElementById('stopRecord');

  this.timeEl = document.getElementById('recordingTime');
  this.recTime = [];
  this.logNextTick = true;
  this.recTimeToken = null;

  let _isRecording = false;
  let _isPaused = false;

  Object.defineProperty(this, 'isRecording', {
    get: function() {
      return _isRecording;
    },
    set: function(bool) {
      if (typeof bool == 'boolean') {
        _isRecording = bool;

        if (bool) {
          document.body.classList.add('recording');
        }
        else {
          document.body.classList.remove('recording');
        }

        if (!this.recTimeToken) {
          this.recTimeToken = rafLoop.subscribe({
               fn: this.logRecordingTime,
            scope: this
          });
        }
      }
    }
  });

  Object.defineProperty(this, 'isPaused', {
    get: function() {
      return _isPaused;
    },
    set: function(bool) {
      if (typeof bool == 'boolean') {
        _isPaused = bool;
        this.logNextTick = true;

        if (bool) {
          document.body.classList.add('paused');
        }
        else {
          document.body.classList.remove('paused');
        }
      }
    }
  });

  let _needsExtension = false;

  Object.defineProperty(this, 'needsExtension', {
    get: function() {
      return _needsExtension;
    },
    set: function(bool) {
      if (typeof bool == 'boolean') {
        _needsExtension = bool;
        if (bool) {
          document.body.classList.add('extensionRequired');
        }
      }
    }
  });

  this.title = '';
  this.presenter = '';
  this.location = '';

  this.titleEl = document.querySelector('#saveCreation input[name=title]');
  this.presenterEl = document.querySelector('#saveCreation input[name=presenter]');
  this.locationEl = document.querySelector('#saveCreation input[name=location]');

  this.saveRecordings = document.getElementById('saveRecordings');
  this.discardRecordings = document.querySelector('label[for=toggleSaveCreationModal]');

  this.socketId = null;
  this.listingPeer = [];

  this.attachEvents();
}

App.prototype = {
  constructor: App,
  attachEvents: function() {
    deviceMgr.on('enumerated', () => {
      for (let deviceType in deviceMgr) {
        let deviceId = (deviceMgr[deviceType].info || {}).deviceId || 
                         Object.keys(deviceMgr[deviceType])
                           .filter(device => device !== 'default')
                           .reduce((id, current) => id = id || current, null);

        this.mediaToggles[deviceType].value = deviceId;
      }
    });

    for (let key in this.mediaToggles) {
      this.mediaToggles[key].checked = false;
      this.mediaToggles[key].addEventListener('change', this.toggleStream.bind(this), false);
    }

    audAnalyser.attachCanvas(this.audioCanvas);
    audAnalyser.ondelegation('subscribe.raf', function() {
      let delFns = Array.prototype.slice.call(arguments);
      let token = rafLoop.subscribe({fn: delFns[0], scope: audAnalyser});
      if (delFns[1]) {
        delFns[1](token);
      }
    });

    this.addDeviceToggle.addEventListener('click', this.toggleAddDevice, false);

    document.getElementById('installExtension').addEventListener('click', this.chromeInstall.bind(this), false);
    document.getElementById('mergestreams').addEventListener('change', this.mergeStreams.bind(this), false);
    document.body.addEventListener('keyup', this.handleKeys.bind(this), false);
    this.userView.addEventListener('change', this.switchCreateView.bind(this), false);

    this.recordButton.addEventListener('click', this.startRecord.bind(this), false);
    this.pauseButton.addEventListener('click', this.pauseRecord.bind(this), false);
    this.stopButton.addEventListener('click', this.stopRecord.bind(this), false);

    this.titleEl.addEventListener('keyup', this.setTitle.bind(this), false);
    this.presenterEl.addEventListener('keyup', this.setPresenter.bind(this), false);
    this.locationEl.addEventListener('keyup', this.setLocation.bind(this), false);

    this.saveRecordings.addEventListener('click', this.saveMedia.bind(this), false);
  },
  switchCreateView: function(e) {
    let newView = `${e.target.value}UserView`;
    this[newView].checked = true;
  },
  toggleStream: function(e) {
    if (!e.target.checked) {
      return;
    }

    if (e.target.value === 'desktop' && this.needsExtension) {
      document.getElementById('toggleExtensionModal').checked = true;
    }

    deviceMgr.connect(e.target.value)
      .then(stream => {
        this.mediaElements[e.target.name].srcObject = stream;
        this.mediaElements[e.target.name].parentNode
          .classList.add('active');
        [...document.querySelectorAll(`video[data-id="${e.target.value}"]`)]
          .forEach(vid => {
            vid.srcObject = stream;
            vid.parentNode.classList.add('active')
          });

        let audioContainer = this.mediaElements.audio.parentNode;
        if (stream.getAudioTracks().length > 0 && 
            (!audioContainer.classList.contains('active') || stream.getVideoTracks().length === 0)) {
          audioContainer.classList.add('active');
          audAnalyser.analyse(stream);

          let audioDeviceId = this.mediaToggles.audio.value;
          let audioListItem = document.querySelector(`#streams li.audioDevice[data-id="${audioDeviceId}"]`);

          if (audioListItem) {
            audioListItem.classList.add('active');
          }
        }

        if (stream.getVideoTracks().length > 0) {
          compositor.addStream(stream);
        }
      })
      .catch(err => console.log(err));
  },
  listDevices: function(devices) {
    for (let key in devices) {
      let item = utils.createElement('li', {
                   class: `${devices[key].deviceType} ${devices[key].deviceType}Device`,
                   data: {
                        id: key,
                     title: (devices[key].info.label.split(' '))[0]
                   }
                 });

      let deviceType = devices[key].deviceType;
      deviceType = deviceType === 'desktop' ? 'video' : deviceType;

      let mediaEl = utils.createElement(deviceType, {
                      data: {
                        id: key
                      }
                    });

      let placeholder = utils.createElement('span', {
                          class: 'placeholder'
                        });
      let shadow = utils.createElement('span', {
                     class: 'shadow'
                   });

      item.appendChild(mediaEl);
      item.appendChild(placeholder);
      item.appendChild(shadow);

      this.deviceList.appendChild(item);
      item.addEventListener('click', this.toggleDevice.bind(this), false);
    }
  },
  listPeer: function(id) {
    if (this.listingPeer.indexOf(id) === -1) {
      this.listingPeer.push(id);
      let peerItem = utils.createElement('li', {
                       class: 'peerDevice connecting',
                        text: 'Some peer',
                        data: {
                             id: id
                        }
                      });

      this.deviceList.appendChild(peerItem);
      peerItem.addEventListener('click', this.togglePeerStream.bind(this), false);
    }
  },
  toggleAddDevice: function(e) {
    socket.emit('initiatePair');
  },
  togglePeerStream: function(e) {
    console.log(e.target.getAttribute('data-id'));
  },
  displayPairCode: function(code) {
    let _linkEl = document.querySelector('#codehref');
    if (document.querySelector('#addDeviceModal canvas')) {
      return;
    }

    let url = '/pair/?code=' + code;
    _linkEl.href = url;
    let link = _linkEl.href;
    _linkEl.textContent = link;
    new QRCode(document.getElementById('qrcode'), {
      text: link,
      width: 240,
      height: 240,
      correctLevel: QRCode.CorrectLevel.L
    });

    document.getElementById('host').textContent = link.split('/').slice(0, 4).join('/');

    let codeEl = document.getElementById('paircode');
    codeEl.textContent = '';
    code.split('').forEach(char => {
      let charSpan = document.createElement('span');
      charSpan.textContent = char;
      document.getElementById('paircode').appendChild(charSpan);
    });
  },
  toggleDevice: function(e) {
    let item = e.target;
    while (item && item.tagName.toLowerCase() != 'li') {
      item = item.parentNode;
    }

    let id = item.getAttribute('data-id');
    let inputToggle = document.querySelector('input[value="' + id + '"]');

    if (inputToggle && !inputToggle.checked) {
      inputToggle.checked = true;
      inputToggle.dispatchEvent(new Event('change'));
    }
  },
  mergeStreams: function(e) {
    if (e.target.checked) {
      compositor.start();
    }
    else {
      compositor.stop();
    }
  },
  handleKeys: function(e) {
    let keyCode = e.keyCode || e.which;

    switch (keyCode) {
      case 27:
        [...document.querySelectorAll('.toggleCover:checked')]
          .forEach(input => input.checked = false);
    }
  },
  chromeInstall: function() {
    if (chrome && chrome.app) {
      chrome.webstore.install(
        this.chromeStoreLink,
        function() {
          location.reload();
        },
        function(e) {
          console.log('error installing', e);
        }
      );
    }
  },
  attachChannelEvents: function(ch) {
    ch.onopen = function(e) {
      //add UI notification for data channel opened?
    };

    ch.onmessage = function(e) {
      console.log('datachannel message', e);
    };
  },
  startRecord: function(e) {
    if (this.isRecording) {
      this.isPaused = false;
      deviceMgr.record();
      return;
    }

    let numStreams = Object.keys(deviceMgr.devices)
                       .map(key => deviceMgr.devices[key].stream)
                       .filter(stream => stream).length;
    if (numStreams === 0) {
      return;
    }

    this.isRecording = true;

    deviceMgr.record();
  },
  pauseRecord: function(e) {
    deviceMgr.pauseRecording();
    this.isPaused = !this.isPaused;
  },
  stopRecord: function(e) {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;
    this.isPaused = false;
    deviceMgr.stopRecording();
    document.getElementById('toggleSaveCreationModal').checked = true;
    rafLoop.unsubscribe(this.recTimeToken);
  },
  logRecordingTime: function(timestamp) {
    if (this.logNextTick) {
      this.recTime.push(timestamp);
      this.logNextTick = false;
    }

    if (this.isPaused) {
      return;
    }

    let timeslices = this.recTime.reduce((collect, current, i) => collect += current * (i % 2 ? -1 : 1), 0);
    let duration = timestamp - timeslices;
    let timeArr = [duration / 3600000 >> 0, (duration / 60000 >> 0) % 60, ((duration / 1000.0) % 60).toFixed(3)]
                    .map((unit, i) => (unit < 10 ? '0' : '') + unit);
    this.timeEl.textContent = timeArr.join(':');
  },
  listRecording: function(details) {
    let anchor = document.createElement('a');
    anchor.target = '_blank';
    anchor.textContent = details.label;
    anchor.setAttribute('data-id', details.id);
    document.getElementById('recordingList').appendChild(anchor);
  },
  setMediaLink: function(details) {
    let anchor = document.querySelector(`a[data-id="${details.id}"]`);
    if (anchor) {
      anchor.href = details.url;
      if (details.media.type.indexOf('video') > -1) {
        anchor.setAttribute('data-type', 'video');
        anchor.download = 'Video - ' + this.title + '.webm';
        let vid = document.createElement('video');
        vid.src = details.url;
        vid.muted = true;
        vid.addEventListener('mouseover', e => vid.play(), false);
        vid.addEventListener('mouseout', e => vid.pause(), false);
        vid.addEventListener('ended', e => vid.currentTime = 0, false);

        anchor.appendChild(vid);
      }
      else {
        anchor.download = 'Audio - ' + this.title + '.webm';
        anchor.setAttribute('data-type', 'audio');
      }
    }
  },
  setTitle: function(e) {
    this.title = e.target.value || 'Recording';
    [...document.querySelectorAll('#recordingList a')].forEach(anchor => {
      anchor.download = anchor.getAttribute('data-type') + ' - ' + this.title + '.webm';
    });
  },
  setPresenter: function(e) {
    this.presenter = e.target.value;
  },
  setLocation: function(e) {
    this.location = e.target.value;
  },
  saveMedia: function(e) {
    [...document.querySelectorAll('#saveCreation a')].forEach(anchor => anchor.click());
    document.getElementById('toggleSaveCreationModal').checked = false;
  }
};

const app = new App();

deviceMgr.once('enumerated', {
    fn: devices => {
      app.listDevices(devices);
    }
});

deviceMgr.on('record.prepare', label => {
  app.listRecording(label);
});

deviceMgr.on('record.complete', details => {
  app.setMediaLink(details);
});

compositor.on('subscribe.raf', function() {
  let args = Array.prototype.slice.call(arguments, 0, 2);
  rafLoop.subscribe({
    fn: args[0],
    scope: compositor
  }, args[1]);
});

compositor.on('unsubscribe.raf', function() {
  console.log(arguments);
});

compositor.on('compositestream', stream => {
  console.log('got composite stream', stream);
});

if (window.chrome && chrome.app) {
  let delay = setTimeout(() => {
    app.needsExtension = true;
  }, 1000);
  window.addEventListener('message', e => {
    if (e.data.type && e.data.type == 'SS_PING' && document.getElementById('appInstalled')) {
      clearTimeout(delay);
      deviceMgr.listenForChromeDesktop();
    }
  });
}

socket.on('peerConnection', data => {
  document.getElementById('toggleAddDeviceModal').checked = false;
  if (!document.querySelector('button[data-stream="' + data.target + '"]')) {
    app.listPeer(data.target);
  }
});
