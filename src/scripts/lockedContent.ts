import {
  calculateDistance,
  errorCallback,
} from "@/components/LockedContent/geolocation";
import { onLocationSuccess } from "@/scripts/initMap";
let watchId: number;

const targetLocation = document.getElementById("locked-content-container")
  ?.dataset.targetPosition;

// This element display the distance between the user and the
// target if geolocation permission is granted
const descriptionElement = document.getElementById(
  "locked-content-description"
);

const locationPermissionButton = document.getElementById(
  "location-permission-button"
);

// Generates a human readable destination text according to
// distance remaining
function generateDistanceText(distance: number) {
  if (distance > 1000) {
    return `${(distance / 1000).toFixed()} KM`;
  } else if (distance > 100) {
    return `${distance.toFixed(0)} M`;
  }
}

// Update the elements according to distance remaining
function updateCurrentLocation(position: GeolocationPosition) {
  const newPosition = position.coords;

  if (targetLocation) {
    // Calculate the distance remaining
    const distance = calculateDistance(
      [newPosition.latitude, newPosition.longitude],
      JSON.parse(targetLocation)
    );
    if (distance < 100) {
      // If user has arrived to destination
      // Transform locked button to reveal button
      const unlockButton = document.getElementById("unlock-content-button");
      const unlockIcon = document.getElementById("unlock-icon");
      const lockIcon = document.getElementById("lock-icon");
      const buttonText = document.getElementById("button-text");

      if (unlockButton) {
        if (buttonText) buttonText.innerText = "İçeriği Göster";
        if (lockIcon) lockIcon.classList.add("hidden");
        if (unlockIcon) unlockIcon.classList.remove("hidden");
        unlockButton.classList.remove("bg-primary", "hover:bg-primary/90");
        unlockButton.classList.add(
          "transition-[background-color]",
          "duration-1000"
        );
        unlockButton.classList.add(
          "animate-pulse",
          "bg-indigo-600",
          "hover:bg-indigo-700",
          "hover:animate-none",
          "border-2",
          "border-indigo-800"
        );
      }
    } else {
      const distanceText = generateDistanceText(distance);

      if (descriptionElement)
        descriptionElement.innerText = `Kalan mesafe: ${distanceText}`;
    }

    if (locationPermissionButton) locationPermissionButton.remove();
  }

  // Update leaflet controls
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

navigator.permissions.query({ name: "geolocation" }).then(permissionStatus => {
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
