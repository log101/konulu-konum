import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("locked-content-lit")
export class LockedContent extends LitElement {
  // Static properties
  @property() readonly imageId?: string;
  @property() readonly imageURL?: string;
  @property({ type: Object })
  readonly targetPosition?: [lat: number, lng: number];

  // Reactive state
  @state()
  protected _hasGeolocationPermission = false;
  @state()
  protected _unlocked = false;
  @state()
  protected _targetProximity?: number;

  render() {
    return html`
      <div>
        Hello from MyElement! ${this.imageId}
        <p>${this.targetPosition}</p>
      </div>
    `;
  }
}
