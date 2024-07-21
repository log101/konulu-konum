import Toastify from "toastify-js";
import L from "leaflet";
import { currentLocationIcon } from "./icons";

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

  if (this._currentLocationMarker) {
    this._currentLocationMarker.setLatLng(currentPos);
  } else {
    this._currentLocationMarker = L.marker(currentPos, {
      icon: currentLocationIcon,
    });
    this._currentLocationMarker.addTo(this._map);
  }
}

export { onLocationError, onLocationSuccess };
