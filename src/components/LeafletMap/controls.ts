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
  options: {
    title: "Konum İzni Ver",
  },
  _watchingLocation: false,
  _containerEl: null as HTMLButtonElement | null,
  _currentLocationMarker: null as L.Marker | null,
  setCurrentLocationMarker: function (marker?: L.Marker) {
    if (marker) this._currentLocationMarker = marker;
  },
  initialize: function (options: any) {
    L.Util.setOptions(this, options);
  },
  startWatching: function () {
    this._watchingLocation = true;
    if (this._containerEl) this._containerEl.textContent = "Konumuma Git";
  },
  onAdd: function (map: L.Map) {
    const locationButton = document.createElement("button");

    this._containerEl = locationButton;

    locationButton.id = "ask-permission-control-button";

    locationButton.textContent = this.options.title;

    locationButton.classList.add("custom-map-control-button");

    locationButton.type = "button";

    L.DomEvent.on(locationButton, "click", () => {
      if (this._watchingLocation && this._currentLocationMarker) {
        map.setView(this._currentLocationMarker.getLatLng(), 12);
      } else {
        this.startWatching();
      }
    });

    return locationButton;
  },
  onRemove: function () {
    L.DomEvent.off(this._containerEl!);
  },
});

export { GoToTargetControl, GeolocationControl };
