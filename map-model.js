function MainMap(id, bounds) {
    this.mapId = id;
    this.bounds = bounds;
}

MainMap.prototype.setColors = function (colors) {
    // Update background
    this.map.setPaintProperty('background', 'background-color', colors.background);
    // Update pins
    // Update polygon color
    this.map.setPaintProperty('us-polygon', 'fill-color', colors.foreground);
    this.map.setPaintProperty('us-territories', 'fill-color', colors.foreground);
    this.map.fitBounds(this.bounds, {
        duration: 2000
    });
}

MainMap.getDayFilter = function() {
    var dayLookupIndexed = [
        null,
        '4/22/2020',
        '4/23/2020',
        '4/24/2020'
    ]; // currentState is 1 indexed not 0 indexed
    
    var day = currentState ? dayLookupIndexed[currentState] : null;
    if (!day) {
        return null;
    }
    return ['==', ['get', 'eventDate'], day];
}

MainMap.getTypeFilter = function() {
    if (!filterBy) {
        return null;
    }
    return ['==', ['get', 'host_type'], filterBy]

}

MainMap.prototype.setTypeFilters = function () {
    var dayFilter = MainMap.getDayFilter();
    this.hoveredPopup.remove(); //close any open popup
    if (!dayFilter && !filterBy) {
        return this.map.setFilter('event-pins', null);
    }
    var filterArray = [];
    var filterByType = MainMap.getTypeFilter();
    if (dayFilter && filterBy) {
        filterArray = ['all', filterByType, dayFilter];
    } else if (filterBy) {
        filterArray = filterByType;
    } else {
        filterArray = dayFilter;
    }
    return this.map.setFilter('event-pins', filterArray);
}

MainMap.prototype.addPointsLayer = function () {
    let mainMap = this;
    mainMap.map.loadImage('./pin_sdf.png', function (err, img) {

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
        let imageName = 'pin'

        mainMap.map.addImage(imageName, {
            width: data.width,
            height: data.height,
            data: alpha
        }, {
            sdf: true
        });
        mainMap.map.addLayer({
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
                'icon-halo-blur': 0,
                'icon-halo-width': 2,
                'icon-halo-color': '#000000'
            }
        });

        setState(initialDay);
    })
}

MainMap.prototype.resetView = function() {
    showInsets();
    this.map.fitBounds(this.bounds, {
        duration: 2000
    });
}

MainMap.prototype.init = function () {
    var me = this;
    var map = window.map = new mapboxgl.Map({
        container: this.mapId,
        center: [-100.486052, 37.830348],
        zoom: 2,
        style: 'mapbox://styles/wearemarchon/ck7fiejvh0j6d1jo2wzsahijn'
        // interactive: false
    });
    this.map = map;
    map.addControl(new mapboxgl.NavigationControl());

    map.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            countries: 'us',
            marker: false,
            zoom: 12,
        })
        .on('clear', function(result) {
            me.resetView();
        })
        .on('result', function (result) {
            hideInsets();
        }),
        'top-left'
    );

    // disable map rotation using right click + drag
    map.dragRotate.disable();

    // disable map rotation using touch rotation gesture
    map.touchZoomRotate.disableRotation();
    map.fitBounds(new mapboxgl.LngLatBounds(
        new mapboxgl.LngLat(-127.119844, 25.393099),
        new mapboxgl.LngLat(-64.920107, 50.095843)
    ), {
        animate: false
    });

    map.on('load', function () {

        map.addSource('event-points', {
            type: 'geojson',
            data: 'https://usclimatestrike.s3.amazonaws.com/events.json'
        });

        me.addPointsLayer();
        me.hoveredPopup = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false
        });
        map.on('click', 'event-pins', function (e) {
            if (e.features.length > 0) {
                var coordinates = e.features[0].geometry.coordinates.slice();
                hideInsets();
                map.flyTo({
                    center: coordinates,
                    zoom: 14
                });
            }
        });
        // Nothing hovered initially
        var hoveredPinId = null;
        var mapDiv = document.getElementById(me.mapId);

        map.on('mousemove', 'event-pins', function (e) {
            if (e.features.length > 0) {
                var coordinates = e.features[0].geometry.coordinates.slice();
                // un-hover previous
                if (hoveredPinId) {
                    map.setFeatureState({
                        source: 'event-points',
                        id: hoveredPinId
                    }, {
                        hover: false
                    });
                }

                // hover current
                hoveredPinId = e.features[0].id;
                map.setFeatureState({
                    source: 'event-points',
                    id: hoveredPinId
                }, {
                    hover: true
                });

                mapDiv.style.cursor = 'pointer';
                me.hoveredPopup
                    .setLngLat(coordinates)
                    .setHTML(markerHtml(e))
                    .addTo(map);
            }
        });

        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        map.on('mouseleave', 'event-pins', function () {
            if (hoveredPinId) {
                map.setFeatureState({
                    source: 'event-points',
                    id: hoveredPinId
                }, {
                    hover: false
                });
                mapDiv.style.cursor = 'grab';
            }
            hoveredPinId = null;
        });
    })
}
