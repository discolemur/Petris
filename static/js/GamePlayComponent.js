"use strict";

class GamePlayComponent extends Component {
  constructor(props) {
    super(props);
    this.messageCallback = this.messageCallback.bind(this);
    this.movingOn = props.movingOn;
    this.setState({ roomState: props.roomState });
    this.communicator = props.communicator;
    this.communicator.setMessageCallback(this.messageCallback);
  }
  pingForPlayers() {
    this.communicator.sendObject({ ping: true });
    setTimeout(() => {
      if (!this.state.roomState.started) {
        this.pingForPlayers();
      }
    }, Player.PING_FREQUENCY);
  }
  messageCallback(msg) {
    this.state.roomState.setLatestPing(msg.playerID);
    // TODO: Vote to drop unresponsive player...
  }
  render(props, state) {
    // TODO
    return h(BoardComponent, { roomState: this.state.roomState });
  }
}
