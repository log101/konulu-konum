import {
  calculateDistance,
  errorCallback,
} from "@/components/LockedContent/geolocation";
import { incrementUnlockCounter } from "@/components/LockedContent/serverUtils";
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
const unlockButton = document.getElementById("unlock-content-button");
const unlockIcon = document.getElementById("unlock-icon");
const lockIcon = document.getElementById("lock-icon");
const buttonText = document.getElementById("button-text");
const description = document.getElementById("locked-content-description");

function updateText(elemId: string, text: string) {
  const elem = document.getElementById(elemId);
  if (elem) elem.innerText = text;
  else console.error("Element could not be found!");
}

function toggleClass(elemId: string, className: string) {
  const elem = document.getElementById(elemId);
  if (elem) elem.classList.toggle(className);
  else console.error("Element could not be found!");
}

if (locationPermissionButton)
  locationPermissionButton.addEventListener("click", startWatchingLocation);

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

  if (!targetLocation) return;
  // Calculate the distance remaining
  const distance = calculateDistance(
    [newPosition.latitude, newPosition.longitude],
    JSON.parse(targetLocation)
  );

  if (distance < 100) {
    // If user has arrived to destination
    // Transform locked button to reveal button
    updateText("button-text", "İçeriği Göster");
    toggleClass("lock-icon", "hidden");
    toggleClass("unlock-icon", "hidden");
    updateText("locked-content-description", "İçeriği görmek için butona bas!");
    unlockButton?.classList.remove("bg-primary", "hover:bg-primary/90");
    unlockButton?.classList.add(
      "bg-indigo-600",
      "hover:bg-indigo-700",
      "hover:animate-none",
      "border-2",
      "border-indigo-800"
    );
    setTimeout(() => {
      unlockButton?.classList.remove("duration-1000");
      unlockButton?.classList.add("animate-pulse");
    }, 800);

    unlockButton?.addEventListener("click", () => {
      const image = document.getElementById("content");
      const unlockButtonContainer = document.getElementById(
        "unlock-button-container"
      );
      incrementUnlockCounter(document.URL.slice(-12));
      if (image) image.classList.remove("blur-2xl");
      if (unlockButtonContainer) unlockButtonContainer.remove();
    });
  } else {
    const distanceText = generateDistanceText(distance);

    if (descriptionElement)
      descriptionElement.innerText = `Kalan mesafe: ${distanceText}`;
  }

  if (locationPermissionButton) {
    locationPermissionButton.remove();
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

if (lockedContentContainer)
  lockedContentContainer.addEventListener(
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
