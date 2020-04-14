import logging
import os
from typing import Dict

import urllib3
http = urllib3.PoolManager()

from dateutil import parser
from datetime import datetime, timedelta

import pprint
import json
import boto3

log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)

def upload(dataset, filename, dry_run):
    data = {
        'type': 'FeatureCollection',
        'features': dataset
    }
    if dry_run:
        print(data)
    else:
        s3 = boto3.resource('s3')
        response = s3.Object('usclimatestrike', filename).put(
                Body=json.dumps(data, indent=2),
                ContentType='application/json',
                ACL='public-read',
                Expires=(datetime.now() + timedelta(hours=6)))
        log.info(response)

def safestrip(string: str) -> str:
    try:
      return string.strip()
    except:
      return ""

def is_us(event: Dict) -> bool:
    location = (event.get('location', {}) or {})
    country = location.get('country')
    return country == "US"

def make_location(event: Dict) -> str:
    location = (event.get('location', {}) or {})
    # need to update to handle null values
    full_location = '{address}, {locality}, {region} {postal_code}'.format(
        address=safestrip(location.get('address_lines')[0]),
        locality=safestrip(location.get('locality')),
        region=safestrip(location.get('region')),
        postal_code=safestrip(location.get('postal_code'))
    )
    return full_location

def parse_location_data(event: Dict, data: str) -> str:
    location = (event.get('location', {}) or {})
    return safestrip(location.get(data))

def make_coord(event: Dict) -> list:
    location = (event.get('location', {}) or {})
    coords = (location.get('location', {}) or {})
    lat = coords.get('latitude')
    lng = coords.get('longitude')
    return [lng, lat]

def check_host(event: Dict, kind: str):
    description = event.get('description')
    if (kind == "faith") and ("**FAITH EVENT**" in description):
        return True
    elif (kind == "labor") and ("**LABOR EVENT**" in description):
        return True
    elif (kind == "showcase") and ("**SHOWCASE EVENT**" in description):
        return True
    else:
        return False

event_id = 0
def make_id(event: Dict) -> str:
    #return (event.get('identifiers', [""]))[0]
    global event_id
    event_id = event_id + 1
    return event_id



def convert_event(event: Dict) -> Dict:
    """Builds the JSON object used by the client to render information in the map.

    Note: local event hosts are using the "venue" location field to store the URL where someone can watch their event.
    This is being extracted and sent to the client as "localStreamLink" and is a deliberate use of Action Network's
    fields. It is distinct from the "eventLink" that provides a form for people to signup for the evvent.
    """
    coord = make_coord(event)
    return {
      "type": "Feature",
      'id' : make_id(event),
      "properties": {
        'name': event.get('title') or '',
        'eventDate': parser.parse(event.get('start_date', '4/22/2020')).strftime('%-m/%-d/%Y'),
        'timestamp': event.get('start_date', '2020-04-22T00:00:00Z"'),
        'eventLink': event.get('browser_url', ''),
        'localStreamLink': parse_location_data(event, 'venue'),
        'location': make_location(event),
        'state': parse_location_data(event, 'region'),
        'zipCode':  parse_location_data(event, 'postal_code'),
        'labor': check_host(event, 'labor'),
        'faith': check_host(event, 'faith'),
        'showcase': check_host(event, 'showcase')
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
            coord[0],
            coord[1]
        ]
      }
    }

def get_events_from_events_campaign(return_events=None,
                                    page=1) -> Dict[str, Dict]:
    if not return_events:
        return_events = []

    log.info('\nget_events_from events_campaign (action network) -- page %d',
             page)

    response = http.request('GET',
                        'https://actionnetwork.org/api/v2/event_campaigns/' + os.environ['ACTION_NETWORK_EVENTS_CAMPAIGN_ID'] + '/events?page=' + str(page),
                        headers={ 'OSDI-API-Token': os.environ['ACTION_NETWORK_API_KEY']},
                        retries = False)

    if response.status != 200:
        log.error(
            'ERROR\tResponse code %d received from https://actionnetwork.org/api/v2/event_campaigns',
            response.status_code)
        return {}

    log.info(
        '\nsuccess! get_events_from events_campaign (action network) -- page %d',
        page)

    response_json = json.loads(response.data.decode('utf-8'))

    events = response_json.get('_embedded', {}).get('osdi:events', {})
    for event in events:
        if (is_us(event)):
            return_events.append(convert_event(event))

    if response_json.get('total_pages', page) > page:
        get_events_from_events_campaign(return_events, page + 1)

    return return_events


def lambda_handler(event, context):
    the_events = get_events_from_events_campaign()
    upload(the_events, "events.json", None)

