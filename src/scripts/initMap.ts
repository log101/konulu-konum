import L from "leaflet";
import Toastify from "toastify-js";

type TargetLocation = [lat: number, lng: number] | null;

const mapEl = document.getElementById("map");

var targetLocationIcon = L.icon({
  iconUrl: "goal.svg",
  iconSize: [32, 32],
});

var currentLocationIcon = L.icon({
  iconUrl: "blue-dot.png",
  iconSize: [32, 32],
});

const targetLocation = mapEl?.dataset.targetLocation;

const data = targetLocation ? JSON.parse(targetLocation) : null;

const TARGET_LOCATION = data as TargetLocation;

var map = L.map("map");

if (TARGET_LOCATION) map.setView(TARGET_LOCATION, 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let currentLocationMarker: L.Marker;

export function onLocationSuccess(position: GeolocationPosition) {
  const currentPos = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };

  if (currentLocationMarker) {
    currentLocationMarker.setLatLng(currentPos);
  } else {
    currentLocationMarker = L.marker(currentPos, { icon: currentLocationIcon });
    currentLocationMarker.addTo(map);
  }
}

const CurrentLocation = L.Control.extend({
  onAdd: function (map: L.Map) {
    const locationButton = document.createElement("button");

    locationButton.textContent = "Konumuma Git";

    locationButton.classList.add("custom-map-control-button");

    locationButton.type = "button";

    locationButton.addEventListener("click", () => {
      if (currentLocationMarker) {
        map.setView(currentLocationMarker.getLatLng(), 12);
      } else {
        Toastify({
          text: "Konumunuza erişilemiyor, lütfen biraz bekleyip tekrar deneyin.",
          duration: 3000,
          gravity: "top",
          position: "center",
          stopOnFocus: true,
          style: {
            background: "black",
            borderRadius: "6px",
            margin: "16px",
          },
          onClick: function () {},
        }).showToast();
      }
    });

    return locationButton;
  },
});

const GoToTargetLocation = L.Control.extend({
  onAdd: function (map: L.Map) {
    const locationButton = document.createElement("button");

    locationButton.textContent = "Hedefe Git";

    locationButton.classList.add("custom-map-control-button");

    locationButton.addEventListener("click", () => {
      if (TARGET_LOCATION) map.setView(TARGET_LOCATION, 18);
    });

    return locationButton;
  },
});

const goToCurrentLocationControl = new CurrentLocation({
  position: "bottomleft",
});

const targetLocationControl = new GoToTargetLocation({
  position: "bottomleft",
});

function addTargetLocationMarker(target: TargetLocation) {
  if (target) {
    L.marker(target, { icon: targetLocationIcon }).addTo(map);

    L.circle(target, {
      color: "blue",
      fillColor: "#30f",
      fillOpacity: 0.2,
      radius: 50,
    }).addTo(map);
  }
}

function initLocationControls() {
  targetLocationControl.addTo(map);
  goToCurrentLocationControl.addTo(map);
}

addTargetLocationMarker(TARGET_LOCATION);
initLocationControls();
