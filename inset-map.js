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
    return this.map.setFilter('event-pins', filterArray);
};

InsetMap.prototype.addPointsLayer = function () {
    let thisInset = this;
    this.map.loadImage('./pin_sdf.png', function (err, img) {

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var alpha = new Uint8ClampedArray(data.data);
        for (var i = 3; i < alpha.length; i += 4) {
            alpha[i] = alpha[i - 3];
        }
        let imageName = this.state + 'pin'

        thisInset.map.addImage(imageName, {
            width: data.width,
            height: data.height,
            data: alpha
        }, {
            sdf: true
        });
        thisInset.map.addLayer({
            'id': 'event-pins',
            'type': 'symbol',
            'source': 'event-points',
            'layout': {
                'icon-allow-overlap': true,
                'icon-anchor': 'bottom',
                'icon-image': imageName,
                'icon-size': 0.5
            },
            'paint': {
                'icon-color': ['to-color',
                    ['case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#82b7d1',
                        ['match',
                            ['get', 'eventDate'],
                            '4/22/2020', COLORS['4/22/2020'].pins,
                            '4/23/2020', COLORS['4/23/2020'].pins,
                            '4/24/2020', COLORS['4/24/2020'].pins,
                            '#000000'
                        ]
                    ]
                ],
                'icon-halo-blur': 0,
                'icon-halo-width': 2,
                'icon-halo-color': '#000000'
            }
        });
        thisInset.map.setFilter('event-pins', ['==', ['get', 'state'], thisInset.state]);

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
