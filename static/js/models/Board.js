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
    constructor() {
        this.cells = {}
        this.makeCells();
    }
    getCells() {
        return Object.values(this.cells);
    }
    makeCells() {
        // top_shape is the order of link positions from each cell n to its neighbor n+1 from the perspective of n.
        const top_shape = [1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1];
        let id_counter = 1;
        let top_width = top_shape.length + 1;
        let num_rows = 7;
        let allCells = [];
        // Make top row
        let root = new Cell(id_counter++);
        root.center = [0, 0];
        allCells.push(root);
        for (let col = 1; col < top_width; ++col) {
            let cell = new Cell(id_counter++);
            if (col > 0) {
                verbosePrint('linking top row together');
                this.linkCells(allCells[col - 1], top_shape[col - 1], cell);
            }
            allCells.push(cell);
        }
        // Build off top row
        for (let row = 1; row < num_rows; ++row) {
            for (let col = 0; col < top_width; ++col) {
                let cell = new Cell(id_counter++);
                let indexAbove = col + (row - 1) * top_width;
                verbosePrint(`linking cell at ${allCells.length} to row above cell at ${indexAbove}`);
                let cellAbove = allCells[indexAbove];
                this.linkCells(cell, 0, cellAbove);
                allCells.push(cell);
            }
        }
        for (let cell of allCells) {
            this.cells[cell.id] = cell;
        }
        this.confirmBoardCreated();
    }
    /**
     * Validates that the board is linked together in a valid manner.
     */
    confirmBoardCreated() {
        let hasCenterless = this.getCells().map(c=>c.center).filter(c=>c===null).length > 0;
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
     * Performs all moves on the board, considering the rules.
     * NOTE: do not call this function until all moves have been submitted.
     * @param {Array<Move>} allMove
     */
    performMoves(allMoves) {
        this.getCells().map(c=>c.resetProtection());
        allMoves = allMoves.map(m=>Object.setPrototypeOf(m, Move.prototype))
        let antibiotics = allMoves.map(m=>m.antibiotic);
        for (let move of allMoves) {
            let enemyColonizations = allMoves.filter(m=>m.playerID != move.playerID).map(m=>m.colonies).flat();
            for (let cellID of move.colonies) {
                if (antibiotics.indexOf(cellID) >= 0) {
                    // Handle antibiotics TODO: maybe show all antibiotics used? Or just the ones that were effective?
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
     * Prepares cells for colonization by removing antibiotics from the previous round.
     */
    prepareForColonization() {
        for (let cell of this.getCells()) {
            if (cell.occupation == CellState.ANTIBIOTIC) {
                cell.occupation = CellState.NO_USER;
            }
        }
    }
}