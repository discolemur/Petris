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
    this.adjustColonizationsPerTurn = this.adjustColonizationsPerTurn.bind(this);
    this.estimateNumTurns = this.estimateNumTurns.bind(this);
    this.adjustDesiredNumTurns = this.adjustDesiredNumTurns.bind(this);
    this.sliders = this.sliders.bind(this);
    this.computerButtons = this.computerButtons.bind(this);
    COMMUNICATOR.setMessageCallback(this.messageCallback);
    this.movingOn = props.movingOn;
    this.state.roomState = props.roomState;
    this.state.desiredNumTurns = 10;
    this.state.startFailed = false;
    this.updateDimensions()
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
    let hexWidth = Math.min(100, defaultButtonWidth(true, 5.5));
    let playerHexagons = [];
    for (let i = 0; i < this.state.roomState.players.length; ++i) {
      let player = this.state.roomState.players[i];
      let hexProps = new HexagonProps();
      hexProps.text = player.type == Player.HUMAN ? player.playerName : 'Computer Player';
      hexProps.color = '#FFF';
      hexProps.BGClass = PLAYER_CLASS_LIST[player.color_index];
      hexProps.hexWidth = hexWidth;
      hexProps.position = 'absolute';
      hexProps.top = (i % 2) * 0.86;
      hexProps.left = i / 2;
      playerHexagons.push(h(Hexagon, { styleParams: hexProps }));
    }
    let totalWidth = ((this.state.roomState.players.length + 1) / 2) * hexWidth;
    let totalHeight = 2 * hexWidth;
    return h('div', { style: { height: `${totalHeight}px`, width: `${totalWidth}px`, display: 'block', position: 'relative' } }, playerHexagons);
  }
  updateDimensions() {
    let optimalNumCells = this.state.desiredNumTurns * (this.state.roomState.players.length * this.state.roomState.colonizationsPerTurn);
    let width = Math.round(Math.sqrt(optimalNumCells));
    let height = Math.ceil(optimalNumCells / width);
    this.setState({ roomState: this.state.roomState.setBasicProperty('boardHeight', height).setBasicProperty('boardWidth', width) })
  }
  adjustColonizationsPerTurn(inputEvent) {
    this.setState({ roomState: this.state.roomState.setBasicProperty('colonizationsPerTurn', inputEvent.target.valueAsNumber) });
    this.updateDimensions();
  }
  adjustDesiredNumTurns(inputEvent) {
    this.setState({ desiredNumTurns: inputEvent.target.valueAsNumber });
    this.updateDimensions();
  }
  estimateNumTurns() {
    return Math.floor((this.state.roomState.boardHeight * this.state.roomState.boardWidth)
      / (this.state.roomState.players.length * this.state.roomState.colonizationsPerTurn))
  }
  sliders() {
    return h('div', { class: "sliders" },
      h('span', { class: "sliderPrompt blockUnit" }, `Approximate Number of Turns: ${this.state.desiredNumTurns}`),
      h('div', { class: "blockUnit"},
        h('span', { class: "sliderLimit" }, '3'),
        h('input', { type: "range", min: 3, max: 40, value: this.state.desiredNumTurns, onInput: this.adjustDesiredNumTurns }),
        h('span', { class: "sliderLimit" }, '40')
      ),
      h('span', { class: "sliderPrompt blockUnit" }, `Colonizations per turn: ${this.state.roomState.colonizationsPerTurn}`),
      h('div', { class: "blockUnit"},
        h('span', { class: "sliderLimit" }, '1'),
        h('input', { type: "range", min: 1, max: 10, value: this.state.roomState.colonizationsPerTurn, onInput: this.adjustColonizationsPerTurn }),
        h('span', { class: "sliderLimit" }, '10')
      )
    )
  }
  computerButtons() {
    let addCompBtnProps = defaultButtonProps('Add Computer Player', defaultButtonWidth(true, 2) / 2, () => this.setState({ roomState: this.state.roomState.addComputer() }), true);
    let removeCompBtnProps = defaultButtonProps('Drop Computer Player', defaultButtonWidth(true, 2) / 2, () => this.setState({ roomState: this.state.roomState.removeComputer() }), true);
    return h('div', {
      style: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
      }
    },
      this.state.roomState.hasComputer() ? h(Hexagon, { styleParams: removeCompBtnProps }) : null,
      this.state.roomState.players.length < MAX_PLAYERS ? h(Hexagon, { styleParams: addCompBtnProps }) : null
    );
  }
  render(props, state) {
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
          state.roomState.isCreator ? this.computerButtons() : null,
          state.roomState.isCreator ? this.sliders() : null,
          state.roomState.isCreator ? defaultButton('Start Game', defaultButtonWidth(true, 2), this.start, true)
            : h('div', { class: 'columnItem' }, 'Waiting for the host to start the game.')
        )
      )
    )
  }
}
