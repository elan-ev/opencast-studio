/* ************
 * Websockets *
 * ***********/

const socket = io();

socket.on('welcome', id => app.socketId = id);
socket.on('pairCode', code => app.displayPairCode(code));
socket.on('peerConnection', data => {
  if (!peers[data.target]) {
    peers[data.target] = new PeerConnection(data);
    peers[data.target].oncomplete = function() {
      console.log('done');
    };
  }

  peers[data.target].handleRequest(data);
});
