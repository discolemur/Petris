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
    this.communicator = props.communicator;
    this.communicator.setMessageCallback(this.messageCallback);
    this.movingOn = props.movingOn;
    if (props.roomState.isCreator) {
      this.pingForPlayers();
    }
    this.setState({ roomState: props.roomState, startFailed: false });
  }
  pingForPlayers() {
    setTimeout(() => {
      if (!this.state.roomState.started) {
        this.pingForPlayers();
      }
    }, Player.PING_FREQUENCY);
    this.communicator.sendObject({ ping: true });
  }
  start() {
    if (this.state.roomState.players.length < 2) {
      this.setState({ startFailed: true })
      return false;
    }
    let roomState = this.state.roomState.setStarted(true);
    if (this.state.roomState.isCreator) {
      this.communicator.sendObject({ started: true });
    }
    this.setState({ roomState: roomState });
    this.movingOn(roomState);
  }
  messageCallback(msg) {
    if (msg.pong) {
      let roomState = this.state.roomState;
      roomState.setLatestPing(msg.playerID);
      this.setState({ roomState: roomState });
      if (this.state.roomState.isCreator) {
        this.communicator.sendObject({ allPlayers: this.state.roomState.players });
      }
    }
    if (msg.playerID === this.state.roomState.playerID) {
      return false;
    }
    if (msg.requestToJoin
      && this.state.roomState.isCreator
      && this.state.roomState.players.length < RoomState.MAX_PLAYERS) {
      this.communicator.sendObject({ canJoin: true });
    }
    if (msg.joined && this.state.roomState.isCreator) {
      let player = msg.player;
      if (this.state.roomState.players.indexOf(player.playerID) == -1) {
        this.setState({ roomState: this.state.roomState.addPlayer(player) });
        this.communicator.sendObject({ allPlayers: this.state.roomState.players });
      }
    }
    if (msg.allPlayers !== undefined) {
      this.setState({ roomState: this.state.roomState.setPlayers(msg.allPlayers) });
    } else if (msg.started) {
      this.start();
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
  render(props, state) {
    if (this.state.roomState.players.length > 1 && this.state.startFailed) {
      this.setState({ startFailed: false });
    }
    return (
      h('div', { id: 'Room' },
        h('div', { class: 'column' },
          h('div', { class: 'columnItem textItem noBorder' }, `Room: ${this.state.roomState.roomName}`),
          h('div', { class: 'columnItem textItem noBorder' }, 'Players'),
          this.state.startFailed ? h('div', { class: 'columnItem textItem noBorder errormsg' }, 'To start, your room needs at least two people.') : null,
          this.playerList(),
          this.state.roomState.isCreator ? defaultButton('Start Game', this.start, true)
            : h('div', { class: 'columnItem' }, 'Waiting for the host to start the game.')
        )
      )
    )
  }
}