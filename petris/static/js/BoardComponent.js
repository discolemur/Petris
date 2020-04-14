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
    this.rotateGameplayButton = props.rotateButton;
    this.updateTrigger = props.updateTrigger;
    this.setState({
      roomState: props.roomState
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
    props.BGColor = EMPTY_COLOR;
    if (occupier.length == 1) {
      props.BGColor = occupier[0].color;
    } else if (cell.occupation == CellState.COMPETITION) {
      props.BGColor = COMPENTITION_COLOR;
    } else if (cell.occupation == CellState.NO_USER) {
      props.BGColor = EMPTY_COLOR;
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
  boardCell(cell, left, top, rotateText, onClick) {
    let props = new HexagonProps();
    props.rotateText = rotateText;
    props.onClick = onClick;
    props.left = left;
    props.top = top;
    props.hexWidth = this.boardHexWidth;
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
    let changed = false;
    if (cellsMove == Move.ANTIBIOTIC) {
      currentMove.removeAntibiotic(cell);
      changed = true;
    } else if (cellsMove == Move.COLONY) {
      currentMove.removeColony(cell);
      changed = true;
    } else if (availableMove == Move.COLONY) {
      currentMove.addColony(cell);
      changed = true;
    } else if (availableMove == Move.ANTIBIOTIC) {
      currentMove.addAntibiotic(cell);
      changed = true;
    }
    if (changed) {
      this.rotateGameplayButton();
      this.updateTrigger();
      this.setState({ roomState: this.state.roomState.setBasicProperty("currentMove", currentMove) });
    }
  }
  render(props, state) {
    let cells = state.roomState.board.getCells();
    this.boardHexWidth = props.boardHexWidth;
    let dims = state.roomState.board.getDimensions(this.boardHexWidth);
    return h('div', {
      id: 'Board',
      class: dims.rotate ? 'fullRotate' : null,
      style: {
        height: `${dims.height}px`,
        width: `${dims.width}px`
      }
    },
      cells.map(c => this.boardCell(
        c,
        c.center[0] - dims.minX + 0.5,
        c.center[1] - dims.minY + 0.5,
        dims.rotate,
        () => this.onCellClick(c)
      ))
    )
  }
}
