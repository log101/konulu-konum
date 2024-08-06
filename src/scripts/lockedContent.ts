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

// Get target position from container's dataset
function getTargetPosition() {
  const lockedContentContainer = document.getElementById(
    "locked-content-container"
  )

  const targetPositionString = lockedContentContainer?.dataset.targetPosition

  // TARGET_POSITION is required to calculate distance
  if (!targetPositionString) throw new Error("Target position is not provided!")

  const data = JSON.parse(targetPositionString) as LatLngTuple

  return data
}

function getRadius() {
  const leafletMap = document.getElementById("map")

  let targetRadiusString = leafletMap?.dataset.targetRadius

  // TARGET_POSITION is required to calculate distance
  if (!targetRadiusString) targetRadiusString = "50"

  const data = Number(targetRadiusString)

  return data
}

// Call Geolocation API to start watching user location
function startWatchingLocation() {
  const TARGET_POSITION = getTargetPosition()
  const radius = getRadius()

  if (!watchId) {
    watchId = window.navigator.geolocation.watchPosition(
      (position) => locationSuccessCallback(position, TARGET_POSITION, radius),
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
        const TARGET_POSITION = getTargetPosition()
        const radius = getRadius()
        watchId = window.navigator.geolocation.watchPosition(
          (position) =>
            locationSuccessCallback(position, TARGET_POSITION, radius),
          errorCallback
        )
        break
      case "denied":
      case "prompt":
      default:
        break
    }
  })
