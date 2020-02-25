import logging
import os
from typing import Dict

from botocore.vendored import requests

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
      
def make_location(event: Dict) -> str:
    location = (event.get('location', {}) or {})
    # need to update to handle null values
    full_location = '{venue}, {address}, {locality}, {region} {postal_code}'.format(
        venue = safestrip(location.get('venue')), address = safestrip(location.get('address_lines')[0]), locality = safestrip(location.get('locality')), 
        region = safestrip(location.get('region')), postal_code = safestrip(location.get('postal_code'))
        ) 
    return full_location

def make_coord(event: Dict) -> list:
    location = (event.get('location', {}) or {})
    coords = (location.get('location', {}) or {})
    lat = coords.get('latitude')
    lng = coords.get('longitude')
    return [lng, lat]
    
event_id = 0    
def make_id(event: Dict) -> str:
    #return (event.get('identifiers', [""]))[0]
    global event_id
    event_id = event_id + 1
    return event_id
    
def convert_event(event: Dict) -> Dict:
    coord = make_coord(event)
    return {
      "type": "Feature",
      'id' : make_id(event),
      "properties": {
        'name': event.get('title') or '',
        'eventDate': parser.parse(event.get('start_date', '4/22/2020')).strftime('%-m/%-d/%Y'),
        'timestamp': event.get('start_date', '2020-04-22T00:00:00Z"'),
        'eventLink': event.get('browser_url', ''),
        'location': make_location(event)
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

    response = requests.get(
        'https://actionnetwork.org/api/v2/event_campaigns/{event_campaign_id}/events?page={page}'.
        format(
            event_campaign_id=os.environ['ACTION_NETWORK_EVENTS_CAMPAIGN_ID'],
            page=page),
        headers={
            'OSDI-API-Token': os.environ['ACTION_NETWORK_API_KEY']
        })
    if response.status_code != 200:
        log.error(
            'ERROR\tResponse code %d received from https://actionnetwork.org/api/v2/event_campaigns',
            response.status_code)
        return {}

    log.info(
        '\nsuccess! get_events_from events_campaign (action network) -- page %d',
        page)

    response_json = response.json()

    events = response_json.get('_embedded', {}).get('osdi:events', {})
    for event in events:
        return_events.append(convert_event(event))

    if response_json.get('total_pages', page) > page:
        get_events_from_events_campaign(return_events, page + 1)

    return return_events


def lambda_handler(event, context):
    the_events = get_events_from_events_campaign()
    upload(the_events, "events.json", None)
