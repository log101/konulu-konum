import { html, type TemplateResult } from "lit";
import { lockSVG, unlockSVG } from "./svg";

// This template is shown when user hasn't give geolocation permission yet
// When user click the button user is asked for geolocation permission
function permissionButtonTemplate(onClickHandler: () => void) {
  return html`
    <div class="flex flex-col justify-center gap-4 overlay">
      <button
        id="unlock-content-button"
        class="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md text-lg p-6 text-md"
      >
        İçerik Kilitli
      </button>
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-2">
        <div class="pb-0 text-center flex flex-col gap-4">
          <p id="locked-content-description">
            Ne kadar yaklaştığını görmek için aşağıdaki butona bas.
          </p>
          <button
            @click="${onClickHandler}"
            class="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-9 rounded-md px-3 bg-green-700 hover:bg-green-600 text-md"
          >
            Konum İzni Ver
          </button>
        </div>
      </div>
    </div>
  `;
}

// This template is shown when user has not given permission
function permissionDeniedButtonTemplate() {
  return html`<div class="flex flex-col justify-center gap-4 overlay">
    <button
      id="unlock-content-button"
      class="inline-flex gap-2 items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md text-lg p-6 text-md"
    >
      ${lockSVG}
      <p>İçerik Kilitli</p>
    </button>
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-2">
      <div class="pb-0 px-4 text-center">
        <p id="locked-content-description">
          Konumuna erişim izni vermediğin için hedefe ne kadar <br />
          yakın olduğun tespit edilemiyor.
        </p>
      </div>
    </div>
  </div>`;
}

// This template is shown when user has given permission but has not arrived yet
function lockedButtonTemplate(proximityText: string | undefined) {
  return html`<div class="flex flex-col justify-center gap-4 overlay">
    <button
      id="unlock-content-button"
      class="inline-flex gap-2 items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md text-lg p-6 text-md"
    >
      ${lockSVG}
      <p>İçerik Kilitli</p>
    </button>
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-2">
      <div class="pb-0 px-4 text-center">
        <p id="locked-content-description">
          İçeriği görmek için konuma gitmelisin! Kalan mesafe: ${proximityText}
        </p>
      </div>
    </div>
  </div>`;
}

// This template is shown when user has arrived to the target location
// When user click the button counter at the bottom of the page is incremented
// and image is revealed
function unlockedButtonTemplate(onClickHandler: () => void) {
  return html` <div class="flex flex-col justify-center gap-4 overlay">
    <button
      @click="${onClickHandler}"
      id="unlock-content-button"
      class="inline-flex gap-2 items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-11 rounded-md text-lg p-6 animate-pulse bg-indigo-600 hover:bg-indigo-700 hover:animate-none border-2 border-indigo-800"
    >
      ${unlockSVG}
      <p>İçeriğin Kilidi Açıldı</p>
    </button>

    <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-2">
      <div class="pb-0 px-4 text-center">
        <p id="locked-content-description">İçeriği görmek için butona bas!</p>
      </div>
    </div>
  </div>`;
}

export {
  lockedButtonTemplate,
  unlockedButtonTemplate,
  permissionButtonTemplate,
  permissionDeniedButtonTemplate,
};
