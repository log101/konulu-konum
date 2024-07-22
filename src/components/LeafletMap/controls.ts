import L, { type LatLngTuple } from "leaflet";

const GoToTargetControl = L.Control.extend({
  _targetLocation: null as LatLngTuple | null,
  setTargetLocation: function (latlng: LatLngTuple) {
    this._targetLocation = latlng;
  },
  onAdd: function (map: L.Map) {
    const locationButton = document.createElement("button");

    locationButton.id = "go-to-target-control-button";

    locationButton.textContent = "Hedefe Git";

    locationButton.classList.add("custom-map-control-button");

    L.DomEvent.on(locationButton, "click", () => {
      if (!this._targetLocation) return;
      map.setView(this._targetLocation, 18);
    });

    return locationButton;
  },
});

const GeolocationControl = L.Control.extend({
  _containerEl: null as HTMLButtonElement | null,
  _currentLocationMarker: null as L.Marker | null,
  setCurrentLocationMarker: function (marker?: L.Marker) {
    if (marker) this._currentLocationMarker = marker;
  },
  onAdd: function (map: L.Map) {
    const locationButton = document.createElement("button");

    this._containerEl = locationButton;

    locationButton.id = "ask-permission-control-button";

    locationButton.textContent = "Konumuma Git";

    locationButton.classList.add("custom-map-control-button");

    locationButton.type = "button";

    L.DomEvent.on(locationButton, "click", () => {
      console.log(this._currentLocationMarker);
      if (this._currentLocationMarker) {
        map.setView(this._currentLocationMarker.getLatLng(), 12);
      }
    });

    return locationButton;
  },
  onRemove: function () {
    L.DomEvent.off(this._containerEl!);
  },
});

export { GoToTargetControl, GeolocationControl };
