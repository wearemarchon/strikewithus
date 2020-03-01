
function InsetMap(state, id, bounds) {
    this.state = state;
    this.mapId = id;
    this.bounds = bounds;
}

InsetMap.prototype.addPointsLayer = function() {
      this.map.addLayer({
          'id': 'event-pins',
          'type': 'symbol',
          'source': 'event-points',
          'layout': {
              'icon-allow-overlap': true,
              'icon-anchor': 'bottom',
              'icon-image': 'pin',
              'icon-size': 0.5
          },
          'paint': {
              'icon-color': ['to-color',
                  ['case',
                      ['boolean', ['feature-state', 'hover'], false],
                      '#82b7d1',
                      ['match',
                          ['get', 'eventDate'],
                          '4/22/2020', COLORS['4/22/2020'].pins,
                          '4/23/2020', COLORS['4/23/2020'].pins,
                          '4/24/2020', COLORS['4/24/2020'].pins,
                          '#000000'
                      ]
                  ]
              ],
              'icon-halo-blur': 0,
              'icon-halo-width': 2,
              'icon-halo-color': '#000000'
          }
      });
}

InsetMap.prototype.init = function() {
    var styleUrl = 'mapbox://styles/arindam1993/ck6i3d5o1007y1ipd0wyieobt'

    this.map = new mapboxgl.Map({
        container: this.mapId,
        doubleClickZoom: false,
        dragPan: false,
        scrollZoom: false,
        style: styleUrl,
    });

  
  
        // map on 'load'
    this.map.on('load', () => {
                this.map.fitBounds(this.bounds, {
                    easeTo: {
                        duration: 0
                    },
                    linear: true,
                });
                this.map.addSource('event-points', {
                    type: 'geojson',
                    data: 'https://usclimatestrike.s3.amazonaws.com/events.json'
                });
      
    })
}