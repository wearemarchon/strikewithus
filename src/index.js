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
        dayIdx = null;
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
    var coordinates = e.features[0].geometry.coordinates.slice();
    var name = e.features[0].properties.name;
    var link = e.features[0].properties.eventLink+'';
    var location = e.features[0].properties.location;
    var dateString = e.features[0].properties.timestamp;
    var date = new Date(dateString);

    var timeDelimiter = dateString.indexOf('T') + 1;
    var hours = parseInt(dateString.substring(timeDelimiter, timeDelimiter + 2));
    var mins = dateString.substring(timeDelimiter + 3, timeDelimiter + 5);

    var ampm = hours >= 12 && hours !== 0 ? 'PM' : 'AM';
    if(hours > 12) {
        hours -= 12;
    }
    if(hours === 0){
        hours = 12;
    }
    var split = location.split(',');
    var locationName = split[0].trim();
    var locationAddress = split.slice(1, split.length - 2).join(',').trim();
    var locationState = split.slice(split.length - 2, split.length).join(',').trim();

    var formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}) + ' ' + hours +':'+ mins+ ' '+ampm;
    return '<a target="_blank" href='+link+(referrer ? "?source="+referrer+"&referrer="+referrer : "" )+'><strong>'+name.toUpperCase()+'</strong></a><br><i>'+formattedDate+'</i><br>'+locationName+'<br>'+locationAddress+'<br>'+locationState;
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
