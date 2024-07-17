import { LitElement, html, nothing, unsafeCSS, type CSSResultGroup } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import L, { type LatLngTuple } from "leaflet";
import Toastify from "toastify-js";

import globalStyles from "@/styles/globals.css?inline";
import lockedContentStyles from "../styles/locked-content.css?inline";

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
  protected _hasGeolocationPermission = false;
  @state()
  protected _unlocked = false;
  @state()
  protected _arrived = false;
  @state()
  protected _targetProximityText?: string;
  @state()
  protected _watchId?: number;

  // Locked lock icon
  lockSVG = html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="#ffffff"
    viewBox="0 0 256 256"
  >
    <path
      d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"
    ></path>
  </svg>`;

  // Unlocked lock icon
  unlockSVG = html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="#ffffff"
      viewBox="0 0 256 256"
    >
      <path
        d="M208,80H96V56a32,32,0,0,1,32-32c15.37,0,29.2,11,32.16,25.59a8,8,0,0,0,15.68-3.18C171.32,24.15,151.2,8,128,8A48.05,48.05,0,0,0,80,56V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm0,128H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"
      ></path>
    </svg>
  `;

  // This callback will be fired when geolocation info is available
  successCallback(position: GeolocationPosition) {
    // Set hasGeolocationPermission state true to change the template
    if (!this._hasGeolocationPermission) this._hasGeolocationPermission = true;

    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    // targetPosition attribute must be set for geolocation feature to work
    if (!this.targetPosition) return;

    // Get target position in latitudes and longitudes
    const targetLatLng = L.latLng(this.targetPosition);

    // Get current position in latitudes and longitudes
    const currentLatLng = L.latLng(pos);

    // Calculate the distance between target and current position in meters
    const betweenMeters = currentLatLng.distanceTo(targetLatLng);

    // Update the proximity text according to the distance remaining
    if (betweenMeters > 1000) {
      this._targetProximityText = `${(betweenMeters / 1000).toFixed()} KM`;
    } else if (betweenMeters > 100) {
      this._targetProximityText = `${betweenMeters.toFixed(0)} M`;
    } else {
      // If target is close less then 100 meters user has arrived to target location
      if (this._watchId) {
        // Stop watching location
        navigator.geolocation.clearWatch(this._watchId);
        // Update state to reveal the image
        this._arrived = true;
      }
    }
  }

  // This callback will be fired on geolocation error
  errorCallback(err: GeolocationPositionError) {
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

  // This template is shown when user hasn't give geolocation permission yet
  // When user click the button user is asked for geolocation permission
  permissionButtonTemplate() {
    return html`
      <div class="flex flex-col justify-center gap-4 overlay">
        <button
          id="unlock-content-button"
          class="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md text-lg p-6 text-md"
        >
          İçerik Kilitli
        </button>
        <div
          class="rounded-lg border bg-card text-card-foreground shadow-sm p-2"
        >
          <div class="pb-0 text-center flex flex-col gap-4">
            <p id="locked-content-description">
              Ne kadar yaklaştığını görmek için aşağıdaki butona bas.
            </p>
            <button
              @click="${this._startWatchingLocation}"
              class="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-9 rounded-md px-3 bg-green-700 hover:bg-green-600 text-md"
            >
              Konum İzni Ver
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // This template is shown when user has given permission but has not arrived yet
  lockedButtonTemplate() {
    return html`<div class="flex flex-col justify-center gap-4 overlay">
      <button
        id="unlock-content-button"
        class="inline-flex gap-2 items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md text-lg p-6 text-md"
      >
        ${this.lockSVG}
        <p>İçerik Kilitli</p>
      </button>
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-2">
        <div class="pb-0 px-4 text-center">
          <p id="locked-content-description">
            İçeriği görmek için konuma gitmelisin! Kalan mesafe:
            ${this._targetProximityText}
          </p>
        </div>
      </div>
    </div>`;
  }

  // This template is shown when user has arrived to the target location
  // When user click the button counter at the bottom of the page is incremented
  // and image is revealed
  unlockedButtonTemplate() {
    return html` <div class="flex flex-col justify-center gap-4 overlay">
      <button
        @click="${() => {
          this._incrementUnlockCounter(this.imageId);
          this._unlocked = true;
        }}"
        id="unlock-content-button"
        class="inline-flex gap-2 items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-11 rounded-md text-lg p-6 animate-pulse bg-indigo-600 hover:bg-indigo-700 hover:animate-none border-2 border-indigo-800"
      >
        ${this.unlockSVG}
        <p>İçeriğin Kilidi Açıldı</p>
      </button>

      <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-2">
        <div class="pb-0 px-4 text-center">
          <p id="locked-content-description">İçeriği görmek için butona bas!</p>
        </div>
      </div>
    </div>`;
  }

  // Start watching user location, if user has not given permission yet
  // this will ask the user for permission and update the watch id
  private _startWatchingLocation() {
    const id = navigator.geolocation.watchPosition(
      this.successCallback.bind(this),
      this.errorCallback.bind(this),
      this.geolocationOptions
    );

    this._watchId = id;
  }

  // This counter is shown at the bottom of the page and incremented
  // each time "show content" button is clicked
  private async _incrementUnlockCounter(id: string | undefined) {
    if (id) {
      fetch(`http://localhost:3000/api/location/increment/${id}`, {
        method: "PATCH",
      });
    }
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
            this._hasGeolocationPermission = true;
            this._startWatchingLocation();
            break;
          case "denied":
          case "prompt":
          default:
            this._hasGeolocationPermission = false;
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
      buttonTemplate = this.unlockedButtonTemplate.bind(this);
    } else if (this._hasGeolocationPermission) {
      buttonTemplate = this.lockedButtonTemplate.bind(this);
    } else {
      buttonTemplate = this.permissionButtonTemplate.bind(this);
    }

    return html`
      <div
        class="w-full h-[475px] overflow-hidden border border-zinc-200 shadow-sm p-4 rounded"
      >
        <div class="flex flex-col justify-center items-center image-wrapper">
          <img
            id="content"
            src="${this.imageURL}"
            class="${this._unlocked ? nothing : "blur-2xl"} h-[450px]"
          />

          ${this._unlocked ? nothing : buttonTemplate()}
        </div>
      </div>
    `;
  }
}
