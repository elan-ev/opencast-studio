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
    }
  },
  toggleAddDevice: function(e) {
    socket.emit('initiatePair');
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
  }
};

const app = new App();

deviceMgr.once('enumerated', {
    fn: devices => {
      app.listDevices(devices);
    }
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
