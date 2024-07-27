/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@types/google.maps" />
/// <reference types="@types/leaflet" />

export declare global {
  interface Window {
    htmx: any
  }

  namespace astroHTML.JSX {
    interface HTMLAttributes {
      _?: any
    }
  }
}
