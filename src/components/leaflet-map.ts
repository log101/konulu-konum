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
import { targetLocationIcon } from "./LeafletMap/icons";
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
  @property({ type: Object, noAccessor: true }) targetLocation?: LatLngTuple;
  @property({ type: Object })
  currentPosition?: LatLngTuple;

  @state()
  protected _map?: L.Map;
  @state()
  protected _currentLocationMarker?: L.Marker;

  firstUpdated(): void {
    if (!this._mapElement || !this.targetLocation) return;
    this._map = new Map(this._mapElement).setView(this.targetLocation, 13);

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

    const currentLocationControl = new GeolocationControl({
      position: "bottomleft",
    });

    currentLocationControl.setCurrentLocationMarker(
      this._currentLocationMarker
    );
    currentLocationControl.addTo(this._map);
  }

  protected update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
    if (changedProperties.get("currentPosition")) {
      this._currentLocationMarker?.setLatLng(this.currentPosition!);
    }
  }

  render() {
    return html`<div id="mapid" class="w-full h-[450px] rounded"></div>`;
  }
}
