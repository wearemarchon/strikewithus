function InsetMap(state, id, bounds, mainMap) {
    this.state = state;
    this.mapId = id;
    this.bounds = bounds;
    this.mainMap = mainMap;
}

InsetMap.prototype.setColors = MainMap.prototype.setColors;

InsetMap.prototype.setTypeFilters = function(filterBy) {
    var stateFilter = ['==', ['get', 'state'], this.state];
    var filterArray = ['all', stateFilter];
    var dayFilter = MainMap.getDayFilter();
    var filterByType = MainMap.getTypeFilter();

    if (dayFilter) {
        filterArray.push(dayFilter);
    }

    if (filterByType) {
        filterArray.push(filterByType);
    }
    if (this.map.getLayer('event-pins')) {
        this.map.setFilter('event-pins-background', filterArray);

        return this.map.setFilter('event-pins', filterArray);
    }
};

InsetMap.prototype.addPointsLayer = function () {
    let thisInset = this;
    this.map.loadImage('./pin_sdf.png', function (err, img) {
        let imageName = this.state + 'pin'
        thisInset.map.addImage(imageName, img, {sdf: true });
        thisInset.map.addLayer({
            'id': 'event-pins-background',
            'type': 'circle',
            'source': 'event-points',
            'paint': {
                'circle-radius': 10,
                'circle-color': ['to-color',
                    ['case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#e7e7e7',
                        ['match',
                            ['get', 'eventDate'],
                            '4/22/2020', COLORS['4/22/2020'].pins,
                            '4/23/2020', COLORS['4/23/2020'].pins,
                            '4/24/2020', COLORS['4/24/2020'].pins,
                            '#000000'
                        ]
                    ]
                ],
            }
        });
        thisInset.map.addLayer({
            'id': 'event-pins',
            'type': 'circle',
            'source': 'event-points',
            'paint': {
                'circle-radius': 6,
                'circle-stroke-color': '#ffffff',
                'circle-stroke-width': 3,
                'circle-color': ['to-color',
                    ['case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#e7e7e7',
                        ['match',
                            ['get', 'eventDate'],
                            '4/22/2020', COLORS['4/22/2020'].pins,
                            '4/23/2020', COLORS['4/23/2020'].pins,
                            '4/24/2020', COLORS['4/24/2020'].pins,
                            '#000000'
                        ]
                    ]
                ],
            }
        });
        thisInset.map.setFilter('event-pins', ['==', ['get', 'state'], thisInset.state]);
        numDone++;
        MainMap.initFilters();

    })
}

InsetMap.prototype.init = function () {
    var styleUrl = 'mapbox://styles/wearemarchon/ck7fiejvh0j6d1jo2wzsahijn'

    this.map = new mapboxgl.Map({
        container: this.mapId,
        doubleClickZoom: false,
        dragPan: false,
        scrollZoom: false,
        style: styleUrl,
    });

    this.map.fitBounds(this.bounds, {
        easeTo: {
            duration: 0
        },
        linear: true,
    });


    // map on 'load'
    this.map.on('load', () => {
        this.map.addSource('event-points', {
            type: 'geojson',
            data: 'https://usclimatestrike.s3.amazonaws.com/events.json'
        });
        this.addPointsLayer();


    })
    let mainMap = this.mainMap;
    let bounds = this.bounds;
    this.map.on('click', function (e) {
        hideInsets();
        mainMap.map.fitBounds(bounds, {
                    easeTo: {
                        duration: 0
                    },
                })

    });
}
