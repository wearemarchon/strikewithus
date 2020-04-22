let allEvents = [];
fetch('https://usclimatestrike.s3.amazonaws.com/events.json')
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        allEvents = data.features.map((feature) => {
            const event = feature.properties;
            const locationArray = event.location.split(',');
            if (locationArray[0].includes('http')) {
                if (!event.localStreamLink) {
                    event.localStreamLink = locationArray[0]
                }
                event.location = locationArray.slice(1).join(',')
            }
            event.id = feature.id;
            return event;
        })
        renderAllEvents();
    });

let renderAllEvents = () => {
    renderList(allEvents);
}

let updateListSelection = (liID) =>{
    Array.from(document.getElementsByClassName('event-card')).forEach(function (ele) {
        ele.classList.remove('active');
    })

    let targetLi = document.getElementById(liID);
    targetLi.classList.add('active');
    targetLi.scrollIntoView({
        // behavior: 'smooth', // when the list is long this animation is too long
        block: 'center' 
    });
};

let makeCard = (event) => {
    let formattedDate = formatDataTime(event.timestamp);
    return `
    <div class="event-card" id="${event.id}-card">
        <div>
        <h4>${event.name}</h4>
        <ul class="unstyled-list">
            <li>${formattedDate}</li>
            <li>${event.location}</li>
          
        </ul>
        </div>
        <div class="button-container">
          <div class="link-button peach-gradient"><a href="${event.eventLink}">RSVP</a></div>
            ${event.localStreamLink ? `<div class="link-button green-gradient"><a href="${event.localStreamLink}">Stream</a></div>` : ''}
        </div>
       
    </div>`
}

let makeList = (events) => events.map((event) => makeCard(event));

let getEventsForDate = () => {
    var dayLookupIndexed = [
        null,
        '4/22/2020',
        '4/23/2020',
        '4/24/2020'
    ]; // currentState is 1 indexed not 0 indexed
    let day = dayLookupIndexed[currentState];

    let filteredEvents = allEvents.filter((event) => {
        if (day) {
            return event.eventDate === day;

        }
        return true;
    })
    return filteredEvents;

}

let getEventsForDateMem = (() => {
    let cache = {};
    return () => {
        if (cache[currentState]) {
            return cache[currentState];
        } else {
            let result = getEventsForDate();
            cache[currentState] = result;
            return result;
        }
    }
})();


let getEvents = (searchedLocation) => {
    let filteredForDay = getEventsForDateMem();
    return filteredForDay.filter((event) => {
        let stateName = ABR_TO_NAME[event.state];
        if (searchedLocation.city) {
            return event.city.toLowerCase() === searchedLocation.city.toLowerCase() && stateName.toLowerCase() === searchedLocation.state.toLowerCase();
        }
        return searchedLocation.state.toLowerCase() === stateName.toLowerCase();
    })
}

let renderList = (events) => {
    let listView = document.getElementById('list-view');
    let cards = makeList(events);
    listView.innerHTML = '';
    if (!events.length) {
        return listView.innerHTML = '<div class="no-events-response">There are no events within your search location, try different location or expand your search area.</div>'
    }
    listView.innerHTML = cards.join('');
}

let renderSearchResults = (searchedLocation) => {
    let events = getEvents(searchedLocation);
    renderList(events);
}
