import L, { type LatLngTuple } from "leaflet";
import Toastify from "toastify-js";

class LockedContent extends HTMLElement {
  watchId: number;
  targetPos: LatLngTuple;
  geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  constructor() {
    super();

    // Clone the template
    let template = document.getElementById(
      "locked-content-template"
    ) as HTMLTemplateElement;
    let templateContent = template.content;

    // Get attributes
    const imageURL = this.getAttribute("imageURL") ?? "#";
    const targetPosAttribute = this.getAttribute("targetPos") ?? "[]";
    this.targetPos = JSON.parse(targetPosAttribute);

    // Attach cloned template to DOM
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(templateContent.cloneNode(true));

    // Set image source URL
    const content = shadowRoot.getElementById("content") as HTMLImageElement;
    content.src = imageURL;

    // start geolocation services
    const id = navigator.geolocation.watchPosition(
      this.successCallback.bind(this),
      this.errorCallback,
      this.geolocationOptions
    );

    this.watchId = id;
  }

  changeDescription(description: string) {
    const descriptionElement = this?.shadowRoot?.getElementById(
      "locked-content-description"
    );

    if (descriptionElement) {
      descriptionElement.innerText = description;
    }
  }

  unlockContent() {
    const unlockButton = this?.shadowRoot?.getElementById(
      "unlock-content-button-element"
    );

    if (unlockButton) {
      unlockButton.removeAttribute("locked");
    }
  }

  // This callback will be fired when geolocation info is available
  successCallback(position: GeolocationPosition) {
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    const targetLatLng = L.latLng(this.targetPos);

    const currentLatLng = L.latLng(pos);

    const betweenMeters = currentLatLng.distanceTo(targetLatLng);

    if (betweenMeters > 1000) {
      this.changeDescription(`${(betweenMeters / 1000).toFixed()} KM`);
    } else if (betweenMeters > 100) {
      this.changeDescription(`${betweenMeters.toFixed(0)} M`);
    } else {
      navigator.geolocation.clearWatch(this.watchId);
      this.unlockContent();
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
}

class UnlockContentButton extends HTMLElement {
  host: HTMLElement | null;
  // Templates are required to create nodes
  permissionTemplateContent: DocumentFragment | null;
  lockedTemplateContent: DocumentFragment | null;
  unlockedTemplateContent: DocumentFragment | null;

  // Image element to blur and show when user is on target
  imageElement: HTMLElement | null;

  // Content id is required to count how many times a content
  // is unlocked
  contentId: string | null;

  static observedAttributes = ["locked"];

  incrementCounter = async (id: string) =>
    fetch(`http://localhost:3000/api/location/increment/${id}`, {
      method: "PATCH",
    });

  constructor() {
    super();

    const host = document.getElementById("locked-content");
    this.host = host;

    this.contentId = host?.getAttribute("contentId") ?? null;

    let permissionTemplate = host?.shadowRoot?.getElementById(
      "locked-button-template"
    ) as HTMLTemplateElement | null;
    this.permissionTemplateContent = permissionTemplate?.content ?? null;

    let lockedTemplate = host?.shadowRoot?.getElementById(
      "locked-button-template"
    ) as HTMLTemplateElement | null;
    this.lockedTemplateContent = lockedTemplate?.content ?? null;

    let unlockedTemplate = host?.shadowRoot?.getElementById(
      "unlocked-button-template"
    ) as HTMLTemplateElement | null;
    this.unlockedTemplateContent = unlockedTemplate?.content ?? null;

    this.imageElement = host?.shadowRoot?.getElementById("content") ?? null;
  }

  connectedCallback() {
    if (this.hasAttribute("locked")) {
      if (this.lockedTemplateContent) {
        this.appendChild(this.lockedTemplateContent.cloneNode(true));
      }
    } else {
      if (this.unlockedTemplateContent) {
        this.appendChild(this.unlockedTemplateContent.cloneNode(true));
      }
    }
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name != "locked") return;

    if (newValue == "true") {
      const child = this.firstElementChild;
      if (this.lockedTemplateContent)
        child?.replaceWith(this.lockedTemplateContent.cloneNode(true));
      this.replaceWith;
    } else {
      const child = this.firstElementChild;
      if (this.unlockedTemplateContent)
        child?.replaceWith(this.unlockedTemplateContent.cloneNode(true));

      const unlockButton = this.host?.shadowRoot?.getElementById(
        "unlock-content-button"
      );

      unlockButton?.addEventListener("click", (el) => {
        if (this.contentId) {
          this.incrementCounter(this.contentId);
        }
        this.imageElement?.classList.remove("blur-2xl");
        this.remove();
      });
    }
  }
}

customElements.define("locked-content", LockedContent);
customElements.define("unlock-content-button", UnlockContentButton);
