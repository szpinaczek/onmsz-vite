export type Language = "pl" | "en";

export interface Frame {
  time: number;
  lat: number;
  lng: number;
  description: {
    pl: string;
    en: string;
  };
  info?: {
    pl: string;
    en: string;
  };
  distance?: number;
  totalDistance?: number;
  speed?: number;
  // Manual panorama fields
  panoId?: string;       // Custom Google Street View panorama ID
  heading?: number;      // Custom heading (0-360 degrees)
  pitch?: number;        // Custom pitch (-90 to 90 degrees)
  zoom?: number;         // Custom zoom level
  customImage?: string;  // URL to custom spherical/360 image
}

export interface MapData {
  frames: Frame[];
  route: [number, number][];
}

export interface MapComponentProps {
  mapData: MapData;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  language: Language;
  apiKey?: string;
}

export interface MapComponentHandle {
  seekToTime: (time: number) => void;
} 

export interface GoogleMapData extends MapData {
  apiKey: string;
}

export interface StreetViewData {
  panoId?: string;
  heading?: number;
  pitch?: number;
  available: boolean;
  error?: string;
}
