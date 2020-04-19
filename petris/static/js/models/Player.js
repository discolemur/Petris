/**
 * Player has the following attributes:
 * playerID
 * playerName
 * color
 * score
 * latestPing
 */
class Player {
  constructor(playerName) {
    this.playerID = uuidv4();
    this.playerName = playerName;
    this.color_index = NO_PLAYER_INDEX;
    this.score = 0;
    this.latestPing = new Date().getTime();
    this.type = Player.HUMAN;
  }
  setPlayerID(pID) {
    this.playerID = pID;
    return this;
  }
  setIsComputer() {
    this.type = Player.COMPUTER;
    return this;
  }
  clearScore() {
    this.score = 0;
    return this;
  }
}

Player.HUMAN = 333;
Player.COMPUTER = 444;