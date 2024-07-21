import L from "leaflet";

const TargetLocationControl = L.Control.extend({
  onAdd: function (map: L.Map, targetLocation: L.LatLngTuple) {
    const locationButton = document.createElement("button");

    locationButton.textContent = "Hedefe Git";

    locationButton.classList.add("custom-map-control-button");

    locationButton.addEventListener("click", () => {
      map.setView(targetLocation, 18);
    });

    return locationButton;
  },
});

export { TargetLocationControl };
