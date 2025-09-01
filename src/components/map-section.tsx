import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const mapStyles = `
  .leaflet-control-container .leaflet-control {
    z-index: 1000 !important;
  }
  .leaflet-control-zoom {
    z-index: 1000 !important;
  }
  .leaflet-control-attribution {
    z-index: 1000 !important;
  }
  .leaflet-control-home {
    z-index: 1000 !important;
    background: white;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  .leaflet-control-home:hover {
    background: #f4f4f4;
    }
  .leaflet-control-zoom a {
    background-color: white !important;
    color: black !important;
  }
  .leaflet-control-attribution {
    background-color: rgb(230, 230, 230) !important;
    color: black !important;
  }
  .leaflet-control-attribution a {
    color: rgb(56, 54, 41) !important;
  }
  .dark .leaflet-control-home {
    background-color: black !important;
  }
  .dark .leaflet-control-home:hover {
    background: #374151;
  }
  .dark .leaflet-control-home svg {
    stroke: white;
  }
  .dark .leaflet-control-layers a {
    background-color: black !important;
    color: black !important;
  }
  .dark .leaflet-control-zoom a {
    background-color:white !important;
    color: black !important;
  }
  .dark .leaflet-control-attribution {
    background-color: black !important;
    color: lightgray !important;
  }
  .dark .leaflet-control-attribution a {
    color: gray !important;
  }
  .dark .leaflet-container {
    background: #000;
  }
  
  /* Apply filter to all layers in dark mode by default */
  .dark .leaflet-layer,
  .dark .leaflet-control-zoom-in,
  .dark .leaflet-control-zoom-out {
    filter: invert(100%) sepia(1) hue-rotate(0deg) brightness(95%) contrast(90%);
  }
  
  /* Remove filter for satellite map in dark mode */
  body.satellite-active.dark .leaflet-layer {
    filter: none !important;
  }
  
  /* Ensure zoom controls always have the filter */
  body.satellite-active.dark .leaflet-control-zoom-in,
  body.satellite-active.dark .leaflet-control-zoom-out {
    filter: invert(100%) sepia(1) hue-rotate(0deg) brightness(95%) contrast(90%);
  }
`;

