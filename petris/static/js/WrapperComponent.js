"use strict";

class WrapperComponent extends Component {
  constructor(props) {
    super(props);
    this.movingOn = this.movingOn.bind(this);
    this.banner = this.banner.bind(this);
    let roomState = new RoomState();
    if (TESTING) {
      roomState = roomState.dummyTest();
    }
    this.setState({ roomState: roomState });
  }
  movingOn(roomState) {
    this.setState({ roomState: roomState });
  }
  banner() {
    let scoreboard = null;
    if (this.state.roomState.started) {
      let playerData = this.state.roomState.players.map(p => {
        let hexagonProps = new HexagonProps();
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
          roomState: state.roomState
        })
          : !state.roomState.joined ? h(WelcomeComponent, {
            movingOn: this.movingOn,
            roomState: state.roomState
          })
            : !state.roomState.started ? h(RoomComponent, {
              movingOn: this.movingOn,
              roomState: state.roomState
            })
              : h(GamePlayComponent, {
                movingOn: this.movingOn,
                roomState: state.roomState
              })
      )
    )
  }
}

render(h(WrapperComponent), document.getElementById('Main'));
