import {
  calculateDistance,
  errorCallback,
} from "@/components/LockedContent/geolocation";
import { onLocationSuccess } from "@/scripts/initMap";
let watchId: number;

const targetLocation = document.getElementById("locked-content-container")
  ?.dataset.targetPosition;

const descriptionElement = document.getElementById(
  "locked-content-description"
);

const locationPermissionButton = document.getElementById(
  "location-permission-button"
);

function generateDistanceText(distance: number) {
  // Update the proximity text according to the distance remaining
  if (distance > 1000) {
    return `${(distance / 1000).toFixed()} KM`;
  } else if (distance > 100) {
    return `${distance.toFixed(0)} M`;
  }
}

function updateCurrentLocation(position: GeolocationPosition) {
  const newPosition = position.coords;

  if (targetLocation) {
    const distance = calculateDistance(
      [newPosition.latitude, newPosition.longitude],
      JSON.parse(targetLocation)
    );

    const distanceText = generateDistanceText(distance);

    if (descriptionElement)
      descriptionElement.innerText = `Kalan mesafe: ${distanceText}`;

    if (locationPermissionButton) locationPermissionButton.remove();
  }

  onLocationSuccess(position);
}

function startWatchingLocation() {
  if (!watchId) {
    watchId = window.navigator.geolocation.watchPosition(
      updateCurrentLocation,
      errorCallback
    );
  }
}

const lockedContentContainer = document.getElementById(
  "locked-content-container"
);

lockedContentContainer?.addEventListener(
  "askpermission",
  startWatchingLocation
);

navigator.permissions
  .query({ name: "geolocation" })
  .then((permissionStatus) => {
    switch (permissionStatus.state) {
      case "granted":
        watchId = window.navigator.geolocation.watchPosition(
          updateCurrentLocation,
          errorCallback
        );
        break;
      case "denied":
      case "prompt":
      default:
        break;
    }
  });

export { startWatchingLocation };
