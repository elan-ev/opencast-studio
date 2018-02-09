var pc_config = {"iceServers":[
                  {urls: 'stun:stun.sipgate.net:3478'},
                ]};

var streamConstraints = {
  optional: [],
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  }
}

if (window.hasOwnProperty('InstallTrigger')) {
  //Firefox has window.InstallTrigger (for now)
  optional: [],
  streamConstraints = {
    offerToReceiveVideo: true,
    offerToReceiveAudio: true
  };
}

var PeerConnection = function(peerDetails, stream, isInitiator, channelEvents) {
  if (typeof peerDetails == 'string') {
    this.id = peerDetails;
  }
  else {
    this.id = app.peers[0];
    this.room = app.room;
  }
  this.isCaller = isInitiator || (typeof stream == 'boolean' ? stream : false);
  this.candidateQueue = [];
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
  });

  this.pc.oniceconnectionstatechange = e => {
    if (['connected', 'completed'].indexOf(this.pc.iceConnectionState) > -1 && !this.noVideoElement) {
      //hacky...
      if (this.stream && !this.streamElement) {
        this.streamElement = this.stream;
      }
    }
    if (this.pc.iceConnectionState === 'connected') {
      console.log('connected');
      this.oncomplete.forEach(func => {
        func();
      });
    }
  };

  if (this.isCaller && stream instanceof MediaStream) {
    this.pc.addStream(stream);
    this.dataChannel = this.pc.createDataChannel('channel');
    this.dataChannel.onopen = e => {
      console.log('opened data channel');
      this.dataChannel.send("hello");
    };
    this.dataChannel.onerror = e => {
      console.log('data channel error', e);
    };
    this.dataChannel.onmessage = e => {
      console.log('msg', e);
    };

    this.sendOffer();
  }
  else if (!this.isCaller) {
    this.pc.ondatachannel = function(e) {
      console.log('setting up datachannel');
      this.dataChannel = e.channel;
      if (app && app.attachChannelEvents) {
        console.log('attaching');
        console.log(this);
        app.attachChannelEvents(this.dataChannel);
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

  var completeFuncs = [];

  Object.defineProperty(this, 'oncomplete', {
      get: function() {
             return completeFuncs;
           },
      set: function(func) {
             if (typeof func != 'function') {
               return;
             }

             completeFuncs.push(func);
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
                             });
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
                       }
};
