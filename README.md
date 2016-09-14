#### ez-tcp-proxy
A simple tcp proxy for NodeJS!

I am using a "context" object, so you can replace the
complete Buffer object.

##### Structure
- EzTcpProxy(targetHost:String, targetPort:Number):Class
    - (source|target):Object
        - host:String
        - port:Number
        - socket:Socket
    - start(sourcePort:Number):void
    - stop():void
    - *Events*
        - connect(callback:Function\<socket:Socket\>)
        - disconnect(callback:Function\<socket:Socket\>)
        - packet(callback:Function\<socket:Socket, packet:Object\>)
            - packet:Object
                - block:Boolean[Default: false]
                - buffer:Buffer
        - error(callback:Function\<socket:Socket, error:Error\>)
- Socket:net.Socket
    - type:Enum (Additional socket variable)
        - SOURCE: 1
        - TARGET: 2

##### example
```
const EzTcpProxy = require('ez-tcp-proxy');

let tcpProxy = new EzTcpProxy('google.com', 80);

tcpProxy.on('packet', (socket, packet) => {
  if(socket.type == EzTcpProxy.SocketTypes.SOURCE) {
    let dataString = packet.buffer.toString();
    let newString = dataString.replace('Host: localhost:8080', 'Host: google.com');
    packet.buffer = new Buffer(newString);
  }
});

tcpProxy.start(8080);
```
