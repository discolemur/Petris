"use strict";

class GamePlayComponent extends Component {
  constructor(props) {
    super(props);
    this.messageCallback = this.messageCallback.bind(this);
    this.nextTurn = this.nextTurn.bind(this);
    this.endTurn = this.endTurn.bind(this);
    this.updateTrigger = () => this.setState({});
    this.movingOn = props.movingOn;
    this.setState({ roomState: props.roomState });
    this.communicator = props.communicator;
    this.communicator.setMessageCallback(this.messageCallback);
  }
  nextTurn() {
    this.setState({ roomState: this.state.roomState.performMoves() })
    this.movingOn(this.state.roomState);
  }
  endTurn() {
    this.setState({ roomState: this.state.roomState.freezeMove() })
    if (TESTING) {
      this.nextTurn();
    }
    this.movingOn(this.state.roomState);
  }
  pingForPlayers() {
    let obj = { ping: true };
    if (this.roomState.isFrozen()) {
      obj.move = this.roomState.currentMove;
    }
    this.communicator.sendObject(obj);
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
  endTurnButton(availableMove) {
    let enabled = false;
    let text = 'End Turn';
    if (this.state.roomState.isFrozen()) {
      text = 'Waiting for everyone to finish.'
    }
    if (availableMove == Move.GAME_OVER) {
      text = 'Game Over!';
    }
    if (availableMove == Move.NO_MOVE && availableMove != Move.GAME_OVER) {
      enabled = true;
    }
    return h('div', { style: { marginTop: '22px' } }, defaultButton(text, this.endTurn, enabled));
  }
  render(props, state) {
    let availableMove = null;
    if (state.roomState.currentMove) {
      availableMove = state.roomState.availableMove();
    }
    return h('div', { id: 'GamePlayWrapper' },
      h(BoardComponent, { roomState: state.roomState, updateTrigger: this.updateTrigger }),
      this.endTurnButton(availableMove)
    )
  }
}
