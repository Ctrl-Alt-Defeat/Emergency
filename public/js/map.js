mapboxgl.accessToken = 'pk.eyJ1IjoiYXJlZWpvYmFpZCIsImEiOiJja2x0c253aW8wOTJ5MndxZmRta3VhbndtIn0.j1FQy0dPKPrSaajm7xTvzA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    zoom: 16
});
navigator.geolocation.getCurrentPosition(data => {
    let coordinates = [];
    coordinates.push(data.coords.longitude, data.coords.latitude);
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: coordinates,
        zoom: 16
    });
    console.log(coordinates);
})
let otherLocations = [[35.8772574, 32.0648532],[35.8772575, 32.0648532],[35.8772572, 32.0648532]];
let allLocationMap = otherLocations.map(ele => {
    return {
        // feature for Mapbox DC
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': ele
        },
        'properties': {
            'title': 'location'
        }
    }
})
navigator.geolocation.watchPosition(data => {
    coordinates = [];
    coordinates.push(data.coords.longitude, data.coords.latitude);
    allLocationMap.unshift({
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': coordinates
        },
        'properties': {
            'title': 'location'
        }
    })
    console.log(coordinates)
    map.on('load', function () {
        // Add an image to use as a custom marker
        map.loadImage(
            'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
            function (error, image) {
                if (error) throw error;
                map.addImage('custom-marker', image);
                // Add a GeoJSON source with 2 points
                map.addSource('points', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features':allLocationMap
                    }
                });

                // Add a symbol layer
                map.addLayer({
                    'id': 'points',
                    'type': 'symbol',
                    'source': 'points',
                    'layout': {
                        'icon-image': 'custom-marker',
                        // get the title name from the source's "title" property
                        'text-field': ['get', 'title'],
                        'text-font': [
                            'Open Sans Semibold',
                            'Arial Unicode MS Bold'
                        ],
                        'text-offset': [0, 1.25],
                        'text-anchor': 'top'
                    }
                });
            }
        );
    });
});

document.getElementById('searchForm').addEventListener('submit', e=>{
    e.preventDefault();
    console.log(e.taget.work);
})