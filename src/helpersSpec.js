const formatDataTime = require('./helpers')

function testFormatDataTime() {

    // Given
    const timestamps = [
        '2020-04-23T00:01:00Z',
        '2020-04-23T01:01:00Z',
        '2020-04-23T03:01:00Z',
        '2020-04-23T05:01:00Z',
        '2020-04-23T12:01:00Z',
        '2020-04-23T15:01:00Z',
        '2020-04-23T19:01:00Z',
        '2020-04-23T21:01:00Z',
        '2020-04-23T13:01:00Z',
        '2020-04-23T23:59:00Z'
    ]

    const expectedFormattedTimeStamps = [
        'Thursday, April 23, 2020 12:01 AM',
        'Thursday, April 23, 2020 1:01 AM',
        'Thursday, April 23, 2020 3:01 AM',
        'Thursday, April 23, 2020 5:01 AM',
        'Thursday, April 23, 2020 12:01 PM',
        'Thursday, April 23, 2020 3:01 PM',
        'Thursday, April 23, 2020 7:01 PM',
        'Thursday, April 23, 2020 9:01 PM',
        'Thursday, April 23, 2020 1:01 PM',
        'Thursday, April 23, 2020 11:59 PM',
        ]

    // When
    timestamps.forEach((timestamp, index) => {
        let formattedTimeStamp = formatDataTime(timestamp)
        // Then
        console.assert(formattedTimeStamp === expectedFormattedTimeStamps[index])
    })
}

testFormatDataTime()
