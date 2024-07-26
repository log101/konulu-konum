import Toastify from "toastify-js";
import L, { type LatLngTuple } from "leaflet";
import {
  addClasses,
  removeClasses,
  removeElement,
  revealContent,
  toggleClass,
  updateText,
} from "./domUtils";
import { mapLocationSuccessCallback } from "@/scripts/initMap";

// Update the elements according to distance remaining
function locationSuccessCallback(
  position: GeolocationPosition,
  targetPosition: LatLngTuple
) {
  const newPosition = position.coords;

  // Calculate the distance remaining
  const distance = calculateDistance(
    [newPosition.latitude, newPosition.longitude],
    targetPosition
  );

  // If user has arrived to destination
  if (distance < 100) {
    // Change the description texts
    updateText("button-text", "İçeriği Göster");
    updateText("locked-content-description", "İçeriği görmek için butona bas!");

    // Swap the icon
    toggleClass("lock-icon", "hidden");
    toggleClass("unlock-icon", "hidden");

    // Tansform the unlock button
    removeClasses("unlock-content-button", "bg-primary", "hover:bg-primary/90");
    addClasses(
      "unlock-content-button",
      "bg-indigo-600",
      "hover:bg-indigo-700",
      "hover:animate-none",
      "border-2",
      "border-indigo-800"
    );

    // Wait for transition to finish then add animation
    setTimeout(() => {
      removeClasses("unlock-content-button", "duration-1000");
      addClasses("unlock-content-button", "animate-pulse");
    }, 800);

    // Reveal image when the unlock button is clicked
    const unlockButton = document.getElementById("unlock-content-button");
    unlockButton?.addEventListener("click", revealContent);
  } else {
    const distanceText = generateDistanceText(distance);
    updateText("locked-content-description", `Kalan mesafe: ${distanceText}`);
  }

  removeElement("location-permission-button");

  // Update leaflet controls
  mapLocationSuccessCallback(position);
}

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

// Generates a human readable destination text according to
// distance remaining
function generateDistanceText(distance: number) {
  if (distance > 1000) {
    return `${(distance / 1000).toFixed()} KM`;
  } else if (distance > 100) {
    return `${distance.toFixed(0)} M`;
  }
}

export {
  errorCallback,
  locationSuccessCallback,
  calculateDistance,
  generateDistanceText,
};
