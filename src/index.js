mapboxgl.accessToken = 'pk.eyJ1Ijoid2VhcmVtYXJjaG9uIiwiYSI6ImNqdTFscXo3ZzAwYTE0ZWxzMWhrNnVtNHIifQ.ql7OysgSLnCazbiXZt8NFA';

var allMaps = [];
var filterBy = null;

function hideInsets() {
    var insets = Array.from(document.getElementsByClassName('inset'));
    insets.forEach(function(ele) {
        ele.classList.add('hidden')
    })
}

function showInsets() {
    var insets = Array.from(document.getElementsByClassName('inset'));
    insets.forEach(function (ele) {
        ele.classList.remove('hidden')
    })
}

function setDay() {

    allMaps.forEach(function(thisMap) {
        if (thisMap.setTypeFilters) {
            thisMap.setTypeFilters();
            thisMap.resetBounds();
        }
    })
}

var buttons = Array.from(document.getElementsByClassName('date-button'));
var currentState = null;

function setState(dayIdx) {
    if(dayIdx === currentState){
        return;
    }
    if (currentState) {
        document.getElementById('map').classList.remove(`day-${currentState}`);
    }
    if (dayIdx) {
        document.getElementById('map').classList.add(`day-${dayIdx}`);
    }

    var dayIndex = dayIdx - 1;
    if (!dayIdx) {
        buttons.forEach((button) => {
            button.classList.remove('active');
        })
        buttons[0].classList.add('active');
    } else {
        for(var i = 0; i < buttons.length; i++){
            if(dayIdx == i){
                buttons[i].classList.add('active');
            } else {
                buttons[i].classList.remove('active');
            }
        }
    }
    currentState = dayIdx;
    showInsets();
    setDay(dayIndex);
}

function toggleFilter(type, ele) {
    Array.from(document.getElementsByClassName('filter-label')).forEach(function(ele) {
        ele.classList.remove('active');
    })

    ele.classList.add('active');

    filterBy = type === 'all' ? null : type;

    allMaps.forEach(function (thisMap) {
        if (thisMap.setTypeFilters) {
            thisMap.setTypeFilters();
        }
    })
}

function markerHtml(e){
    var event = e.features[0].properties;
    var name = event.name;
    var location = event.location;

    var split = location.split(',');
    var locationName = split[0].trim();
    var formattedDate = formatDataTime(event.timestamp);

    return `<div class="map-popup">
        <h4>${name.toUpperCase()}</h4>
            <ul class="unstyled-list">
                <li>${formattedDate}</li>
                <li>${locationName}</li>
                <li>${event.city}, ${event.state}</li>
            </ul>
        </div>`
}

var numDone = 0;
var totalMaps = 5;
function drawMaps() {
    const states = ['AK', 'HI', 'PR', 'GU'];
    let mainMap = new MainMap('map', [-127.119844, 25.393099, -64.920107, 50.095843]);
    states.forEach(function(state) {
        let inset = new InsetMap(state, `${state.toLowerCase()}-inset`, bBoxes[state], mainMap);
        inset.init();
        allMaps.push(inset);
    })
    mainMap.init();
    allMaps.push(mainMap);
}

drawMaps();
