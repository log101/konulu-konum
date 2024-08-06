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

const DiameterControl = L.Control.extend({
  onAdd: function (map: L.Map) {
    const diameterContainer = document.createElement("div")

    diameterContainer.classList.add(
      "bg-white",
      "h-[40px]",
      "p-2",
      "flex",
      "items-center",
      "gap-2"
    )

    const diameterButtonClasses = [
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

    const diameterIncreaseButton = document.createElement("button")

    diameterIncreaseButton.classList.add(...diameterButtonClasses)

    const diameterDecreaseButton = document.createElement("button")

    diameterIncreaseButton.type = "button"

    diameterDecreaseButton.type = "button"

    diameterDecreaseButton.classList.add(...diameterButtonClasses)

    const diameterContainerText = document.createElement("p")

    const diameterText = document.createElement("p")

    diameterContainerText.classList.add("text-xl")

    diameterText.classList.add("text-xl")

    diameterIncreaseButton.textContent = "+"

    diameterDecreaseButton.textContent = "-"

    diameterContainerText.textContent = "Çap: "

    diameterText.textContent = `${targetLocationCircleRadius.toString()}m`

    diameterContainer.insertAdjacentElement(
      "afterbegin",
      diameterIncreaseButton
    )

    diameterContainer.insertAdjacentElement("afterbegin", diameterText)

    diameterContainer.insertAdjacentElement(
      "afterbegin",
      diameterDecreaseButton
    )

    diameterContainer.insertAdjacentElement("afterbegin", diameterContainerText)

    diameterContainer.id = "diameter-control"

    L.DomEvent.on(diameterIncreaseButton, "click", (ev) => {
      targetLocationCircleRadius = Math.min(
        targetLocationCircleRadius + 100,
        2000
      )
      targetLocationCircle.setRadius(targetLocationCircleRadius)

      diameterText.innerText = `${targetLocationCircleRadius.toString()}m`
      updateInputValue(
        "geolocation-diameter-input",
        targetLocationCircleRadius.toString()
      )
      L.DomEvent.stop(ev)
    })

    L.DomEvent.on(diameterIncreaseButton, "dblclick", (ev) =>
      L.DomEvent.stop(ev)
    )

    L.DomEvent.on(diameterDecreaseButton, "click", (ev) => {
      targetLocationCircleRadius = Math.max(
        targetLocationCircleRadius - 100,
        50
      )
      targetLocationCircle.setRadius(targetLocationCircleRadius)
      diameterText.innerText = `${targetLocationCircleRadius.toString()}m`
      updateInputValue(
        "geolocation-diameter-input",
        targetLocationCircleRadius.toString()
      )

      L.DomEvent.stop(ev)
    })

    L.DomEvent.on(diameterDecreaseButton, "dblclick", (ev) =>
      L.DomEvent.stop(ev)
    )

    return diameterContainer
  },
})

const askPermissionControl = new AskPermissonControl({ position: "bottomleft" })

const currentLocationControl = new CurrentLocationControl({
  position: "bottomleft",
})

const diameterControl = new DiameterControl({ position: "bottomright" })

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

    diameterControl.addTo(map)
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
