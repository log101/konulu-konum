// Lit
import { html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

// Leaflet
import L from "leaflet";
import type { LatLngTuple } from "leaflet";

@customElement("leaflet-map")
export class LeafletMap extends LitElement {
  @property({ type: Object }) targetLocation?: LatLngTuple;

  @query("#leaflet-map-container")
  _mapElement!: HTMLDivElement;

  @state()
  protected _map?: L.Map;
  @state()
  protected _geolocationPermissionStatus: PermissionState = "prompt";
  @state()
  protected _currentLocationMarker?: L.Marker;
  @state()
  protected _watchingLocation = false;

  connectedCallback(): void {
    super.connectedCallback();

    // Check geolocation permission, if user has given permission before
    // start watching user location
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        switch (permissionStatus.state) {
          case "granted":
            this._geolocationPermissionStatus = "granted";
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
    return html`<div
      id="leaflet-map-container"
      class="w-full h-[450px] rounded"
    ></div>`;
  }
}
