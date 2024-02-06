import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function remoteLog(data: any) {
  fetch("/api/debug", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
}
