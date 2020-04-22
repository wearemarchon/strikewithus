
const mapPadding = {
    top: 40,
    bottom: 150,
    right: 0,
    left: 0,
}

const mobileMapPadding = { 
    top: 40,
    bottom: 40,
    right: 0,
    left: 0,
}

function MainMap(id, bounds) {
    this.mapId = id;
    this.bounds = bounds;
    this.hoveredPopup = null;
}

MainMap.prototype.resetBounds = function () {
    this.resetView();
}

MainMap.initFilters = function() {
    // We want to only set initial state once, but need to do it only once all maps are loaded
    if (numDone === totalMaps) {
        setState(initialDay);
    }
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

MainMap.getTypeFilter = function () {

    if (!filterBy) {
        return null; // all on, just show all events
    }

    return ['==', ['get', filterBy], true];
}

MainMap.prototype.makeZoomToNationalButton = function () {
    document.querySelector('.mapboxgl-ctrl-compass').remove();
    if (document.querySelector('.mapboxgl-ctrl-usa')) {
        document.querySelector('.mapboxgl-ctrl-usa').remove();
    }
    var usaButton = document.createElement('button');
    usaButton.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-usa';


    usaButton.innerHTML = '<span class="usa-icon"></span>';

    usaButton.addEventListener('click', () => this.resetView());
    document.querySelector('.mapboxgl-ctrl-group').appendChild(usaButton);
};

MainMap.prototype.setTypeFilters = function () {
    var dayFilter = MainMap.getDayFilter();
    var filterByType = MainMap.getTypeFilter();
    this.hoveredPopup.remove(); //close any open popup
    if (!dayFilter && !filterByType) { //all the checkboxes are on
        this.map.setFilter('event-pins-background', null);
        return this.map.setFilter('event-pins', null);
    }
    var filterArray = [];
    if (dayFilter && filterByType) {
        filterArray = ['all', filterByType, dayFilter];
    } else if (filterByType) {
        filterArray = filterByType;
    } else {
        filterArray = dayFilter;
    }
    this.map.setFilter('event-pins-background', filterArray)
    return this.map.setFilter('event-pins', filterArray);
}

MainMap.prototype.addPointsLayer = function () {
    let mainMap = this;
    mainMap.map.addLayer(EVENT_LAYER);
    mainMap.map.addLayer(BACKGROUND_LAYER);
    numDone++;  
    MainMap.initFilters();
}

MainMap.prototype.resize = function () {
    this.mapPadding = window.innerWidth < 700 ? mobileMapPadding : mapPadding;
    this.map.fitBounds(this.bounds, {
        duration: 1000,
        padding: this.mapPadding,
    });
    this.map.resize();
}

MainMap.prototype.resetView = function() {
    showInsets();
    let events = getEventsForDateMem();
    renderList(events);
    this.map.fitBounds(this.bounds, {
        duration: 1000,
        padding: this.mapPadding,
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

    window.addEventListener('resize', () => {
        me.resize()
    });

    this.mapPadding = window.innerWidth < 700 ? mobileMapPadding : mapPadding;

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
        .on('result', function (returned) {
            let result = returned.result;
            let type = result.place_type[0];
            let searchLocation = {
                state: '',
                city: ''
            }
            if (type === 'region') {
                searchLocation.state = result.text;
            } else if (type === 'place') {
                searchLocation.city = result.text;
                searchLocation.state = STATE_NAMES.find((stateName) => result.place_name.includes(stateName))
            } else if (type === 'postcode') {
                searchLocation.city = result.place_name.split(',')[0];
                searchLocation.state = STATE_NAMES.find((stateName) => result.place_name.includes(stateName))
            }
            renderSearchResults(searchLocation)
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
        animate: false,
        padding: this.mapPadding,
    });

    this.makeZoomToNationalButton();

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
                var feature = e.features[0];
                updateListSelection(`${feature.id}-card`)
                hideInsets();
                map.flyTo({
                    center: coordinates,
                    // zoom: 14
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
