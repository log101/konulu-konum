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
} from "@/lib/domUtils"
import { updateMarkerLocation } from "@/components/Leaflet/geolocation"

var map = L.map("map").setView([41.024857599001905, 28.940787550837882], 10)

openstreetmapTiles.addTo(map)

let targetLocationMarker: L.Marker

let targetLocationCircle: L.Circle

let targetLocationCircleRadius = 50

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

const RadiusControl = L.Control.extend({
  onAdd: function (map: L.Map) {
    const radiusContainer = document.createElement("div")

    radiusContainer.classList.add(
      "bg-white",
      "h-[40px]",
      "p-2",
      "flex",
      "items-center",
      "gap-2"
    )

    const radiusButtonClasses = [
      "text-xl",
      "border-2",
      "border-slate-700",
      "max-h-[30px]",
      "flex",
      "items-center",
      "p-2",
      "rounded-lg",
      "bg-gray-100",
      "hover:bg-gray-300",
    ]

    const radiusIncreaseButton = document.createElement("button")

    radiusIncreaseButton.classList.add(...radiusButtonClasses)

    const radiusDecreaseButton = document.createElement("button")

    radiusIncreaseButton.type = "button"

    radiusDecreaseButton.type = "button"

    radiusDecreaseButton.classList.add(...radiusButtonClasses)

    const radiusContainerText = document.createElement("p")

    const radiusText = document.createElement("p")

    radiusContainerText.classList.add("text-xl")

    radiusText.classList.add("text-xl")

    radiusIncreaseButton.textContent = "+"

    radiusDecreaseButton.textContent = "-"

    radiusContainerText.textContent = "Çap: "

    radiusText.textContent = `${targetLocationCircleRadius.toString()}m`

    radiusContainer.insertAdjacentElement("afterbegin", radiusIncreaseButton)

    radiusContainer.insertAdjacentElement("afterbegin", radiusText)

    radiusContainer.insertAdjacentElement("afterbegin", radiusDecreaseButton)

    radiusContainer.insertAdjacentElement("afterbegin", radiusContainerText)

    radiusContainer.id = "radius-control"

    L.DomEvent.on(radiusIncreaseButton, "click", (ev) => {
      targetLocationCircleRadius = Math.min(
        targetLocationCircleRadius + 100,
        2000
      )
      targetLocationCircle.setRadius(targetLocationCircleRadius)

      radiusText.innerText = `${targetLocationCircleRadius.toString()}m`
      updateInputValue(
        "geolocation-radius-input",
        targetLocationCircleRadius.toString()
      )
      L.DomEvent.stop(ev)
    })

    L.DomEvent.on(radiusIncreaseButton, "dblclick", (ev) => L.DomEvent.stop(ev))

    L.DomEvent.on(radiusDecreaseButton, "click", (ev) => {
      targetLocationCircleRadius = Math.max(
        targetLocationCircleRadius - 100,
        50
      )
      targetLocationCircle.setRadius(targetLocationCircleRadius)
      radiusText.innerText = `${targetLocationCircleRadius.toString()}m`
      updateInputValue(
        "geolocation-radius-input",
        targetLocationCircleRadius.toString()
      )

      L.DomEvent.stop(ev)
    })

    L.DomEvent.on(radiusDecreaseButton, "dblclick", (ev) => L.DomEvent.stop(ev))

    return radiusContainer
  },
})

const askPermissionControl = new AskPermissonControl({ position: "bottomleft" })

const currentLocationControl = new CurrentLocationControl({
  position: "bottomleft",
})

const radiusControl = new RadiusControl({ position: "bottomright" })

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
      radius: targetLocationCircleRadius,
    }).addTo(map)

    radiusControl.addTo(map)
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
