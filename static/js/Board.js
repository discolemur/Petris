"use strict";

var _verbose_board = false;
function verbosePrint(msg) {
    if (_verbose_board) {
        console.log(msg);
    }
}

/**
 * BoardState gives global variables important to the state of the board. 
 */
var BoardState = {
    NO_USER: -1,
    ANTIBIOTIC: -2,
    COMPETITION: -3,
    POSSIBLE_PLAYERS: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
};

/**
 * Cell holds its id, neighbors, occupation state, and whether the spot was blocked by an antibiotic.
 */
class Cell {
    /**
     * Neighbors are ordered according to this clock-based convention:
     * [ 12:00, 2:00, 4:00, 6:00, 8:00, 10:00 ]
     * Center is a float that represents the coordinate center of the cell.
     * Preact will handle scaling on-screen.
     * Just keep scaling consistent among the cell objects.
     * @param {Number} id This should be a unique, non-negative number.
     */
    constructor(id) {
        this.id = id;
        this.center = null;
        this.neighbors = [null, null, null, null, null, null];
        this.occupation = BoardState.NO_USER;
        this.wasProtected = false;
    }
    /**
     * Conveniently sets antibiotic protection to false
     */
    resetProtection() {
        this.wasProtected = false;
    }
    isSurrounded() {
        return this.neighbors.filter(x => x === null).length == 0;
    }
    setRelativeCenter(neighbor, positionToNeighbor) {
        let nX = neighbor.center[0];
        let nY = neighbor.center[1];
        let angle = (Math.PI / 2) + (positionToNeighbor * Math.PI / 3);
        let x = nX + Math.cos(angle);
        let y = nY + Math.sin(angle);
        this.center = [x, y];
    }
    /**
     * Links cell to its neighbor at the given position.
     * Note: this is only a single link!
     * Don't forget to do the backwards link to keep double-linkedness!
     * @param {Number} position
     * @param {Cell} neighbor
     */
    link(position, neighbor) {
        if (this.center === null && neighbor.center === null) {
            console.log('Major error! At least one of the neighbors must have a center!');
        }
        if (this.isSurrounded() || neighbor.isSurrounded()
            || this.isAdjacent(neighbor)) {
            return false;
        }
        let positionFromNeighbor = (position + 3) % 6;
        this.neighbors[position] = neighbor;
        neighbor.neighbors[positionFromNeighbor] = this;
        if (this.center === null) {
            this.setRelativeCenter(neighbor, position);
        } else if (neighbor.center === null) {
            neighbor.setRelativeCenter(this, positionFromNeighbor);
        }
        return true;
    }
    /**
     * Returns whether the neighbor is a neighbor or not.
     * @param {Cell} neighbor 
     */
    isAdjacent(neighbor) {
        return this.neighbors.filter(x => (x !== null && x.id === neighbor.id)).length > 0;
    }
    /**
     * Returns the position (-1 if neighbor is not found) of neighbor in the list of neighbors.
     * @param {Cell} neighbor 
     */
    getPosition(neighbor) {
        let position = -1;
        for (let i = 0; i < 6; ++i) {
            if (this.neighbors[i] !== null && this.neighbors[i].id === neighbor.id) {
                position = i;
                break;
            }
        }
        return position;
    }
    getNumberOfAdjacentHigherIDConnections() {
        return this.neighbors.filter(
            (n) => (n.id > this.id && n.occupation == this.occupation)
        ).length;
    }
}

/**
 * Move holds playerID, colonize (tuple), and antibiotic.
 */
class Move {
    constructor(playerID, colonize, antibiotic) {
        this.playerID = playerID;
        this.colonize = colonize;
        this.antibiotic = antibiotic;
    }
}

/**
 * Board holds its players and cells.
 * It can merge with other boards.
 * It can calculate the current scores.
 */
