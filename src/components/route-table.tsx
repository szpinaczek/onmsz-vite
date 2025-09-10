import { getTranslation } from "./i18n/translations";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { MiniDistanceChart } from "./mini-distance-chart";
import { useRef, useEffect } from 'react';
import type { Language } from '@/types/map';

// Types
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

interface VideoPlayerHandle {
  seekVideo: (time: number) => void;
  currentTime: number;
}

// Props interface
interface RouteTableProps {
  keyFrames: FrameData[];
  language: Language;
  currentTime: number;
  videoPlayerRef: React.RefObject<VideoPlayerHandle | null>;
  videoSectionRef: React.RefObject<HTMLDivElement | null>;
}

export function RouteTable({
  keyFrames,
  language,
  currentTime,
  videoPlayerRef,
  videoSectionRef
}: RouteTableProps) {
  
  // Refs
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const lastScrolledIndexRef = useRef<number>(-1);

  // Functions
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters} m`;
  };

  // Function to set row references
  const setRowRef = (index: number) => (el: HTMLTableRowElement | null) => {
    rowRefs.current[index] = el;
  };

  // Function to scroll to a specific row
  const scrollToRow = (index: number, behavior: 'smooth' | 'instant' = 'smooth') => {
    if (!scrollViewportRef.current || !rowRefs.current[index]) return;

    const viewport = scrollViewportRef.current;
    const row = rowRefs.current[index];
    
    // Scroll the row to the top of the viewport
    viewport.scrollTo({
      top: row.offsetTop,
      behavior
    });
  };

  // Function to scroll to video section
  const scrollToVideo = () => {
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Auto-scroll to current row when time changes
  useEffect(() => {
    if (keyFrames.length === 0) return;

    // Find the current frame index based on currentTime
    let currentFrameIndex = -1;
    for (let i = 0; i < keyFrames.length; i++) {
      if (currentTime >= keyFrames[i].time &&
          (i === keyFrames.length - 1 || currentTime < keyFrames[i + 1].time)) {
        currentFrameIndex = i;
        break;
      }
    }

    // Only scroll if we found a valid frame and it's different from the last scrolled one
    if (currentFrameIndex !== -1 && currentFrameIndex !== lastScrolledIndexRef.current) {
      lastScrolledIndexRef.current = currentFrameIndex;
      scrollToRow(currentFrameIndex, 'smooth');
    }
  }, [currentTime, keyFrames]);
  
    return (
        <div className="mt-6 p-6 bg-brown-100 dark:bg-brown-700 rounded-lg border-0 shadow-sm shadow-brown-300 dark:shadow-brown-400/50">
            <h3 className="text-2xl font-bold tracking-tight mb-6 text-brown-900 dark:text-brown-100">
              {getTranslation('routeInfo', language)}
            </h3>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Table section */}
              <div className="flex-1">
                <Card className="border-none bg-transparent shadow-none">
                  <CardContent className="p-0">
                    <div 
                      ref={scrollViewportRef}
                      className="w-full overflow-y-auto max-h-[400px] pr-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-brown-100 dark:[&::-webkit-scrollbar-thumb]:bg-brown-400 [&::-webkit-scrollbar-thumb]:rounded-full"
                    >
                      <Table className="text-[16px]">
                        <TableHeader className="sticky top-0 bg-brown-100 dark:bg-brown-700/80 backdrop-blur-sm z-10">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[100px] text-brown-900 dark:text-brown-100 font-semibold">
                              {getTranslation('time', language)}
                            </TableHead>
                            <TableHead className="text-brown-900 dark:text-brown-100 font-semibold">
                              {getTranslation('location', language)}
                            </TableHead>
                            <TableHead className="hidden md:table-cell w-[200px] text-brown-900 dark:text-brown-100 font-semibold">
                              {getTranslation('coordinates', language)}
                            </TableHead>
                            <TableHead className="w-[150px] text-brown-900 dark:text-brown-100 font-semibold">
                              {getTranslation('distance', language)}
                            </TableHead>
                            <TableHead className="hidden lg:table-cell w-[120px] text-brown-900 dark:text-brown-100 font-semibold">
                              {getTranslation('progress', language)}
                            </TableHead>
                            <TableHead className="w-[100px] text-right">
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {keyFrames.map((frame, index) => (
                            <TableRow 
                              key={index}
                              ref={setRowRef(index)}
                              className={`hover:bg-brown-50/50 dark:hover:bg-brown-800/30 transition-colors border-b border-brown-100 dark:border-brown-500 ${
                                currentTime >= frame.time && (index === keyFrames.length - 1 || currentTime < keyFrames[index + 1].time)
                                  ? "bg-primary/20 dark:bg-primary/20"
                                  : ""
                              }`}
                            >
                              <TableCell className="font-medium text-brown-900 dark:text-brown-100">
                                {formatTime(frame.time)}
                              </TableCell>
                              <TableCell className="text-brown-900 dark:text-brown-100">
                                {frame.description[language]}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-brown-900 dark:text-brown-100">
                                {frame.lat.toFixed(6)}, {frame.lng.toFixed(6)}
                              </TableCell>
                              <TableCell className="text-brown-900 dark:text-brown-100">
                                {formatDistance(frame.totalDistance || 0)}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <MiniDistanceChart
                                  frames={keyFrames}
                                  currentIndex={index}
                                  className="mx-auto"
                                  language={language}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="lg"
                                  className="text-pink-500 dark:text-pink-500 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-brown-100 dark:hover:bg-pink-800 transition-colors font-bold text-[14px]"
                                  onClick={() => {
                                    if (videoPlayerRef.current) {
                                      videoPlayerRef.current.seekVideo(frame.time);
                                      scrollToRow(index);
                                      scrollToVideo();
                                    }
                                  }}
                                >
                                  {getTranslation('jumpTo', language)}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
    );
}   