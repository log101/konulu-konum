import L from "leaflet"

var targetLocationIcon = L.icon({
  iconUrl: "https://konulukonum.log101.dev/goal.svg",
  iconSize: [32, 32],
})

var currentLocationIcon = L.icon({
  iconUrl: "https://konulukonum.log101.dev/blue-dot.png",
  iconSize: [32, 32],
})

export { targetLocationIcon, currentLocationIcon }
