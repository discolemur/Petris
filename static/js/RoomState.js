"use strict";

/**
 * From community wiki answer at https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

class Player {
  constructor(playerID, playerName) {
    this.playerID = playerID;
    this.playerName = playerName;
  }
  toString() {
    return this.playerID;
  }
}

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
  }
  reset() {
    this.players = [];
    this.playerName = null;
    this.roomName = null;
    this.started = false;
    this.isCreator = false;
    this.joined = false;
    this.connectionMessage = null;
  }
  setPlayers(players) {
    let tmp = {};
    for (let player of players) {
      tmp[player.playerID] = player;
    }
    this.players = Array.from(Object.values(tmp));
    return this;
  }
  addPlayer(player) {
    this.players.push(player);
    return this.setPlayers(this.players); // Guarantees no duplicates.
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
}

RoomState.MAX_PLAYERS = 10;
