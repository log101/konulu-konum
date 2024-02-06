const data = JSON.parse(document.getElementById('map').dataset.targetLocation)

const TARGET_LOCATION = data.coordinates

function startWatchingLocation() {
    map.locate({ watch: true })
}

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

function onLocationError(err) {
    let errorMessage;
    switch (err.code) {
        case 1:
            errorMessage = 'Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin.'
            break;
        case 2:
            errorMessage = 'Konumunuz tespit edilemedi, lütfen biraz sonra tekrar deneyiniz.'
            break;
        case 3:
            errorMessage = 'Konum isteği zaman aşımına uğradı, lütfen sayfayı yenileyip tekrar deneyiniz.'
            break;
        default:
            errorMessage = 'Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin.'
            break;
    }
    // @ts-ignore
    Toastify({
        text: errorMessage,
        duration: 3000,
        gravity: 'top', // `top` or `bottom`
        position: 'center', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: 'black',
            borderRadius: '6px',
            margin: '16px',
        },
        onClick: function () { }, // Callback after click
    }).showToast();
}


function onLocationSuccess(locationEvent) {
    const position = locationEvent.latlng

    const currentPos = {
        lat: position.lat,
        lng: position.lng
    }

    if (currentLocationMarker) {
        currentLocationMarker.setLatLng(currentPos);
    } else {
        currentLocationMarker = L.marker(currentPos, { icon: currentLocationIcon });
        currentLocationMarker.addTo(map);
    }
}

map.on('locationerror', onLocationError);

map.on('locationfound', onLocationSuccess)


L.Control.GoToCurrentLocation = L.Control.extend({
    onAdd: function (map) {
        const locationButton = document.createElement('button');

        locationButton.textContent = 'Konum İzni Ver';

        locationButton.classList.add('custom-map-control-button');

        locationButton.type = 'button'

        locationButton.addEventListener('click', (ev) => {
            if (locationButton.textContent != 'Konumuma Git') {
                startWatchingLocation()
                locationButton.textContent = 'Konumuma Git';
            } else {
                if (currentLocationMarker) {
                    map.setView(currentLocationMarker.getLatLng(), 12);
                } else {
                    // @ts-ignore
                    Toastify({
                        text: 'Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin.',
                        duration: 3000,
                        gravity: 'top', // `top` or `bottom`
                        position: 'center', // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            background: 'black',
                            borderRadius: '6px',
                            margin: '16px',
                        },
                        onClick: function () { }, // Callback after click
                    }).showToast();
                }

            }
            L.DomEvent.stopPropagation(ev)
        })

        return locationButton;
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
    }
});

L.control.currentLocation = function (opts) {
    return new L.Control.GoToCurrentLocation(opts);
};

L.control.targetLocation = function (opts) {
    return new L.Control.GoToTargetLocation(opts);
};

L.control.currentLocation({ position: 'bottomleft' }).addTo(map);

L.control.targetLocation({ position: 'bottomleft' }).addTo(map);

