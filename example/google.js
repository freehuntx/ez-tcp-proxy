const EzTcpProxy = require('..');

let tcpProxy = new EzTcpProxy('google.com', 80);

tcpProxy.onConnect((socket) => {
  if(socket.type == EzTcpProxy.SocketTypes.SOURCE) {
    console.log('Source endpoint connected!');
  }
  else {
    console.log('Target endpoint connected!');
  }
});

tcpProxy.onDisconnect((socket) => {
  if(socket.type == EzTcpProxy.SocketTypes.SOURCE) {
    console.log('Source endpoint disconnected!');
  }
  else {
    console.log('Target endpoint disconnected!');
  }
});

tcpProxy.onData((socket, context) => {
  if(socket.type == EzTcpProxy.SocketTypes.SOURCE) {
    console.log('Source sent data!');
  }
  else {
    console.log('Target sent data!');
  }
});

tcpProxy.start(8080);
console.log('TCP Proxy listening on port: 8080');