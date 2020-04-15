"use strict";

class RoomState {
  constructor() {
    this.playerID = uuidv4();
    this.reset();
  }
  reset() {
    this.players = [];
    this.confirmedMoves = {};
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
    let p1 = new Player('nick');
    let p2 = new Player('andrew').setIsComputer();
    let p3 = new Player('ryan').setIsComputer();
    let p4 = new Player('jacob').setIsComputer();
    let p5 = new Player('jessica').setIsComputer();
    let p6 = new Player('rebecca').setIsComputer();
    let p7 = new Player('sydney').setIsComputer();
    p1.color = PLAYER_COLOR_LIST[0];
    p2.color = PLAYER_COLOR_LIST[1];
    p3.color = PLAYER_COLOR_LIST[2];
    p4.color = PLAYER_COLOR_LIST[3];
    p5.color = PLAYER_COLOR_LIST[4];
    p6.color = PLAYER_COLOR_LIST[5];
    p7.color = PLAYER_COLOR_LIST[6];
    this.players = [p1, p2, p3, p4, p5, p6, p7];
    this.playerName = p1.playerName;
    this.roomName = 'sandbox';
    this.started = true;
    this.isCreator = true;
    this.joined = true;
    this.connectionMessage = null;
    this.playerID = p1.playerID;
    this.boardHeight = 5;
    this.boardWidth = 5;
    return this;
  }
  getGameProps() {
    return {
      boardHeight: this.boardHeight,
      boardWidth: this.boardWidth,
      colonizationsPerTurn: this.colonizationsPerTurn,
      players: this.players,
      started: this.started
    }
  }
  setGameProps(props) {
    this.boardHeight = props.boardHeight;
    this.boardWidth = props.boardWidth;
    this.colonizationsPerTurn = props.colonizationsPerTurn;
    this.started = props.started;
    this.setPlayers(props.players);
    return this;
  }
  _removeDuplicates(arr, idKey) {
    if (arr === null || arr.length < 2) {
      return arr;
    }
    let tmp = {};
    for (let x of arr) {
      tmp[x[idKey]] = x;
    }
    return Array.from(Object.values(tmp));
  }
  _setColors(plist) {
    let used_colors = plist.map(p => p.color);
    if (used_colors.indexOf(NO_PLAYER_COLOR) >= 0 || used_colors.indexOf(null) >= 0 || used_colors.indexOf(undefined) >= 0) {
      let available_colors = PLAYER_COLOR_LIST.filter(c => used_colors.indexOf(c) < 0);
      let counter = 0;
      for (let player of plist) {
        if (player.color === undefined || player.color === null || player.color === NO_PLAYER_COLOR) {
          player.color = available_colors[counter++];
        }
      }
    }
    return plist;
  }
  setPlayers(plist) {
    plist = this._removeDuplicates(plist, 'playerID');
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
  addComputer() {
    if (this.players.length < MAX_PLAYERS) {
      let p = new Player(shuffle(COMPUTER_PLAYER_NAMES)[0]);
      p.setIsComputer();
      this.addPlayer(p);
    }
    return this;
  }
  removeComputer() {
    for (let i = 0; i < this.players.length; ++i) {
      if (this.players[i].type == Player.COMPUTER) {
        this.dropPlayer(this.players[i].playerID);
        break;
      }
    }
    return this;
  }
  hasComputer() {
    return this.players.filter(p => p.type == Player.COMPUTER).length > 0;
  }
  /**
   * Attribute may be any key of RoomState objects.
   * Ensures that the attribute is a valid key.
   * Value must be the proper value of that key.
   * 
   * Returns this.
   * 
   * @param {*} attribute 
   * @param {*} value 
   */
  setBasicProperty(attribute, value) {
    if (Object.keys(this).indexOf(attribute) < 0) {
      console.log(`MAJOR ERRROR! ${attribute} is not an attribute of a RoomState object!`);
    }
    this[attribute] = value;
    return this;
  }
  newBoard() {
    this.board = new Board(this.boardWidth, this.boardHeight);
    this.players = this.players.map(p => p.clearScore());
    this.clearMoves();
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
    this.autofillIfBoardTooFull();
    this.board.setScores(this.players);
    this.clearMoves();
    callback();
  }
  autofillIfBoardTooFull() {
    let emptyCells = this._getEmptyCells();
    if (this.colonizationsPerTurn >= emptyCells.length) {
      console.log('Autofilling because full.')
      this.board.resetProtection();
      for (let c of emptyCells) {
        c.occupation = CellState.COMPETITION;
      }
    }
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
  /**
   * Gets list of confirmed moves (not keyed object, just the list of moves.)
   */
  getConfirmedMoves() {
    return Object.values(this.confirmedMoves);
  }
  /**
   * 
   * @param {Array<Move>} moves 
   */
  updateConfirmedMoves(moves) {
    moves.map(m => this.logMove(m));
    return this;
  }
  _getEmptyCells() {
    return this.board.getCells().filter(c => (c.occupation == CellState.NO_USER));
  }
  /**
   * Returns list of empty cells adjacent to property owned by player.
   * @param {Player} player 
   */
  _getEmptyAdjacentCells(playerID) {
    let ownedEdges = this.board.getCells().filter(c => c.occupation == playerID).filter(c => c.hasUnoccupiedNeighbor());
    return this._removeDuplicates(ownedEdges.map(edge => edge.getUnoccupiedNeighbors()).flat(), 'id');
  }
  _autoMove(playerID) {
    let emptyCells = this._getEmptyCells();
    let move = new Move(playerID, this.turnNumber, this.colonizationsPerTurn);
    let expandables = shuffle(this._getEmptyAdjacentCells(playerID));
    let eIDs = expandables.map(c => c.id);
    let moveCounter = this.colonizationsPerTurn;
    let edgeCounter = 0;
    // First try to expand off of existing islands.
    while (moveCounter > 0 && edgeCounter < expandables.length && expandables.length > 0) {
      move.addColony(expandables[edgeCounter++]);
      --moveCounter;
    }
    // Next, try to add new islands.
    if (moveCounter > 0 && emptyCells.length > 0) {
      emptyCells = shuffle(emptyCells.filter(c => eIDs.indexOf(c.id) < 0));
    }
    let emptyCounter = 0;
    while (moveCounter > 0 && emptyCounter < emptyCells.length && emptyCells.length > 0) {
      move.addColony(emptyCells[emptyCounter++]);
      --moveCounter;
    }
    return move;
  }
  logComputerMoves() {
    let computerPlayers = this.players.filter(p => p.type == Player.COMPUTER);
    if (!this.isCreator || computerPlayers.length == 0) {
      return this;
    }
    for (let cp of computerPlayers) {
      let move = this._autoMove(cp.playerID);
      this.logMove(move);
    }
    return this;
  }
  isReadyForNextTurn() {
    return (Object.keys(this.confirmedMoves).length == this.players.length);
  }
  getAvailableMove() {
    if (this.currentMove === null) {
      return Moves.COLONY;
    }
    let am = this.currentMove.getAvailableMove();
    let emptyCells = this.board.getCells().filter(c => c.occupation == CellState.NO_USER);
    if (emptyCells.length == 0
      || emptyCells.filter(c => this.currentMove.cellHasMove(c) == Moves.NO_MOVE).length == 0) {
      am = Moves.NO_MOVE;
    }
    if (this.currentMove.isEmpty() && emptyCells.length == 0) {
      am = Moves.GAME_OVER;
    }
    return am;
  }
  getNumAvailableMoves() {
    if (this.currentMove != null) {
      return this.colonizationsPerTurn - this.currentMove.colonies.length;
    }
    return this.colonizationsPerTurn;
  }
  freezeMove() {
    this.currentMove.setFrozen();
    this.confirmedMoves[this.playerID] = this.currentMove;
    if (this.isCreator) {
      this.logComputerMoves();
    }
    return this;
  }
  isFrozen() {
    if (this.currentMove !== null && this.currentMove.frozen) {
      return true;
    }
    return false;
  }
  getPlayerColor(pID) {
    return this.players.filter(p => p.playerID == pID)[0].color;
  }
  dropUnresponsivePlayers() {
    // Only drop players if the game hasn't started yet.
    if (this.isCreator && !this.started) {
      for (let p of this.players) {
        if (p.playerID == this.playerID || p.type == Player.COMPUTER) {
          continue;
        }
        if (new Date().getTime() - p.latestPing > PING_TIMEOUT) {
          this.dropPlayer(p.playerID);
        }
      }
    }
    return this;
  }
  setLatestPing(pID) {
    for (let player of this.players) {
      if (player.playerID === pID) {
        player.latestPing = new Date().getTime();
      }
      if (player.playerID === this.playerID) {
        player.latestPing = new Date().getTime(); // Might as well confirm that we exist too.
      }
    }
    return this;
  }
  getWinner() {
    let highest = Math.max.apply(null, this.players.map(p=>p.score));
    let winners = this.players.filter(p=>p.score===highest);
    if (winners.length !== 1) {
      return null;
    }
    return winners[0];
  }
}
