import { toggleButton, validateFileInput } from "@/lib/domUtils"
import { toast } from "@/lib/utils"

export function toggleMap() {
  const coordinatesText = document.getElementById("coordinates")

  const mapDiv = document.getElementById("map")

  mapDiv?.classList.add("border-slate-900")
  coordinatesText?.classList.add("drop-shadow-2xl")

  setTimeout(() => {
    mapDiv?.classList.remove("border-slate-900")
    coordinatesText?.classList.remove("drop-shadow-2xl")
  }, 800)
}

const handleSubmit = async (e: SubmitEvent) => {
  toggleButton("submit-button", "submit-button-spinner")
  const locationSelected = document.getElementById(
    "geolocation-input"
  ) as HTMLInputElement | null

  if (!locationSelected) {
    throw new Error("Element could not be found!")
  }

  if (!locationSelected.value) {
    const map = document.getElementById("map")
    map?.scrollIntoView({ behavior: "smooth", block: "center" })
    return toggleMap()
  }

  const inputEl = document.getElementById(
    "photo-selector"
  ) as HTMLInputElement | null

  if (!inputEl) {
    throw new Error("Element could not be found!")
  }

  validateFileInput(inputEl)
}

document.getElementById("sample-form")!.onsubmit = handleSubmit

document.getElementById("photo-selector")!.oninput = (ev) =>
  validateFileInput(ev.target as HTMLInputElement)

const url = new URL(document.URL)

if (url.searchParams.get("error"))
  toast("Konulu konum oluşturulamadı, lütfen tekrar deneyin.")
