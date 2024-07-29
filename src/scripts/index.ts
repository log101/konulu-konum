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
  e.preventDefault()
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

  const formData = new FormData(e.target as HTMLFormElement)

  const res = await fetch(`http://127.0.0.1:3000/api/location`, {
    method: "POST",
    body: formData,
  })

  if (res.status === 200) {
    const data = await res.json()

    if (data.url) location.assign(`/x?id="${data.url}"`)
  } else {
    toast("Konulu konum oluşturulamadı, lütfen tekrar deneyin.")
  }
}

document.getElementById("sample-form")!.onsubmit = handleSubmit

document.getElementById("photo-selector")!.oninput = (ev) =>
  validateFileInput(ev.target as HTMLInputElement)
