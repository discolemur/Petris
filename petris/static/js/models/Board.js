"use strict";

var _verbose_board = false;
function verbosePrint(msg) {
    if (_verbose_board) {
        console.log(msg);
    }
}

/**
 * Board holds its cells.
 * It can merge with other boards.
 * It can calculate the current scores.
 */
class Board {
    constructor(width, height) {
        this.width = width !== null ? width : DEFAULT_BOARD_WIDTH;
        this.height = height !== null ? height : DEFAULT_BOARD_HEIGHT;
        this.hexWidth = DEFAULT_BOARD_CELL_WIDTH;
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
        this.cells = {}
        this.makeCells();
    }
    getCells() {
        return Object.values(this.cells);
    }
    getEmptyCells() { // TODO consider improving efficiency for large boards
        return this.getCells().filter(c => (c.occupation == CellState.NO_USER));
    }
    makeTopRow() {
        // I define the pattern as the order of link positions from each cell n to its neighbor n+1 from the perspective of n.
        // The shape of the top row repeats [ 1, 1, 2, 2, 1, 2 ] this.width-1 times.
        // This means the first to the second cell is at position 1, and the 3rd to 4th cell is at position 2, 4th to 5th is position 2, etc.
        const pattern = [1, 1, 2, 2, 1, 2];
        let allCells = [];
        // Make top row
        let root = new Cell();
        root.center = [0, 0];
        allCells.push(root);
        this.cells[root.id] = root;
        for (let i = 0; i < this.width - 1; ++i) {
            let cell = new Cell();
            this.linkCells(allCells[i], pattern[i%pattern.length], cell)
            allCells.push(cell);
            this.cells[cell.id] = cell;
        }
        return allCells;
    }
    makeCells() {
        let allCells = this.makeTopRow();
        // Build off top row
        for (let row = 1; row < this.height; ++row) {
            for (let col = 0; col < this.width; ++col) {
                let cell = new Cell();
                let indexAbove = col + (row - 1) * this.width;
                verbosePrint(`linking cell at ${allCells.length} to row above cell at ${indexAbove}`);
                let cellAbove = allCells[indexAbove];
                this.linkCells(cell, 0, cellAbove);
                allCells.push(cell);
                this.cells[cell.id] = cell;
            }
        }
        this.minX = Math.min.apply(null, this.getCells().map(c => c.center[0]));
        this.maxX = Math.max.apply(null, this.getCells().map(c => c.center[0]));
        this.minY = Math.min.apply(null, this.getCells().map(c => c.center[1]));
        this.maxY = Math.max.apply(null, this.getCells().map(c => c.center[1]));
        this.confirmBoardCreated();
    }
    /**
     * Validates that the board is linked together in a valid manner.
     */
    confirmBoardCreated() {
        let hasCenterless = this.getCells().map(c => c.center).filter(c => c === null).length > 0;
        if (hasCenterless) {
            console.log('Board failed to set all centers.');
        } else {
            console.log('All cells have centers.');
        }
        let success = true;
        for (let i = 0; i < this.getCells().length; ++i) {
            let cell = this.getCells()[i];
            for (let n = 0; n < 6; ++n) {
                let neighbor = cell.neighbors[n];
                if (neighbor === null) {
                    continue;
                }
                if (!this.confirmLinked(cell, neighbor)) {
                    success = false;
                    break;
                }
            }
            if (!success) {
                break;
            }
        }
        if (success) {
            console.log('Board created.')
        } else {
            console.log('Board failed to link successfully.')
        }
    }
    /**
     * Validates neighbors of c1 and c2 are doubly linked together correctly.
     * @param {Cell} c1 
     * @param {Cell} c2 
     */
    confirmLinked(c1, c2) {
        let c1p = c1.getPosition(c2);
        let c2p = c2.getPosition(c1);
        if (c1p != ((c2p + 3) % 6)) {
            return false;
        }
        if (!c1.isAdjacent(c2) || !c2.isAdjacent(c1)) {
            return true;
        }
        // Check neighbors of c2 are linked to c1
        let c2p_ccw_neighbor = c2.neighbors[(c2p + 5) % 6];
        let c2p_cw_neighbor = c2.neighbors[(c2p + 1) % 6];
        if (c2p_ccw_neighbor !== null && (!c2p_ccw_neighbor.isAdjacent(c1) || !c1.isAdjacent(c2p_ccw_neighbor))) {
            return false;
        }
        if (c2p_cw_neighbor !== null && (!c2p_cw_neighbor.isAdjacent(c1) || !c1.isAdjacent(c2p_cw_neighbor))) {
            return false;
        }
        // Check neighbors of c1 are linked to c2;
        let c1p_ccw_neighbor = c1.neighbors[(c1p + 5) % 6];
        let c1p_cw_neighbor = c1.neighbors[(c1p + 1) % 6];
        if (c1p_ccw_neighbor !== null && (!c1p_ccw_neighbor.isAdjacent(c2) || !c2.isAdjacent(c1p_ccw_neighbor))) {
            return false;
        }
        if (c1p_cw_neighbor !== null && (!c1p_cw_neighbor.isAdjacent(c2) || !c2.isAdjacent(c1p_cw_neighbor))) {
            return false;
        }
        return true;
    }
    /**
     * Links cells and tries to link their neighbors as appropriate.
     * @param {Cell} c1 cell 1
     * @param {Number} c1p position on cell 1 neighbor list to add cell 2
     * @param {Cell} c2 cell 2
     * 
     * Returns true when finished.
     */
    linkCells(c1, c1p, c2) {
        // If they're already connected, stop here.
        // Otherwise, we could have endless loops by linking neighbors to neighbors etc.
        if (c1.isAdjacent(c2)) {
            return true;
        }
        let c2p = (c1p + 3) % 6;
        verbosePrint('Linking c1 to c2');
        c1.link(c1p, c2);
        verbosePrint('Linking c2 to c1');
        c2.link(c2p, c1);
        // Link c1 to c2's immediate neighbors, clockwise and counter-clockwise.
        let c2p_ccw_neighbor = c2.neighbors[(c2p + 5) % 6];
        let c2p_cw_neighbor = c2.neighbors[(c2p + 1) % 6];
        if (c2p_ccw_neighbor !== null) {
            let c1_to_new_neighbor = (c1p + 1) % 6;
            verbosePrint('Linking c1 to c2\'s counter-clockwise neighbor');
            this.linkCells(c1, c1_to_new_neighbor, c2p_ccw_neighbor);
        }
        if (c2p_cw_neighbor !== null) {
            let c1_to_new_neighbor = (c1p + 5) % 6;
            verbosePrint('Linking c1 to c2\'s clockwise neighbor');
            this.linkCells(c1, c1_to_new_neighbor, c2p_cw_neighbor);
        }
        // Link c2 to c1's neighbors
        let c1p_ccw_neighbor = c1.neighbors[(c1p + 5) % 6];
        let c1p_cw_neighbor = c1.neighbors[(c1p + 1) % 6];
        if (c1p_ccw_neighbor !== null) {
            let c2_to_new_neighbor = (c2p + 1) % 6;
            verbosePrint('Linking c2 to c1\'s counter-clockwise neighbor');
            this.linkCells(c2, c2_to_new_neighbor, c1p_ccw_neighbor);
        }
        if (c1p_cw_neighbor !== null) {
            let c2_to_new_neighbor = (c2p + 5) % 6;
            verbosePrint('Linking c2 to c1\'s clockwise neighbor');
            this.linkCells(c2, c2_to_new_neighbor, c1p_cw_neighbor);
        }
        return true;
    }
    /**
     * Resets cell antibiotic protection flag on all cells.
     */
    resetProtection() {
        this.getCells().map(c => c.resetProtection());
    }
    /**
     * Performs all moves on the board, considering the rules.
     * NOTE: do not call this function until all moves have been submitted.
     * @param {Array<Move>} allMove
     */
    performMoves(allMoves) {
        this.resetProtection();
        allMoves = allMoves.map(m => Object.setPrototypeOf(m, Move.prototype))
        let antibiotics = allMoves.map(m => m.antibiotic);
        for (let move of allMoves) {
            let enemyColonizations = allMoves.filter(m => m.playerID != move.playerID).map(m => m.colonies).flat();
            for (let cellID of move.colonies) {
                if (antibiotics.indexOf(cellID) >= 0) {
                    // Handle antibiotics. We only show the ones that were effective. (see BoardComponent.boardCell)
                    this.cells[cellID].wasProtected = true;
                } else if (enemyColonizations.indexOf(cellID) >= 0) {
                    // Handle competitions
                    this.cells[cellID].occupation = CellState.COMPETITION;
                } else {
                    this.cells[cellID].occupation = move.playerID;
                }
            }
        }
    }
    /**
     * Sets the score of each player.
     */
    setScores(players) {
        for (let player of players) {
            player.score = this.getCells()
                .filter(c => c.occupation == player.playerID)
                .map(c => c.getNumberOfAdjacentHigherIDConnections())
                .reduce((a, b) => a + b, 0);
        }
        return players;
    }
    /**
     * Sets optimal board cell width to accomodate screen size
     * @param {*} boardWidth 
     * @param {*} boardHeight 
     */
    setBoardHexWidth(boardWidth, boardHeight) {
        let heightMax = boardHeight / (this.maxY - this.minY + 1.4);
        let widthMax = boardWidth / (this.maxX - this.minX + 1.4);
        this.hexWidth = Math.min(heightMax, widthMax);
    }
    /**
     * Returns whether the board should rotate.
     */
    shouldRotate() {
        return this.getDimensions().rotate;
    }
    getDimensions() {
        let isLandscape = windowIsLandscape();
        let height = (this.maxY - this.minY + 1.4) * this.hexWidth;
        let width = (this.maxX - this.minX + 1.4) * this.hexWidth;
        let rotate = (isLandscape && (height > width)) || (!isLandscape && (width > height));
        return {
            minX: this.minX,
            minY: this.minY,
            height: height,
            width: width,
            rotate: rotate,
            boardHexWidth: this.hexWidth
        }
    }
}