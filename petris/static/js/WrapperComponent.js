"use strict";

var getRoomState = () => { }

class WrapperComponent extends Component {
  constructor(props) {
    super(props);
    this.movingOn = this.movingOn.bind(this);
    this.getPlayerScoreElements = this.getPlayerScoreElements.bind(this);
    this.banner = this.banner.bind(this);
    let roomState = new RoomState();
    if (TESTING) {
      roomState = roomState.dummyTest();
    }
    this.setState({ roomState: roomState });
  }
  componentDidMount() {
    getRoomState = () => this.state.roomState;
    window.addEventListener('resize', (event)=>this.setState({}));
  }
  movingOn(roomState) {
    this.setState({ roomState: roomState });
  }
  getPlayerScoreElements() {
    let elements = [];
    let pair = [];
    for (let i = 0; i < this.state.roomState.players.length; ++i) {
      let className = 'playerScore';
      if (i % 2 == 1) {
        className = 'playerScoreLower';
      }
      let p = this.state.roomState.players[i];
      let hexagonProps = new HexagonProps();
      hexagonProps.position = 'relative';
      hexagonProps.text = p.score;
      hexagonProps.hexWidth = 40;
      hexagonProps.fontSize = 20;
      hexagonProps.borderWidth = 3;
      hexagonProps.borderColor = PLAYER_CLASS_LIST[p.color_index];
      hexagonProps.BGClass = WHITE_CLASS;
      pair.push(h('div', { class: className },
        h(Hexagon, { styleParams: hexagonProps }),
        h('span', { style: { marginLeft: '10px' } }, `${p.playerName}`)
      ));
      if (i % 2 == 1) {
        elements.push(h('div', { class: 'scorePair' }, pair));
        pair = [];
      }
    }
    if (pair.length == 1) {
      elements.push(h('div', { class: 'scorePair' }, pair));
    }
    return elements;
  }
  banner() {
    let subtitle = h('div', { id: 'Subtitle'}, 'grow colonies | make connections')
    return h('div', { id: 'Banner' },
      h('div', { id: 'BannerScores' },
        h('span', { id: 'Title' }, 'Petris'),
        this.state.roomState.started ? this.getPlayerScoreElements() : subtitle)
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
