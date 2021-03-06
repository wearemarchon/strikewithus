var COLORS = {
    pinColor: '#463057',
    hoverColor: '#f26948',
};

var STATE_NAMES = [
    'Alaska',
    'Alabama',
    'Arkansas',
    'American Samoa',
    'Arizona',
    'California',
    'Colorado',
    'Connecticut',
    'District Of Columbia',
    'Delaware',
    'Florida',
    'Georgia',
    'Guam',
    'Hawaii',
    'Iowa',
    'Idaho',
    'Illinois',
    'Indiana',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Massachusetts',
    'Maryland',
    'Maine',
    'Michigan',
    'Minnesota',
    'Missouri',
    'Northern Mariana Islands',
    'Mississippi',
    'Montana',
    'North Carolina',
    'North Dakota',
    'Nebraska',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'Nevada',
    'New York',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Puerto Rico',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Virginia',
    'Virgin Islands',
    'Vermont',
    'Washington',
    'Wisconsin',
    'West Virginia',
    'Wyoming',
];

var ABR_TO_NAME = {
    AK: 'Alaska',
    AL: 'Alabama',
    AR: 'Arkansas',
    AS: 'American Samoa',
    AZ: 'Arizona',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DC: 'District of Columbia',
    DE: 'Delaware',
    FL: 'Florida',
    GA: 'Georgia',
    GU: 'Guam',
    HI: 'Hawaii',
    IA: 'Iowa',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    MA: 'Massachusetts',
    MD: 'Maryland',
    ME: 'Maine',
    MI: 'Michigan',
    MN: 'Minnesota',
    MO: 'Missouri',
    MP: 'Northern Mariana Islands',
    MS: 'Mississippi',
    MT: 'Montana',
    NC: 'North Carolina',
    ND: 'North Dakota',
    NE: 'Nebraska',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NV: 'Nevada',
    NY: 'New York',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    PR: 'Puerto Rico',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VA: 'Virginia',
    VI: 'Virgin Islands',
    VT: 'Vermont',
    WA: 'Washington',
    WI: 'Wisconsin',
    WV: 'West Virginia',
    WY: 'Wyoming',
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
