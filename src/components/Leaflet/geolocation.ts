import L from "leaflet"

function updateMarkerLocation(
  marker: L.Marker,
  icon: L.Icon,
  position: L.LatLng,
  map: L.Map
) {
  if (marker) {
    marker.setLatLng(position)
  } else {
    marker = L.marker(position, { icon })
    marker.addTo(map)
  }

  return marker
}
export { updateMarkerLocation }
