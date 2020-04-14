"use strict";

class GamePlayComponent extends Component {
  constructor(props) {
    super(props);
    // Bindings
    this.onConnectionLost = this.onConnectionLost.bind(this);
    this.nextTurn = this.nextTurn.bind(this);
    this.onKeyPressed = this.onKeyPressed.bind(this);
    this.endTurn = this.endTurn.bind(this);
    this.pingForPlayers = this.pingForPlayers.bind(this);
    this.messageCallback = this.messageCallback.bind(this);
    this.canEndTurn = this.canEndTurn.bind(this);
    this.gamePlayButton = this.gamePlayButton.bind(this);
    this.rotateButton = this.rotateButton.bind(this);
    this.adjustBoardHexWidth = this.adjustBoardHexWidth.bind(this);
    this.goHome = this.goHome.bind(this);
    this.clearBoard = this.clearBoard.bind(this);
    // End Bindings
    this.updateTrigger = () => this.setState({});
    this.movingOn = props.movingOn;
    COMMUNICATOR.setMessageCallback(this.messageCallback);
    COMMUNICATOR.setOnConnectionLost(this.onConnectionLost);
    this.state.roomState = props.roomState.newBoard();
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
    this.rotateButton();
    this.movingOn(this.state.roomState);
  }
  pingForPlayers() {
    let obj = { ping: true };
    if (this.state.roomState.isFrozen()) {
      obj.moves = this.state.roomState.getConfirmedMoves();
    }
    COMMUNICATOR.sendObject(obj);
    setTimeout(() => {
      if (this.state.roomState.isFrozen()) {
        this.pingForPlayers();
      }
    }, GAME_PING_FREQUENCY);
  }
  messageCallback(msg) {
    if (msg.moves) {
      this.setState({
        roomState: this.state.roomState.setLatestPing(msg.playerID).updateConfirmedMoves(msg.moves)
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
  gamePlayButton(hexWidth) {
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
    let btnProps = defaultButtonProps(text, hexWidth, this.endTurn, enabled);
    if (!enabled) {
      btnProps.BGColor = this.state.roomState.getPlayerColor(this.state.roomState.playerID);
    } else {
      btnProps.blinkBGColor = this.state.roomState.getPlayerColor(this.state.roomState.playerID);
    }
    btnProps.flatTop = this.state.rotatedBtn;
    btnProps.transitionAll = true;
    return h('div', {
      style: {
        width: btnProps.hexWidth + btnProps.borderWidth * 6,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center'
      }
    }, h(Hexagon, { styleParams: btnProps }));
  }
  rotateButton() {
    this.setState({ rotatedBtn: !this.state.rotatedBtn });
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
    let ww = window.innerWidth;
    let dims = this.state.roomState.board.getDimensions(this.state.boardHexWidth);
    if (dims.rotate) {
      let tmp = dims.width;
      dims.width = dims.height;
      dims.height = tmp;
    }
    let boardTooWide = (dims.width + 200) > ww;
    let hexBtnWidth = boardTooWide ? ww / 3.5 : Math.min((ww - dims.width) * 0.75, defaultButtonWidth());
    let availableMove = this.state.roomState.getAvailableMove();
    return h('div', { id: 'GamePlayWrapper', style: { flexDirection: boardTooWide ? 'column' : 'row', justifyContent: boardTooWide ? 'start' : 'space-around' } },
      h('div', { class: "slider", style: { position: 'absolute', left: '10px', top: '-15px' } },
        h('span', {}, 'Small'),
        h('input', { type: "range", min: 20, max: 100, value: this.state.boardHexWidth, onInput: this.adjustBoardHexWidth }),
        h('span', {}, 'Large')
      ),
      h(BoardComponent, { roomState: this.state.roomState, updateTrigger: this.updateTrigger, rotateButton: this.rotateButton, boardHexWidth: this.state.boardHexWidth }),
      h('div', { style: { display: 'flex', flexDirection: boardTooWide ? 'row' : 'column', justifyContent: 'space-evenly' } },
        availableMove == Move.GAME_OVER ? defaultButton('Return to Home', hexBtnWidth, this.goHome, true) : null,
        this.gamePlayButton(hexBtnWidth),
        availableMove == Move.GAME_OVER && state.roomState.isCreator ? defaultButton('Clear Board', hexBtnWidth, this.clearBoard, true) : null
      )
    )
  }
}
