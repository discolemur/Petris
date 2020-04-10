"use strict";

var BOARD_CELL_BORDER_WIDTH = 3;

class BoardComponent extends Component {
  constructor(props) {
    super(props);
    this.adaptCellByAvailableMove = this.adaptCellByAvailableMove.bind(this);
    this.adaptCellByOccupation = this.adaptCellByOccupation.bind(this);
    this.adaptCellByCurrentMove = this.adaptCellByCurrentMove.bind(this);
    this.boardCell = this.boardCell.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.updateTrigger = props.updateTrigger;
    this.setState({
      roomState: props.roomState.newBoard()
    });
  }
  /**
   * Step One: Consider available moves, and adapt cell accordingly.
   * @param {Cell} cell 
   * @param {HexagonProps} props 
   */
  adaptCellByAvailableMove(cell, props) {
    let availableMove = this.state.roomState.getAvailableMove();
    let availableMoveColor = null;
    if (this.state.roomState.currentMove.cellHasMove(cell) != Move.NO_MOVE) {
      availableMoveColor = '#484848';
      props.hoverBorderColor = '#C30000';
    } else {
      if (availableMove == Move.ANTIBIOTIC) {
        availableMoveColor = ANTIBIOTIC_COLOR;
      } else if (availableMove == Move.COLONY) {
        availableMoveColor = this.state.roomState.players.filter(p => p.playerID == this.state.roomState.playerID)[0].color;
      }
    }
    props.hoverBGColor = availableMoveColor;
    return props;
  }
  /**
   * Step Two: Consider current occupation of cell, and adapt cell accordingly.
   * @param {Cell} cell 
   * @param {HexagonProps} props 
   */
  adaptCellByOccupation(cell, props) {
    let occupier = this.state.roomState.players.filter(p => p.playerID == cell.occupation);
    props.cellBGColor = EMPTY_COLOR;
    if (occupier.length == 1) {
      props.cellBGColor = occupier[0].color;
    } else if (cell.occupation == CellState.COMPETITION) {
      props.cellBGColor = COMPENTITION_COLOR;
    } else if (cell.occupation == CellState.NO_USER) {
      props.cellBGColor = EMPTY_COLOR;
    }
    return props;
  }
  /**
   * Step Three: Consider current move decisions, and adapt cell accordingly.
   * @param {Cell} cell 
   * @param {HexagonProps} props 
   */
  adaptCellByCurrentMove(cell, props) {
    let currentMove = this.state.roomState.currentMove;
    if (currentMove !== null) {
      if (currentMove.colonies.indexOf(cell.id) >= 0) {
        props.blinkBGColor = this.state.roomState.players.filter(p => p.playerID === currentMove.playerID)[0].color;
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
    return props;
  }
  /**
 * Returns the rendering of one cell in absolute position.
 * @param {Cell} cell 
 * @param {Number} left 
 * @param {Number} top
 * @param {function} onClick 
 */
  boardCell(cell, left, top, onClick) {
    let props = new HexagonProps();
    props.onClick = onClick;
    props.left = left;
    props.top = top;
    props.cellWidth = this.boardCellWidth;
    props.borderWidth = BOARD_CELL_BORDER_WIDTH;
    props.borderColor = '#4C4C4C';
    props.flatTop = true;
    if (cell.wasProtected) {
      props.borderColor = ANTIBIOTIC_COLOR;
    }
    props = this.adaptCellByAvailableMove(cell, props);
    props = this.adaptCellByOccupation(cell, props);
    props = this.adaptCellByCurrentMove(cell, props);
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
    this.setState({ roomState: this.state.roomState.setBasicProperty("currentMove", currentMove) });
  }
  render(props, state) {
    this.boardCellWidth = props.boardCellWidth;
    let cells = state.roomState.board.getCells();
    let minX = Math.min.apply(null, cells.map(c => c.center[0]));
    let maxX = Math.max.apply(null, cells.map(c => c.center[0]));
    let minY = Math.min.apply(null, cells.map(c => c.center[1]));
    let maxY = Math.max.apply(null, cells.map(c => c.center[1]));
    return h('div', {
      id: 'Board',
      style: {
        height: `${(maxY - minY + 2) * this.boardCellWidth}px`,
        width: `${(maxX - minX + 2) * this.boardCellWidth}px`
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
