"use strict";

var TESTING = false;

class WrapperComponent extends Component {
  constructor(props) {
    super(props);
    this.movingOn = this.movingOn.bind(this);
    this.banner = this.banner.bind(this);
    this.communicator = new Communicator();
    let roomState = new RoomState();
    if (TESTING) {
      roomState = roomState.dummyTest();
      this.communicator = new CommunicatorDummy();
    }
    this.setState({ roomState: roomState });
  }
  movingOn(roomState) {
    console.log('moved on')
    this.setState({ roomState: roomState });
  }
  banner() {
    let scoreboard = null;
    if (this.state.roomState.started) {
      let playerData = this.state.roomState.players.map(p => {
        let hexagonProps = HexagonProps();
        hexagonProps.position = 'relative';
        hexagonProps.text = p.score;
        hexagonProps.cellWidth = 40;
        hexagonProps.fontSize = 15;
        hexagonProps.borderWidth = 3;
        hexagonProps.borderColor = p.color;
        hexagonProps.cellBGColor = 'white';
        return h('div', { class: 'playerScore' },
          h(Hexagon, { styleParams: hexagonProps }),
          h('span', { style: { marginLeft: '10px' } }, `${p.playerName}`)
        );
      });
      scoreboard = h('div', { id: 'BannerScores' }, playerData);
    }
    return h('div', { id: 'Banner' },
      h('div', { id: 'BannerContents' },
        h('span', { style: { height: '100%', minWidth: '30%' } }, 'Petris'),
        scoreboard
      )
    );
  }
  render(props, state) {
    return (
      h('div', { id: 'Wrapper' },
        this.banner(),
        TESTING ? h(GamePlayComponent, {
          movingOn: this.movingOn,
          roomState: state.roomState,
          communicator: this.communicator
        })
          : !state.roomState.joined ? h(WelcomeComponent, {
            movingOn: this.movingOn,
            roomState: state.roomState,
            communicator: this.communicator
          })
            : !state.roomState.started ? h(RoomComponent, {
              movingOn: this.movingOn,
              roomState: state.roomState,
              communicator: this.communicator
            })
              : h(GamePlayComponent, {
                movingOn: this.movingOn,
                roomState: state.roomState,
                communicator: this.communicator
              })
      )
    )
  }
}

render(h(WrapperComponent), document.getElementById('Main'));
