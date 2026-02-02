declare module "*.css";
declare module "@fontsource/*" {}
declare module "@fontsource-variable/*" {}

// Type definitions for Google Maps API
interface Window {
  google?: any;
  onGoogleMapsLoaded?: () => void;
}

declare namespace google {
  namespace maps {
    class StreetViewPanorama {
      constructor(element: HTMLElement, options: any);
      setPosition(position: { lat: number; lng: number }): void;
      setPov(pov: { heading: number; pitch: number }): void;
      setZoom(zoom: number): void;
      getZoom(): number;
    }
  }
}