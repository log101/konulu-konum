/* eslint-disable no-undef */
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

L.circle(TARGET_LOCATION, {
    color: 'blue',
    fillColor: '#30f',
    fillOpacity: 0.2,
    radius: 50
}).addTo(map);

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

L.control.targetLocation = function (opts) {
    return new L.Control.GoToTargetLocation(opts);
};

L.control.targetLocation({ position: 'bottomleft' }).addTo(map);

L.control.locate({
    position: 'bottomleft', clickBehavior: {
        inView: 'setView',
        outOfView: 'setView',
        inViewNotFollowing: 'setView'
    }
}).addTo(map);
