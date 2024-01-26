const data = JSON.parse(document.getElementById('map').dataset.targetLocation)

const TARGET_LOCATION = data.coordinates

var map = L.map('map').setView(TARGET_LOCATION, 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

var targetLocationIcon = L.icon({
    iconUrl: 'goal.svg',
    iconSize: [32, 32],
});

L.marker(TARGET_LOCATION, { icon: targetLocationIcon }).addTo(map);

var circle = L.circle(TARGET_LOCATION, {
    color: 'blue',
    fillColor: '#30f',
    fillOpacity: 0.2,
    radius: 50
}).addTo(map);

var currentLocationIcon = L.icon({
    iconUrl: 'blue-dot.png',
    iconSize: [32, 32],
});

let currentLocationMarker;

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);

L.Control.GoToCurrentLocation = L.Control.extend({
    onAdd: function (map) {
        const locationButton = document.createElement('button');

        locationButton.textContent = 'Konumuma Git';

        locationButton.classList.add('custom-map-control-button');

        locationButton.name = 'select-location-button'

        locationButton.addEventListener('click', () => {
            map.setView(currentLocationMarker.getLatLng(), 18);
        });

        return locationButton;
    },

    onRemove: function (map) {
        // Nothing to do here
    },
});

L.Control.GoToTargetLocation = L.Control.extend({
    onAdd: function (map) {
        const locationButton = document.createElement('button');

        locationButton.textContent = 'Hedefe Git';

        locationButton.classList.add('custom-map-control-button');

        locationButton.addEventListener('click', () => {
            map.setView(TARGET_LOCATION, 18);
        });

        return locationButton;
    },

    onRemove: function (map) {
        // Nothing to do here
    },
});

L.control.currentLocation = function (opts) {
    return new L.Control.GoToCurrentLocation(opts);
};

L.control.targetLocation = function (opts) {
    return new L.Control.GoToTargetLocation(opts);
};

L.control.currentLocation({ position: 'bottomleft' }).addTo(map);

L.control.targetLocation({ position: 'bottomleft' }).addTo(map);

navigator.permissions
    .query({ name: "geolocation" })
    .then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
            navigator.geolocation.watchPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }

                    if (currentLocationMarker) {
                        currentLocationMarker.setLatLng(pos);
                    } else {
                        currentLocationMarker = L.marker(pos, { icon: currentLocationIcon });
                        currentLocationMarker.addTo(map);
                    }
                },
                () => null,
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 57000 }
            )
        } else {
            permissionStatus.onchange = () => {
                if (permissionStatus.state === 'granted') {
                    navigator.geolocation.watchPosition(
                        (position) => {
                            const pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            }

                            if (currentLocationMarker) {
                                currentLocationMarker.setLatLng(pos);
                            } else {
                                currentLocationMarker = L.marker(pos, { icon: currentLocationIcon });
                                currentLocationMarker.addTo(map);
                            }
                        },
                        () => null,
                        { enableHighAccuracy: true, maximumAge: 10000, timeout: 57000 }
                    )
                }
            };
        }
    });
