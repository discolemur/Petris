"use strict";

var hexagonBtn = (text, onClick) => {
  return h('div', { class: "btn hexagon", onClick: onClick },
    h('div', { class: "hexTop" }),
    h('div', { class: "hexBottom" }),
    h('span', {}, text)
  )
}

class BoardComponent extends Component {
  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
    this.movingOn = props.movingOn;
    this.setState({ roomState: props.roomState, board: new Board(props.roomState.players.length) });
    this.communicator = props.communicator;
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
    return (
      h('div', { id: 'Board' })
    )
  }
}

class Wrapper extends Component {
  constructor(props) {
    super(props);
    this.movingOn = this.movingOn.bind(this);
    this.communicator = new Communicator();
    this.setState({ roomState: new RoomState() });
  }
  movingOn(roomState) {
    console.log('Moving on...');
    console.log(roomState);
    this.setState({ roomState: roomState });
  }
  render(props, state) {
    return (
      h('div', { id: 'Wrapper' },
        !this.state.roomState.joined ? h(WelcomeComponent, {
          movingOn: this.movingOn,
          roomState: this.state.roomState,
          communicator: this.communicator
        })
          : !this.state.roomState.started ? h(RoomComponent, {
            movingOn: this.movingOn,
            roomState: this.state.roomState,
            communicator: this.communicator
          })
            : h(BoardComponent, {
              movingOn: this.movingOn,
              roomState: this.state.roomState,
              communicator: this.communicator
            })
      )
    )
  }
}

render(h(Wrapper), document.getElementById('Main'));