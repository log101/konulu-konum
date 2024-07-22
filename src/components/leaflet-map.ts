// Lit
import {
  html,
  LitElement,
  unsafeCSS,
  type CSSResultGroup,
  type PropertyValues,
} from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

// Leaflet
import L, { Map } from "leaflet";
import type { LatLngTuple } from "leaflet";
import { currentLocationIcon, targetLocationIcon } from "./LeafletMap/icons";
import { GeolocationControl, GoToTargetControl } from "./LeafletMap/controls";

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

  @query("#go-to-target-control-button")
  _goToTargetButton!: HTMLButtonElement;

  @query("#ask-permission-control-button")
  _askPermissionButton!: HTMLButtonElement;

  // Properties and states
  @property({ type: Object, noAccessor: true }) targetPosition?: LatLngTuple;
  @property({ type: Object })
  currentPosition?: LatLngTuple;

  @state()
  protected _map?: L.Map;
  @state()
  protected _currentLocationMarker?: L.Marker;

  firstUpdated(): void {
    if (!this._mapElement || !this.targetPosition) return;
    this._map = new Map(this._mapElement).setView(this.targetPosition, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this._map);

    // Add target location icon marker
    L.marker(this.targetPosition, { icon: targetLocationIcon }).addTo(
      this._map
    );

    L.circle(this.targetPosition, {
      color: "blue",
      fillColor: "#30f",
      fillOpacity: 0.2,
      radius: 50,
    }).addTo(this._map);

    // Add target location control
    const targetLocationControl = new GoToTargetControl({
      position: "bottomleft",
    });

    targetLocationControl.setTargetLocation(this.targetPosition);
    targetLocationControl.addTo(this._map);
  }

  protected update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
    if (changedProperties.get("currentPosition")) {
      if (!this._currentLocationMarker && this._map) {
        this._currentLocationMarker = L.marker(this.currentPosition!, {
          icon: currentLocationIcon,
        });
        this._currentLocationMarker.addTo(this._map);

        const geolocationControl = new GeolocationControl({
          position: "bottomleft",
        });

        geolocationControl.setCurrentLocationMarker(
          this._currentLocationMarker
        );
        geolocationControl.addTo(this._map);
      } else if (this._currentLocationMarker) {
        this._currentLocationMarker.setLatLng(this.currentPosition!);
      }
    }
  }

  render() {
    return html`<div id="mapid" class="w-full h-[450px] rounded"></div>`;
  }
}
