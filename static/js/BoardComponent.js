"use strict";

class BoardComponent extends Component {
  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
    this.setState({ board: new Board(props.roomState.players.length) });
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
  /**
   * Returns list of preact components for cell and its neighbors
   * @param {Cell} cell
   */
  displayCell(cell, minX, minY) {
    let left = cell.center[0] - minX;
    let top = cell.center[1] - minY;
    let cellWidth = 60;
    let borderWidth = 3;
    let cellColor = '#C4C4C4'; // TODO Put these constants somewhere meaningful.
    let borderColor = '#4C4C4C'; // TODO
    let hoverColor = '#484848'; // TODO
    return hexagonCell(cell.id, cellWidth, borderWidth, cellColor, borderColor, hoverColor, left, top, ()=>{
      console.log(`Clicked on cell ${cell.id}`)
    })
  }
  render(props, state) {
    let cells = this.state.board.cells;
    let minX = Math.min.apply(null, cells.map(c=>c.center[0]));
    let minY = Math.min.apply(null, cells.map(c=>c.center[1]));
    return (
      h('div', { id: 'Board' },
        cells.map(c=>this.displayCell(c, minX, minY))
      )
    )
  }
}
