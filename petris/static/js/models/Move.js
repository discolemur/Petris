/**
 * Move holds playerID, colonies (array of colonies to add), and antibiotic.
 */
class Move {
    constructor(playerID, turnNumber, maxColonizations) {
        this.playerID = playerID;
        this.colonies = [];
        this.antibiotic = null;
        this.frozen = false;
        this.turnNumber = turnNumber;
        this.maxColonizations = maxColonizations;
    }
    isEmpty() {
        return this.colonies.length == 0 && this.antibiotic === null;
    }
    getAvailableMove() {
        if (this.frozen) {
            return Move.NO_MOVE;
        }
        if (this.colonies.length < this.maxColonizations) {
            return Move.COLONY;
        }
        if (this.antibiotic === null) {
            return Move.ANTIBIOTIC;
        }
        return Move.NO_MOVE;
    }
    cellHasMove(cell) {
        if (this.colonies.indexOf(cell.id) >= 0) {
            return Move.COLONY;
        } else if (this.antibiotic == cell.id) {
            return Move.ANTIBIOTIC;
        }
        return Move.NO_MOVE;
    }
    addColony(cell) {
        if (this.colonies.length == this.maxColonizations || this.frozen) {
            return false;
        }
        this.colonies.push(cell.id);
        return true;
    }
    addAntibiotic(cell) {
        if (this.antibiotic !== null || this.frozen) {
            return false;
        }
        this.antibiotic = cell.id;
        return true;
    }
    removeAntibiotic(cell) {
        if (this.antibiotic == cell.id && !this.frozen) {
            this.antibiotic = null;
        }
    }
    removeColony(cell) {
        if (!this.frozen) {
            this.colonies = this.colonies.filter(x=>x!=cell.id);
        }
    }
    setFrozen() {
        this.frozen = true;
    }
}
Move.COLONY = 10;
Move.ANTIBIOTIC = 20;
Move.NO_MOVE = false;
Move.GAME_OVER = -100;