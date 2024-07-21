import Toastify from "toastify-js";
import L from "leaflet";

// This callback will be fired on geolocation error
function errorCallback(err: GeolocationPositionError) {
  let errorMessage;
  // Show toast accoring to the error state
  switch (err.code) {
    case GeolocationPositionError.PERMISSION_DENIED:
      errorMessage =
        "Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin.";
      break;
    case GeolocationPositionError.POSITION_UNAVAILABLE:
      errorMessage =
        "Konumunuz tespit edilemedi, lütfen biraz sonra tekrar deneyiniz.";
      break;
    case GeolocationPositionError.TIMEOUT:
      errorMessage =
        "Konum isteği zaman aşımına uğradı, lütfen sayfayı yenileyip tekrar deneyiniz.";
      break;
    default:
      errorMessage =
        "Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin.";
      break;
  }

  Toastify({
    text: errorMessage,
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

function calculateDistance(
  currentPosition: L.LatLngTuple,
  targetPosition: L.LatLngTuple
) {
  // Get target position in latitudes and longitudes
  const targetLatLng = L.latLng(targetPosition);

  // Get current position in latitudes and longitudes
  const currentLatLng = L.latLng(currentPosition);

  // Calculate the distance between target and current position in meters
  const betweenMeters = currentLatLng.distanceTo(targetLatLng);

  return betweenMeters;
}

export { errorCallback, calculateDistance };
