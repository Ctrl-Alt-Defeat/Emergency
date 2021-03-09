mapboxgl.accessToken = 'pk.eyJ1IjoiYXJlZWpvYmFpZCIsImEiOiJja2x0c253aW8wOTJ5MndxZmRta3VhbndtIn0.j1FQy0dPKPrSaajm7xTvzA';
console.log(cordenation);
cordenation = cordenation.split(','); 
var map = new mapboxgl.Map({
    container: 'map',
    center: cordenation,
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 16
});

let feature = [{
    'type': 'Feature',
    'properties': {
        'description':
            '<strong>You are Here</strong>',
        'icon': 'embassy'
    },
    'geometry': {
        'type': 'Point',
        'coordinates': cordenation
    }
}]

map.on('load', function () {
    map.addSource('places', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': feature
        }
    });
    // Add a layer showing the places.
    map.addLayer({
        'id': 'places',
        'type': 'symbol',
        'source': 'places',
        'layout': {
            'icon-image': '{icon}-15',
            'icon-allow-overlap': true
        }
    });

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'places', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = '';
    });
});
let img_url = img || 'https://th.bing.com/th/id/R3c1dd0093935902659e99bef56aa4ce6?rik=TkZVVEIDxl7BHg&riu=http%3a%2f%2fwww.hrz';
isUserAccount == "false" ? window.localStorage.setItem('id' , id_account ):console.log('no')
isUserAccount == "false" ? window.localStorage.setItem('username' ,username ):console.log('no')
isUserAccount == "false" ? window.localStorage.setItem('img' ,img_url ):console.log('no')

document.getElementById('ownerid').value = localStorage.getItem("id");;
