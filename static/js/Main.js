"use strict";

class Wrapper extends Component {
  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
    this.board = new Board();
    this.setState({ boardState: this.board.getState() });
  }
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, true);
  };
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, true);
  };
  handleScroll(event) {
    // TODO scroll should zoom in and out if using browser, and two-finger-pinch should zoom in mobile.
    this.setState({  });
  };
  render(props, state) {
    return (
      h('div', { id: 'Wrapper' },
      )
    )
  }
}

render(h(Wrapper), document.getElementById('Main'));