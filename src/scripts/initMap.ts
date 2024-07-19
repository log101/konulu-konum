import L from "leaflet";

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

const data = JSON.parse(targetLocation ?? "{}");
const TARGET_LOCATION = data;

var map = L.map("map").setView(TARGET_LOCATION, 13);

L.marker(TARGET_LOCATION, { icon: targetLocationIcon }).addTo(map);

L.circle(TARGET_LOCATION, {
  color: "blue",
  fillColor: "#30f",
  fillOpacity: 0.2,
  radius: 50,
}).addTo(map);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

map.on("locationerror", onLocationError);

map.on("locationfound", onLocationSuccess);

let currentLocationMarker: L.Marker;

function onLocationError(err: L.ErrorEvent) {
  let errorMessage;
  switch (err.code) {
    case 1:
      errorMessage =
        "Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin.";
      break;
    case 2:
      errorMessage =
        "Konumunuz tespit edilemedi, lütfen biraz sonra tekrar deneyiniz.";
      break;
    case 3:
      errorMessage =
        "Konum isteği zaman aşımına uğradı, lütfen sayfayı yenileyip tekrar deneyiniz.";
      break;
    default:
      errorMessage =
        "Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin.";
      break;
  }
  // @ts-ignore
  Toastify({
    text: errorMessage,
    duration: 3000,
    gravity: "top", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "black",
      borderRadius: "6px",
      margin: "16px",
    },
    onClick: function () {}, // Callback after click
  }).showToast();
}

function onLocationSuccess(locationEvent: L.LocationEvent) {
  const position = locationEvent.latlng;

  const currentPos = {
    lat: position.lat,
    lng: position.lng,
  };

  if (currentLocationMarker) {
    currentLocationMarker.setLatLng(currentPos);
  } else {
    currentLocationMarker = L.marker(currentPos, { icon: currentLocationIcon });
    currentLocationMarker.addTo(map);
  }
}

// @ts-ignore L.Control allows extensions
L.Control.AskPermisson = L.Control.extend({
  onAdd: function () {
    const locationButton = document.createElement("button");

    locationButton.textContent = "Konum İzni Ver";

    locationButton.classList.add("custom-map-control-button");

    locationButton.type = "button";

    locationButton.addEventListener("click", (ev) => {
      startWatchingLocation();
      locationButton.textContent = "Konumuma Git";
      L.DomEvent.stopPropagation(ev);
    });

    return locationButton;
  },
});

// @ts-ignore L.Control allows extensions
L.Control.CurrentLocation = L.Control.extend({
  onAdd: function (map: L.Map) {
    const locationButton = document.createElement("button");

    locationButton.textContent = "Konumuma Git";

    locationButton.classList.add("custom-map-control-button");

    locationButton.type = "button";

    locationButton.addEventListener("click", (ev) => {
      if (currentLocationMarker) {
        map.setView(currentLocationMarker.getLatLng(), 12);
      } else {
        // @ts-ignore
        Toastify({
          text: "Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin.",
          duration: 3000,
          gravity: "top", // `top` or `bottom`
          position: "center", // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: "black",
            borderRadius: "6px",
            margin: "16px",
          },
          onClick: function () {}, // Callback after click
        }).showToast();
      }

      L.DomEvent.stopPropagation(ev);
    });

    return locationButton;
  },
});

// @ts-ignore L.Control allows extensions
L.Control.GoToTargetLocation = L.Control.extend({
  onAdd: function (map: L.Map) {
    const locationButton = document.createElement("button");

    locationButton.textContent = "Hedefe Git";

    locationButton.classList.add("custom-map-control-button");

    locationButton.addEventListener("click", () => {
      map.setView(TARGET_LOCATION, 18);
    });

    return locationButton;
  },
});

// @ts-ignore L.Control allows extensions
L.control.askPermission = function (opts) {
  // @ts-ignore L.Control allows extensions
  return new L.Control.AskPermisson(opts);
};

// @ts-ignore L.Control allows extensions
L.control.goToCurrentLocation = function (opts) {
  // @ts-ignore L.Control allows extensions
  return new L.Control.CurrentLocation(opts);
};

// @ts-ignore L.Control allows extensions
L.control.targetLocation = function (opts) {
  // @ts-ignore L.Control allows extensions
  return new L.Control.GoToTargetLocation(opts);
};

// @ts-ignore L.Control allows extensions
const goToCurrentLocationControl = L.control.goToCurrentLocation({
  position: "bottomleft",
});

// @ts-ignore L.Control allows extensions
const askPermissionControl = L.control.askPermission({
  position: "bottomleft",
});

// @ts-ignore L.Control allows extensions
const targetLocationControl = L.control.targetLocation({
  position: "bottomleft",
});

function startWatchingLocation() {
  goToCurrentLocationControl.addTo(map);
  askPermissionControl.remove();
  map.locate({ watch: true });
}

function initLocationControls() {
  targetLocationControl.addTo(map);
  // Check geolocation permission, if user has given permission before
  // start watching user location
  navigator.permissions
    .query({ name: "geolocation" })
    .then((permissionStatus) => {
      switch (permissionStatus.state) {
        case "granted":
          startWatchingLocation();
          break;
        case "denied":
        case "prompt":
          askPermissionControl.addTo(map);
        default:
          break;
      }
    });
}

initLocationControls();
