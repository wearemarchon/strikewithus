
from .convertActionNetworkEventCampainToGeoJSON import get_events_from_events_campaign, upload

if __name__ == '__main__':

    # This represents a dry run of the lambda function
    the_events = get_events_from_events_campaign()
    upload(the_events, "test-events.json", True)
