class MQTT_CONFIG {
    constructor(roomName, playerID) {
        this.broker = "broker.hivemq.com";
        this.port = 8000; // Websocket port is 8000, TCP port is 1883
        this.timeout = 10;
        this.topic = `/discolemur_petris/${roomName}`;
        this.client_id = playerID;
    }
}

// Goal: pseudo-serverless communication -- the host acts like a server.
// When host creates a new room, it pings to find any other hosts. If another host exists, it fails to create the room.

class Communicator {
    constructor() {
        this.config = null;
        this.client = null;
        this.connect = this.connect.bind(this);
        this.setOnConnectionLost = this.setOnConnectionLost.bind(this);
        this.setMessageCallback = this.setMessageCallback.bind(this);
        this.onConnect = this.onConnect.bind(this);
        this.onMessageArrived = this.onMessageArrived.bind(this);
        this._sendMessage = this._sendMessage.bind(this);
        this.sendObject = this.sendObject.bind(this);
        this.messageCallback = (obj) => console.log('Received message, but no message callback is set.');
    }
    isConnected() {
        return this.client !== null && this.client.isConnected();
    }
    connect(roomName, playerID, onConnectCallback, onFailure) {
        this.config = new MQTT_CONFIG(roomName, playerID);
        this.client = new Paho.MQTT.Client(this.config.broker, Number(this.config.port), this.config.client_id);
        let options = {
            timeout: this.config.timeout,
            onSuccess: () => this.onConnect(onConnectCallback),
            onFailure: onFailure
        }
        this.client.onMessageArrived = this.onMessageArrived;
        console.log('Connecting...');
        this.client.connect(options);
    }
    disconnect() {
        if (this.isConnected()) {
            this.client.disconnect();
        }
    }
    setOnConnectionLost(onConnectionLost) {
        this.client.onConnectionLost = onConnectionLost;
    }
    setMessageCallback(messageCallback) {
        this.messageCallback = messageCallback;
    }
    onConnect(callback) {
        console.log('Connected!')
        this.client.subscribe(this.config.topic);
        callback();
    }
    onMessageArrived(msg) {
        let obj = JSON.parse(msg.payloadString);
        if (obj.ping && obj.playerID !== this.config.client_id) {
            this.sendObject({ pong: true });
        }
        this.messageCallback(obj);
    }
    _sendMessage(msg) {
        if (this.client === null) {
            console.log('ERROR: attempted to send a message before initializing MQTT client.');
        }
        // Publish a Message
        var message = new Paho.MQTT.Message(msg);
        message.destinationName = this.config.topic;
        message.qos = 0;
        if (!this.client.isConnected()) {
            console.log('Client is not connected. Retrying message.')
            let options = {
                timeout: this.config.timeout,
                onSuccess : () => this.onConnect(()=>this._sendMessage(msg)),
                onFailure : () => console.log('Could not reconnect to room. Sad puppies.')
            }
            this.client.connect(options);
        } else {
            this.client.send(message);
        }
    }
    /**
     * Stringifies and sends an object.
     * @param {Object} obj 
     */
    sendObject(obj) {
        obj.playerID = this.config.client_id;
        this._sendMessage(JSON.stringify(obj));
    }
}

class CommunicatorDummy {
    constructor() {
    }
    connect(roomName, playerID, onConnectCallback, onFailure) {
    }
    setOnConnectionLost(onConnectionLost) {
    }
    setMessageCallback(messageCallback) {
    }
    onConnect(callback) {
    }
    onMessageArrived(msg) {
    }
    _sendMessage(msg) {
    }
    sendObject(obj) {
    }
}

var COMMUNICATOR = new Communicator();
if (TESTING) {
    COMMUNICATOR = new CommunicatorDummy();
}