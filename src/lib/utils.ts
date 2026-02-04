import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface StreetViewParams {
  id: string
  pitch: number
  heading: number
  lat: number
  lng: number
}

export function extractStreetViewParams(url: string): StreetViewParams | null {
  try {
    // Extract panorama ID
    const idMatch = url.match(/!1s([^!]+)/)
    if (!idMatch) return null
    const id = idMatch[1]

    // Extract pitch and heading from thumbnail URL
    const thumbnailMatch = url.match(/pitch%3D([-+]?\d*\.?\d+)%26panoid%3D[^%]+%26yaw%3D([-+]?\d*\.?\d+)/)
    if (!thumbnailMatch) return null
    const pitch = parseFloat(thumbnailMatch[1])
    const heading = parseFloat(thumbnailMatch[2])

    // Extract coordinates from URL params
    const coordsMatch = url.match(/@([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)/)
    if (!coordsMatch) return null
    const lat = parseFloat(coordsMatch[1])
    const lng = parseFloat(coordsMatch[2])

    return { id, pitch, heading, lat, lng }
  } catch (error) {
    console.error('Error extracting Street View parameters:', error)
    return null
  }
}
