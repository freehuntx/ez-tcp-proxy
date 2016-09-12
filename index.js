const net = require('net');

const SocketTypes = {
  SOURCE: 1,
  TARGET: 2
};

class EzTcpProxy {
  constructor(targetHost, targetPort) {
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
        if(this._onConnect !== undefined) this._onConnect(targetSocket);
        sourceSocket.resume(); // Target is ready!
      });
    });
  }

  _initSocketEvents(sourceSocket, targetSocket) {
    if(this._onConnect !== undefined) this._onConnect(sourceSocket);

    for(let endpoint of [sourceSocket, targetSocket]) {
      let counterEndpoint = endpoint==sourceSocket?targetSocket:sourceSocket;

      endpoint.on('data', (data) => {
        let send = true;

        if(this._onData !== undefined) {
          let context = {data: data};
          send = this._onData(endpoint, context);
          data = context.data;
          if(send === undefined) send = true; // No return = true
        }

        if(send){
          let flushed = counterEndpoint.write(data);
          if(!flushed) endpoint.pause();
        }
      });

      endpoint.on('drain', () => {
        endpoint.resume();
      });

      endpoint.on('close', (hadError) => {
        counterEndpoint.end();
        if(this._onDisconnect !== undefined) this._onDisconnect(endpoint);
      });

      endpoint.on('end', ()=>{
        endpoint.end();
      });

      endpoint.on('error', (error) => {
        if (error.code === 'ECONNRESET') {
          counterEndpoint.destroy();
          return;
        }

        if(this._onError !== undefined) this._onError(endpoint, error);
      });
    }
  }

  // Event listener
  onConnect(cb) { this._onConnect = cb; }
  onDisconnect(cb) { this._onDisconnect = cb; }
  onData(cb) { this._onData = cb; }
  onError(cb) { this._onError = cb; }

  static get SocketTypes() {
    return SocketTypes;
  }
}

module.exports = EzTcpProxy;
