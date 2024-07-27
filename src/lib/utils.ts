import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Toastify from "toastify-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toast(errorMessage: string) {
  Toastify({
    text: errorMessage,
    duration: 3000,
    gravity: "top",
    position: "center",
    stopOnFocus: true,
    style: {
      background: "black",
      borderRadius: "6px",
      margin: "16px",
    },
    onClick: function () {},
  }).showToast()
}
