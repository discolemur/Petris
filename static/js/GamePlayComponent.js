"use strict";

class GamePlayComponent extends Component {
  constructor(props) {
    super(props);
    this.messageCallback = this.messageCallback.bind(this);
    this.nextTurn = this.nextTurn.bind(this);
    this.movingOn = props.movingOn;
    this.setState({ roomState: props.roomState });
    this.communicator = props.communicator;
    this.communicator.setMessageCallback(this.messageCallback);
  }
  nextTurn() {
    // TODO
    this.setState({ roomState: this.state.roomState.setCurrentMove(new Move(this.state.roomState.playerID)) })
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
    let availableMove = null;
    if (this.state.roomState.currentMove) {
      availableMove = this.state.roomState.currentMove.availableMove();
      // TODO need to update as move is updated!
    }
    return h('div', {},
      h(BoardComponent, { roomState: this.state.roomState }),
      availableMove === Move.NO_MOVE ? defaultButton('End Move', this.nextTurn) : null
    )
  }
}
