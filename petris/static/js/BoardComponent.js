"use strict";


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
    this.BOARD_CELL_BORDER_WIDTH = 3;
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
    let availableMoveClass = null;
    if (this.state.roomState.currentMove.cellHasMove(cell) != Moves.NO_MOVE) {
      availableMoveClass = NO_MOVE_CLASS;
      props.hoverBorderColor = '#C30000';
    } else {
      if (availableMove == Moves.ANTIBIOTIC) {
        availableMoveClass = ANTIBIOTIC_CLASS;
      } else if (availableMove == Moves.COLONY) {
        availableMoveClass = PLAYER_CLASS_LIST[this.state.roomState.players.filter(p => p.playerID == this.state.roomState.playerID)[0].color_index];
      }
    }
    props.hoverBGClass = availableMoveClass;
    return props;
  }
  /**
   * Step Two: Consider current occupation of cell, and adapt cell accordingly.
   * @param {Cell} cell 
   * @param {HexagonProps} props 
   */
  adaptCellByOccupation(cell, props) {
    let occupier = this.state.roomState.players.filter(p => p.playerID == cell.occupation);
    props.BGClass = EMPTY_CLASS;
    if (occupier.length == 1) {
      props.BGClass = PLAYER_CLASS_LIST[occupier[0].color_index];
    } else if (cell.occupation == CellState.COMPETITION) {
      props.BGClass = COMPENTITION_CLASS;
    } else if (cell.occupation == CellState.NO_USER) {
      props.BGClass = EMPTY_CLASS;
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
        props.blinkClass = PLAYER_BLINK_CLASSES[this.state.roomState.players.filter(p => p.playerID === currentMove.playerID)[0].color_index];
      } else if (currentMove.antibiotic === cell.id) {
        props.text = 'antibiotic';
        props.blinkClass = ANTIBIOTIC_BLINK_CLASS;
      }
    }
    if (this.state.roomState.currentMove.frozen || cell.occupation !== CellState.NO_USER) {
      props.onClick = null;
      props.hoverBGClass = null;
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
  boardCell(cell, hexWidth, left, top, rotateText, onClick) {
    let props = new HexagonProps();
    props.rotateText = rotateText;
    props.onClick = onClick;
    props.left = left;
    props.top = top;
    props.hexWidth = hexWidth;
    props.borderWidth = this.BOARD_CELL_BORDER_WIDTH;
    props.borderColor = BOARD_CELL_BORDER_COLOR;
    props.flatTop = true;
    if (cell.wasProtected) {
      props.borderColor = ANTIBIOTIC_BORDER_COLOR;
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
    if (cellsMove == Moves.ANTIBIOTIC) {
      currentMove.removeAntibiotic(cell);
      changed = true;
    } else if (cellsMove == Moves.COLONY) {
      currentMove.removeColony(cell);
      changed = true;
    } else if (availableMove == Moves.COLONY) {
      currentMove.addColony(cell);
      changed = true;
    } else if (availableMove == Moves.ANTIBIOTIC) {
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
    let dims = state.roomState.board.getDimensions();
    let height = dims.height;
    let width = dims.width;
    let cells = state.roomState.board.getCells();
    return h('div', {
      id: 'Board',
      class: dims.rotate ? 'fullRotate' : null,
      style: {
        height: `${height}px`,
        width: `${width}px`,
      }
    },
      cells.map(c => this.boardCell(
        c,
        dims.boardHexWidth,
        c.center[0] - dims.minX,
        c.center[1] - dims.minY,
        dims.rotate,
        () => this.onCellClick(c)
      ))
    )
  }
}
