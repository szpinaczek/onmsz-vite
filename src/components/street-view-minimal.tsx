import React, { useRef, useEffect, useState } from 'react';
import { getTranslation } from './i18n/translations';
import type { Language } from '@/types/map';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface StreetViewMinimalProps {
  isVisible: boolean;
  onClose?: () => void;
  position: { lat: number; lng: number };
  language: Language;
  apiKey: string;
  heading?: number;
  // Manual panorama props
  manualPanorama?: {
    type: 'default' | 'panoId' | 'customImage';
    panoId?: string;
    customImage?: string;
    heading?: number;
    pitch?: number;
    zoom?: number;
  };
}

const StreetViewMinimal: React.FC<StreetViewMinimalProps> = ({
  isVisible,
  // onClose, // Unused currently
  position,
  language,
  apiKey,
  heading,
  manualPanorama
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoaded, loadError } = useGoogleMaps(apiKey);

  useEffect(() => {
    console.log("StreetViewMinimal effect", { isVisible, position, heading, isLoaded, loadError, manualPanorama });
    
    if (!isVisible || !containerRef.current) {
      return;
    }

    try {
      setLoading(true);
      
      // Ensure container is visible
      containerRef.current.style.display = 'block';
      containerRef.current.style.width = '100%';
      containerRef.current.style.height = '100%';

      // If manual panorama is provided, use it
      if (manualPanorama) {
        if (manualPanorama.type === 'customImage' && manualPanorama.customImage) {
          // Display custom 360 image
          if (panoramaRef.current) {
            containerRef.current.innerHTML = '';
            panoramaRef.current = null;
          }
          containerRef.current.innerHTML = `
            <div style="width: 100%; height: 100%; background: url('${manualPanorama.customImage}') center/cover; display: flex; align-items: center; justify-content: center;">
              <div style="background: rgba(255, 255, 255, 0.9); padding: 10px 20px; border-radius: 8px; text-align: center;">
                <div style="font-weight: bold; margin-bottom: 5px;">${getTranslation('customPanorama', language)}</div>
                <div style="font-size: 12px;">${getTranslation('customPanoramaDescription', language)}</div>
              </div>
            </div>
          `;
          setLoading(false);
          console.log("Custom panorama displayed successfully");
          return;
        } else if (manualPanorama.type === 'panoId' && manualPanorama.panoId) {
          // Use custom Google Street View panorama
          if (!isLoaded) {
            setLoading(false);
            return;
          }
          
          if (!panoramaRef.current) {
            // Initialize Street View with custom panorama
            const options: any = {
              pano: manualPanorama.panoId,
              enableCloseButton: false,
              addressControl: false,
              linksControl: false,
              panControl: false,
              zoomControl: false,
              fullscreenControl: false
            };
            
            options.pov = { 
              heading: manualPanorama.heading || heading || 0, 
              pitch: manualPanorama.pitch || 0 
            };
            if (manualPanorama.zoom) {
              options.zoom = manualPanorama.zoom;
            }

            panoramaRef.current = new window.google.maps.StreetViewPanorama(
              containerRef.current,
              options
            );
          } else {
            // Update existing panorama
            (panoramaRef.current as any).setPano(manualPanorama.panoId);
            const pov: any = { 
              heading: manualPanorama.heading || heading || 0, 
              pitch: manualPanorama.pitch || 0 
            };
            if (manualPanorama.zoom) {
              pov.zoom = manualPanorama.zoom;
            }
            panoramaRef.current.setPov(pov);
          }
          setLoading(false);
          console.log("Custom Google Street View panorama displayed successfully");
          return;
        }
      }

      // Otherwise, use default behavior (regular Google Street View)
      if (!isLoaded) {
        setLoading(false);
        return;
      }

      if (!panoramaRef.current) {
        // Initialize Street View
        const options: any = {
          position,
          enableCloseButton: false,
          addressControl: false,
          linksControl: false,
          panControl: false,
          zoomControl: false,
          fullscreenControl: false
        };
        
        options.pov = { heading: heading || 0, pitch: 0 };

        panoramaRef.current = new window.google.maps.StreetViewPanorama(
          containerRef.current,
          options
        );
      } else {
        // Update existing panorama
        panoramaRef.current.setPosition(position);
        
        const pov: any = { heading: heading || 0, pitch: 0 };
        panoramaRef.current.setPov(pov);
      }

      setLoading(false);
      console.log("Street View initialized successfully");
    } catch (err) {
      console.error("Street View initialization error:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }

  }, [isVisible, position, heading, language, isLoaded, loadError, manualPanorama]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-brown-900 border-l border-brown-200 dark:border-brown-700">
      {/* <div className="flex items-center justify-between p-3 border-b border-brown-200 dark:border-brown-700 bg-brown-50 dark:bg-brown-800">
        <h3 className="text-sm font-medium text-brown-900 dark:text-brown-100">
          {getTranslation('streetView', language)}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
          title={getTranslation('close', language)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div> */}

      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-brown-100 dark:bg-brown-800 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-50 mx-auto mb-2"></div>
              <p className="text-sm text-brown-600 dark:text-brown-400">
                {getTranslation('loadingStreetView', language)}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-brown-100 dark:bg-brown-800 z-10">
            <div className="text-center">
              <div className="text-4xl mb-2">📍</div>
              <p className="text-sm text-brown-600 dark:text-brown-400">{error}</p>
            </div>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-brown-100 dark:bg-brown-800 z-10">
            <div className="text-center">
              <div className="text-4xl mb-2">❌</div>
              <p className="text-sm text-brown-600 dark:text-brown-400">
                {loadError.message}
              </p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ minHeight: '300px', display: isVisible ? 'block' : 'none' }}
        />
      </div>
    </div>
  );
};

export default StreetViewMinimal;
