const EventEmitter = require('events'),
      net = require('net');

const SocketTypes = {
  SOURCE: 1,
  TARGET: 2
};

class EzTcpProxy extends EventEmitter {
  constructor(targetHost, targetPort) {
    super();
    if(targetHost === undefined || targetPort === undefined)
      throw new Error('Missing host or port!');

    this.source = {
      host: '0.0.0.0',
      socket: null
    };
    this.target = {
      host: targetHost,
      port: targetPort,
      socket: null
    };

    this._initProxy();
  }

  start(sourcePort = localPort || this.source.port) {
    if(sourcePort === undefined) throw new Error('Missing source port!');
    if(this._proxy) this.stop();

    this._proxy.listen(sourcePort);
  }

  stop() {
    if(this._proxy) {
      this._proxy.close();
    }
  }

  _initProxy() {
    this._proxy = net.createServer((sourceSocket) => {
      let targetSocket = new net.Socket;
      this.source.socket = sourceSocket;
      this.target.socket = targetSocket;
      
      sourceSocket.pause(); // Wait till the target socket is ready
      sourceSocket.type = SocketTypes.SOURCE;
      targetSocket.type = SocketTypes.TARGET;

      this._initSocketEvents(sourceSocket, targetSocket);

      targetSocket.connect(this.target.port, this.target.host, () => {
        this.emit('connect', targetSocket);
        sourceSocket.resume(); // Target is ready!
      });
    });
  }

  _initSocketEvents(sourceSocket, targetSocket) {
    this.emit('connect', sourceSocket);

    for(let endpoint of [sourceSocket, targetSocket]) {
      let counterEndpoint = endpoint==sourceSocket?targetSocket:sourceSocket;

      endpoint.on('data', (data) => {
        let packet = {block: false, buffer: data};

        this.emit('packet', endpoint, packet);
        if(packet.block) return;

        let flushed = counterEndpoint.write(packet.buffer);
        if(!flushed) endpoint.pause();
      });

      endpoint.on('drain', () => {
        endpoint.resume();
      });

      endpoint.on('close', (hadError) => {
        counterEndpoint.end();
        this.emit('disconnect', endpoint);
      });

      endpoint.on('end', ()=>{
        endpoint.end();
      });

      endpoint.on('error', (error) => {
        if (error.code === 'ECONNRESET') {
          counterEndpoint.destroy();
          return;
        }

        this.emit('error', endpoint, error);
      });
    }
  }

  static get SocketTypes() {
    return SocketTypes;
  }
}

module.exports = EzTcpProxy;
