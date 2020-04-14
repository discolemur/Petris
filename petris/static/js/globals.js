
/**
 * Connection Defaults
 */
var TIME_UNTIL_CREATE = 1000;
var JOIN_ROOM_TIMEOUT = 1000;
var PING_TIMEOUT = 9 * 1000; // 9 seconds
var ROOM_PING_FREQUENCY = 3 * 1000; // 3 seconds
var GAME_PING_FREQUENCY = 5 * 1000; // 5 seconds

// This is how long to wait for a response before assuming the room is empty.
var TIME_UNTIL_CREATE = 1000;
var JOIN_ROOM_TIMEOUT = 1000;


/**
 * Game Play Defaults
 */
var DEFAULT_BOARD_CELL_WIDTH = 60;
var DEFAULT_BOARD_WIDTH = 24;
var DEFAULT_BOARD_HEIGHT = 7;
var DEFAULT_COLONIZATIONS_PER_TURN = 2;
var MAX_PLAYERS = 10;


/**
 * Color Defaults
 */
var EMPTY_COLOR = '#C4C4C4'; // '#C2B790';
var COMPENTITION_COLOR = '#222';
var ANTIBIOTIC_COLOR = '#97F365';

var NO_PLAYER_COLOR = '#AAAAAA';
var PLAYER_COLOR_LIST = [
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

/**
 * Random
 */
var COMPUTER_PLAYER_NAMES = [
    'Escherichia',
    'Aeromonas',
    'Brucella',
    'Haemophilus',
    'Klebsiella',
    'Bacillus',
    'Staph',
    'Clostridium',
    'Veillonella',
    'Listeria',
    'Clostridium',
    'Moraxella',
    'Proteus'
]

/**
 * CellState gives global variables important to the state of the board. 
 */
var CellState = {
    NO_USER: -1,
    ANTIBIOTIC: -2,
    COMPETITION: -3,
};

var Moves = {
    COLONY: 10,
    ANTIBIOTIC: 20,
    NO_MOVE: false,
    GAME_OVER: -100
};

function windowIsLandscape() {
    return window.innerWidth > window.innerHeight;
}

/**
 * From community wiki answer at https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

/**
 * From https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * Community Wiki Jeff answer.
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}