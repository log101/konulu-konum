import L from "leaflet"

var targetLocationIcon = L.icon({
  iconUrl: "/goal.svg",
  iconSize: [32, 32],
})

var currentLocationIcon = L.icon({
  iconUrl: "/blue-dot.png",
  iconSize: [32, 32],
})

export { targetLocationIcon, currentLocationIcon }
