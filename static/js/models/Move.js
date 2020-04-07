/**
 * Move holds playerID, colonies (array of colonies to add), and antibiotic.
 */
class Move {
    constructor(playerID, turnNumber) {
        this.playerID = playerID;
        this.colonies = [];
        this.antibiotic = null;
        this.frozen = false;
        this.turnNumber = turnNumber;
    }
    isEmpty() {
        return this.colonies.length == 0 && this.antibiotic === null;
    }
    getAvailableMove() {
        if (this.colonies.length < Move.MAX_COLONIZATIONS) {
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
        if (this.colonies.length == Move.MAX_COLONIZATIONS) {
            return false;
        }
        this.colonies.push(cell.id);
        return true;
    }
    addAntibiotic(cell) {
        if (this.antibiotic !== null) {
            return false;
        }
        this.antibiotic = cell.id;
        return true;
    }
    removeAntibiotic(cell) {
        if (this.antibiotic == cell.id) {
            this.antibiotic = null;
        }
    }
    removeColony(cell) {
        this.colonies = this.colonies.filter(x=>x!=cell.id);
    }
    setFrozen() {
        this.frozen = true;
    }
}
Move.MAX_COLONIZATIONS = 2;
Move.COLONY = 10;
Move.ANTIBIOTIC = 20;
Move.NO_MOVE = false;
Move.GAME_OVER = -100;