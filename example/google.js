const EzTcpProxy = require('..');

let tcpProxy = new EzTcpProxy('google.com', 80);

tcpProxy.on('connect', (socket) => {
  if(socket.type == EzTcpProxy.SocketTypes.SOURCE) {
    console.log('Source endpoint connected!');
  }
  else {
    console.log('Target endpoint connected!');
  }
});

tcpProxy.on('disconnect', (socket) => {
  if(socket.type == EzTcpProxy.SocketTypes.SOURCE) {
    console.log('Source endpoint disconnected!');
  }
  else {
    console.log('Target endpoint disconnected!');
  }
});

tcpProxy.on('packet', (socket, packet) => {
  if(socket.type == EzTcpProxy.SocketTypes.SOURCE) {
    let data = packet.buffer.toString();
    let newData = data.replace('Host: localhost:8080', 'Host: google.com');

    packet.buffer = new Buffer(newData);
    console.log('Source sent packet!');
  }
  else {
    console.log('Target sent packet!');
  }
});

tcpProxy.start(8080);
console.log('TCP Proxy listening on port: 8080');