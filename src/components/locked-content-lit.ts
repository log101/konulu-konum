import { LitElement, html, unsafeCSS, type CSSResultGroup } from "lit";
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

  // Static properties, no accessor attribute disables detecting changes
  // as these are readonly attriubtes there is no need to attach setters
  @property({ noAccessor: true }) readonly imageId?: string;
  @property({ noAccessor: true }) readonly imageURL?: string;
  @property({ type: Object, noAccessor: true })
  readonly targetPosition?: LatLngTuple;

  // Reactive state
  @state()
  protected _hasGeolocationPermission = false;
  @state()
  protected _unlocked = false;
  @state()
  protected _targetProximity?: string;
  @state()
  protected _watchId?: number;

  // This callback will be fired when geolocation info is available
  successCallback(position: GeolocationPosition) {
    if (!this._hasGeolocationPermission) this._hasGeolocationPermission = true;

    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    if (!this.targetPosition) return;

    const targetLatLng = L.latLng(this.targetPosition);

    const currentLatLng = L.latLng(pos);

    const betweenMeters = currentLatLng.distanceTo(targetLatLng);

    if (betweenMeters > 1000) {
      this._targetProximity = `${(betweenMeters / 1000).toFixed()} KM`;
    } else if (betweenMeters > 100) {
      this._targetProximity = `${betweenMeters.toFixed(0)} M`;
    } else {
      if (this._watchId) {
        navigator.geolocation.clearWatch(this._watchId);
        this._unlocked = true;
      }
    }
  }

  // This callback will be fired on geolocation error
  errorCallback(err: GeolocationPositionError) {
    let errorMessage;
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

  lockedButtonTemplate() {
    return html`<div class="flex flex-col justify-center gap-4 overlay">
      <button
        id="unlock-content-button"
        class="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md text-lg p-6 text-md"
      >
        İçerik Kilitli
      </button>
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-2">
        <div class="pb-0 px-4 text-center">
          <p id="locked-content-description">
            İçeriği görmek için konuma gitmelisin! Kalan mesafe:
            ${this._targetProximity}
          </p>
        </div>
      </div>
    </div>`;
  }

  unlockedButtonTemplate() {
    return html` <div class="flex flex-col justify-center gap-4 overlay">
      <button
        id="unlock-content-button"
        class="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-11 rounded-md text-lg p-6 animate-pulse bg-indigo-600 hover:bg-indigo-700 hover:animate-none border-2 border-indigo-800"
      >
        İçeriğin Kilidi Açıldı
      </button>

      <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-2">
        <div class="pb-0 px-4 text-center">
          <p id="locked-content-description">İçeriği görmek için butona bas!</p>
        </div>
      </div>
    </div>`;
  }

  private _startWatchingLocation() {
    // start geolocation services
    const id = navigator.geolocation.watchPosition(
      this.successCallback.bind(this),
      this.errorCallback.bind(this),
      this.geolocationOptions
    );

    this._watchId = id;
  }

  connectedCallback(): void {
    super.connectedCallback();

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

    if (this._unlocked) {
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
          <img id="content" src="${this.imageURL}" class="blur-2xl h-[450px]" />

          ${buttonTemplate()}
        </div>
      </div>
    `;
  }
}
