function formatDataTime(timestamp) {
    var dateString = timestamp;
    var date = new Date(dateString);
    var timeDelimiter = dateString.indexOf('T') + 1;
    var hours = parseInt(dateString.substring(timeDelimiter, timeDelimiter + 2));
    var mins = dateString.substring(timeDelimiter + 3, timeDelimiter + 5);

    var ampm = hours >= 12 && hours !== 0 ? 'PM' : 'AM';

    // Because new Date assumes UTC, if the hour is from 12:00AM to 5:00AM the constructor thinks it the day before,
    // causing the wrong date to show. In this case, we increment the day by one.
    if (hours >= 0 && hours < 5) {
        date.setDate(date.getDate() + 1);
    }

    if (hours > 12) {
        hours -= 12;
    }

    if (hours === 0) {
        hours = 12;
    }

    var formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) + ' ' + hours + ':' + mins + ' ' + ampm;
    return formattedDate;
}

try {
    module.exports = exports = formatDataTime;
} catch (e) { };
