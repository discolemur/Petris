"use strict";

/**
 * Waits for host to start the game. Lists players in the game.
 */
class RoomComponent extends Component {
  constructor(props) {
    super(props);
    this.messageCallback = this.messageCallback.bind(this);
    this.playerList = this.playerList.bind(this);
    this.start = this.start.bind(this);
    this.communicator = props.communicator;
    this.communicator.setMessageCallback(this.messageCallback);
    this.movingOn = props.movingOn;
    this.setState({ roomState: props.roomState });
  }
  start() {
    let roomState = this.state.roomState.setStarted(true);
    if (this.state.roomState.isCreator) {
      this.communicator.sendObject({ started: true });
    }
    this.setState({ roomState: roomState });
    this.movingOn(roomState);
  }
  messageCallback(msg) {
    if (msg.playerID === this.state.roomState.playerID) {
      return false;
    }
    if (msg.requestToJoin && this.state.roomState.isCreator) {
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
    return this.state.roomState.players.map(player => h('div', { class: 'columnItem textItem' }, player.playerName));
  }
  render(props, state) {
    return (
      h('div', { id: 'Room' },
        h('div', { class: 'column' },
          this.playerList(),
          this.state.roomState.isCreator ? hexagonBtn('Start Game', this.start)
            : h('div', { class: 'columnItem' }, 'Waiting for the host to start the game.')
        )
      )
    )
  }
}