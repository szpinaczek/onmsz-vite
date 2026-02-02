import { getTranslation } from "./i18n/translations";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
// import { MiniDistanceChart } from "./mini-distance-chart";
import { useRef, useEffect } from 'react';
import type { Language } from '@/types/map';
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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
  speed?: number;
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

  const formatSpeed = (speed?: number): string => {
    if (speed === undefined || speed === 0) return '—';
    return `${speed} km/h`;
  };

  const getSpeedColorClass = (speed?: number): string => {
    if (!speed || speed === 0) {
      return 'bg-earls-green-300 text-earls-green-900 dark:bg-earls-green-500 dark:text-earls-green-950';
    } else if (speed <= 10) {
      // Walking/slow movement - green
      return 'bg-earls-green-300 text-earls-green-900 dark:bg-earls-green-500 dark:text-earls-green-950';
    } else if (speed <= 50) {
      // Fast walking to running - yellow
      return 'bg-picasso-400 text-picasso-900 dark:bg-picasso-500 dark:text-picasso-950';
    } else if (speed <= 150) {
      // Supernatural speed - blue
      return 'bg-orange-300 text-orange-800 dark:bg-orange-400 dark:text-orange-950';
    } else {
      // Extreme speed - red
      return 'bg-brick-500 text-brick-100 dark:bg-brick-600 dark:text-brick-100';
    }
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
                      <Table className="text-[16px] table-fixed">
                        <TableHeader className="sticky top-0 bg-brown-100 dark:bg-brown-700/80 backdrop-blur-sm z-10">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[70px] text-brown-900 dark:text-brown-100 font-semibold">
                              {getTranslation('time', language)}
                            </TableHead>
                            <TableHead className="text-brown-900 dark:text-brown-100 font-semibold">
                              {getTranslation('location', language)}
                            </TableHead>
                            <TableHead className="hidden md:table-cell text-brown-900 dark:text-brown-100 font-semibold">
                              {getTranslation('coordinates', language)}
                            </TableHead>
                            <TableHead className="hidden md:table-cell text-brown-900 dark:text-brown-100 font-semibold whitespace-nowrap">
                              {getTranslation('distance', language)}
                            </TableHead>
                            <Tooltip>
                            <TooltipTrigger asChild>
                              <TableHead className="hidden lg:table-cell text-brown-900 dark:text-brown-100 font-semibold text-center whitespace-nowrap">
                                {getTranslation('speed', language)}
                              </TableHead>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getTranslation('speedTooltip', language)}</p>
                            </TooltipContent>
                            </Tooltip>
                            {/* <TableHead className="hidden xl:table-cell text-brown-900 dark:text-brown-100 font-semibold text-center">
                              {getTranslation('progress', language)}
                            </TableHead> */}
                            <TableHead className="text-right">
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
                                  ? "bg-brown-200 dark:bg-primary/20"
                                  : ""
                              }`}
                            >
                              <TableCell className="font-medium text-brown-900 dark:text-brown-100">
                                {formatTime(frame.time)}
                              </TableCell>
                              <TableCell className="text-brown-900 dark:text-brown-100 hyphens-auto whitespace-wrap">
                                {frame.description[language]}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-brown-900 dark:text-brown-100">
                                {frame.lat.toFixed(6)}, {frame.lng.toFixed(6)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-brown-900 dark:text-brown-100">
                                {formatDistance(frame.totalDistance || 0)}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSpeedColorClass(frame.speed)}`}>
                                  {formatSpeed(frame.speed)}
                                </span>
                              </TableCell>
                              {/* <TableCell className="hidden xl:table-cell text-center">
                                <MiniDistanceChart
                                  frames={keyFrames}
                                  currentIndex={index}
                                  className="mx-auto"
                                  language={language}
                                />
                              </TableCell> */}
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="lg"
                                  className="text-pink-500 dark:text-pink-500 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-brown-100 dark:hover:bg-pink-800 transition-colors font-bold text-[14px] px-4"
                                  onClick={() => {
                                    console.log("RouteTable: Jump to frame clicked", frame);
                                    if (videoPlayerRef.current) {
                                      console.log("RouteTable: Video player ref is available");
                                      videoPlayerRef.current.seekVideo(frame.time);
                                      scrollToRow(index);
                                      scrollToVideo();
                                    } else {
                                      console.log("RouteTable: Video player ref is null");
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