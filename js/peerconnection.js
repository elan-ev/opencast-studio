let pc_config = {"iceServers":[
                  {urls: 'stun:stun.sipgate.net:3478'},
                ]};

let streamConstraints = {
  optional: [],
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  }
}

if (window.hasOwnProperty('InstallTrigger')) {
  //Firefox has window.InstallTrigger (for now)
  streamConstraints = {
    offerToReceiveVideo: true,
    offerToReceiveAudio: true
  }
}

const myCapabilities = {
  MediaRecorder: !!window.MediaRecorder
}

let PeerConnection = function(peerDetails, stream, isInitiator, channelEvents) {
  if (typeof peerDetails == 'string') {
    this.id = peerDetails;
  }
  else {
    this.id = (app.peers || [])[0] || peerDetails.target;
    this.room = app.room;
  }
  this.isCaller = isInitiator || (typeof stream == 'boolean' ? stream : false);
  this.candidateQueue = [];

  this.capabilities = {
    MediaRecorder: !!window.MediaRecorder
  }

  this.recorder = null;
  this.fileChunk = 16384;

  this.pc = new RTCPeerConnection(pc_config);

  this.pc.onicecandidate = evt => {
    if (evt.candidate) {
      details = {
                 type: 'candidate',
        sdpMLineIndex: evt.candidate.sdpMLineIndex,
               sdpMid: evt.candidate.sdpMid,
            candidate: evt.candidate.candidate
      };
      socket.emit('peerConnection', {target: this.id, details: details});
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
    if (['connected', 'completed'].indexOf(this.pc.iceConnectionState) > -1 && !this.noVideoElement) {
      //hacky...
      if (this.stream && !this.streamElement) {
        this.streamElement = this.stream;
      }
    }
    if (this.pc.iceConnectionState === 'connected') {
      this.emit('complete');
    }
  };

  if (this.isCaller && stream instanceof MediaStream) {
    this.pc.addStream(stream);
    this.dataChannel = this.pc.createDataChannel('channel');
    setChannelEvents.call(this);

    this.sendOffer();
  }
  else if (!this.isCaller) {
    this.pc.ondatachannel = e => {
      this.dataChannel = e.channel;
      if (app && app.attachChannelEvents) {
        app.attachChannelEvents(this.dataChannel);
      }
      else {
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
             mediaElement.src = URL.createObjectURL(stream);
             mediaElement.autoplay = true;
             mediaElement.muted = true;
             mediaElement.setAttribute('data-peer', this.id);
           }
    }
  );

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

  var _username = '';
  this.awaitUsername = [];

  Object.defineProperty(this, 'username', {
      get: function() {
             return _username;
           },
      set: function(username) {
             _username = username;
             this.awaitUsername.forEach(el => el.innerHTML = _username);
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
      token = (Math.random() + 1).toString(36).substring(2,10);
    } while (Object.keys(this.completeFns).indexOf(token) > -1);

    fnObj = typeof fnObj === 'function' ? {fn: fnObj, scope: null} : fnObj;
    this.completeFns[ev][token] = {
      scope: fnObj.scope,
         fn: fnObj.fn
    }

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
        }.bind(scope))();
      }
    }
  },
             sendOffer: function() {
                          var self = this;
                          this.pc.createOffer(offer => {
                            self.pc.setLocalDescription(offer);
                            socket.emit('peerConnection', {target: self.id, details: offer});
                          }, self.offerFailed, streamConstraints);
                        },
           offerFailed: function(e) {
                          console.log('failed offer', e);
                        },
            sendAnswer: function() {
                          var self = this;
                          this.pc.createAnswer(offer => {
                             self.pc.setLocalDescription(offer);
                             socket.emit('peerConnection', {target: self.id, details: offer});
                          }, self.answerFailed, streamConstraints);
                        },
          answerFailed: function(e) {
                          console.log('failed answer', e);
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
                         if (!this.pc.remoteDescription.sdp) {
                           this.pc.setRemoteDescription(new RTCSessionDescription(details), function() {
                               self.candidateQueue.forEach(candidate => {
                                 self.pc.addIceCandidate(candidate);
                               });
                             }, err => console.log('err setting remote desc', err));
                         }
                         this.sendAnswer();
                       },
         handleAnswer: function(details) {
                         this.pc.setRemoteDescription(new RTCSessionDescription(details));
                       },
         addCandidate: function(details) {
                         let candidate = new RTCIceCandidate({sdpMLineIndex:details.sdpMLineIndex, sdpMid:details.sdpMid, candidate:details.candidate});
                         if (this.pc.hasOwnProperty('remoteDescription')) {
                           this.pc.addIceCandidate(candidate);
                         }
                         else {
                           this.candidateQueue.push(candidate);
                         }
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
      this.emit('record.prepare', {id: this.id, label: 'Remote peer', flavor: 'remote'});
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
          }
          else {
            this.dataChannel.send('filetransfer.complete');
          }
        }
      })(file);
      let slice = file.slice(offset, offset + this.fileChunk);
      reader.readAsArrayBuffer(slice);
    }
    sliceFile(0);
  },
  handleIncomingTransfer: function(data) {
    this.mediaBuffer.push(data);
    if (this.progress) {
      this.mediaDetails.current += data.byteLength;
      let currentProgress = 515 - (this.mediaDetails.current / this.mediaDetails.size) * 515 >> 0;
      this.progress.setAttributeNS(null, 'stroke-dashoffset', currentProgress);
    }
  },
  saveBuffer: function() {
    this.mediaBlob = new Blob(this.mediaBuffer, {type: 'video/webm'});
    let url = URL.createObjectURL(this.mediaBlob);
    this.emit('record.raw', {url: url, media: this.mediaBlob, id: this.id});
  }
};

function setChannelEvents() {
  let channel = this.dataChannel;
  if (!channel) {
    console.log('no datachannel supplied');
    return;
  }

  channel.onopen = e => {
    channel.send("ping");
    console.log('datachannel opened');
    if (this.isCaller) {
      channel.send(JSON.stringify(
        {event: 'capabilities', payload: myCapabilities}
      ));
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
    } catch(e) {
    }

    switch(event) {
      case 'ping':
        channel.send('pong');
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
        }
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

      default:
        //incoming file
        if (this.incomingMedia) {
          this.handleIncomingTransfer(e.data);
        }
    }
  }
}
