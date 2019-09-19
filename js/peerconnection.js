import utils from './utils.js';

let pc_config = {
  iceServers: [
    { url: 'stun:stun.sipgate.net:3478' },
    { url: 'stun:iphone-stun.strato-iphone.de:3478' },
    { url: 'stun:numb.viagenie.ca:3478' },
    { url: 'stun:stun.aa.net.uk:3478' },
    { url: 'stun:stun.kiwilink.co.nz:3478' },
    { url: 'stun:stun.uls.co.za:3478' },
    { url: 'stun:stun.mitake.com.tw:3478' },
    { url: 'stun:stun.sip.us:3478' }
  ]
};

let streamConstraints = {
  optional: [],
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  }
};

if (window.hasOwnProperty('InstallTrigger')) {
  //Firefox has window.InstallTrigger (for now)
  streamConstraints = {
    offerToReceiveVideo: true,
    offerToReceiveAudio: true
  };
}

const myCapabilities = {
  MediaRecorder: !!window.MediaRecorder
};

let PeerConnection = function(peerDetails, stream, isInitiator, channelEvents) {
  if (typeof peerDetails == 'string') {
    this.id = peerDetails;
  } else {
    this.id = (app.peers || [])[0] || peerDetails.target;
    this.room = app.room;
  }
  this.isCaller = isInitiator || (typeof stream == 'boolean' ? stream : false);
  this.candidateQueue = [];
  this.canvas = null;
  this.bgCanvas = null;
  this.canvasPages = [];
  this.bgCanvasPages = [];

  this.capabilities = {
    MediaRecorder: !!window.MediaRecorder
  };

  this.recorder = null;
  this.fileChunk = 16384;

  let _completeFns = {};

  Object.defineProperty(this, 'completeFns', {
    get: function() {
      return _completeFns;
    }
  });

  var _closeFuncs = [];

  Object.defineProperty(this, 'onclose', {
    get: function() {
      return _closeFuncs;
    },
    set: function(func) {
      if (typeof func != 'function') {
        return;
      }

      _closeFuncs.push(func);
    }
  });

  this.pc = new RTCPeerConnection(pc_config);
  this.captureEvents();

  if (this.isCaller) {
    if (stream instanceof MediaStream) {
      this.pc.addStream(stream);
    } else if (canvas) {
      this.on('channel.opened', () => {
        let msg = {
          event: 'canvas.dimensions',
          payload: {
            width: canvas.canvas.width,
            height: canvas.canvas.height,
            lineWidth: canvas.ctx.lineWidth,
            eraseWidth: canvas.eraseWidth,
            colour: canvas.ctx.fillStyle
          }
        };
        this.dataChannel.send(JSON.stringify(msg));
      });
    }
    if (this.pc.createDataChannel) {
      this.dataChannel = this.pc.createDataChannel('channel');
      setChannelEvents.call(this);
    }

    this.sendOffer();
  } else if (!this.isCaller) {
    this.pc.ondatachannel = e => {
      this.dataChannel = e.channel;
      if (app && app.attachChannelEvents) {
        app.attachChannelEvents(this.dataChannel);
      } else {
        setChannelEvents.call(this);
      }
    };
  }

  var mediaElement = null;

  Object.defineProperty(this, 'streamElement', {
    get: function() {
      return mediaElement;
    },
    set: function(stream) {
      mediaElement = document.createElement(stream.getVideoTracks().length > 0 ? 'video' : 'audio');
      mediaElement.srcObject = stream;
      mediaElement.autoplay = true;
      mediaElement.muted = true;
      mediaElement.setAttribute('data-peer', this.id);
    }
  });

  var _username = '';
  this.awaitUsername = [];

  Object.defineProperty(this, 'username', {
    get: function() {
      return _username;
    },
    set: function(username) {
      _username = username;
      this.awaitUsername.forEach(el => (el.innerHTML = _username));
    }
  });
};

