"use strict";

/**
 * Waits for host to start the game. Lists players in the game.
 */
class RoomComponent extends Component {
  constructor(props) {
    super(props);
    this.pingForPlayers = this.pingForPlayers.bind(this);
    this.start = this.start.bind(this);
    this.messageCallback = this.messageCallback.bind(this);
    this.playerList = this.playerList.bind(this);
    this.adjustBoardHeight = this.adjustBoardHeight.bind(this);
    this.adjustBoardWidth = this.adjustBoardWidth.bind(this);
    this.adjustColonizationsPerTurn = this.adjustColonizationsPerTurn.bind(this);
    this.estimateNumTurns = this.estimateNumTurns.bind(this);
    this.sliders = this.sliders.bind(this);
    COMMUNICATOR.setMessageCallback(this.messageCallback);
    this.movingOn = props.movingOn;
    this.state.roomState = props.roomState;
    this.state.startFailed = false;
    if (props.roomState.isCreator) {
      this.pingForPlayers();
    }
  }
  pingForPlayers() {
    setTimeout(() => {
      if (!this.state.roomState.started) {
        this.pingForPlayers();
        this.setState({ roomState: this.state.roomState.dropUnresponsivePlayers() });
      }
    }, ROOM_PING_FREQUENCY);
    COMMUNICATOR.sendObject({ ping: true, gameProps: this.state.roomState.getGameProps() });
  }
  start() {
    if (this.state.roomState.players.length < 2) {
      this.setState({ startFailed: true })
      return false;
    }
    let roomState = this.state.roomState.setBasicProperty('started', true);
    if (this.state.roomState.isCreator) {
      COMMUNICATOR.sendObject({ started: true, gameProps: this.state.roomState.getGameProps() });
    }
    this.setState({ roomState: roomState });
    this.movingOn(roomState);
  }
  messageCallback(msg) {
    if (msg.pong) {
      this.setState({ roomState: this.state.roomState.setLatestPing(msg.playerID) });
      return;
    }
    if (msg.playerID === this.state.roomState.playerID) {
      return;
    }
    if (msg.requestToJoin
      && this.state.roomState.isCreator) {
      COMMUNICATOR.sendObject({ canJoin: !this.state.roomState.started && this.state.roomState.players.length < MAX_PLAYERS });
    }
    if (msg.joined && this.state.roomState.isCreator) {
      let player = msg.player;
      if (this.state.roomState.players.indexOf(player.playerID) == -1) {
        this.setState({ roomState: this.state.roomState.addPlayer(player) });
        COMMUNICATOR.sendObject({
          gameProps: this.state.roomState.getGameProps()
        });
      }
    }
    if (msg.gameProps) {
      this.setState({
        roomState: this.state.roomState.setGameProps(msg.gameProps)
      });
    }
  }
  playerList() {
    return this.state.roomState.players.map(player =>
      h('div', {
        class: 'columnItem textItem',
        style: `border: ${player.color}; border-style: solid; border-width: 0.25em;`
      }, player.playerName)
    );
  }
  adjustBoardHeight(inputEvent) {
    this.setState({ roomState: this.state.roomState.setBasicProperty('boardHeight', inputEvent.target.valueAsNumber) });
  }
  adjustBoardWidth(inputEvent) {
    this.setState({ roomState: this.state.roomState.setBasicProperty('boardWidth', inputEvent.target.valueAsNumber) });
  }
  adjustColonizationsPerTurn(inputEvent) {
    this.setState({ roomState: this.state.roomState.setBasicProperty('colonizationsPerTurn', inputEvent.target.valueAsNumber) });
  }
  estimateNumTurns() {
    return Math.floor((this.state.roomState.boardHeight * this.state.roomState.boardWidth)
      / (this.state.roomState.players.length * this.state.roomState.colonizationsPerTurn))
  }
  sliders() {
    return [h('div', { class: "slider" },
      h('span', {}, `Board Width: ${this.state.roomState.boardWidth}  |  2`),
      h('input', { type: "range", min: 2, max: 28, value: this.state.roomState.boardWidth, onInput: this.adjustBoardWidth }),
      h('span', {}, '28')
    ),
    h('div', { class: "slider" },
      h('span', {}, `Board Height: ${this.state.roomState.boardHeight}  |  2`),
      h('input', { type: "range", min: 2, max: 28, value: this.state.roomState.boardHeight, onInput: this.adjustBoardHeight }),
      h('span', {}, '28')
    ),
    h('div', { class: "slider" },
      h('span', {}, `Colonizations per turn: ${this.state.roomState.colonizationsPerTurn}  |  1`),
      h('input', { type: "range", min: 1, max: 10, value: this.state.roomState.colonizationsPerTurn, onInput: this.adjustColonizationsPerTurn }),
      h('span', {}, '10')
    ),
    h('span', { style: { textAlign: 'center', marginTop: '10px', marginBottom: '10px' } }, `Expected number of turns to complete game with ${Math.max.apply(null, [2, this.state.roomState.players.length])} players: ${this.estimateNumTurns()} turns`)
    ]
  }
  render(props, state) {
    console.log(state);
    if (state.roomState.players.length > 1 && state.startFailed) {
      this.setState({ startFailed: false });
    }
    if (state.roomState.started) {
      this.start();
    }
    return (
      h('div', { id: 'Room' },
        h('div', { class: 'column' },
          h('div', { class: 'columnItem textItem noBorder' }, `Room: ${state.roomState.roomName}`),
          h('div', { class: 'columnItem textItem noBorder' }, 'Players'),
          state.startFailed ? h('div', { class: 'columnItem textItem noBorder errormsg' }, 'To start, your room needs at least two people.') : null,
          this.playerList(),
          state.roomState.isCreator ? this.sliders() : null,
          state.roomState.isCreator ? defaultButton('Start Game', this.start, true)
            : h('div', { class: 'columnItem' }, 'Waiting for the host to start the game.')
        )
      )
    )
  }
}
