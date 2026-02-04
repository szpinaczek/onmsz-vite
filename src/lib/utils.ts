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

    // Extract coordinates from URL params
    const coordsMatch = url.match(/@([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)/)
    if (!coordsMatch) return null
    const lat = parseFloat(coordsMatch[1])
    const lng = parseFloat(coordsMatch[2])

        // Extract pitch and heading - support both URL formats
    let pitch: number | undefined
    let heading: number | undefined

    // Format 1: Standard Google Street View (streetviewpixels-pa.googleapis.com)
    const standardMatch = url.match(/pitch%3D([-+]?\d*\.?\d+)%26panoid%3D[^%]+%26yaw%3D([-+]?\d*\.?\d+)/)
    if (standardMatch) {
      pitch = parseFloat(standardMatch[1])
      heading = parseFloat(standardMatch[2])
    } else {
      // Format 2: User-contributed photo spheres (lh3.googleusercontent.com)
      const userContributedPitchMatch = url.match(/pi-([-+]?\d*\.?\d+)/)
      const userContributedHeadingMatch = url.match(/ya(\d+(\.\d+)?)/)
      
      if (userContributedPitchMatch) {
        pitch = parseFloat(userContributedPitchMatch[1])
      }
      
      // Check for ya parameter in various formats
      if (userContributedHeadingMatch) {
        heading = parseFloat(userContributedHeadingMatch[1])
      } else {
        const yaDashMatch = url.match(/ya-([-+]?\d*\.?\d+)/)
        if (yaDashMatch) {
          heading = parseFloat(yaDashMatch[1])
        }
      }
      
      // Fallback to @ parameters
      if (!heading) {
        const headingMatch = url.match(/@[^,]+,[^,]+,[^,]+,[^,]+,([\d.]+)h/)
        if (headingMatch) {
          heading = parseFloat(headingMatch[1])
        }
      }
      
      if (!pitch) {
        const pitchMatch = url.match(/@[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,([\d.]+)t/)
        if (pitchMatch) {
          // The "t" parameter is not pitch but something else - cap to reasonable range
          const rawPitch = parseFloat(pitchMatch[1])
          pitch = rawPitch > 90 ? 90 : (rawPitch < -90 ? -90 : rawPitch)
        }
      }
    }

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
    } else {
      // Check for FOV in user-contributed format (fo parameter)
      const foMatch = url.match(/fo-(\d+)/)
      if (foMatch) {
        fov = parseFloat(foMatch[1])
        const minFov = 10
        const maxFov = 120
        zoom = Math.max(0, Math.min(1, 1 - (fov - minFov) / (maxFov - minFov)))
      }
    }

    // Extract image dimensions
    const widthMatch = url.match(/!7i(\d+)/)
    const heightMatch = url.match(/!8i(\d+)/)
    const imageWidth = widthMatch ? parseInt(widthMatch[1]) : undefined
    const imageHeight = heightMatch ? parseInt(heightMatch[1]) : undefined

    return {
      id,
      pitch: pitch ?? 0,
      heading: heading ?? 0,
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
