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
    this.color = Player.NO_COLOR;
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
Player.NO_COLOR = '#AAAAAA';
Player.COLOR_LIST = [
  '#18305A',
  '#874719',
  '#828619',
  '#817ABF',
  '#10554C',
  '#876019',
  '#45145A',
  '#597D17',
  '#6E96B4',
  '#6F1543'
]
Player.HUMAN = 333;
Player.COMPUTER = 444;