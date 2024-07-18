// Lit imports
import { LitElement, html, nothing, unsafeCSS, type CSSResultGroup } from "lit";
import { customElement, property, state } from "lit/decorators.js";

// Leaflet
import { type LatLngTuple } from "leaflet";

// Styles
import globalStyles from "@/styles/globals.css?inline";
import lockedContentStyles from "../styles/locked-content.css?inline";

// Templates
import {
  lockedButtonTemplate,
  permissionButtonTemplate,
  permissionDeniedButtonTemplate,
  unlockedButtonTemplate,
} from "./LockedContent/templates";

// Geolocation utils
import { calculateDistance, errorCallback } from "./LockedContent/geolocation";
import { incrementUnlockCounter } from "./LockedContent/middleware";

// LockedContent is a custom element watching user location and blurring
// given image until user has arrived a certain position
@customElement("locked-content-lit")
export class LockedContent extends LitElement {
  // Constants
  geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  };

  // Tailwind and custom styles
  static styles: CSSResultGroup | undefined = [
    unsafeCSS(globalStyles),
    unsafeCSS(lockedContentStyles),
  ];

  // Components properties/attributes, no accessor attribute disables detecting
  // changes as these are readonly attriubtes there is no need to attach setters
  @property({ noAccessor: true }) readonly imageId?: string;
  @property({ noAccessor: true }) readonly imageURL?: string;
  @property({ type: Object, noAccessor: true })
  readonly targetPosition?: LatLngTuple;

  // Reactive states, template is rendered according to this states
  @state()
  protected _geolocationPermissionStatus: PermissionState = "prompt";
  @state()
  protected _unlocked = false;
  @state()
  protected _arrived = false;
  @state()
  protected _distanceText?: string;
  @state()
  protected _watchId?: number;

  // This callback will be fired when geolocation info is available
  successCallback(position: GeolocationPosition) {
    // Set hasGeolocationPermission state true to change the template
    this._geolocationPermissionStatus = "granted";

    // Target position must be set
    if (!this.targetPosition) return;

    // Calculate the distance between target and current position in meters
    const distance = calculateDistance(position, this.targetPosition);

    // Update the text based on the distance
    this._updateDistanceText(distance);

    this._checkArrived(distance);
  }

  private _updateDistanceText(distance: number) {
    // Update the proximity text according to the distance remaining
    if (distance > 1000) {
      this._distanceText = `${(distance / 1000).toFixed()} KM`;
    } else if (distance > 100) {
      this._distanceText = `${distance.toFixed(0)} M`;
    }
  }

  private _checkArrived(distance: number) {
    // If target is close less then 100 meters user has arrived to target location
    if (distance < 100) {
      if (this._watchId) {
        // Stop watching location
        navigator.geolocation.clearWatch(this._watchId);
      }
      // Update state to reveal the image
      this._arrived = true;
    }
  }

  // This template is shown when user hasn't give geolocation permission yet
  // When user click the button user is asked for geolocation permission
  private _permissionButtonTemplate = () =>
    permissionButtonTemplate(this._startWatchingLocation);

  // This template is shown when user has given permission but has not arrived yet
  private _lockedButtonTemplate = () =>
    lockedButtonTemplate(this._distanceText);

  // This template is shown when user has arrived to the target location
  // When user click the button counter at the bottom of the page is incremented
  // and image is revealed
  private _unlockedButtonTemplate = () =>
    unlockedButtonTemplate(() => {
      incrementUnlockCounter(this.imageId);
      this._unlocked = true;
    });

  // Start watching user location, if user has not given permission yet
  // this will ask the user for permission and update the watch id
  private _startWatchingLocation() {
    // User is already being watched no need to
    // watch position
    if (this._watchId) return;

    const id = navigator.geolocation.watchPosition(
      this.successCallback.bind(this),
      (err) => {
        if (err.code == GeolocationPositionError.PERMISSION_DENIED) {
          this._geolocationPermissionStatus = "denied";
        }
        errorCallback(err);
      },
      this.geolocationOptions
    );

    this._watchId = id;
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Check geolocation permission, if user has given permission before
    // start watching user location
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        switch (permissionStatus.state) {
          case "granted":
            this._startWatchingLocation();
            break;
          case "denied":
            this._geolocationPermissionStatus = "denied";
          case "prompt":
          default:
            break;
        }
      });
  }

  render() {
    let buttonTemplate;

    // Determine which template to show, there are 3 states:
    // 1 - No geolocation permission given
    // 2 - Permission given but has no arrived to target position yet
    // 3 - Arrived to target position
    // 4 - User did not give geolocation permission
    if (this._arrived) {
      buttonTemplate = this._unlockedButtonTemplate;
    } else if (this._geolocationPermissionStatus == "granted") {
      buttonTemplate = this._lockedButtonTemplate;
    } else if (this._geolocationPermissionStatus == "prompt") {
      buttonTemplate = this._permissionButtonTemplate;
    } else {
      buttonTemplate = permissionDeniedButtonTemplate;
    }

    return html`
      <div
        class="w-full h-[475px] overflow-hidden border border-zinc-200 shadow-sm p-4 rounded"
      >
        <div class="flex flex-col justify-center items-center image-wrapper">
          <img
            id="content"
            src="${this.imageURL}"
            class="h-[450px] ${this._unlocked ? "" : "blur-2xl"}"
          />

          ${this._unlocked ? nothing : buttonTemplate()}
        </div>
      </div>
    `;
  }
}
