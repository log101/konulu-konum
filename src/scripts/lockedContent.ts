import {
  errorCallback,
  locationSuccessCallback,
} from "@/components/LockedContent/geolocation"
import type { LatLngTuple } from "leaflet"

// Geolocation watch id to avoid duplicate watchPosition calls
let watchId: number

// DOM ELEMENTS
const locationPermissionButton = document.getElementById(
  "location-permission-button"
)

const unlockButton = document.getElementById("unlock-content-button")

const lockedContentContainer = document.getElementById(
  "locked-content-container"
)

// These elements MUST be defined
// Throw error if they are not found
if (!locationPermissionButton || !lockedContentContainer || !unlockButton) {
  throw new Error("Element not found!")
}

// EVENT LISTENERS
locationPermissionButton.addEventListener("click", startWatchingLocation)

lockedContentContainer.addEventListener("askpermission", startWatchingLocation)

const targetPositionString = lockedContentContainer.dataset.targetPosition

// TARGET_POSITION is required to calculate distance
if (!targetPositionString) throw new Error("Target position is not provided!")

const TARGET_POSITION = JSON.parse(targetPositionString) as LatLngTuple

// Call Geolocation API to start watching user location
function startWatchingLocation() {
  if (!watchId) {
    watchId = window.navigator.geolocation.watchPosition(
      (position) => locationSuccessCallback(position, TARGET_POSITION),
      errorCallback
    )
  }
}

// When the web page is loaded, check if user has given geolocation
// permission before
navigator.permissions
  .query({ name: "geolocation" })
  .then((permissionStatus) => {
    switch (permissionStatus.state) {
      case "granted":
        watchId = window.navigator.geolocation.watchPosition(
          (position) => locationSuccessCallback(position, TARGET_POSITION),
          errorCallback
        )
        break
      case "denied":
      case "prompt":
      default:
        break
    }
  })
