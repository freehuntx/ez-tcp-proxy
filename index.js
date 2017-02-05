const EventEmitter = require('events'),
      net = require('net');

const SocketTypes = {
  SOURCE: 1,
  TARGET: 2
};

class EzTcpProxy extends EventEmitter {
  constructor(targetHost, targetPort, localPort, options={}) {
    super();

    if(targetHost === undefined || targetPort === undefined || localPort === undefined) {
      throw new Error('Missing targetHost, targetPort or localPort option!');
    }

    this._options = options;
    this._options.autoStart = this._options.autoStart===undefined ? false : this._options.autoStart;
    this._options.autoStartDelay = this._options.autoStartDelay===undefined ? 100 : this._options.autoStartDelay;
    this.targetHost = targetHost;
    this.targetPort = targetPort;
    this.localPort = localPort;
    this.started = false;
    this.source = null;
    this.target = null;

    this._initProxy();
    if(this._options.autoStart) {
      setTimeout(()=>this.start(), this._options.autoStartDelay);
    }
  }

  start() {
    if(this.started) {
      console.error('Proxy already started!');
      return;
    }

    this._proxy.listen(this.localPort);
    this.started = true;
    this.emit('start');
  }

  stop() {
    if(!this.started) {
      console.error('Proxy already stopped!');
      return;
    }

    this._proxy.close();
    this.started = false;
    this.emit('stop');
  }

  _initProxy() {
    this._proxy = net.createServer((sourceSocket) => {
      sourceSocket.pause(); // Wait till the target socket is ready

      let targetSocket = new net.Socket;
      this._initSocketEvents(sourceSocket, targetSocket);

      this.source = sourceSocket;
      this.target = targetSocket;
      sourceSocket.type = SocketTypes.SOURCE;
      targetSocket.type = SocketTypes.TARGET;

      targetSocket.connect(this.targetPort, this.targetHost, () => {
        this.emit('connect', targetSocket);
        sourceSocket.resume(); // Target is ready!
      });
    });
  }

  _initSocketEvents(sourceSocket, targetSocket) {
    this.emit('connect', sourceSocket);

    for(let endpoint of [sourceSocket, targetSocket]) {
      let counterEndpoint = endpoint==sourceSocket?targetSocket:sourceSocket;

      endpoint.on('drain', () => {
        endpoint.resume();
      });

      endpoint.on('data', (data) => {
        let packet = {block: false, buffer: data};

        this.emit('packet', endpoint, packet);
        if(packet.block) return;

        let flushed = counterEndpoint.write(packet.buffer);
        if(!flushed) endpoint.pause();
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
