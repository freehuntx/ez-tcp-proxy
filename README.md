#### ez-tcp-proxy
This is a simple NodeJS library to setup a tcp proxy.  

##### Features
- Change packet data being sent/received
- Block packets

##### Structure
- EzTcpProxy(targetHost:String, targetPort:Number):Class
    - **Properties**
        - source:Object
            - host:String
            - port:Number
            - socket:Socket
        - target:Object
            - host:String
            - port:Number
            - socket:Socket
    - **Methods**
        - start(sourcePort:Number):void
        - stop():void
    - **Events**
        - connect \<socket:Socket\>
        - disconnect \<socket:Socket\>
        - packet \<socket:Socket, packet:Object\>
            - packet:Object
                - block:Boolean[Default: false]
                - buffer:Buffer
        - error \<socket:Socket, error:Error\>
- Socket:net.Socket (*Additional **net.Socket** properties*)
    - type:\<Enum\>EzTcpProxy.SocketTypes
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
