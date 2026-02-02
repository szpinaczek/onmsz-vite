// import './globals.css'
import './App.css'
import "@fontsource/open-sans"
import '@fontsource/special-elite';
import { ThemeProvider } from "./components/theme-provider"
import Header from './components/header';
import HeroSection from './components/hero-section';
import { useLanguage } from './components/i18n/language-context';
import { AboutSection } from './components/about-section';
import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import VideoPlayer, { type VideoPlayerHandle } from './components/video-player';
import MapComponent from './components/map-section';
import type { MapData, Language } from '@/types/map';
import { RouteTable } from './components/route-table';
import Footer from './components/footer';
import StreetViewMinimal from './components/street-view-minimal';

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
  speed?: number;
  heading?: number;
}

// Calculate heading between two coordinates (in degrees)
const calculateHeading = (from: { lat: number; lng: number }, to: { lat: number; lng: number }): number => {
  const lat1 = (from.lat * Math.PI) / 180;
  const lng1 = (from.lng * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const lng2 = (to.lng * Math.PI) / 180;

  const dLng = lng2 - lng1;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  
  let heading = (Math.atan2(y, x) * 180) / Math.PI;
  
  // Normalize to 0-360 degrees
  heading = (heading + 360) % 360;
  
  return heading;
};


function App() {

  const { language, setLanguage } = useLanguage();

  const handleLanguage = (data: Language) => {
    setLanguage(data)
  };

  // const handleFullscreenChange = (isFullscreen: boolean = false) => { // eslint-disable-line
  //   // Handle fullscreen change if needed
  // };

  const handleTimeUpdate = (time: number) => {
    console.log("App.handleTimeUpdate called with time:", time);
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


  // const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  //   const R = 6371; // Earth's radius in km
  //   const dLat = toRad(lat2 - lat1);
  //   const dLon = toRad(lon2 - lon1);
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   return R * c;
  // };

  // const toRad = (value: number) => {
  //   return (value * Math.PI) / 180;
  // };


  const [currentTime, setCurrentTime] = useState<number>(0);
  const [keyFrames, setKeyFrames] = useState<FrameData[]>([]);
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  const mapRef = useRef<MapComponentHandle>(null);
  const isMapUpdating = useRef<boolean>(false);
  const isVideoUpdating = useRef<boolean>(false);
  // const tableRef = useRef<HTMLDivElement>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const [streetViewPosition, setStreetViewPosition] = useState<{ lat: number; lng: number; heading?: number } | null>(null);

  // Load frames data (unified loading)
  useEffect(() => {
    const loadFramesData = async () => {
      // setIsLoading(true);
      try {
        const response = await fetch('/frames.json');
        const data = await response.json();

         if (data && data.frames) {
            // Calculate distances, speeds, and headings between frames
            const framesWithDistancesAndSpeeds = data.frames.map((frame: FrameData, index: number) => {
              if (index === 0) {
                return { ...frame, distance: 0, totalDistance: 0, speed: 0, heading: 0 };
              }

              const prevFrame = data.frames[index - 1];
              const distance = L.latLng(prevFrame.lat, prevFrame.lng)
                .distanceTo(L.latLng(frame.lat, frame.lng));

              // Calculate heading (direction) from previous frame to current frame
              const heading = calculateHeading(prevFrame, frame);

              // Calculate total distance from route start
              const totalDistance = data.frames
                .slice(0, index + 1)
                .reduce((sum: number, f: FrameData, i: number) => {
                  if (i === 0) return 0;
                  const prev = data.frames[i - 1];
                  return sum + L.latLng(prev.lat, prev.lng)
                    .distanceTo(L.latLng(f.lat, f.lng));
                }, 0);

              // Calculate smooth progressive speed (supernatural acceleration)
              let speed = 0;

              if (index === 1) {
                // Second frame: fast walking pace
                speed = 6.5; // km/h
              } else if (index > 1) {
                // Smooth exponential acceleration from walking to supernatural speeds
                const totalFrames = data.frames.length - 1; // Exclude first frame (index 0)
                const currentFrameProgress = (index - 1) / (totalFrames - 1); // 0 to 1

                const startSpeed = 6.5; // km/h (fast walking)
                const endSpeed = 300; // km/h (supernatural final speed)

                // Exponential curve for realistic acceleration feeling
                // Using power of 1.8 for smooth but noticeable acceleration
                const accelerationCurve = Math.pow(currentFrameProgress, 1.8);
                speed = startSpeed + (endSpeed - startSpeed) * accelerationCurve;
              }

              return {
                ...frame,
                distance: Math.round(distance),
                totalDistance: Math.round(totalDistance),
                speed: Math.round(speed * 10) / 10, // Round to 1 decimal place
                heading: heading
              };
            });

          // Set both keyFrames and mapData from the same source
          setKeyFrames(framesWithDistancesAndSpeeds);

          // Prepare route data for map
          const route = framesWithDistancesAndSpeeds.map((frame: FrameData) => [frame.lat, frame.lng] as [number, number]);
          setMapData({
            frames: framesWithDistancesAndSpeeds,
            route
          });
        }
      } catch (error) {
        console.error('Error loading frames data:', error);
      }
      // finally {
      //   setIsLoading(false);
      // }
    };

    loadFramesData();
  }, []);

  useEffect(() => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Update Street View position based on current frame
  useEffect(() => {
    console.log("Current time changed to:", currentTime);
    if (keyFrames.length > 0) {
      // Find the closest frame to currentTime
      const closestFrame = keyFrames.reduce((prev, curr) => {
        return Math.abs(curr.time - currentTime) < Math.abs(prev.time - currentTime) ? curr : prev;
      });
      console.log("Street View position updated to:", closestFrame);
      setStreetViewPosition({ 
        lat: closestFrame.lat, 
        lng: closestFrame.lng, 
        heading: closestFrame.heading 
      });
    }
  }, [currentTime, keyFrames]);

  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="min-h-screen">

          <div className="container sm:px-0 mx-auto w-screen max-w-full md:max-w-[95%]">
            <Header language={language} handleLanguage={handleLanguage} />
            <HeroSection />
            <div>
              <div className="py-8">

                <div className="mb-8" id="about">
                  <AboutSection language={language} />
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Video section */}
                  <div className="video-section w-full lg:w-2/3 scroll-mt-24" id="video" ref={videoSectionRef}>
                    <div className="max-w-[1280px] mx-auto">
                      <VideoPlayer
                        ref={videoPlayerRef}
                        onTimeUpdate={handleTimeUpdate}
                        onFrameChange={handleTimeUpdate}
                        // onFullscreenChange={handleFullscreenChange}
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
                  
                 <div className="map-section w-full md:flex-1">
                  <div className="h-[400px] md:h-[500px] lg:h-full bg-brown-100 dark:bg-brown-800 rounded-lg overflow-hidden relative">
                      <StreetViewMinimal
                        isVisible={true}
                        onClose={() => {}}
                        position={streetViewPosition || { lat: 51.8086928, lng: 19.4710456 }}
                        heading={streetViewPosition?.heading}
                        language={language}
                        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
                      />
                    {/* Test button to manually update Street View position */}
                    <div className="absolute top-4 left-4 z-10">
                      <button 
                        className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => {
                          const testPosition = { 
                            lat: 51.8086928 + (Math.random() - 0.5) * 0.02, 
                            lng: 19.4710456 + (Math.random() - 0.5) * 0.02 
                          };
                          console.log("Test button clicked, updating position to:", testPosition);
                          setStreetViewPosition(testPosition);
                          // Force update of the component
                          window.dispatchEvent(new Event('resize'));
                        }}
                      >
                        Test Street View Position
                      </button>
                    </div>
                  </div>
                </div>

                <div id="route-table">
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
            <Footer />
          </div>
        </div>
      </ThemeProvider>

    </>
  )
}

export default App;

