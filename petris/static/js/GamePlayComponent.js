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
    this.adjustBoardCellWidth = this.adjustBoardCellWidth.bind(this);
    this.updateTrigger = () => this.setState({});
    this.movingOn = props.movingOn;
    COMMUNICATOR.setMessageCallback(this.messageCallback);
    COMMUNICATOR.setOnConnectionLost(this.onConnectionLost);
    this.state.roomState = props.roomState;
    this.state.boardCellWidth = DEFAULT_BOARD_CELL_WIDTH;
    this.pingForPlayers();
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
    COMMUNICATOR.sendObject(obj);
    setTimeout(() => {
      if (this.state.roomState.isFrozen()) {
        this.pingForPlayers();
      }
    }, GAME_PING_FREQUENCY);
  }
  messageCallback(msg) {
    if (msg.move) {
      this.setState({
        roomState: this.state.roomState.setLatestPing(msg.playerID).logMove(msg.move)
      });
    }
  }
  endTurnButton() {
    let availableMove = this.state.roomState.getAvailableMove();
    let enabled = false;
    let text = 'Select Cells';
    if (availableMove == Move.GAME_OVER) {
      text = 'Game Over!';
    } else if (this.state.roomState.isFrozen()) {
      text = 'Waiting for everyone to finish.'
    } else if (availableMove == Move.NO_MOVE && availableMove != Move.GAME_OVER) {
      text = 'End Turn';
      enabled = true;
    }
    return h('div', { style: { marginTop: '22px' } }, defaultButton(text, this.endTurn, enabled));
  }
  adjustBoardCellWidth(inputEvent) {
    this.setState({ boardCellWidth: inputEvent.target.valueAsNumber});
  }
  render(props, state) {
    if (state.roomState.isReadyForNextTurn()) {
      this.nextTurn();
    }
    // TODO visually notify that the next turn has started
    return h('div', { id: 'GamePlayWrapper' },
      h('div', { class: "slider"},
        h('span', {}, 'Small'),
        h('input', { type: "range", min: 20, max: 100, value: state.boardCellWidth, onInput: this.adjustBoardCellWidth }),
        h('span', {}, 'Large')
      ),
      h(BoardComponent, { roomState: state.roomState, updateTrigger: this.updateTrigger, boardCellWidth: state.boardCellWidth }),
      this.endTurnButton()
    )
  }
}
