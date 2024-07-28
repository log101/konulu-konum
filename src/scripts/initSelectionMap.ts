import L from "leaflet"
import { openstreetmapTiles } from "@/components/Leaflet/constants"
import { toast } from "@/lib/utils"
import {
  currentLocationIcon,
  targetLocationIcon,
} from "@/components/Leaflet/icons"
import {
  addClasses,
  removeClasses,
  updateInputValue,
  updateText,
} from "@/components/LockedContent/domUtils"
import { updateMarkerLocation } from "@/components/Leaflet/geolocation"

var map = L.map("map").setView([41.024857599001905, 28.940787550837882], 10)

openstreetmapTiles.addTo(map)

let targetLocationMarker: L.Marker

let targetLocationCircle: L.Circle

let currentLocationMarker: L.Marker

map.on("locationerror", () =>
  toast(
    "Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin."
  )
)

map.on("locationfound", (ev) => {
  removeClasses("current-location-control", "disabled-button")
  addClasses("ask-permission-control", "disabled-button")

  currentLocationMarker = updateMarkerLocation(
    currentLocationMarker,
    currentLocationIcon,
    ev.latlng,
    map
  )
})

const CurrentLocationControl = L.Control.extend({
  onAdd: function (map: L.Map) {
    const locationButton = document.createElement("button")

    locationButton.textContent = "Konumuma Git"

    locationButton.classList.add("custom-map-control-button", "disabled-button")

    locationButton.type = "button"

    locationButton.id = "current-location-control"

    locationButton.addEventListener("click", (ev) => {
      if (currentLocationMarker) {
        map.setView(currentLocationMarker.getLatLng(), 12)
      } else {
        toast("Konumunuza erişilemiyor, lütfen biraz bekleyip tekrar deneyin.")
      }
      L.DomEvent.stopPropagation(ev)
    })

    return locationButton
  },
})

const AskPermissonControl = L.Control.extend({
  onAdd: function (map: L.Map) {
    const locationButton = document.createElement("button")

    locationButton.textContent = "Konum İzni Ver"

    locationButton.classList.add("custom-map-control-button")

    locationButton.type = "button"

    locationButton.id = "ask-permission-control"

    locationButton.addEventListener("click", (ev) => {
      map.locate({ watch: true })
      L.DomEvent.stopPropagation(ev)
    })

    return locationButton
  },
})

const askPermissionControl = new AskPermissonControl({ position: "bottomleft" })

const currentLocationControl = new CurrentLocationControl({
  position: "bottomleft",
})

askPermissionControl.addTo(map)

currentLocationControl.addTo(map)

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
  updateInputValue("geolocation-input", `${pos.lat},${pos.lng}`)
  updateText("coordinates", `${pos.lat}. Enlem, ${pos.lng}. Boylam`)
  updateText(
    "location-selected-confirmation",
    "Konum seçildi, bir sonraki adıma geçebilirsiniz."
  )
})

const geolocationInputEl = document.getElementById(
  "geolocation-input"
) as HTMLInputElement | null

if (geolocationInputEl?.value) {
  geolocationInputEl.value = ""
}
