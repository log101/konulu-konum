var map = L.map('map').setView([41.024857599001905, 28.940787550837882], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let targetLocationMarker;

let targetLocationCircle;

var targetLocationIcon = L.icon({
    iconUrl: 'goal.svg',
    iconSize: [32, 32],
});

var currentLocationIcon = L.icon({
    iconUrl: 'blue-dot.png',
    iconSize: [32, 32],
});

let currentLocationMarker;

let watchId = -1;
function startWatchingLocation() {
    watchId = navigator.geolocation.watchPosition(
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
        { enableHighAccuracy: true, timeout: 27000, maximumAge: 10000 }
    )
}

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);

L.Control.GoToCurrentLocation = L.Control.extend({
    onAdd: function (map) {
        const locationButton = document.createElement('button');

        locationButton.textContent = 'Konum İzni Ver';

        locationButton.classList.add('custom-map-control-button');

        locationButton.type = 'button'

        locationButton.addEventListener('click', (ev) => {
            if (watchId === -1) {
                startWatchingLocation()
                locationButton.textContent = 'Konumuma Git';
            } else {
                map.setView(currentLocationMarker.getLatLng(), 12);
            }
            L.DomEvent.stopPropagation(ev)
        })

        return locationButton;
    },
});

L.control.currentLocation = function (opts) {
    return new L.Control.GoToCurrentLocation(opts);
};

L.control.currentLocation({ position: 'bottomleft' }).addTo(map);

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
        }
    });


map.on('click', (e) => {
    if (targetLocationMarker) {
        targetLocationMarker.setLatLng(e.latlng)
        targetLocationCircle.setLatLng(e.latlng)
    } else {
        targetLocationMarker = L.marker(e.latlng, { icon: targetLocationIcon }).addTo(map);

        targetLocationCircle = L.circle(e.latlng, {
            color: 'blue',
            fillColor: '#30f',
            fillOpacity: 0.2,
            radius: 50
        }).addTo(map);
    }

    const pos = targetLocationMarker.getLatLng()
    document.getElementById('coordinates').innerText = `${pos.lat}. Enlem, ${pos.lng}. Boylam`
    document.getElementById('geolocation-input').value = `${pos.lat},${pos.lng}`
    document.getElementById('location-selected-confirmation').innerText = "Konum seçildi, bir sonraki adıma geçebilirsiniz."
})
