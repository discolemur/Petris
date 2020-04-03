"use strict";

class BoardComponent extends Component {
  constructor(props) {
    super(props);
    this.board = new Board(props.numPlayers);
  }
  render(props, state) {
    return (
      h('div', { id: 'Board' })
    )
  }
}

class RoomComponent extends Component {
  constructor(props) {
    super(props);
    this.room = props.room;
    this.isCreator = props.isCreator;
    this.setState({ players: [ props.name ] })
    this.start = props.start;
  }
  render(props, state) {
    return (
      h('div', { id: 'Room' },
        h('div', { class: 'column' },
          this.isCreator ? h('div', { class: 'btn columnItem', onClick: this.start }, 'Start Game')
            : h('div', { class: 'columnItem' }, 'Waiting for the host to start the game.')
        )
      )
    )
  }
}

class WelcomeComponent extends Component {
  constructor(props) {
    super(props);
    this.updateRoom = this.updateRoom.bind(this);
    this.updateName = this.updateName.bind(this);
    this.setOption = (opt) => this.setState({ 'option': opt });
    this.createRoom = () => props.createRoom(this.state.room, this.state.name);
    this.joinRoom = () => props.joinRoom(this.state.room, this.state.name);
    this.setState({ option: null })
  }
  bogus() {
    return h('div', { class: 'column' }, 'Wow. You broke it. I don\'t know how, but you broke it.');
  }
  create() {
    return h('div', { class: 'column', margin: 'auto' },
      h('div', { class: 'columnItem noBorder' }, 'Your Name'),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('input', { class: 'columnItem', type: 'text', onInput: (txt) => this.updateName(txt), value: this.state.name }),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('div', { class: 'columnItem noBorder' }, 'Room Name'),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('input', { class: 'columnItem', type: 'text', onInput: (txt) => this.updateRoom(txt), value: this.state.room }),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('div', { class: 'btn columnItem', onClick: () => this.createRoom() }, 'Create Room')
    )
  }
  join() {
    return h('div', { class: 'column', margin: 'auto' },
      h('div', { class: 'columnItem noBorder' }, 'Your Name'),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('input', { class: 'columnItem', type: 'text', onInput: (txt) => this.updateName(txt), value: this.state.name }),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('div', { class: 'columnItem noBorder' }, 'Room Name'),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('input', { class: 'columnItem', type: 'text', onInput: (txt) => this.updateRoom(txt), value: this.state.room }),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('div', { class: 'btn columnItem', onClick: () => this.joinRoom() }, 'Join Room')
    )
  }
  options() {
    return h('div', { class: 'column', margin: 'auto' },
      h('div', { class: 'btn columnItem', onClick: () => this.setOption('create') }, 'Create Room'),
      h('div', { style: { display: 'block', height: '0.4em' } }),
      h('div', { class: 'btn columnItem', onClick: () => this.setOption('join') }, 'Join Room')
    )
  }
  updateRoom(event) {
    let room_name = event.target.value;
    if (event.data === ' ' || room_name.indexOf(' ') != -1 || room_name.length > 15 || !room_name.match(/^[a-z0-9]*$/i)) {
      this.setState({ room: this.state.room });
    } else {
      this.setState({ room: room_name });
    }
  }
  updateName(event) {
    let name = event.target.value;
    if (name.length > 15 || !name.match(/^[a-z0-9 ]*$/i)) {
      this.setState({ name: this.state.name });
    } else {
      this.setState({ name: name });
    }
  }
  render(props, state) {
    return (
      h('div', { id: 'Welcome' },
        this.state.option === null ? this.options()
          : this.state.option == 'join' ? this.join()
            : this.state.option == 'create' ? this.create()
              : this.bogus()
      )
    )
  }
}

class Wrapper extends Component {
  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
    this.setState({ room: null, isCreator: false, started: false });
    this.start = () => this.setState({ started: true });
    this.createRoom = (roomName, name) => this.setState({ room: roomName, isCreator: true, name: name });
    this.joinRoom = (roomName, name) => this.setState({ room: roomName, isCreator: false, name: name });
  }
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, true);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, true);
  }
  handleScroll(event) {
    // TODO scroll should zoom in and out if using browser, and two-finger-pinch should zoom in mobile.
    this.setState({});
  }
  render(props, state) {
    console.log(state);
    return (
      h('div', { id: 'Wrapper' },
        this.state.room === null ? h(WelcomeComponent, { createRoom: this.createRoom, joinRoom: this.joinRoom })
          : !this.state.started ? h(RoomComponent, { room: this.state.room, isCreator: this.state.isCreator, name: this.state.name, start: this.start })
            : h(BoardComponent, { numPlayers: this.state.numPlayers })
      )
    )
  }
}

render(h(Wrapper), document.getElementById('Main'));