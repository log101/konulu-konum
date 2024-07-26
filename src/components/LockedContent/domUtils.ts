import { incrementUnlockCounter } from "./serverUtils";

function updateText(elemId: string, text: string) {
  const elem = document.getElementById(elemId);
  if (elem) elem.innerText = text;
  else console.error("Element could not be found!");
}

function toggleClass(elemId: string, className: string) {
  const elem = document.getElementById(elemId);
  if (elem) elem.classList.toggle(className);
  else console.error("Element could not be found!");
}

function removeClasses(elemId: string, ...inputs: string[]) {
  const elem = document.getElementById(elemId);
  if (elem) elem.classList.remove(...inputs);
  else console.error("Element could not be found!");
}

function addClasses(elemId: string, ...inputs: string[]) {
  const elem = document.getElementById(elemId);
  if (elem) elem.classList.add(...inputs);
  else console.error("Element could not be found!");
}

function removeElement(elemId: string) {
  const elem = document.getElementById(elemId);
  if (elem) elem.remove();
  else console.error("Element could not be found!");
}

function revealContent() {
  incrementUnlockCounter(document.URL.slice(-12));
  removeClasses("content", "blur-2xl");
  removeElement("unlock-button-container");
}

export {
  addClasses,
  removeClasses,
  removeElement,
  toggleClass,
  updateText,
  revealContent,
};
