import { onLocationError } from "@/lib/error"
import { toast } from "@/lib/utils"

var map = L.map("map").setView([41.024857599001905, 28.940787550837882], 10)

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map)

let targetLocationMarker

let targetLocationCircle

var targetLocationIcon = L.icon({
  iconUrl: "goal.svg",
  iconSize: [32, 32],
})

var currentLocationIcon = L.icon({
  iconUrl: "blue-dot.png",
  iconSize: [32, 32],
})

let currentLocationMarker

function startWatchingLocation() {
  map.locate({ watch: true })
}

function onLocationSuccess(locationEvent) {
  const position = locationEvent.latlng

  const currentPos = {
    lat: position.lat,
    lng: position.lng,
  }

  if (currentLocationMarker) {
    currentLocationMarker.setLatLng(currentPos)
  } else {
    currentLocationMarker = L.marker(currentPos, { icon: currentLocationIcon })
    currentLocationMarker.addTo(map)
  }
}

map.on("locationerror", onLocationError)

map.on("locationfound", onLocationSuccess)

L.Control.AskPermisson = L.Control.extend({
  onAdd: function (map) {
    const locationButton = document.createElement("button")

    locationButton.textContent = "Konum İzni Ver"

    locationButton.classList.add("custom-map-control-button")

    locationButton.type = "button"

    locationButton.addEventListener("click", (ev) => {
      if (locationButton.textContent != "Konumuma Git") {
        startWatchingLocation()
        locationButton.textContent = "Konumuma Git"
      } else {
        if (currentLocationMarker) {
          map.setView(currentLocationMarker.getLatLng(), 12)
        } else {
          toast(
            "Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin."
          )
        }
      }
      L.DomEvent.stopPropagation(ev)
    })

    return locationButton
  },
})

L.control.askPermission = function (opts) {
  return new L.Control.AskPermisson(opts)
}

L.control.askPermission({ position: "bottomleft" }).addTo(map)

map.on("click", (e) => {
  if (targetLocationMarker) {
    targetLocationMarker.setLatLng(e.latlng)
    targetLocationCircle.setLatLng(e.latlng)
  } else {
    targetLocationMarker = L.marker(e.latlng, {
      icon: targetLocationIcon,
    }).addTo(map)

    targetLocationCircle = L.circle(e.latlng, {
      color: "blue",
      fillColor: "#30f",
      fillOpacity: 0.2,
      radius: 50,
    }).addTo(map)
  }

  const pos = targetLocationMarker.getLatLng()
  document.getElementById("coordinates").innerText =
    `${pos.lat}. Enlem, ${pos.lng}. Boylam`
  document.getElementById("geolocation-input").value = `${pos.lat},${pos.lng}`
  document.getElementById("location-selected-confirmation").innerText =
    "Konum seçildi, bir sonraki adıma geçebilirsiniz."
})
