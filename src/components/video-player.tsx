import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { Separator } from '@/components/ui/separator';
import { Volume2, VolumeX, SkipBack, SkipForward, Play, Pause, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import InfoTooltip from '@/components/info-tooltip';

// Define types for the props
interface VideoPlayerProps {
  onTimeUpdate?: (currentTime: number) => void;
  onFrameChange?: (time: number) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  language?: 'pl' | 'en';
}

// Define the ref methods
export interface VideoPlayerHandle {
  pauseVideo: () => void;
  playVideo: () => void;
  seekVideo: (time: number) => void;
  currentTime: number;
}

// Add this type definition before the VideoPlayer component
interface KeyFrame {
  time: number;
  description: {
    pl: string;
    en: string;
  };
  info?: {
    pl: string;
    en: string;
  };
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(({ onTimeUpdate, onFrameChange, onFullscreenChange, language = 'pl' }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const isUserSeeking = useRef(false);
//   const [showControls, setShowControls] = useState(true);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // State for key frames
  const [keyFrames, setKeyFrames] = useState<KeyFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState<KeyFrame | null>(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState<boolean>(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepFrame('backward');
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepFrame('forward');
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTime]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    onFullscreenChange?.(!isFullscreen);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        if (onTimeUpdate) {
          onTimeUpdate(video.currentTime);
        }
      };
      
      const handlePlay = () => {
        setIsPlaying(true);
        setTimeout(() => {
          setShowPoster(false);
        }, 300);
      };
      
      const handlePause = () => {
        setIsPlaying(false);
        if (video.currentTime === 0) {
          setShowPoster(true);
        }
      };
      
      const handleVolumeChange = () => {
        setIsMuted(video.muted);
      };
      
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
      };
      
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('volumechange', handleVolumeChange);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('volumechange', handleVolumeChange);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [onTimeUpdate]);

  useImperativeHandle(ref, () => ({
    pauseVideo: () => {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    },
    playVideo: () => {
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Error playing video:", error);
          });
      }
    },
    seekVideo: (time: number) => {
      if (videoRef.current) {
        isUserSeeking.current = true;
        videoRef.current.currentTime = time;
        setCurrentTime(time);
        setShowPoster(false);
        if (onFrameChange) {
          onFrameChange(time);
        }
        isUserSeeking.current = false;
      }
    },
    currentTime: currentTime
  }));

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        console.log("Playing video");
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Error playing video:", error);
          });
      } else {
        console.log("Pausing video");
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      console.error("videoRef.current is null");
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const seekVideo = (time: number) => {
    if (videoRef.current) {
      isUserSeeking.current = true;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      setShowPoster(false);
      if (onFrameChange) {
        onFrameChange(time);
      }
      isUserSeeking.current = false;
    }
  };

  const stepFrame = (direction: 'forward' | 'backward') => {
    if (videoRef.current) {
      // Pause the video first
      videoRef.current.pause();
      setIsPlaying(false);
      
      const frameRate = 25; // Assuming 25 FPS
      const step = 1 / frameRate;
      const newTime = videoRef.current.currentTime + (direction === 'forward' ? step : -step);
      
      isUserSeeking.current = true;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setShowPoster(false);
      
      // Notify about frame change
      if (onFrameChange) {
        onFrameChange(newTime);
      }
      isUserSeeking.current = false;
    }
  };
  
  // Jump to specific time points (useful for navigating between key frames)
  const jumpToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      
      isUserSeeking.current = true;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      setShowPoster(false);
      
      if (onFrameChange) {
        onFrameChange(time);
      }
      isUserSeeking.current = false;
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (videoRef.current && value.length > 0) {
      isUserSeeking.current = true;
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Notify about frame change
      if (onFrameChange) {
        onFrameChange(newTime);
      }
      isUserSeeking.current = false;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // Update current frame based on time
      const frame = keyFrames.find((frame, index) => 
        time >= frame.time && (index === keyFrames.length - 1 || time < keyFrames[index + 1].time)
      ) || null;
      
      setCurrentFrame(frame);
      
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Format time in MM:SS format with total seconds
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const totalSeconds = Math.floor(timeInSeconds);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} (${totalSeconds}s)`;
  };

  // Load key frames from frames.json
  useEffect(() => {
    fetch("/frames.json")
      .then(response => response.json())
      .then((data) => {
        if (data && data.frames) {
          const frames = data.frames.map((frame: any) => ({
            time: frame.time,
            description: {
              pl: frame.description?.pl || "",
              en: frame.description?.en || ""
            },
            info: frame.info ? {
              pl: frame.info.pl || "",
              en: frame.info.en || ""
            } : undefined
          }));
          setKeyFrames(frames);
          
          // Auto-show info tooltip if first frame has info
          if (frames.length > 0 && frames[0].info) {
            setShowInfoTooltip(true);
          }
        }
      })
      .catch(error => console.error("Error loading key frames:", error));
  }, []);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seekVideo(newTime);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Video container */}
      <div className="relative w-full aspect-video bg-black rounded-t-lg overflow-hidden">
        {!isFullscreen && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              poster="/images/splash-screen2.jpg"
              onClick={togglePlayPause}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onPlay={() => setShowPoster(false)}
              onPause={() => {
                if (videoRef.current?.currentTime === 0) {
                  setShowPoster(true);
                }
              }}
            >
              <source src="/onmsz_medium_compressed.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Info Tooltip */}
            <InfoTooltip 
              info={currentFrame?.info}
              language={language}
              isVisible={showInfoTooltip}
              onToggleVisibility={setShowInfoTooltip}
            />
            
            {/* Splash screen overlay */}
            {showPoster && (
              <div 
                className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300"
                style={{ opacity: showPoster ? 1 : 0 }}
              >
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                >
                  <Play className="h-6 w-6" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video controls below video */}
      <div className="w-full bg-brown-200/60 dark:bg-brown-700 p-4 rounded-b-lg shadow-md">
        {/* Progress bar */}
        <div className="w-full mb-4 relative">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration}
              step={0.01}
            className="flex-grow slider-track bg-brown-300 dark:bg-brown-200"
              onValueChange={handleSliderChange}
            />
          {/* Key frame markers - visible only on desktop */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
              {keyFrames.map((frame, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="absolute top-0 bottom-0 w-0.5 bg-brown-600 dark:bg-brown-50 hover:bg-brown-800 dark:hover:bg-brown-100 hover:scale-x-150 transition-transform origin-center pointer-events-auto"
                  style={{ left: `${(frame.time / duration) * 100}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    jumpToTime(frame.time);
                  }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{frame.description[language]} ({formatTime(frame.time)})</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              ))}
            </div>
        </div>

        {/* Time display */}
        <div className="flex justify-between items-center mb-4 text-sm text-brown-600 dark:text-brown-100">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Control buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4">
          {/* Playback controls */}
          <div className="flex items-center justify-between lg:justify-start gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={togglePlayPause} className="h-8 w-8 ">
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? 'Pauza' : 'Odtwarzaj'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => seekVideo(currentTime - 10)} className="h-8 w-8 ">
                    <SkipBack className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>10 sekund wstecz</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => seekVideo(currentTime + 10)} className="h-8 w-8 ">
                    <SkipForward className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>10 sekund do przodu</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => stepFrame('backward')} className="h-8 w-8 ">
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Poprzednia klatka</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => stepFrame('forward')} className="h-8 w-8 ">
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Następna klatka</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Additional controls */}
          <div className="flex items-center justify-between lg:justify-end gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8 ">
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isMuted ? 'Włącz dźwięk' : 'Wycisz'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8 ">
                    {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullscreen ? 'Wyłącz pełny ekran' : 'Pełny ekran'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[80vw] w-[80vw] p-0 bg-black border-none z-[2000]">
          <DialogTitle className="sr-only">Odtwarzacz wideo</DialogTitle>
          <div className="relative w-full aspect-video">
            {isFullscreen && (
              <>
                <video
                  ref={videoRef}
                  width="100%"
                  className="w-full h-full object-contain"
                  poster="/images/splash-screen2.jpg"
                  onClick={togglePlayPause}
                  onTimeUpdate={handleTimeUpdate}
                  onDurationChange={handleDurationChange}
                  onPlay={() => setShowPoster(false)}
                  onPause={() => {
                    if (videoRef.current?.currentTime === 0) {
                      setShowPoster(true);
                    }
                  }}
                >
                  <source src="/onmsz_medium_compressed.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Info Tooltip in fullscreen mode */}
                <InfoTooltip 
                  info={currentFrame?.info}
                  language={language}
                  isVisible={showInfoTooltip}
                  onToggleVisibility={setShowInfoTooltip}
                />
                
                {/* Splash screen overlay in dialog */}
                {showPoster && (
                  <div 
                    className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300"
                    style={{ opacity: showPoster ? 1 : 0 }}
                  >
        <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayPause();
                      }}
                    >
                      <Play className="h-6 w-6" />
        </Button>
                  </div>
                )}
              </>
            )}

            {/* Video controls in dialog - always visible */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex flex-col gap-2">
                {/* Time indicators */}
                <div className="flex justify-between items-center text-white text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                
                {/* Progress bar */}
                <div className="relative h-1 bg-brown-100/30 rounded-full cursor-pointer" onClick={handleProgressBarClick}>
                  <div 
                    className="absolute h-full bg-brown-100 rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:text-white/80"
          onClick={togglePlayPause}
        >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isPlaying ? 'Pause' : 'Play'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:text-white/80"
                            onClick={() => seekVideo(currentTime - 10)}
                          >
                            <SkipBack className="h-4 w-4" />
        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>10 sekund wstecz</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:text-white/80"
          onClick={toggleMute}
                          >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isMuted ? 'Unmute' : 'Mute'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:text-white/80"
                            onClick={toggleFullscreen}
                          >
                            <Maximize2 className="h-4 w-4" />
        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fullscreen</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
      </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
