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
  fov?: number  // Field of view (zoom) in degrees
  zoom?: number // Alternative zoom representation (0-1)
  imageWidth?: number
  imageHeight?: number
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

    // Extract field of view (FOV) - look for patterns like 75y
    const fovMatch = url.match(/@[^,]+,[^,]+,[^,]+,([\d.]+)y/)
    let fov: number | undefined
    let zoom: number | undefined
    if (fovMatch) {
      fov = parseFloat(fovMatch[1])
      // Convert FOV to zoom (0-1, where 0 is most zoomed out, 1 is most zoomed in)
      // Google Maps uses FOV range approximately 10° (zoom in) to 120° (zoom out)
      const minFov = 10
      const maxFov = 120
      zoom = Math.max(0, Math.min(1, 1 - (fov - minFov) / (maxFov - minFov)))
    }

    // Extract image dimensions
    const widthMatch = url.match(/!7i(\d+)/)
    const heightMatch = url.match(/!8i(\d+)/)
    const imageWidth = widthMatch ? parseInt(widthMatch[1]) : undefined
    const imageHeight = heightMatch ? parseInt(heightMatch[1]) : undefined

    return {
      id,
      pitch,
      heading,
      lat,
      lng,
      fov,
      zoom,
      imageWidth,
      imageHeight
    }
  } catch (error) {
    console.error('Error extracting Street View parameters:', error)
    return null
  }
}
