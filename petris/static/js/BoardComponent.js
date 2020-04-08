"use strict";

var BOARD_CELL_WIDTH = 60;
var BOARD_CELL_BORDER_WIDTH = 3;


var EMPTY_COLOR = '#C4C4C4'; // '#C2B790';
var COMPENTITION_COLOR = '#444444';
var ANTIBIOTIC_COLOR = '#97F365';

class BoardComponent extends Component {
  constructor(props) {
    super(props);
    this.boardCell = this.boardCell.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.updateTrigger = props.updateTrigger;
    this.setState({
      roomState: props.roomState.newBoard()
    });
  }
  /**
 * Returns the rendering of one cell in absolute position.
 * @param {Cell} cell 
 * @param {Move} currentMove 
 * @param {Array<Player>} players 
 * @param {Number} minX 
 * @param {Number} minY 
 * @param {function} onClick 
 */
  boardCell(cell, left, top, onClick) {
    let players = this.state.roomState.players;
    let currentMove = this.state.roomState.currentMove;
    // TODO break some logic into functions...
    let props = HexagonProps();
    props.borderColor = '#4C4C4C';
    let availableMove = this.state.roomState.getAvailableMove();
    let availableMoveColor = null;
    if (currentMove.cellHasMove(cell) != Move.NO_MOVE) {
      availableMoveColor = '#484848';
      props.hoverBorderColor = '#C30000';
    } else {
      if (availableMove == Move.ANTIBIOTIC) {
        availableMoveColor = ANTIBIOTIC_COLOR;
      } else if (availableMove == Move.COLONY) {
        availableMoveColor = players.filter(p => p.playerID == currentMove.playerID)[0].color;
      }
    }
    props.hoverBGColor = availableMoveColor;
    props.onClick = onClick;
    props.left = left;
    props.top = top;
    props.cellWidth = BOARD_CELL_WIDTH;
    props.borderWidth = BOARD_CELL_BORDER_WIDTH;
    props.flatTop = true;
    let occupier = players.filter(p => p.playerID == cell.occupation);
    if (occupier.length == 1) {
      props.cellBGColor = occupier[0].color;
    } else if (cell.occupation == CellState.ANTIBIOTIC) {
      props.text = 'antibiotic';
      props.cellBGColor = ANTIBIOTIC_COLOR;
    } else if (cell.occupation == CellState.ANTIBIOTIC) {
      props.cellBGColor = COMPENTITION_COLOR;
    } else if (cell.occupation == CellState.NO_USER) {
      props.cellBGColor = EMPTY_COLOR;
    }
    if (currentMove !== null) {
      if (currentMove.colonies.indexOf(cell.id) >= 0) {
        props.blinkBGColor = players.filter(p => p.playerID === currentMove.playerID)[0].color;
      } else if (currentMove.antibiotic === cell.id) {
        props.text = 'antibiotic';
        props.blinkBGColor = ANTIBIOTIC_COLOR;
      }
    }
    if (this.state.roomState.currentMove.frozen || cell.occupation !== CellState.NO_USER) {
      props.onClick = null;
      props.hoverBGColor = null;
      props.hoverBorderColor = null;
    }
    return h(Hexagon, { styleParams: props });
  }
  onCellClick(cell) {
    if (cell.occupation !== CellState.NO_USER) {
      return;
    }
    let currentMove = this.state.roomState.currentMove;
    let cellsMove = currentMove.cellHasMove(cell);
    let availableMove = this.state.roomState.currentMove.getAvailableMove();
    if (cellsMove == Move.ANTIBIOTIC) {
      currentMove.removeAntibiotic(cell);
    } else if (cellsMove == Move.COLONY) {
      currentMove.removeColony(cell);
    } else if (availableMove == Move.COLONY) {
      currentMove.addColony(cell);
    } else if (availableMove == Move.ANTIBIOTIC) {
      currentMove.addAntibiotic(cell);
    }
    this.updateTrigger();
    this.setState({ roomState: this.state.roomState.setCurrentMove(currentMove) });
  }
  render(props, state) {
    let cells = state.roomState.board.getCells();
    let minX = Math.min.apply(null, cells.map(c => c.center[0]));
    let maxX = Math.max.apply(null, cells.map(c => c.center[0]));
    let minY = Math.min.apply(null, cells.map(c => c.center[1]));
    let maxY = Math.max.apply(null, cells.map(c => c.center[1]));
    return h('div', {
      id: 'Board',
      style: {
        height: `${(maxY - minY + 2) * BOARD_CELL_WIDTH}px`,
        width: `${(maxX - minX + 2) * BOARD_CELL_WIDTH}px`
      }
    },
      cells.map(c => this.boardCell(
        c,
        c.center[0] - minX + 0.5,
        c.center[1] - minY + 0.5,
        () => this.onCellClick(c)
      ))
    )
  }
}
