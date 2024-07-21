// Lit
import { html, LitElement, unsafeCSS, type CSSResultGroup } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

// Leaflet
import L, { Map } from "leaflet";
import type { LatLngTuple } from "leaflet";
import { targetLocationIcon } from "./LeafletMap/icons";
import { TargetLocationControl } from "./LeafletMap/controls";

// Styles
import leafletStyles from "leaflet/dist/leaflet.css?inline";
import globalStyles from "@/styles/globals.css?inline";
import mapStyles from "@/styles/locked-page.css?inline";

@customElement("leaflet-map")
export class LeafletMap extends LitElement {
  // Styles
  static styles?: CSSResultGroup | undefined = [
    unsafeCSS(leafletStyles),
    unsafeCSS(globalStyles),
    unsafeCSS(mapStyles),
  ];

  // Div element to initialize Leaflet in
  @query("#mapid")
  _mapElement!: HTMLDivElement;

  // Properties and states
  @property({ type: Object }) targetLocation?: LatLngTuple;

  @state()
  protected _map?: L.Map;
  @state()
  protected _geolocationPermissionStatus: PermissionState = "prompt";
  @state()
  protected _currentLocationMarker?: L.Marker;
  @state()
  protected _watchingLocation = false;

  firstUpdated(): void {
    if (!this._mapElement || !this.targetLocation) return;
    var map = new Map(this._mapElement).setView(this.targetLocation, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add target location icon marker
    L.marker(this.targetLocation, { icon: targetLocationIcon }).addTo(map);

    L.circle(this.targetLocation, {
      color: "blue",
      fillColor: "#30f",
      fillOpacity: 0.2,
      radius: 50,
    }).addTo(map);

    // Add target location control
    const targetLocationControl = new TargetLocationControl({
      position: "bottomleft",
    });

    targetLocationControl.addTo(map);

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
    return html`<div id="mapid" class="w-full h-[450px] rounded"></div>`;
  }
}
