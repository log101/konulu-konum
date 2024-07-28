import { addClasses, removeClasses } from "@/components/LockedContent/domUtils"
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

export function validateFileInput(el: HTMLInputElement) {
  const files = el.files

  if (!files) return

  if (files.length > 0) {
    if (files[0].size > 4 * 1024 * 1024) {
      el.setCustomValidity("Dosya boyutu 4 MB'den küçük olmalıdır.")
      el.reportValidity()
    } else {
      el.setCustomValidity("")
    }
  }
}

function toggleButton(elemId: string, spinnerId: string) {
  const elem = document.getElementById(elemId) as HTMLButtonElement | null
  const spinner = document.getElementById(spinnerId)

  if (!elem) {
    throw new Error("Element could not be found!")
  } else if (elem.disabled) {
    spinner?.classList.add("hidden")
    removeClasses(elemId, "bg-slate-500")
    addClasses(elemId, "bg-slate-900")
    elem.disabled = false
  } else {
    spinner?.classList.remove("hidden")
    removeClasses(elemId, "bg-slate-900")
    addClasses(elemId, "bg-slate-500")
    elem.disabled = true
    setTimeout(() => toggleButton(elemId, spinnerId), 1000)
  }
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

    if (data.url) location.assign("/" + data.url)
  } else {
    toast("Konulu konum oluşturulamadı, lütfen tekrar deneyin.")
  }
}

document.getElementById("sample-form")!.onsubmit = handleSubmit

document.getElementById("photo-selector")!.oninput = (ev) =>
  validateFileInput(ev.target as HTMLInputElement)
