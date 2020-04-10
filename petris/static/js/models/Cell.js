
/**
 * CellState gives global variables important to the state of the board. 
 */
var CellState = {
    NO_USER: -1,
    ANTIBIOTIC: -2,
    COMPETITION: -3,
};

var ID_COUNTER = 1;

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
     */
    constructor() {
        this.id = ID_COUNTER++;
        this.center = null;
        this.neighbors = [null, null, null, null, null, null];
        this.occupation = CellState.NO_USER;
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
            (n) => (n !== null && (n.id > this.id && n.occupation == this.occupation))
        ).length;
    }
    hasUnoccupiedNeighbor() {
        for (let i = 0; i < 6; ++i) {
            if (this.neighbors[i] !== null && this.neighbors[i].occupation == CellState.NO_USER) {
                return true;
            }
        }
        return false;
    }
    getUnoccupiedNeighbors() {
        return this.neighbors.filter(n=>(n !== null && n.occupation == CellState.NO_USER));
    }
}

