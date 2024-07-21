// Lit
import { html, LitElement, unsafeCSS, type CSSResultGroup } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

// Leaflet
import L, { Map } from "leaflet";
import type { LatLngTuple } from "leaflet";
import { targetLocationIcon } from "./LeafletMap/icons";
import { GeolocationControl, GoToTargetControl } from "./LeafletMap/controls";

// Styles
import leafletStyles from "leaflet/dist/leaflet.css?inline";
import globalStyles from "@/styles/globals.css?inline";
import mapStyles from "@/styles/locked-page.css?inline";
import { onLocationError, onLocationSuccess } from "./LeafletMap/geolocation";

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

  @query("#go-to-target-control-button")
  _goToTargetButton!: HTMLButtonElement;

  @query("#ask-permission-control-button")
  _askPermissionButton!: HTMLButtonElement;

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
    this._map = new Map(this._mapElement).setView(this.targetLocation, 13);

    this._map.on("locationerror", onLocationError);

    this._map.on("locationfound", (ev) =>
      onLocationSuccess(ev, this._map!, this._currentLocationMarker)
    );

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this._map);

    // Add target location icon marker
    L.marker(this.targetLocation, { icon: targetLocationIcon }).addTo(
      this._map
    );

    L.circle(this.targetLocation, {
      color: "blue",
      fillColor: "#30f",
      fillOpacity: 0.2,
      radius: 50,
    }).addTo(this._map);

    // Add target location control
    const targetLocationControl = new GoToTargetControl({
      position: "bottomleft",
    });

    targetLocationControl.setTargetLocation(this.targetLocation);
    targetLocationControl.addTo(this._map);

    // Check geolocation permission, if user has given permission before
    // start watching user location
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        switch (permissionStatus.state) {
          case "granted":
            this._geolocationPermissionStatus = "granted";
            const locateUserControl = new GeolocationControl({
              // @ts-expect-error
              title: "Konumuma Git",
              position: "bottomleft",
            });
            locateUserControl.setCurrentLocationMarker(
              this._currentLocationMarker
            );
            locateUserControl.addTo(this._map!);
            break;
          case "denied":
            this._geolocationPermissionStatus = "denied";
            break;
          case "prompt":
            const askPermissionControl = new GeolocationControl({
              position: "bottomleft",
            });

            askPermissionControl.addTo(this._map!);
            break;
          default:
            break;
        }
      });
  }

  render() {
    return html`<div id="mapid" class="w-full h-[450px] rounded"></div>`;
  }
}
