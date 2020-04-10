var COLORS = {
    'all' :{
        background: '#b3b3b3',
        us: '#ffffff',
    },
    '4/22/2020': {
        background: '#69c6b0',
        us: '#ffffff',
        pins: '#69c6b0'
    },
    '4/23/2020': {
        background: '#e66fa1',
        us: '#f7f7f7',
        pins: '#e66fa1'
    },
    '4/24/2020': {
        background: '#f76c36',
        us: '#f7f7f7',
        pins: '#f76c36'
    }
};

let bBoxes = {
    AK: [
        -179.231086,
        51.175092,
        -127.859681,
        71.441059,
    ],
    GU: [
        144.563426,
        13.182335,
        145.009167,
        13.706179
    ],
    HI: [
        -161.03759765625,
        18.542116654448996,
        -154.22607421875,
        22.573438264572406,
    ],
    PR: [
        -67.998751,
        17.831509,
        -65.168503,
        18.568002
    ],
};

var urlParams = new URLSearchParams(window.location.search);
var queryDay = parseInt(urlParams.get('day'));
var referrer = urlParams.get('referral');
var initialDay = queryDay > 0 && queryDay <= 3 ? queryDay : null;

var DEFAULT_DAY = '4/22/2020';