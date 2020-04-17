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
        <h4>${event.name}</h4>
        <ul class="unstyled-list">
            <li>${formattedDate}</li>
            <li>${event.location}</li>
            <li class="link-button"><a href="${event.eventLink}">RSVP</a></li>
            ${event.localStreamLink ? `<li class="link-button"><a href="${event.localStreamLink}">Stream</a></li>` : ''}
        </ul>
       
    </div>`}

let makeList = (events) => events.map((event) => makeCard(event));

let getEvents = (searchedLocation) => {
    return allEvents.filter((event) => {
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