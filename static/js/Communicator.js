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
// TODO: When host creates a new room, it pings to find any other hosts. If another host exists, it fails to create the room.
// TODO: Once started, the host collects people's moves and compiles them into one board, then sends the updated board to everyone once all people have made their moves.
// TODO: ping around occasionally to get the list of players.

class Communicator {
    constructor() {
        this.config = null;
        this.client = null;
        this.onMessageArrived = this.onMessageArrived.bind(this);
        this.messageCallback = (obj)=>console.log('Received message, but no message callback is set.');
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
        this.client.send(message);
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