PeerConnection.prototype = {
  constructor: PeerConnection,
  on: function(ev, fnObj) {
    if (!this.completeFns[ev]) {
      this.completeFns[ev] = {};
    }

    let token = null;
    do {
      token = (Math.random() + 1).toString(36).substring(2, 10);
    } while (Object.keys(this.completeFns).indexOf(token) > -1);

    fnObj = typeof fnObj === 'function' ? { fn: fnObj, scope: null } : fnObj;
    this.completeFns[ev][token] = {
      scope: fnObj.scope,
      fn: fnObj.fn
    };

    return token;
  },
  emit: function(ev, val) {
    let args = Array.prototype.slice.call(arguments);
    ev = args[0];
    val = args.slice(1);

    if (this.completeFns[ev]) {
      for (let key in this.completeFns[ev]) {
        let scope = this.completeFns[ev][key].scope;
        let fn = this.completeFns[ev][key].fn;
        (function() {
          fn.apply(scope, val);
        }.bind(scope)());
      }
    }
  },
  sendOffer: function() {
    var self = this;
    this.pc
      .createOffer()
      .then(offer => {
        self.pc.setLocalDescription(offer);
        //TODO: remove type check when comms implemented on pairing device
        (typeof comms != 'undefined' ? comms : socket).emit('peerConnection', {
          target: self.id,
          details: offer
        });
      })
      .catch(err => this.offerFailed(err));
  },
  sendAnswer: function() {
    this.pc
      .createAnswer()
      .then(offer => {
        this.pc.setLocalDescription(offer);
        (typeof comms != 'undefined' ? comms : socket).emit('peerConnection', {
          target: this.id,
          details: offer
        });
      })
      .catch(err => this.answerFailed(err));
  },
  answerFailed: function(e) {
    console.log('failed answer', e);
  },
  offerFailed: function(e) {
    console.log('failed offer', e);
  },
  handleRequest: function(data) {
    let details = data.details;
    switch (details.type) {
      case 'offer':
        this.handleOffer(details);
        break;

      case 'answer':
        this.handleAnswer(details);
        break;

      case 'candidate':
        this.addCandidate(details);
    }
  },
  handleOffer: function(details) {
    var self = this;
    if (!this.pc.remoteDescription || !this.pc.remoteDescription.sdp) {
      this.pc
        .setRemoteDescription(details)
        .then(() => this.emit('remoteDescription.set'))
        .catch(err => this.emit('remoteDescription.failed', err));
    }
    this.sendAnswer();
  },
  handleAnswer: function(details) {
    this.pc.setRemoteDescription(new RTCSessionDescription(details));
  },
  addCandidate: function(details) {
    let candidate = new RTCIceCandidate({
      sdpMLineIndex: details.sdpMLineIndex,
      sdpMid: details.sdpMid,
      candidate: details.candidate
    });
    if (this.pc.remoteDescription) {
      this.pc.addIceCandidate(candidate);
    } else {
      this.candidateQueue.push(candidate);
    }
  },
  captureEvents: function() {
    this.pc.onicecandidate = evt => {
      if (evt.candidate) {
        details = {
          type: 'candidate',
          sdpMLineIndex: evt.candidate.sdpMLineIndex,
          sdpMid: evt.candidate.sdpMid,
          candidate: evt.candidate.candidate
        };
        (typeof comms != 'undefined' ? comms : socket).emit('peerConnection', {
          target: this.id,
          details: details
        });
      }
    };

    this.pc.addEventListener('addstream', event => {
      this.stream = event.stream;
      this.recorder = new Recorder(this.stream);
      this.recorder.on('record.complete', media => {
        media.id = this.id;
        this.emit('record.complete', media);
        this.recorder = null;
      });
    });

    this.pc.oniceconnectionstatechange = e => {
      if (
        ['connected', 'completed'].indexOf(this.pc.iceConnectionState) > -1 &&
        !this.noVideoElement
      ) {
        //hacky...
        if (this.stream && !this.streamElement) {
          this.streamElement = this.stream;
        }
      }
      this.emit(`connection.${this.pc.iceConnectionState}`);
    };
    this.on('remoteDescription.set', () => {
      this.candidateQueue.forEach(candidate => {
        this.pc.addIceCandidate(candidate);
      });
      this.candidateQueue = [];
    });
    this.on('remoteDescription.failed', e => console.log('rdp failed', e));
  },
  record: function() {
    this.dataChannel.send('record');
    this.recorder.start();
  },
  pauseRecording: function() {
    this.dataChannel.send('pauseRecording');
    this.recorder.pause();
  },
  stopRecording: function() {
    if (this.recorder) {
      this.dataChannel.send('stopRecording');
      this.recorder.stop();
      this.emit('record.prepare', { id: this.id, label: 'Remote peer', flavor: 'remote' });
    }
  },
  transferFile: function() {
    //TODO: tokenize each recorder
    let file = recorder.result;
    let sliceFile = offset => {
      let reader = new FileReader();
      reader.onload = (() => {
        return e => {
          this.dataChannel.send(e.target.result);
          if (file.size > offset + e.target.result.byteLength) {
            setTimeout(sliceFile, 0, offset + this.fileChunk);
          } else {
            this.dataChannel.send('filetransfer.complete');
          }
        };
      })(file);
      let slice = file.slice(offset, offset + this.fileChunk);
      reader.readAsArrayBuffer(slice);
    };
    sliceFile(0);
  },
  handleIncomingTransfer: function(data) {
    this.mediaBuffer.push(data);
    if (this.progress) {
      this.mediaDetails.current += data.byteLength;
      let currentProgress = (515 - (this.mediaDetails.current / this.mediaDetails.size) * 515) >> 0;
      this.progress.setAttributeNS(null, 'stroke-dashoffset', currentProgress);
    }
  },
  saveBuffer: function() {
    this.mediaBlob = new Blob(this.mediaBuffer, { type: 'video/webm' });
    let url = URL.createObjectURL(this.mediaBlob);
    this.emit('record.raw', { url: url, media: this.mediaBlob, id: this.id });
  },
  setCanvasDimensions: function(dims, numAttempts) {
    if (!this.canvas) {
      //displayScale not used in this block (it SHOULD be used)
      this.canvas = document.createElement('canvas');
      this.canvas.width = dims.width;
      this.canvas.height = dims.height;
      this.ctx = this.canvas.getContext('2d');
      this.lineWidth = this.ctx.lineWidth = dims.lineWidth;
      this.eraseWidth = dims.eraseWidth;
      this.ctx.fillStyle = this.ctx.strokeStyle = dims.colour;
      this.ctx.lineCap = 'round';
    }
    if (this.displayCanvas) {
      let aspectRatio = dims.width / dims.height;
      if (aspectRatio > 1) {
        let parentWidth = this.displayCanvas.parentNode.clientWidth;
        if (!parentWidth && (!numAttempts || numAttempts < 3)) {
          numAttempts = numAttempts || 0;
          return setTimeout(() => {
            this.setCanvasDimensions(dims, ++numAttempts);
          }, 1000);
        }
        let parentHeight = this.displayCanvas.parentNode.clientHeight;
        this.displayCanvas.style.width = '100%';
        this.displayCanvas.style.height = ((parentWidth / aspectRatio) >> 0) + 'px';
        this.displayCanvas.width = parentWidth;
        this.displayCanvas.height = (parentWidth / aspectRatio) >> 0;
        this.displayScale = parentWidth / dims.width;
        this.displayCanvas.style.top = (parentHeight - parentWidth / aspectRatio) / 2 + 'px';
      } else {
        let parentHeight = this.displayCanvas.parentNode.clientHeight;
        if (!parentHeight && (!numAttempts || numAttempts < 3)) {
          numAttempts = numAttempts || 0;
          return setTimeout(() => {
            this.setCanvasDimensions(dims, ++numAttempts);
          }, 1000);
        }
        let parentWidth = this.displayCanvas.parentNode.clientWidth;
        this.displayCanvas.style.height = '100%';
        this.displayCanvas.style.width = ((parentHeight * aspectRatio) >> 0) + 'px';
        this.displayCanvas.width = (parentHeight * aspectRatio) >> 0;
        this.displayCanvas.height = parentHeight;
        this.displayScale = parentHeight / dims.height;
        this.displayCanvas.style.left = (parentWidth - parentHeight * aspectRatio) / 2 + 'px';
      }
      this.displayCtx = this.displayCanvas.getContext('2d');
      this.displayCtx.lineWidth = dims.lineWidth * this.displayScale;
      this.eraseWidth = dims.eraseWidth * this.displayScale;
      this.displayCtx.strokeStyle = this.displayCtx.fillStyle = dims.colour;
      this.displayCtx.lineCap = 'round';
    }
  },
  drawCanvas: function(pts) {
    pts = pts.map(pt => {
      return {
        x: pt.x * this.displayScale,
        y: pt.y * this.displayScale
      };
    });

    let p0 = pts[0];
    let p1 = pts[1];

    this.displayCtx.globalCompositeOperation = 'source-over';

    this.displayCtx.beginPath();
    this.displayCtx.moveTo(pts[0].x, pts[0].y);

    let mid = {};
    for (let i = 1, n = pts.length - 1; i < n; i++) {
      mid = {
        x: (p0.x + p1.x) / 2,
        y: (p0.y + p1.y) / 2
      };
      this.displayCtx.quadraticCurveTo(p0.x, p0.y, mid.x, mid.y);
      p0 = pts[i];
      p1 = pts[i + 1];
    }
    this.displayCtx.lineTo(mid.x, mid.y);
    this.displayCtx.stroke();
  },
  canvasErase: function(pts) {
    if (!pts.length) return;

    pts = pts.map(pt => {
      return {
        x: pt.x * this.displayScale,
        y: pt.y * this.displayScale
      };
    });

    this.displayCtx.globalCompositeOperation = 'destination-out';
    this.displayCtx.lineWidth = this.eraseWidth;
    this.displayCtx.beginPath();
    this.displayCtx.moveTo(pts[0].x, pts[0].y);

    for (let i = 1, n = pts.length; i < n; i++) {
      this.displayCtx.lineTo(pts[i].x, pts[i].y);
      this.displayCtx.stroke();
    }
  }
};

