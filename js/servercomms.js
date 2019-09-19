import utils from './utils.js';

/* ************
 * Websockets *
 * ***********/

function Communications() {
  this.socket = null;
  this.bt = null;
  this.nfc = null;

  if (typeof io !== 'undefined' && io) {
    this.socket = io();

    this.socket.on('welcome', id => (app.socketId = id));
    this.socket.on('pairCode', code => app.displayPairCode(code));
    this.socket.on('peerConnection', data => managePeerConnection(data));
  }

  this.transportOrder = ['SOCKET'];
  this.transportOrder.some(newTransport => {
    if (this[newTransport.toLowerCase()]) {
      return this.switchTransport(newTransport);
    }
  });
}

Communications.prototype = {
  constructor: Communications,
  emitSOCKET: function() {
    if (!this.socket) {
      throw new Error('socket not initialized (io not found)');
    }

    let args = Array.prototype.slice.call(arguments);
    this.socket.emit.apply(this.socket, args);
  },
  switchTransport: function(transport) {
    if (['SOCKET'].indexOf(transport) > -1) {
      this.emit = this.__proto__[`emit${transport}`];
      return true;
    }
  },
  emit: function() {}
};

const comms = new Communications();
export default comms;

function managePeerConnection(data) {
  if (!peers[data.target]) {
    peers[data.target] = new PeerConnection(data);
    peers[data.target].on('connection.connected', () => connectionSuccess(data));
    peers[data.target].on('record.prepare', details => {
      app.listRecording(details);
    });
    peers[data.target].on('record.complete', details => {
      app.setMediaLink(details);
    });
    peers[data.target].on('record.raw', details => {
      app.setMediaLink(details);
      let peerListing = document.querySelector(`#recordingList a[data-id="${details.id}"]`);
      if (peerListing) {
        peerListing.classList.remove('transfer');
      } else {
        console.log('no such peer listing');
      }
    });
    peers[data.target].on('connection.disconnected', () => {
      app.removePeer(data.target);
    });
  }

  peers[data.target].handleRequest(data);
}

function connectionSuccess(data) {
  let peerItem = document.querySelector('#streams li[data-id="' + data.target + '"]');
  let isVisual = false;

  if (peers[data.target].stream && peers[data.target].stream.getVideoTracks().length > 0) {
    isVisual = true;
    let peerVid = document.createElement('video');
    let container = utils.createElement('span', {
      class: 'mediaContainer'
    });
    let front = utils.createElement('span', {
      class: 'front'
    });
    let back = utils.createElement('ul', {
      class: 'back'
    });

    let removeEl = utils.createElement('li');
    let removeBtn = utils.createElement('button', {
      text: 'Disconnect'
    });
    removeEl.appendChild(removeBtn);
    let compositeItem = utils.createElement('li');
    let mediaCompositeBtn = utils.createElement('button', {
      text: 'Toggle composite'
    });
    compositeItem.appendChild(mediaCompositeBtn);

    let details = utils.createElement('li');
    let detailsBtn = utils.createElement('button', {
      text: 'Remote details'
    });
    details.appendChild(detailsBtn);

    back.appendChild(removeEl);
    back.appendChild(compositeItem);
    back.appendChild(details);

    peerVid.autoplay = true;
    peerVid.muted = true;

    container.appendChild(front);
    container.appendChild(back);
    front.appendChild(peerVid);
    peerItem.appendChild(container);
    peerVid.srcObject = peers[data.target].stream;
    peerItem.classList.add('streaming');
    peerItem.classList.remove('connecting');
    peerItem.classList.add('active');
    container.classList.add('active');
    peerItem.addEventListener('click', app.toggleDevice.bind(app), false);
    mediaCompositeBtn.addEventListener('click', app.addPeerStreamToComposite.bind(app), false);

    peerItem.setAttribute('data-title', 'Remote stream');
  } else if (!peers[data.target].stream) {
    //probably only the whiteboard
    isVisual = true;
    let peerCanvas = document.createElement('canvas');
    let container = utils.createElement('span', {
      class: 'mediaContainer'
    });
    let front = utils.createElement('span', {
      class: 'front'
    });
    let back = utils.createElement('span', {
      class: 'back'
    });

    container.appendChild(front);
    container.appendChild(back);
    front.appendChild(peerCanvas);
    peerItem.appendChild(container);
    peerItem.classList.add('streaming');
    peerItem.classList.remove('connecting');
    peerItem.classList.add('active');
    container.classList.add('active');
    peerItem.addEventListener('click', app.toggleDevice.bind(app), false);
    peerItem.setAttribute('data-title', 'Whiteboard');
    peers[data.target].displayCanvas = peerCanvas;
  }

  if (isVisual) {
    let sourceItem = {};
    sourceItem[data.target] = {
      deviceType: 'video',
      source: 'peer',
      info: {
        label: `Remote peer ${Object.keys(peers).length}: ${
          peers[data.target].stream ? 'stream' : 'whiteboard'
        }`,
        type: peers[data.target].stream ? 'video' : 'whiteboard'
      }
    };
    app.listAsSource(sourceItem);
  }
}
