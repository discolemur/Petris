"use strict";

var verbose = false;
function verbosePrint(msg) {
    if (verbose) {
        console.log(msg);
    }
}

class Cell {
    /**
     * Neighbors are ordered according to this clock-based convention:
     * [ 12:00, 2:00, 4:00, 6:00, 8:00, 10:00 ]
     * @param {*} id This should be a unique number.
     */
    constructor(id) {
        this.id = id;
        this.neighbors = [null, null, null, null, null, null];
    }
    /**
     * Links cell to its neighbor at the given position.
     * Note: this is only a single link!
     * Don't forget to do the backwards link to keep double-linkedness!
     * @param {Number} position
     * @param {Cell} neighbor
     */
    link(position, neighbor) {
        if (this.neighbors.filter(x => x === null).length == 0 || this.isAdjacent(neighbor)) {
            return false;
        }
        this.neighbors[position] = neighbor;
        neighbor[(position+3)%6] = this;
        return true;
    }
    /**
     * Returns whether the neighbor is a neighbor or not.
     * @param {Cell} neighbor 
     */
    isAdjacent(neighbor) {
        return this.neighbors.filter(x => (x!== null && x.id == neighbor.id)).length > 0;
    }
    /**
     * Returns the position (-1 if neighbor is not found) of neighbor in the list of neighbors.
     * @param {Cell} neighbor 
     */
    getPosition(neighbor) {
        let position = -1;
        for (let i = 0; i < 6; ++i) {
            if (this.neighbors[i] !== null && this.neighbors[i].id == neighbor.id) {
                position = i;
                break;
            }
        }
        return position;
    }
}

class BoardState {
    constructor() {

    }
}

class Board {
    constructor() {
        this.cells = [];
        this.makeCells();
    }
    makeCells() {
        // top_shape is the order of link positions from each cell n to its neighbor n+1 from the perspective of n.
        const top_shape = [1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1];
        let id_counter = 1;
        let top_width = top_shape.length + 1;
        // Make top row
        for (let col = 0; col < top_width; ++col) {
            let cell = new Cell(id_counter++);
            if (col > 0) {
                verbosePrint('linking top row together');
                this.linkCells(this.cells[col-1], top_shape[col-1], cell);
            }
            this.cells.push(cell);
        }
        // Build off top row
        for (let row = 1; row < 7; ++row) {
            for (let col = 0; col < top_width; ++col) {
                let cell = new Cell(id_counter++);
                let indexAbove = col + (row-1)*top_width;
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
    getState() {

    }
}