function setChannelEvents() {
  let channel = this.dataChannel;
  if (!channel) {
    console.log('no datachannel supplied');
    return;
  }

  channel.onopen = e => {
    channel.send('ping');
    if (this.isCaller) {
      channel.send(JSON.stringify({ event: 'capabilities', payload: myCapabilities }));
    }
  };

  channel.onerror = e => {
    console.log('data channel error', e);
  };

  channel.onmessage = e => {
    let event = e.data;
    let json = {};
    try {
      json = JSON.parse(e.data);
      event = json.event;
    } catch (e) {}

    switch (event) {
      case 'ping':
        channel.send('pong');
        break;

      case 'pong':
        utils.log('Communications channel opened');
        this.emit('channel.opened');
        break;

      case 'record':
        if (stream) {
          recorder = new Recorder(stream);
          recorder.start();
        }
        break;

      case 'pauseRecording':
        recorder.pause();
        break;

      case 'stopRecording':
        recorder.stop();
        break;

      case 'request.filetransfer':
        let response = {
          event: 'request.filetransfer.accepted',
          payload: {
            size: recorder.result.size,
            current: 0
          }
        };
        channel.send(JSON.stringify(response));
        this.transferFile();
        break;

      case 'request.filetransfer.accepted':
        this.mediaBuffer = [];
        this.incomingMedia = true;
        this.mediaDetails = json.payload;
        break;

      case 'filetransfer.complete':
        this.incomingMedia = false;
        this.saveBuffer();
        break;

      case 'capabilities':
        this.capabilities = json.payload;
        break;

      case 'canvas.dimensions':
        this.setCanvasDimensions(json.payload);
        break;

      case 'canvas.draw':
        this.drawCanvas(json.payload);
        break;

      case 'canvas.erase':
        this.canvasErase(json.payload);
        break;

      default:
        //incoming file
        if (this.incomingMedia) {
          this.handleIncomingTransfer(e.data);
        }
    }
  };
}

export default PeerConnection;