class Board {
    constructor(numPlayers) {
        this.players = BoardState.POSSIBLE_PLAYERS.slice(0, numPlayers);
        this.cells = [];
        this.makeCells();
    }
    makeCells() {
        // top_shape is the order of link positions from each cell n to its neighbor n+1 from the perspective of n.
        const top_shape = [1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1];
        let id_counter = 1;
        let top_width = top_shape.length + 1;
        // Make top row
        let root = new Cell(id_counter++);
        root.center = [0, 0];
        this.cells.push(root);
        for (let col = 1; col < top_width; ++col) {
            let cell = new Cell(id_counter++);
            if (col > 0) {
                verbosePrint('linking top row together');
                this.linkCells(this.cells[col - 1], top_shape[col - 1], cell);
            }
            this.cells.push(cell);
        }
        // Build off top row
        for (let row = 1; row < 7; ++row) {
            for (let col = 0; col < top_width; ++col) {
                let cell = new Cell(id_counter++);
                let indexAbove = col + (row - 1) * top_width;
                verbosePrint(`linking cell at ${this.cells.length} to row above cell at ${indexAbove}`);
                let cellAbove = this.cells[indexAbove];
                this.linkCells(cell, 0, cellAbove);
                this.cells.push(cell);
            }
        }
        this.confirmBoardCreated();
    }
    /**
     * Validates that the board is linked together in a valid manner.
     */
    confirmBoardCreated() {
        let hasCenterless = this.cells.map(c=>c.center).filter(c=>c===null).length > 0;
        if (hasCenterless) {
            console.log('Board failed to set all centers.');
        } else {
            console.log('All cells have centers.');
        }
        let success = true;
        for (let i = 0; i < this.cells.length; ++i) {
            let cell = this.cells[i];
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
        this.cells.map(c=>resetProtection());
        allMoves = allMoves.map(m=>Object.setPrototypeOf(m, Move.prototype))
        let antibiotics = allMoves.map(m=>m.antibiotic);
        for (let move of allMoves) {
            let enemyColonizations = allMoves.filter(m=>m.playerID != move.playerID).map(m=>m.colonize).flat();
            for (let cellID of move.colonize) {
                if (antibiotics.indexOf(cellID) >= 0) {
                    // Handle antibiotics TODO: maybe show all antibiotics used? Or just the ones that were effective?
                    this.cells[cellID].wasProtected = true;
                } else if (enemyColonizations.indexOf(cellID) >= 0) {
                    // Handle competitions
                    this.cells[cellID].occupation = BoardState.COMPETITION;
                } else {
                    this.cells[cellID].occupation = move.playerID;
                }
            }
        }
    }
    /**
     * Modifies this Board into combination of this and the array of boards.
     * Returns this.
     * @param {Array<Board>} boards 
     */
    combine(boards) {
        // Add this board to the mix, then party on, dudes!
        boards.push(this);
        for (let i = 0; i < this.cells.length; ++i) {
            // This is an array of only unique occupation values at this cell.
            let occupations = Array.from(new Set(boards.map(b => b.cells[i].occupation)));
            // Handle antibiotics
            if (occupations.indexOf(BoardState.ANTIBIOTIC) != -1) {
                this.cells[i].occupation = BoardState.ANTIBIOTIC;
            }
            // Handle competitions
            else if (occupations.filter(x => (
                x != BoardState.NO_USER &&
                x != BoardState.ANTIBIOTIC &&
                x != BoardState.COMPETITION
            )).length > 1 || occupations.indexOf(BoardState.COMPETITION) != -1) {
                this.cells[i].occupation = BoardState.COMPETITION;
            }
            // Handle normal cases
            else {
                let occupiedUsers = occupations.filter(x => (x != BoardState.NO_USER));
                if (occupiedUsers.length > 1) {
                    console.log('Fatal error: Issue calculating cell occupation.');
                }
                if (occupiedUsers.length == 1) {
                    this.cells[i].occupation = occupiedUsers[0];
                }
            }
        }
        return this;
    }
    /**
     * Returns an object containing the score of each player.
     */
    getScores() {
        let scores = {};
        for (let player of this.players) {
            scores[player] = this.cells
                .filter(c => c.occupation == player)
                .map(c => c.getNumberOfAdjacentHigherIDConnections())
                .reduce((a, b) => a + b, 0);
        }
        return scores;
    }
    /**
     * Prepares cells for colonization by removing antibiotics from the previous round.
     */
    prepareForColonization() {
        for (let cell of this.cells) {
            if (cell.occupation == BoardState.ANTIBIOTIC) {
                cell.occupation = BoardState.NO_USER;
            }
        }
    }
}