#### ez-tcp-proxy
A simple tcp proxy for NodeJS!

I am using a "context" object, so you can replace the
complete Buffer object.

##### Structure
- EzTcpProxy:Object
    - source|target:Object
        - host:String
        - port:Number
        - socket:Socket
    - start(sourcePort:Number):void
    - stop():void
    - onConnect(callback:Function\<socket:Socket\>):void
    - onDisconnect(callback:Function\<socket:Socket\>):void
    - onData(callback:Function\<socket:Socket, context:Object\>):void
        - context:Object
            - data:Buffer
    - onError(callback:Function\<socket:Socket, error:Error\>):void
- Socket:net.Socket
    - type:Enum (Additional socket variable)
        - SOURCE: 1
        - TARGET: 2

##### example
```
const EzTcpProxy = require('ez-tcp-proxy');

let tcpProxy = new EzTcpProxy('google.com', 80);

tcpProxy.onData((socket, context) => {
  if(socket.type == EzTcpProxy.SocketTypes.SOURCE) {
    let dataString = context.data.toString();
    let newString = dataString.replace('Host: localhost:8080', 'Host: google.com');
    context.data = new Buffer(newString);
  }
});

tcpProxy.start(8080);
```
