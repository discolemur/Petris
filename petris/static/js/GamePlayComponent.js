"use strict";

class GamePlayComponent extends Component {
  constructor(props) {
    super(props);
    this.onConnectionLost = this.onConnectionLost.bind(this);
    this.nextTurn = this.nextTurn.bind(this);
    this.onKeyPressed = this.onKeyPressed.bind(this);
    this.endTurn = this.endTurn.bind(this);
    this.pingForPlayers = this.pingForPlayers.bind(this);
    this.messageCallback = this.messageCallback.bind(this);
    this.canEndTurn = this.canEndTurn.bind(this);
    this.gamePlayButton = this.gamePlayButton.bind(this);
    this.adjustBoardHexWidth = this.adjustBoardHexWidth.bind(this);
    this.goHome = this.goHome.bind(this);
    this.clearBoard = this.clearBoard.bind(this);
    this.updateTrigger = () => this.setState({});
    this.movingOn = props.movingOn;
    COMMUNICATOR.setMessageCallback(this.messageCallback);
    COMMUNICATOR.setOnConnectionLost(this.onConnectionLost);
    this.state.roomState = props.roomState;
    this.state.boardHexWidth = DEFAULT_BOARD_CELL_WIDTH;
    document.addEventListener("keyup", this.onKeyPressed);
    this.pingForPlayers();
    this.state.rotatedBtn = false;
  }
  onConnectionLost() {
    console.log('Connection broke!');
    this.setState({ roomState: this.state.roomState.setBasicProperty('connectionMessage', 'Connection broke!') });
  }
  nextTurn() {
    this.state.roomState.performMoves(() => this.movingOn(this.state.roomState));
    this.setState({});
  }
  onKeyPressed(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      if (this.canEndTurn()) {
        this.endTurn();
      }
    }
  }
  endTurn() {
    this.setState({ roomState: this.state.roomState.freezeMove() });
    this.pingForPlayers();
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
    } else if (msg.clearBoard) {
      this.setState({ roomState: this.state.roomState.newBoard() });
      this.movingOn(this.state.roomState);
    }
  }
  canEndTurn() {
    let availableMove = this.state.roomState.getAvailableMove();
    return (availableMove == Move.NO_MOVE || availableMove == Move.ANTIBIOTIC) && availableMove != Move.GAME_OVER
  }
  gamePlayButton() {
    let availableMove = this.state.roomState.getAvailableMove();
    let numAvailableMoves = this.state.roomState.getNumAvailableMoves();
    let enabled = false;
    let text = numAvailableMoves == 1 ? 'Place 1 Colony' : `Place ${numAvailableMoves} Colonies`;
    if (availableMove == Move.GAME_OVER) {
      text = 'Game Over!';
    } else if (this.state.roomState.isFrozen()) {
      text = 'Waiting for everyone to finish.'
    } else if (this.canEndTurn()) {
      text = availableMove == Move.ANTIBIOTIC ? 'Add Antibiotic, or Press to End Turn' : 'Press to End Turn';
      enabled = true;
    }
    let btnProps = defaultButtonProps(text, this.endTurn, enabled);
    if (!enabled) {
      btnProps.BGColor = this.state.roomState.getPlayerColor(this.state.roomState.playerID);
    } else {
      btnProps.blinkBGColor = this.state.roomState.getPlayerColor(this.state.roomState.playerID);
    }
    this.state.rotatedBtn = !this.state.rotatedBtn;
    btnProps.flatTop = this.state.rotatedBtn;
    btnProps.transitionAll = true;
    return h('div', { style: { width: btnProps.hexWidth } }, h(Hexagon, { styleParams: btnProps }));
  }
  adjustBoardHexWidth(inputEvent) {
    this.setState({ boardHexWidth: inputEvent.target.valueAsNumber });
  }
  clearBoard() {
    COMMUNICATOR.sendObject({ clearBoard: true });
    this.setState({ roomState: this.state.roomState.newBoard() });
    this.movingOn(this.state.roomState);
  }
  goHome() {
    this.setState({ roomState: this.state.roomState.reset() });
    this.movingOn(this.state.roomState);
  }
  render(props, state) {
    if (state.roomState.isReadyForNextTurn()) {
      this.nextTurn();
    }
    let availableMove = this.state.roomState.getAvailableMove();
    // TODO visually notify that the next turn has started
    return h('div', { id: 'GamePlayWrapper' },
      h('div', { class: "slider" },
        h('span', {}, 'Small'),
        h('input', { type: "range", min: 20, max: 100, value: state.boardHexWidth, onInput: this.adjustBoardHexWidth }),
        h('span', {}, 'Large')
      ),
      h(BoardComponent, { roomState: state.roomState, updateTrigger: this.updateTrigger, boardHexWidth: state.boardHexWidth }),
      h('div', { style: { width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' } },
        availableMove == Move.GAME_OVER ? defaultButton('Return to Home', this.goHome, true) : null,
        this.gamePlayButton(),
        availableMove == Move.GAME_OVER && state.roomState.isCreator ? defaultButton('Clear Board', this.clearBoard, true) : null
      )
    )
  }
}
