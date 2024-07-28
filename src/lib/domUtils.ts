import { incrementUnlockCounter } from "../components/LockedContent/serverUtils"

function updateText(elemId: string, text: string) {
  const elem = document.getElementById(elemId)
  if (elem) elem.innerText = text
  else console.error("Element could not be found!")
}

function updateInputValue(elemId: string, value: string) {
  const elem = document.getElementById(elemId) as HTMLInputElement
  if (elem) elem.value = value
  else console.error("Element could not be found!")
}

function toggleClass(elemId: string, className: string) {
  const elem = document.getElementById(elemId)
  if (elem) elem.classList.toggle(className)
  else console.error("Element could not be found!")
}

function removeClasses(elemId: string, ...inputs: string[]) {
  const elem = document.getElementById(elemId)
  if (elem) elem.classList.remove(...inputs)
  else console.error("Element could not be found!")
}

function addClasses(elemId: string, ...inputs: string[]) {
  const elem = document.getElementById(elemId)
  if (elem) elem.classList.add(...inputs)
  else console.error("Element could not be found!")
}

function removeElement(elemId: string) {
  const elem = document.getElementById(elemId)
  if (elem) elem.remove()
  else console.error("Element could not be found!")
}

function addAttribute(elemId: string, attribute: string, value: string) {
  const elem = document.getElementById(elemId)
  if (elem) elem.setAttribute(attribute, value)
  else console.error("Element could not be found!")
}

function revealContent() {
  incrementUnlockCounter(document.URL.slice(-12))
  removeClasses("content", "blur-2xl")
  removeElement("unlock-button-container")
}

function validateFileInput(el: HTMLInputElement) {
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

export {
  addClasses,
  removeClasses,
  removeElement,
  toggleClass,
  updateText,
  updateInputValue,
  revealContent,
  addAttribute,
  validateFileInput,
  toggleButton,
}
