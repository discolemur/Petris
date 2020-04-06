"use strict";

/**
 * From community wiki answer at https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

/**
 * Player has the following attributes:
 * playerID
 * playerName
 * color
 * score
 * latestPing
 */
class Player {
  constructor(playerID, playerName) {
    this.playerID = playerID;
    this.playerName = playerName;
    this.color = Player.NO_COLOR;
    this.score = 0;
    this.latestPing = new Date().getTime();
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
Player.PING_TIMEOUT = 10 * 1000; // 10 seconds
Player.PING_FREQUENCY = 3 * 1000; // 3 seconds

var EMPTY_CELL_COLOR = '#C2B790';
var COMPENTITION_CELL_COLOR = '#444444';
var ANTIBIOTIC_CELL_COLOR = '#97F365';

class RoomState {
  constructor() {
    this.players = [];
    this.playerName = null;
    this.roomName = null;
    this.started = false;
    this.isCreator = false;
    this.joined = false;
    this.connectionMessage = null;
    this.playerID = uuidv4();
    this.onlyTesting = false;
    this.currentMove = null;
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
    this.players = [ p1, p2, p3, p4, p5, p6 ];
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
    this.players = plist;
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
  setCurrentMove(move) {
    this.currentMove = move;
    return this;
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
  setLatestPing(pID) {
    for (let player of this.players) {
      if (player.playerID === pID || player.playerID === this.playerID) {
        player.latestPing = new Date().getTime();
      }
    }
    if (this.isCreator) {
      for (let p of this.players) {
        if (new Date().getTime() - p.latestPing > Player.PING_TIMEOUT) {
          this.dropPlayer(p.playerID);
        }
      }
    }
    return this;
  }
}

RoomState.MAX_PLAYERS = 6;
