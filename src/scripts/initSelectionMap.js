/* eslint-disable no-undef */
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

L.control.locate({
    position: 'bottomleft', clickBehavior: {
        inView: 'setView',
        outOfView: 'setView',
        inViewNotFollowing: 'setView'
    }
}).addTo(map);

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
