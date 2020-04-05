"use strict";

/**
 * 
 * @param {Cell} cell 
 * @param {Move} currentMove 
 * @param {Array<Player>} players 
 * @param {Number} minX 
 * @param {Number} minY 
 * @param {function} onClick 
 */
var boardCell = (cell, currentMove, players, minX, minY, onClick) => {
  let props = HexagonProps();
  props.borderColor = '#4C4C4C';
  props.hoverBGColor = '#484848';
  props.onClick = onClick;
  props.text = cell.id;
  props.left = cell.center[0] - minX;
  props.top = cell.center[1] - minY;
  props.cellWidth = 60;
  props.borderWidth = 3;
  props.flatTop = true;
  let occupier = players.filter(p => p.playerID == cell.occupation);
  if (occupier.length == 1) {
    props.cellBGColor = occupier[0].color;
  } else if (cell.occupation == CellState.ANTIBIOTIC) {
    props.cellBGColor = ANTIBIOTIC_CELL_COLOR;
  } else if (cell.occupation == CellState.ANTIBIOTIC) {
    props.cellBGColor = COMPENTITION_CELL_COLOR;
  } else if (cell.occupation == CellState.NO_USER) {
    props.cellBGColor = '#C4C4C4';
  }
  if (currentMove !== null) {
    if (currentMove.colonies.indexOf(cell.id) >= 0) {
      props.borderColor = players.filter(p => p.playerID === currentMove.playerID)[0].color;
    } else if (currentMove.antibiotic === cell.id) {
      props.borderColor = ANTIBIOTIC_CELL_COLOR;
    }
  }
  return h(Hexagon, { styleParams: props });
}

class BoardComponent extends Component {
  constructor(props) {
    super(props);
    this.nextTurn = this.nextTurn.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.displayCell = this.displayCell.bind(this);
    this.setState({
      roomState: props.roomState.setCurrentMove(new Move(props.roomState.playerID)),
      board: new Board(props.roomState.players.length)
    });
  }
  nextTurn() {
    this.setState({ roomState: props.roomState.setCurrentMove(new Move(props.roomState.playerID)) })
  }
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, true);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, true);
  }
  handleScroll(event) {
    // TODO scroll should zoom in and out if using browser, and two-finger-pinch should zoom in mobile.
    console.log('Scrolled');
  }
  /**
   * Returns list of preact components for cell and its neighbors
   * @param {Cell} cell
   */
  displayCell(cell, minX, minY) {
    return boardCell(cell, this.state.roomState.currentMove, this.state.roomState.players, minX, minY, () => {
      console.log(`Clicked on cell ${cell.id}`);
      if (cell.occupation === CellState.NO_USER) {
        this.setState({ roomState: this.state.roomState.colonize(cell) });
      }
    });
  }
  render(props, state) {
    let cells = this.state.board.cells;
    let minX = Math.min.apply(null, cells.map(c => c.center[0]));
    let minY = Math.min.apply(null, cells.map(c => c.center[1]));
    return (
      h('div', { id: 'Board' }, h('div', { id: 'BoardFloater' }, // TODO: make board appear in center of screen, use floater.
        cells.map(c => this.displayCell(c, minX, minY))
      ))
    )
  }
}
