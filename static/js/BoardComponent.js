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
  // TODO break some logic into functions...
  let props = HexagonProps();
  props.borderColor = '#4C4C4C';
  let availableMove = currentMove.availableMove();
  let availableMoveColor = null; // '#484848'; // This gets distracting if set.
  if (availableMove == Move.ANTIBIOTIC) {
    availableMoveColor = ANTIBIOTIC_CELL_COLOR;
  } else if (availableMove == Move.COLONY) {
    availableMoveColor = players.filter(p => p.playerID == currentMove.playerID)[0].color;
  }
  props.hoverBGColor = availableMoveColor;
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
      props.blinkBGColor = players.filter(p => p.playerID === currentMove.playerID)[0].color;
    } else if (currentMove.antibiotic === cell.id) {
      props.blinkBGColor = ANTIBIOTIC_CELL_COLOR;
    }
  }
  return h(Hexagon, { styleParams: props });
}

class BoardComponent extends Component {
  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
    this.displayCell = this.displayCell.bind(this);
    this.setState({
      roomState: props.roomState.setCurrentMove(new Move(props.roomState.playerID)),
      board: new Board(props.roomState.players.length)
    });
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
      if (cell.occupation !== CellState.NO_USER) {
        return;
      }
      let currentMove = this.state.roomState.currentMove;
      let cellsMove = currentMove.cellHasMove(cell);
      let availableMove = this.state.roomState.currentMove.availableMove();
      if (cellsMove == Move.ANTIBIOTIC) {
        currentMove.removeAntibiotic(cell);
      } else if (cellsMove == Move.COLONY) {
        currentMove.removeColony(cell);
      } else if (availableMove == Move.COLONY) {
        currentMove.addColony(cell);
      } else if (availableMove == Move.ANTIBIOTIC) {
        currentMove.addAntibiotic(cell);
      }
      this.setState({ roomState: this.state.roomState.setCurrentMove(currentMove) });
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
