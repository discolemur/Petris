"use strict";

class GamePlayComponent extends Component {
  constructor(props) {
    super(props);
    this.onConnectionLost = this.onConnectionLost.bind(this);
    this.nextTurn = this.nextTurn.bind(this);
    this.endTurn = this.endTurn.bind(this);
    this.pingForPlayers = this.pingForPlayers.bind(this);
    this.messageCallback = this.messageCallback.bind(this);
    this.endTurnButton = this.endTurnButton.bind(this);
    this.updateTrigger = () => this.setState({});
    this.movingOn = props.movingOn;
    this.setState({ roomState: props.roomState });
    this.communicator = props.communicator;
    this.communicator.setMessageCallback(this.messageCallback);
    this.communicator.setOnConnectionLost(this.onConnectionLost)
  }
  onConnectionLost() {
    console.log('Connection broke!');
    this.setState({ roomState: this.state.roomState.setConnectionMessage('Connection broke!') });
  }
  nextTurn() {
    this.state.roomState.performMoves(() => this.movingOn(this.state.roomState));
    this.setState({});
  }
  endTurn() {
    this.setState({ roomState: this.state.roomState.freezeMove() })
    this.pingForPlayers();
    // if (TESTING) {
    //   this.nextTurn();
    // }
    this.movingOn(this.state.roomState);
  }
  pingForPlayers() {
    let obj = { ping: true };
    if (this.state.roomState.isFrozen()) {
      obj.move = this.state.roomState.currentMove;
    }
    this.communicator.sendObject(obj);
    setTimeout(() => {
      if (this.state.roomState.isFrozen()) {
        this.pingForPlayers();
      }
    }, Player.PING_FREQUENCY);
  }
  messageCallback(msg) {
    let roomState = this.state.roomState;
    // Connection is still good at this point.
    if (msg.move) {
      this.setState({ roomState: roomState.setLatestPing(msg.playerID).logMoveProceedIfFull(move, this.nextTurn) });
    }
  }
  endTurnButton() {
    console.log(this.state.roomState);
    let availableMove = this.state.roomState.getAvailableMove();
    let enabled = false;
    let text = 'End Turn';
    if (availableMove == Move.GAME_OVER) {
      text = 'Game Over!';
    } else if (this.state.roomState.isFrozen()) {
      text = 'Waiting for everyone to finish.'
    } else if (availableMove == Move.NO_MOVE && availableMove != Move.GAME_OVER) {
      enabled = true;
    }
    return h('div', { style: { marginTop: '22px' } }, defaultButton(text, this.endTurn, enabled));
  }
  render(props, state) {
    return h('div', { id: 'GamePlayWrapper' },
      h(BoardComponent, { roomState: state.roomState, updateTrigger: this.updateTrigger }),
      this.endTurnButton()
    )
  }
}
