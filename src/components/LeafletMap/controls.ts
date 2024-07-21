import L from "leaflet";

const GoToTargetControl = L.Control.extend({
  onAdd: function () {
    const locationButton = document.createElement("button");

    locationButton.id = "go-to-target-control-button";

    locationButton.textContent = "Hedefe Git";

    locationButton.classList.add("custom-map-control-button");

    return locationButton;
  },
});

const AskPermissonControl = L.Control.extend({
  onAdd: function () {
    const locationButton = document.createElement("button");

    locationButton.id = "ask-permission-control-button";

    locationButton.textContent = "Konum İzni Ver";

    locationButton.classList.add("custom-map-control-button");

    locationButton.type = "button";

    return locationButton;
  },
});

export { GoToTargetControl, AskPermissonControl };
