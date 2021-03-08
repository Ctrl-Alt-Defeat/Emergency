mapboxgl.accessToken = 'pk.eyJ1IjoiYXJlZWpvYmFpZCIsImEiOiJja2x0c253aW8wOTJ5MndxZmRta3VhbndtIn0.j1FQy0dPKPrSaajm7xTvzA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: 16
});

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};
let otherLocations = [];
navigator.geolocation.getCurrentPosition(data => {
    let coordinates = [];
    coordinates.push(data.coords.longitude, data.coords.latitude);
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coordinates,
        zoom: 16
    });
}, error, options);

navigator.geolocation.watchPosition(data => {
    coordinates = [];
    coordinates.push(data.coords.longitude, data.coords.latitude);
    drowLocation();
}, error, options)

document.getElementById('searchForm').addEventListener('submit', function (evt) {
    evt.preventDefault();
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: coordinates,
        zoom: 16
    });
    getDataFromDB();
});

function getDataFromDB() {
    $.ajax({
        type: "POST",
        url: '/map',
        data: { work: document.getElementById('work').value, experience: document.getElementById('experience').value },
        success: (result) => {
            console.log(result, 'result');
            otherLocations = result;
            map = new mapboxgl.Map({
                container: 'map',
                center: coordinates,
                style: 'mapbox://styles/mapbox/streets-v11',
                zoom: 16
            });
            drowLocation();
        }
    });
}

function drowLocation() {
    console.log(otherLocations);
    let finalLocation = [];
    for(let i = 0 ; i < otherLocations.length ; i++){
        let lon = Number(otherLocations[i].location.split(',')[0]);
        let lat = Number(otherLocations[i].location.split(',')[1]);
        console.log([lon, lat], coordinates);
        let workStatus = otherLocations[i].status ? 'Available' : 'Not Available';
        finalLocation.push({
            'type': 'Feature',
            'properties': {
                'description':
                    `<p><h1>This is ${otherLocations[i].username}<h1/><h5>He is ${workStatus} Now</h5><h4>Years Of Experience: ${otherLocations[i].exp}</h4><h4>Type Of Work: ${otherLocations[i].type_of_work}</h4><h4>Account And Feedback: <a href="/login/acconut/${otherLocations[i].id}?is_not_enable=${true}">${otherLocations[i].full_name}</a></h4><h4>Contact:<a href="/login/acconut/${otherLocations[i].id}?is_not_enable=${true}#contact">Here</a></h4></p>`,
                'icon': 'embassy'
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [lon, lat]
            }
        })
    }
    otherLocations.forEach(ele => {

    })
    finalLocation.unshift({
        'type': 'Feature',
        'properties': {
            'description':
                '<strong>You are Here</strong>',
            'icon': 'embassy'
        },
        'geometry': {
            'type': 'Point',
            'coordinates': coordinates
        }
    })
    map.on('load', function () {
        map.addSource('places', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': finalLocation
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
}