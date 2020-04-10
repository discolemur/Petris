"use strict";

// This is how long to wait for a response before assuming the room is empty.
var TIME_UNTIL_CREATE = 1000;

/**
 * Prompts until it asks which room you want to join or create.
 */
class WelcomeComponent extends Component {
  constructor(props) {
    super(props);
    this.canCreate = true;
    this.canJoin = false;
    this.messageCallback = this.messageCallback.bind(this);
    this.updateRoom = this.updateRoom.bind(this);
    this.updateName = this.updateName.bind(this);
    this.connectToRoom = this.connectToRoom.bind(this);
    this.onConnectToRoom = this.onConnectToRoom.bind(this);
    this.joinIfRoomNotActive = this.joinIfRoomNotActive.bind(this);
    this.createIfRoomEmpty = this.createIfRoomEmpty.bind(this);
    this.onFailToConnect = this.onFailToConnect.bind(this);
    this.onConnectionLost = this.onConnectionLost.bind(this);
    this.errorMessage = this.errorMessage.bind(this);
    this.options = this.options.bind(this);
    this.create = this.create.bind(this);
    this.join = this.join.bind(this);
    COMMUNICATOR.setMessageCallback(this.messageCallback);
    this.setOption = (opt) => this.setState({ 'option': opt });
    this.movingOn = props.movingOn;
    this.setState({
      option: null,
      checkingRoom: false,
      roomState: props.roomState,
      howTo: false
    });
  }
  messageCallback(msg) {
    if (msg.pong && this.state.roomState.isCreator) {
      this.canCreate = false;
      this.setState({
        roomState: this.state.roomState.setBasicProperty('connectionMessage', `Could not create room "${this.state.roomState.roomName}".`),
        checkingRoom: false
      });
    }
    if (msg.canJoin) {
      this.canJoin = true;
      if (this.state.checkingRoom) {
        this.joinIfRoomNotActive();
        this.setState({ checkingRoom: false });
      }
    }
  }
  updateRoom(event) {
    let roomName = event.target.value;
    if (roomName === null
      || roomName === ' '
      || roomName.indexOf(' ') != -1
      || roomName.length > 15
      || !roomName.match(/^[a-z0-9]*$/i)) {
      this.setState({ roomState: this.state.roomState.setBasicProperty('roomName', this.state.roomState.roomName) });
    } else {
      this.setState({ roomState: this.state.roomState.setBasicProperty('roomName', roomName) });
    }
  }
  updateName(event) {
    let playerName = event.target.value;
    if (playerName === null
      || playerName === ' '
      || playerName.indexOf(' ') != -1
      || playerName.length > 15
      || !playerName.match(/^[a-z0-9 ]*$/i)) {
      this.setState({ roomState: this.state.roomState.setBasicProperty('playerName', this.state.roomState.playerName) });
    } else {
      this.setState({ roomState: this.state.roomState.setBasicProperty('playerName', playerName) });
    }
  }
  connectToRoom(created) {
    let roomState = this.state.roomState;
    if (roomState.roomName == null || roomState.roomName.length == 0
      || roomState.playerName == null || roomState.playerName.length == 0) {
      this.setState({ roomState: roomState.setBasicProperty('connectionMessage', 'Please type your name and a room name.') });
      return;
    }
    COMMUNICATOR.connect(
      roomState.roomName,
      roomState.playerID,
      this.onConnectToRoom,
      this.onFailToConnect
    );
    roomState = roomState.addPlayer(new Player(roomState.playerID, roomState.playerName));
    this.setState({ roomState: roomState.setBasicProperty('isCreator', created), checkingRoom: true });
  }
  onConnectToRoom() {
    this.state.roomState.connectionMessage = null;
    COMMUNICATOR.setOnConnectionLost(this.onConnectionLost);
    if (this.state.roomState.isCreator) {
      this.canCreate = true;
      COMMUNICATOR.sendObject({ ping: true });
      setTimeout(() => {
        this.createIfRoomEmpty();
        this.setState({ checkingRoom: false });
      }, TIME_UNTIL_CREATE);
    } else {
      this.canJoin = false;
      COMMUNICATOR.sendObject({ requestToJoin: true });
    }
  }
  joinIfRoomNotActive() {
    if (this.canJoin) {
      COMMUNICATOR.sendObject({
        joined: true,
        player: new Player(this.state.roomState.playerID, this.state.roomState.playerName)
      });
      let roomState = this.state.roomState.setBasicProperty('joined', true);
      this.movingOn(roomState);
    } else {
      this.setState({ roomState: this.state.roomState.setBasicProperty('connectionMessage', `Could not connect to room "${this.state.roomState.roomName}".`) });
    }
  }
  createIfRoomEmpty() {
    if (this.canCreate) {
      let roomState = this.state.roomState.setBasicProperty('joined', true);
      this.movingOn(roomState);
    } else {
      this.setState({ roomState: this.state.roomState.setBasicProperty('connectionMessage', `Could not create room "${this.state.roomState.roomName}".`) });
    }
  }
  onFailToConnect() {
    console.log('Failed to connect to room.');
    let roomState = this.state.roomState.setBasicProperty('connectionMessage', 'Failed to connect to room.');
    this.setState({ roomState: roomState });
  }
  onConnectionLost(responseObject) {
    console.log("Connection Lost: " + responseObject.errorMessage);
  }
  bogus() {
    return h('div', { class: 'column' }, 'Wow. You broke it. I don\'t know how, but you broke it.');
  }
  errorMessage() {
    return this.state.roomState.connectionMessage === null ? null
      : h('div', { class: 'columnItem textItem noBorder errormsg' }, this.state.roomState.connectionMessage);
  }
  options() {
    return h('div', { class: 'column', margin: 'auto' },
      defaultButton('Create Room', () => this.setOption('create'), true),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      defaultButton('Join Room', () => this.setOption('join'), true),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('div', { style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' } },
        h('div', { class: 'btn', onClick: () => this.setState({ howTo: true }) }, 'Learn to Play'),
        h('a', { class: 'btn', href: 'https://github.com/discolemur/Petris' }, 'View on GitHub')
      )
    )
  }
  create() {
    return h('div', { class: 'column', margin: 'auto' },
      this.errorMessage(),
      h('div', { class: 'columnItem textItem noBorder' }, 'Your Name'),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('input', { class: 'columnItem', type: 'text', onInput: (txt) => this.updateName(txt), value: this.state.roomState.playerName }),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('div', { class: 'columnItem textItem noBorder' }, 'Room Name'),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('input', { class: 'columnItem', type: 'text', onInput: (txt) => this.updateRoom(txt), value: this.state.roomState.roomName }),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('div', { class: 'sideBySide' },
        defaultButton('Back', () => this.setState({ option: null }), true),
        h('div', { class: this.state.checkingRoom ? 'spinner' : 'default' },
          defaultButton('Create Room', () => this.connectToRoom(true), true)
        )
      )
    )
  }
  join() {
    return h('div', { class: 'column', margin: 'auto' },
      this.errorMessage(),
      h('div', { class: 'columnItem textItem noBorder' }, 'Your Name'),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('input', { class: 'columnItem', type: 'text', onInput: (txt) => this.updateName(txt), value: this.state.roomState.playerName }),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('div', { class: 'columnItem textItem noBorder' }, 'Room Name'),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('input', { class: 'columnItem', type: 'text', onInput: (txt) => this.updateRoom(txt), value: this.state.roomState.roomName }),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('div', { class: 'sideBySide' },
        defaultButton('Back', () => this.setState({ option: null }), true),
        h('div', { class: this.state.checkingRoom ? 'spinner' : 'default' },
          defaultButton('Join Room', () => this.connectToRoom(false), true)
        )
      )
    )
  }
  render(props, state) {
    return (state.howTo ? h(HowToComponent, { return: () => this.setState({ howTo: false }) })
      : h('div', { id: 'Welcome' },
        this.state.option === null ? this.options()
          : this.state.option == 'join' ? this.join()
            : this.state.option == 'create' ? this.create()
              : this.bogus()
      )
    )
  }
}
