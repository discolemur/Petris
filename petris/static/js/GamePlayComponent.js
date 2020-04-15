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
    this.goHome = this.goHome.bind(this);
    this.clearBoard = this.clearBoard.bind(this);
    // End Bindings
    this.updateTrigger = () => this.setState({});
    this.movingOn = props.movingOn;
    COMMUNICATOR.setMessageCallback(this.messageCallback);
    COMMUNICATOR.setOnConnectionLost(this.onConnectionLost);
    this.state.roomState = props.roomState.newBoard();
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
    return (availableMove == Moves.NO_MOVE || availableMove == Moves.ANTIBIOTIC) && availableMove != Moves.GAME_OVER
  }
  gamePlayButton(hexWidth) {
    let availableMove = this.state.roomState.getAvailableMove();
    let numAvailableMoves = this.state.roomState.getNumAvailableMoves();
    let enabled = false;
    let btnProps = defaultButtonProps('', hexWidth, this.endTurn, enabled);
    if (!enabled) {
      btnProps.BGColor = this.state.roomState.getPlayerColor(this.state.roomState.playerID);
    } else {
      btnProps.blinkBGColor = this.state.roomState.getPlayerColor(this.state.roomState.playerID);
    }
    btnProps.text = numAvailableMoves == 1 ? 'Place 1 Colony' : `Place ${numAvailableMoves} Colonies`;
    if (availableMove == Moves.GAME_OVER) {
      let winner = this.state.roomState.getWinner();
      btnProps.text = 'Game Over! No winner.';
      if (winner !== null) {
        btnProps.text = `${winner.playerName} wins!`;
        btnProps.BGColor = winner.color;
      }
    } else if (this.state.roomState.isFrozen()) {
      btnProps.text = 'Waiting for everyone to finish.'
    } else if (this.canEndTurn()) {
      btnProps.text = availableMove == Moves.ANTIBIOTIC ? 'Add Antibiotic, or Press to End Turn' : 'Press to End Turn';
      enabled = true;
    }
    btnProps.flatTop = this.state.rotatedBtn;
    btnProps.transitionAll = true;
    return h('div', {
      style: {
        width: 'auto',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center'
      }
    }, h(Hexagon, { styleParams: btnProps }));
  }
  rotateButton() {
    this.setState({ rotatedBtn: !this.state.rotatedBtn });
  }
  clearBoard() {
    COMMUNICATOR.sendObject({ clearBoard: true });
    this.setState({ roomState: this.state.roomState.newBoard() });
    this.movingOn(this.state.roomState);
  }
  goHome() {
    if (TESTING) {
      TESTING = false;
    }
    this.setState({ roomState: this.state.roomState.reset() });
    this.movingOn(this.state.roomState);
  }
  render(props, state) {
    if (state.roomState.isReadyForNextTurn()) {
      this.nextTurn();
    }
    let isLandscape = windowIsLandscape();
    let wrapperHeight = window.innerHeight - 110;
    let wrapperWidth = window.innerWidth;
    let hexBtnWidth = isLandscape ? wrapperHeight / 4 : wrapperWidth / 4;
    let hexBtnMaxWidth = hexBtnWidth * 1.2398;
    let buttonWrapperHeight = isLandscape ? wrapperHeight : hexBtnMaxWidth;
    let buttonWrapperWidth =  isLandscape ? hexBtnMaxWidth : wrapperWidth;
    let boardHeight = isLandscape ? wrapperHeight : wrapperHeight - hexBtnMaxWidth;
    let boardWidth = isLandscape ? wrapperWidth - hexBtnMaxWidth : wrapperWidth;
    this.state.roomState.board.setBoardHexWidth(boardWidth, boardHeight);
    let availableMove = this.state.roomState.getAvailableMove();
    return h('div', {
      id: 'GamePlayWrapper', style: {
        flexDirection: isLandscape ? 'row' : 'column',
        justifyContent: isLandscape ? 'space-around' : 'start',
        height: `${wrapperHeight}px`,
        width: `${wrapperWidth}px`
      }
    },
      h(BoardComponent, {
        roomState: this.state.roomState,
        updateTrigger: this.updateTrigger,
        rotateButton: this.rotateButton
      }),
      h('div', {
        style:
        {
          id: 'GameplayButtonWrapper',
          width: `${buttonWrapperWidth}px`,
          height: `${buttonWrapperHeight}px`,
          display: 'flex',
          flexDirection: isLandscape ? 'column' : 'row',
          justifyContent: 'space-evenly'
        }
      },
        availableMove == Moves.GAME_OVER
          ? defaultButton('Return to Home', hexBtnWidth, this.goHome, true) : null,
        this.gamePlayButton(hexBtnWidth),
        availableMove == Moves.GAME_OVER && state.roomState.isCreator
          ? defaultButton('Clear Board', hexBtnWidth, this.clearBoard, true) : null
      )
    )
  }
}