// Tworzymy własną ikonę dla znacznika aktualnej pozycji
const CurrentPositionIcon = L.icon({
  iconUrl: "/images/marker-icon-red.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  // popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Ikona dla punktów kluczowych (kropka)
const KeyFrameIcon = L.divIcon({
  className: 'key-frame-marker',
  html: '<div class="w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-gray-200 shadow-md"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

export interface MapComponentHandle {
  seekToTime: (time: number) => void;
}

interface FrameData {
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
}

interface MapData {
  frames: FrameData[];
  route: [number, number][];
}

interface InterpolatedPosition {
  lat: number;
  lng: number;
  description: string;
  prevFrame: FrameData | null;
  nextFrame: FrameData | null;
  progress: number;
}

interface MapComponentProps {
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  language: 'pl' | 'en';
}

const MapComponent = forwardRef<MapComponentHandle, MapComponentProps>(({ currentTime, onTimeUpdate, language }, ref) => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [currentPosition, setCurrentPosition] = useState<InterpolatedPosition | null>(null);
  const [isSatelliteActive, setIsSatelliteActive] = useState<boolean>(false);
  const lastUpdateTime = useRef<number>(0);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userClickedRef = useRef<boolean>(false);
  const clickedPositionRef = useRef<{ lat: number, lng: number } | null>(null);

  // Calculate interpolated position based on current time
  const calculateInterpolatedPosition = (time: number, frames: FrameData[]): InterpolatedPosition | null => {
    if (frames.length === 0) return null;

    // If time is before the first frame or after the last frame
    if (time <= frames[0].time) {
      return {
        lat: frames[0].lat,
        lng: frames[0].lng,
        description: frames[0].description[language],
        prevFrame: null,
        nextFrame: frames[0],
        progress: 0
      };
    }

    if (time >= frames[frames.length - 1].time) {
      const lastFrame = frames[frames.length - 1];
      return {
        lat: lastFrame.lat,
        lng: lastFrame.lng,
        description: lastFrame.description[language],
        prevFrame: lastFrame,
        nextFrame: null,
        progress: 1
      };
    }

    // Find the frames before and after the current time
    let prevFrameIndex = 0;
    for (let i = 0; i < frames.length - 1; i++) {
      if (frames[i].time <= time && frames[i + 1].time > time) {
        prevFrameIndex = i;
        break;
      }
    }

    const prevFrame = frames[prevFrameIndex];
    const nextFrame = frames[prevFrameIndex + 1];

    // Calculate progress between the two frames (0 to 1)
    const totalDuration = nextFrame.time - prevFrame.time;
    const elapsed = time - prevFrame.time;
    const progress = totalDuration > 0 ? elapsed / totalDuration : 0;

    // Linear interpolation between the two positions
    const lat = prevFrame.lat + (nextFrame.lat - prevFrame.lat) * progress;
    const lng = prevFrame.lng + (nextFrame.lng - prevFrame.lng) * progress;

    return {
      lat,
      lng,
      description: `${prevFrame.description[language]} → ${nextFrame.description[language]}`,
      prevFrame,
      nextFrame,
      progress
    };
  };

  useImperativeHandle(ref, () => ({
    seekToTime: (time: number) => {
      if (!mapData || mapData.frames.length === 0 || !mapRef.current) return;

      // Jeśli użytkownik właśnie kliknął w punkt, nie przesuwaj mapy
      if (userClickedRef.current) return;

      const interpolatedPosition = calculateInterpolatedPosition(time, mapData.frames);
      if (interpolatedPosition) {
        // Jeśli mamy zapisaną pozycję kliknięcia, sprawdź czy jesteśmy blisko niej
        if (clickedPositionRef.current) {
          const clickedPos = clickedPositionRef.current;

          // Sprawdź, czy pozycja kliknięcia jest blisko bieżącej pozycji (w promieniu 0.0001 stopnia)
          const isNearCurrentPos =
            Math.abs(clickedPos.lat - interpolatedPosition.lat) < 0.0001 &&
            Math.abs(clickedPos.lng - interpolatedPosition.lng) < 0.0001;

          // Jeśli jesteśmy blisko pozycji kliknięcia, wyczyść referencję
          if (isNearCurrentPos) {
            clickedPositionRef.current = null;
          } else {
            // W przeciwnym razie nie przesuwaj mapy
            return;
          }
        }

        // Natychmiast przesuń mapę do pozycji odpowiadającej podanemu czasowi
        mapRef.current.setView(
          [interpolatedPosition.lat, interpolatedPosition.lng],
          mapRef.current.getZoom(),
          { animate: true, duration: 0.5 }
        );
      }
    }
  }));

  // Load map data
  useEffect(() => {
    fetch("/frames.json")
      .then(response => response.json())
      .then(data => setMapData(data))
      .catch(error => console.error("Error loading map data:", error));
      
    // Clean up when component unmounts
    return () => {
      document.body.classList.remove('satellite-active');
    };
  }, []);

  // Update marker position based on current time
  useEffect(() => {
    if (!mapData || mapData.frames.length === 0) return;

    const interpolatedPosition = calculateInterpolatedPosition(currentTime, mapData.frames);
    if (interpolatedPosition) {
      setCurrentPosition(interpolatedPosition);

      // Nie przesuwamy mapy automatycznie - to będzie obsługiwane przez MapUpdater
      // lub przez bezpośrednie kliknięcia użytkownika
    }
  }, [currentTime, mapData]);

  const handlePolylineClick = (e: L.LeafletMouseEvent) => {
    if (!mapData || !mapData.frames.length || !mapRef.current) return;

    const { lat, lng } = e.latlng;

    // Find the closest frame to the clicked position
    const closestFrame = mapData.frames.reduce((prev, curr) => {
      const prevDistance = Math.sqrt(Math.pow(prev.lat - lat, 2) + Math.pow(prev.lng - lng, 2));
      const currDistance = Math.sqrt(Math.pow(curr.lat - lat, 2) + Math.pow(curr.lng - lng, 2));
      return currDistance < prevDistance ? curr : prev;
    });

    // Prevent rapid consecutive updates
    const now = Date.now();
    if (now - lastUpdateTime.current > 300) {
      lastUpdateTime.current = now;

      // Oznacz, że użytkownik kliknął i zapisz pozycję
      userClickedRef.current = true;
      clickedPositionRef.current = { lat: closestFrame.lat, lng: closestFrame.lng };

      // Natychmiast przesuń mapę do klikniętej pozycji
      mapRef.current.setView([closestFrame.lat, closestFrame.lng], mapRef.current.getZoom(), {
        animate: true,
        duration: 0.5
      });

      // Aktualizuj czas
      onTimeUpdate(closestFrame.time);

      // Resetuj flagę kliknięcia po krótkim czasie
      setTimeout(() => {
        userClickedRef.current = false;
      }, 1000);
    }
  };

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const MapUpdater = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    const userInteractionRef = useRef(false);

    // Store map reference
    useEffect(() => {
      mapRef.current = map;

      // Add event listeners to detect user interaction with the map
      const handleUserInteraction = () => {
        userInteractionRef.current = true;
        // Reset after a delay to allow automatic following again
        setTimeout(() => {
          userInteractionRef.current = false;
        }, 5000); // 5 seconds delay before auto-following again
      };

      // Add event listener for baselayerchange to detect when the user switches map layers
      const handleBaseLayerChange = (e: L.LayersControlEvent) => {
        // Check if the satellite layer is active
        const isSatellite = e.name === "Satellite map";
        setIsSatelliteActive(isSatellite);
        
        // Add or remove a class from the document body
        if (isSatellite) {
          document.body.classList.add('satellite-active');
          
          // Find all leaflet-layer elements and remove the filter directly
          setTimeout(() => {
            const layers = document.querySelectorAll('.leaflet-layer');
            layers.forEach(layer => {
              if (layer instanceof HTMLElement) {
                layer.style.filter = 'none';
              }
            });
            
            // Make sure zoom controls still have the filter
            const zoomControls = document.querySelectorAll('.leaflet-control-zoom-in, .leaflet-control-zoom-out');
            zoomControls.forEach(control => {
              if (control instanceof HTMLElement) {
                control.style.filter = 'invert(100%) sepia(1) hue-rotate(0deg) brightness(95%) contrast(90%)';
              }
            });
          }, 100);
        } else {
          document.body.classList.remove('satellite-active');
          
          // Reset the filter (let CSS handle it)
          setTimeout(() => {
            const layers = document.querySelectorAll('.leaflet-layer');
            layers.forEach(layer => {
              if (layer instanceof HTMLElement) {
                layer.style.filter = '';
              }
            });
          }, 100);
        }
      };

      map.on('dragstart', handleUserInteraction);
      map.on('zoomstart', handleUserInteraction);
      map.on('baselayerchange', handleBaseLayerChange);

      // Check if satellite layer is already active (in case of component remount)
      if (document.body.classList.contains('satellite-active')) {
        setIsSatelliteActive(true);
        setTimeout(() => {
          const layers = document.querySelectorAll('.leaflet-layer');
          layers.forEach(layer => {
            if (layer instanceof HTMLElement) {
              layer.style.filter = 'none';
            }
          });
          
          // Make sure zoom controls still have the filter
          const zoomControls = document.querySelectorAll('.leaflet-control-zoom-in, .leaflet-control-zoom-out');
          zoomControls.forEach(control => {
            if (control instanceof HTMLElement) {
              control.style.filter = 'invert(100%) sepia(1) hue-rotate(0deg) brightness(95%) contrast(90%)';
            }
          });
        }, 100);
      }

      return () => {
        map.off('dragstart', handleUserInteraction);
        map.off('zoomstart', handleUserInteraction);
        map.off('baselayerchange', handleBaseLayerChange);
        
        // Clean up the body class when component unmounts
        document.body.classList.remove('satellite-active');
      };
    }, [map]);

    // Handle position updates
    useEffect(() => {
      // Jeśli użytkownik właśnie kliknął w punkt, nie przesuwaj mapy automatycznie
      if (!position || userInteractionRef.current || userClickedRef.current) return;

      // Jeśli mamy zapisaną pozycję kliknięcia, użyj jej zamiast bieżącej pozycji
      if (clickedPositionRef.current) {
        const clickedPos = clickedPositionRef.current;

        // Sprawdź, czy pozycja kliknięcia jest blisko bieżącej pozycji (w promieniu 0.0001 stopnia)
        const isNearCurrentPos =
          Math.abs(clickedPos.lat - position[0]) < 0.0001 &&
          Math.abs(clickedPos.lng - position[1]) < 0.0001;

        // Jeśli jesteśmy blisko pozycji kliknięcia, wyczyść referencję
        if (isNearCurrentPos) {
          clickedPositionRef.current = null;
        } else {
          // W przeciwnym razie nie przesuwaj mapy
          return;
        }
      }

      // Only follow the marker if it's getting close to the edge of the visible area
      const bounds = map.getBounds();
      const point = L.latLng(position[0], position[1]);

      // Check if point is visible on the map
      if (!bounds.contains(point)) {
        // Point is outside visible area, center the map on it
        map.setView(position, map.getZoom(), { animate: true, duration: 0.5 });
        return;
      }

      // Calculate how close the point is to the edge (as a percentage of the visible area)
      const visibleWidth = bounds.getEast() - bounds.getWest();
      const visibleHeight = bounds.getNorth() - bounds.getSouth();

      const distanceToEast = bounds.getEast() - point.lng;
      const distanceToWest = point.lng - bounds.getWest();
      const distanceToNorth = bounds.getNorth() - point.lat;
      const distanceToSouth = point.lat - bounds.getSouth();

      const edgeThreshold = 0.2; // 20% of the visible area

      if (
        distanceToEast < visibleWidth * edgeThreshold ||
        distanceToWest < visibleWidth * edgeThreshold ||
        distanceToNorth < visibleHeight * edgeThreshold ||
        distanceToSouth < visibleHeight * edgeThreshold
      ) {
        map.setView(position, map.getZoom(), { animate: true, duration: 0.5 });
      }
    }, [map, position]);

    return null;
  };

  const resetView = () => {
    if (mapRef.current && mapData && mapData.frames.length > 0) {
      const points = mapData.frames.map(frame => L.latLng(frame.lat, frame.lng));
      const bounds = L.latLngBounds(points);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  if (!mapData) {
    return <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">Loading map data...</div>;
  }

  const defaultCenter: [number, number] = mapData.frames.length > 0 ? [mapData.frames[0].lat, mapData.frames[0].lng] : [51.8086928, 19.4710456];

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <style>{mapStyles}</style>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className={`w-full h-full map-container ${isSatelliteActive ? 'satellite-active' : 'standard-active'}`}
        style={{ height: '100%' }}
      >
        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="Standard map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              className="standard-map-layer"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite map">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community'
              className="satellite-map-layer"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Remaining route line */}
        <Polyline
          positions={mapData.frames.map(frame => [frame.lat, frame.lng])}
          pathOptions={{
            color: '#D93472',
            weight: 4,
            opacity: 0.7,
            lineJoin: 'round'
          }}
          eventHandlers={{
            click: handlePolylineClick
          }}
        />

        {/* Route markers */}
        {mapData?.frames.map((frame, index) => (
          <Marker
            key={index}
            position={[frame.lat, frame.lng]}
            icon={KeyFrameIcon}
            eventHandlers={{
              click: () => {
                const now = Date.now();
                if (now - lastUpdateTime.current > 300 && mapRef.current) {
                  lastUpdateTime.current = now;

                  // Oznacz, że użytkownik kliknął i zapisz pozycję
                  userClickedRef.current = true;
                  clickedPositionRef.current = { lat: frame.lat, lng: frame.lng };

                  // Natychmiast przesuń mapę do klikniętego markera
                  mapRef.current.setView([frame.lat, frame.lng], mapRef.current.getZoom(), {
                    animate: true,
                    duration: 0.5
                  });

                  // Aktualizuj czas
                  onTimeUpdate(frame.time);

                  // Resetuj flagę kliknięcia po krótkim czasie
                  setTimeout(() => {
                    userClickedRef.current = false;
                  }, 1000);
                }
              }
            }}
          />
        ))}

        {/* Current position marker */}
        {currentPosition && (
          <Marker
            position={[currentPosition.lat, currentPosition.lng]}
            icon={CurrentPositionIcon}
          />
        )}

        {/* Map updater component */}
        {currentPosition && (
          <MapUpdater position={[currentPosition.lat, currentPosition.lng]} />
        )}
      </MapContainer>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[999]">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 dark:bg-black hover:bg-white dark:hover:bg-black/90 text-gray-900 dark:text-gray-100"
          onClick={resetView}
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
MapComponent.displayName = 'MapComponent';
export default MapComponent;