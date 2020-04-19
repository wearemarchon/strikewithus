let allEvents = [];
fetch('https://usclimatestrike.s3.amazonaws.com/events.json')
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        allEvents = data.features.map((feature) => {
            return feature.properties;
        })
        renderAllEvents();
    });

let renderAllEvents = () => {
    renderList(allEvents);
}

let makeCard = (event) => {
    let formattedDate = formatDataTime(event);
    return `
    <div class="event-card">
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
            return event.city === searchedLocation.city && stateName === searchedLocation.state;
        }
        return searchedLocation.state === stateName;
    })
}

let renderList = (events) => {
    let listView = document.getElementById('list-view');
    let cards = makeList(events);
    listView.innerHTML = '';
    listView.innerHTML = cards.join('');
}

let renderSearchResults = (searchedLocation) => {
    let events = getEvents(searchedLocation);
    renderList(events);
}
