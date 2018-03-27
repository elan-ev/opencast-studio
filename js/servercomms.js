/* ************
 * Websockets *
 * ***********/

const socket = io();

if (socket) {
  socket.on('welcome', id => app.socketId = id);
  socket.on('pairCode', code => app.displayPairCode(code));
  socket.on('peerConnection', data => {
    if (!peers[data.target]) {
      peers[data.target] = new PeerConnection(data);
      peers[data.target].on('complete', function() {
        let peerItem = document.querySelector('#streams li[data-id="' + data.target + '"]');

        if (peers[data.target].stream.getVideoTracks().length > 0) {
          let peerVid = document.createElement('video');
          peerVid.autoplay = true;
          peerVid.muted = true;
          peerItem.appendChild(peerVid);
          peerVid.srcObject = peers[data.target].stream;
          peerItem.classList.add('streaming');
          peerItem.classList.remove('connecting');
        }
      });
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
        }
        else {
          console.log('no such peer listing');
        }
      });
    }

    peers[data.target].handleRequest(data);
  });
}
