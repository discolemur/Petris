
/**
 * Connection Defaults
 */
// This is how long to wait for a response before assuming the room is empty.
const TIME_UNTIL_CREATE = 1000;
const JOIN_ROOM_TIMEOUT = 1000;

const PING_TIMEOUT = 9 * 1000; // 9 seconds
const ROOM_PING_FREQUENCY = 3 * 1000; // 3 seconds
const GAME_PING_FREQUENCY = 5 * 1000; // 5 seconds

/**
 * Game Play Defaults
 */
const DEFAULT_BOARD_CELL_WIDTH = 60;
const DEFAULT_BOARD_WIDTH = 24;
const DEFAULT_BOARD_HEIGHT = 7;
const DEFAULT_COLONIZATIONS_PER_TURN = 2;
const MAX_PLAYERS = 10;


/**
 * Color Defaults (now handled in colors.css, these constants are important to set the correct class name.)
 */
const ANTIBIOTIC_CLASS = 'Antibiotic';
const ANTIBIOTIC_BLINK_CLASS = 'AntibioticBL';
const COMPENTITION_CLASS = 'Competition';
const EMPTY_CLASS = 'EmptyCell';
const NO_MOVE_CLASS = 'NoMove';
const WHITE_CLASS = 'WhiteBackground';
const ENABLED_BUTTON_CLASS = 'EnabledButton';
const DISABLED_BUTTON_CLASS = 'DisabledButton';
const PLAYER_COLOR_INDICES = [0,1,2,3,4,5,6,7,8,9];
const NO_PLAYER_INDEX = 10;
const PLAYER_CLASS_LIST = ['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10','NoPlayer'];
const PLAYER_BLINK_CLASSES = ['P1BL','P2BL','P3BL','P4BL','P5BL','P6BL','P7BL','P8BL','P9BL','P10BL'];

/**
 * Random
 */
const COMPUTER_PLAYER_NAMES = [
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
const CellState = {
    NO_USER: -1,
    ANTIBIOTIC: -2,
    COMPETITION: -3,
};

const Moves = {
    COLONY: 10,
    ANTIBIOTIC: 20,
    NO_MOVE: false,
    GAME_OVER: -100
};

/**
 * Helper functions
 */

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