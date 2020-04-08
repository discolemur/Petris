"use strict";

/**
 * From community wiki answer at https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

class RoomState {
  constructor() {
    this.players = [];
    this.confirmedMoves = {};
    this.playerName = null;
    this.roomName = null;
    this.started = false;
    this.isCreator = false;
    this.joined = false;
    this.connectionMessage = null;
    this.playerID = uuidv4();
    this.onlyTesting = false;
    this.currentMove = null;
    this.turnNumber = 1;
    this.board = null;
    this.boardHeight = DEFAULT_BOARD_HEIGHT;
    this.boardWidth = DEFAULT_BOARD_WIDTH;
    this.colonizationsPerTurn = DEFAULT_COLONIZATIONS_PER_TURN;
  }
  reset() {
    this.players = [];
    this.playerName = null;
    this.roomName = null;
    this.started = false;
    this.isCreator = false;
    this.joined = false;
    this.connectionMessage = null;
    this.currentMove = null;
    this.turnNumber = 1;
    this.board = null;
    this.boardHeight = DEFAULT_BOARD_HEIGHT;
    this.boardWidth = DEFAULT_BOARD_WIDTH;
    this.colonizationsPerTurn = DEFAULT_COLONIZATIONS_PER_TURN;
    return this;
  }
  dummyTest() {
    let p1 = new Player('nick', 'nick');
    let p2 = new Player('andrew', 'andrew');
    let p3 = new Player('andrew', 'ryan');
    let p4 = new Player('andrew', 'jacob');
    let p5 = new Player('andrew', 'jessica');
    let p6 = new Player('andrew', 'rebecca');
    p1.color = Player.COLOR_LIST[0];
    p2.color = Player.COLOR_LIST[1];
    p3.color = Player.COLOR_LIST[2];
    p4.color = Player.COLOR_LIST[3];
    p5.color = Player.COLOR_LIST[4];
    p6.color = Player.COLOR_LIST[5];
    this.players = [p1, p2, p3, p4, p5, p6];
    this.playerName = p1.playerName;
    this.roomName = 'sandbox';
    this.started = true;
    this.isCreator = true;
    this.joined = true;
    this.connectionMessage = null;
    this.playerID = p1.playerID;
    this.onlyTesting = true;
    return this;
  }
  _removeDuplicates(plist) {
    let tmp = {};
    for (let player of plist) {
      tmp[player.playerID] = player;
    }
    return Array.from(Object.values(tmp));
  }
  _setColors(plist) {
    let used_colors = plist.map(p => p.color);
    if (used_colors.indexOf(Player.NO_COLOR) >= 0 || used_colors.indexOf(null) >= 0 || used_colors.indexOf(undefined) >= 0) {
      let available_colors = Player.COLOR_LIST.filter(c => used_colors.indexOf(c) < 0);
      let counter = 0;
      for (let player of plist) {
        if (player.color === undefined || player.color === null || player.color === Player.NO_COLOR) {
          player.color = available_colors[counter++];
        }
      }
    }
    return plist;
  }
  setPlayers(plist) {
    plist = this._removeDuplicates(plist);
    plist = this._setColors(plist);
    this.players = plist.map(p => Object.setPrototypeOf(p, Player.prototype));
    return this;
  }
  addPlayer(player) {
    this.players.push(player);
    return this.setPlayers(this.players); // Guarantees no duplicates.
  }
  dropPlayer(pID) {
    this.players = this.players.filter(p => p.playerID != pID)
    return this;
  }
  setPlayerName(name) {
    this.playerName = name;
    return this;
  }
  setRoomName(name) {
    this.roomName = name;
    return this;
  }
  setStarted(started) {
    this.started = started;
    return this;
  }
  setIsCreator(isCreator) {
    this.isCreator = isCreator;
    return this;
  }
  setJoined(joined) {
    this.joined = joined;
    return this;
  }
  setConnectionMessage(msg) {
    this.connectionMessage = msg;
    return this;
  }
  newBoard() {
    this.board = new Board(this.boardWidth, this.boardHeight);
    this.clearMoves();
    return this;
  }
  setCurrentMove(move) {
    this.currentMove = move;
    return this;
  }
  setBoardHeight(h) {
    this.boardHeight = h;
    return this;
  }
  setBoardWidth(w) {
    this.boardWidth = w;
    return this;
  }
  setColonizationsPerTurn(cpt) {
    this.colonizationsPerTurn = cpt;
    return this;
  }
  /**
   * IMPORTANT: returns callback, not this.
   * @param {function} callback 
   */
  performMoves(callback) {
    let moves = this.confirmedMoves;
    moves[this.playerID] = this.currentMove;
    this.board.performMoves(Object.values(moves));
    this.board.setScores(this.players);
    this.clearMoves();
    callback();
  }
  clearMoves() {
    this.confirmedMoves = {};
    ++this.turnNumber;
    this.currentMove = new Move(this.playerID, this.turnNumber, this.colonizationsPerTurn);
    return this;
  }
  /**
 * Logs an opponent's move, triggers if all moves are logged, then returns this.
 * @param {Move} move
 */
  logMove(move) {
    move = Object.setPrototypeOf(move, Move.prototype);
    if (move.turnNumber == this.turnNumber) {
      this.confirmedMoves[move.playerID] = move;
    }
    return this;
  }
  isReadyForNextTurn() {
    return (Object.keys(this.confirmedMoves).length == this.players.length);
  }
  addColony(cell) {
    this.currentMove.addColony(cell);
    return this;
  }
  removeColony(cell) {
    this.currentMove.removeColony(cell);
    return this;
  }
  addAntibiotic(cell) {
    this.currentMove.addAntibiotic(cell);
    return this;
  }
  removeAntibiotic(cell) {
    this.currentMove.removeAntibiotic(cell);
    return this;
  }
  getAvailableMove() {
    if (this.currentMove === null) {
      return Move.COLONY;
    }
    let am = this.currentMove.getAvailableMove();
    let emptyCells = this.board.getCells().filter(c => c.occupation == CellState.NO_USER);
    if (emptyCells.length == 0
      || emptyCells.filter(c => this.currentMove.cellHasMove(c) == Move.NO_MOVE).length == 0) {
      am = Move.NO_MOVE;
    }
    if (this.currentMove.isEmpty() && emptyCells.length == 0) {
      am = Move.GAME_OVER;
    }
    return am;
  }
  freezeMove() {
    this.currentMove.setFrozen();
    this.confirmedMoves[this.playerID] = this.currentMove;
    return this;
  }
  isFrozen() {
    if (this.currentMove !== null && this.currentMove.frozen) {
      return true;
    }
    return false;
  }
  setLatestPing(pID) {
    for (let player of this.players) {
      if (player.playerID === pID || player.playerID === this.playerID) {
        player.latestPing = new Date().getTime();
      }
    }
    // Only drop players if the game hasn't started yet.
    if (this.isCreator && !this.started) {
      for (let p of this.players) {
        if (new Date().getTime() - p.latestPing > Player.PING_TIMEOUT) {
          this.dropPlayer(p.playerID);
        }
      }
    }
    return this;
  }
}
