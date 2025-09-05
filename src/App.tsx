// import './globals.css'
import './App.css'
import "@fontsource/open-sans"
import '@fontsource/special-elite';
import { ThemeProvider, useTheme } from "./components/theme-provider"
import Header from './components/header';
import { useLanguage } from './components/i18n/language-context';
import { AboutSection } from './components/about-section';
import { getTranslation } from './components/i18n/translations';
import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import VideoPlayer, { type VideoPlayerHandle } from './components/video-player';
import MapComponent from './components/map-section';
// import { Table } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import type { MapData, Language } from '@/types/map';
import { RouteTable } from './components/route-table';

interface MapComponentHandle {
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
  distance?: number;
  totalDistance?: number;
}


function App({ children }: { children?: React.ReactNode }) {

  const { language, setLanguage } = useLanguage();

  const handleLanguage = (data: Language) => {  
    setLanguage(data)  
  };

  const handleFullscreenChange = (isFullscreen: boolean) => {
    // Handle fullscreen change if needed
  };

  const handleTimeUpdate = (time: number) => {
    if (!isMapUpdating.current) {
      isVideoUpdating.current = true;
      setCurrentTime(time);
      if (mapRef.current) {
        mapRef.current.seekToTime(time);
      }
      setTimeout(() => {
        isVideoUpdating.current = false;
      }, 50);
    }
  };

  const handleMapTimeUpdate = (time: number) => {
    if (!isVideoUpdating.current) {
      isMapUpdating.current = true;
      setCurrentTime(time);
      if (videoPlayerRef.current) {
        videoPlayerRef.current.seekVideo(time);
      }
      // RouteTable will handle its own scrolling
      setTimeout(() => {
        isMapUpdating.current = false;
      }, 50);
    }
  };


  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number) => {
    return (value * Math.PI) / 180;
  };


  const [currentTime, setCurrentTime] = useState<number>(0);
  const [keyFrames, setKeyFrames] = useState<FrameData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  const mapRef = useRef<MapComponentHandle>(null);
  const isMapUpdating = useRef<boolean>(false);
  const isVideoUpdating = useRef<boolean>(false);
  // const tableRef = useRef<HTMLDivElement>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);

  // Load frames data
  useEffect(() => {
    setIsLoading(true);
    fetch("/frames.json")
      .then(response => response.json())
      .then(data => {
        if (data && data.frames) {
          // Oblicz odległości między punktami
          const frames = data.frames.map((frame: FrameData, index: number) => {
            if (index === 0) {
              return { ...frame, distance: 0, totalDistance: 0 };
            }
            
            const prevFrame = data.frames[index - 1];
            const distance = L.latLng(prevFrame.lat, prevFrame.lng)
              .distanceTo(L.latLng(frame.lat, frame.lng));
            
            // Oblicz całkowitą odległość od początku trasy
            const totalDistance = data.frames
              .slice(0, index + 1)
              .reduce((sum: number, f: FrameData, i: number) => {
                if (i === 0) return 0;
                const prev = data.frames[i - 1];
                return sum + L.latLng(prev.lat, prev.lng)
                  .distanceTo(L.latLng(f.lat, f.lng));
              }, 0);
            
            return {
              ...frame,
              distance: Math.round(distance),
              totalDistance: Math.round(totalDistance)
            };
          });
          
          setKeyFrames(frames);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error loading frames data:", error);
        setIsLoading(false);
      });
  }, []);


  useEffect(() => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    const loadFramesData = async () => {
      try {
        const response = await fetch('/frames.json');
        const data = await response.json();
        
        // Calculate distances between frames
        const framesWithDistances = data.frames.map((frame: any, index: number) => {
          if (index === 0) {
            return { ...frame, distance: 0, totalDistance: 0 };
          }
          
          const prevFrame = data.frames[index - 1];
          const distance = calculateDistance(
            prevFrame.lat,
            prevFrame.lng,
            frame.lat,
            frame.lng
          );
          
          const totalDistance = data.frames
            .slice(0, index)
            .reduce((sum: number, f: any) => sum + (f.distance || 0), 0);
            
          return { ...frame, distance, totalDistance };
        });
        
        // Prepare route data
        const route = framesWithDistances.map((frame: any) => [frame.lat, frame.lng]);
        
        setMapData({
          frames: framesWithDistances,
          route
        });
      } catch (error) {
        console.error('Error loading frames data:', error);
      }
    };

    loadFramesData();
  }, []);

  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <div className="min-h-screen">
            <div className="container sm:px-0 mx-auto w-screen max-w-full md:max-w-[95%]">
              {/* Sticky header */}
                  <Header language={language} handleLanguage={handleLanguage}/>
              <div>
                <div className="py-8">

          <div className="mb-8">
            <AboutSection language={language} />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Video section */}
            <div className="video-section w-full lg:w-2/3 scroll-mt-24" ref={videoSectionRef}>
              <div className="max-w-[1280px] mx-auto">
                <VideoPlayer 
                  ref={videoPlayerRef} 
                  onTimeUpdate={handleTimeUpdate} 
                  onFrameChange={handleTimeUpdate}
                  onFullscreenChange={handleFullscreenChange}
                  language={language}
                />
              </div>
            </div>
            
            {/* Map section */}
            <div className="map-section w-full md:flex-1">
              <div className="h-[300px] md:h-[400px] lg:h-full bg-brown-100 dark:bg-brown-800 rounded-lg overflow-hidden relative">
                {mapData && (
                  <MapComponent
                    currentTime={currentTime}
                    onTimeUpdate={handleMapTimeUpdate}
                    language={language}
                  />
                )}
              </div>
            </div>
          </div>

          <RouteTable
            keyFrames={keyFrames}
            language={language}
            currentTime={currentTime}
            videoPlayerRef={videoPlayerRef}
            videoSectionRef={videoSectionRef}
          />

              </div>
            </div>
          </div>
          </div>
      </ThemeProvider>

    </>
  )
}

export default App
