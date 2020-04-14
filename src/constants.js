var COLORS = {
    pinColor: '#463057',
    hoverColor: '#f26948',
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

var EVENT_LAYER = {
    'id': 'event-pins-background',
    'type': 'circle',
    'source': 'event-points',
    'paint': {
        'circle-radius': 10,
        'circle-color': ['case',
            ['boolean', ['feature-state', 'hover'], false],
            COLORS.hoverColor,
            COLORS.pinColor,

        ],
    }
}

var BACKGROUND_LAYER = {
    'id': 'event-pins',
    'type': 'circle',
    'source': 'event-points',
    'paint': {
        'circle-radius': 6,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 3,
        'circle-color': ['case',
            ['boolean', ['feature-state', 'hover'], false],
            COLORS.hoverColor,
            COLORS.pinColor,

        ],
    }
}