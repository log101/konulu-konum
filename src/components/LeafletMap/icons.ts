import { icon } from "leaflet";

var targetLocationIcon = icon({
  iconUrl: "goal.svg",
  iconSize: [32, 32],
});

var currentLocationIcon = icon({
  iconUrl: "blue-dot.png",
  iconSize: [32, 32],
});

export { targetLocationIcon, currentLocationIcon };
