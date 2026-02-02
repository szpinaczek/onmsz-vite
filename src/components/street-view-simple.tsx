import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { getTranslation } from './i18n/translations';
import type { Language } from '@/types/map';

interface StreetViewSimpleProps {
  isVisible: boolean;
  onClose: () => void;
  position: { lat: number; lng: number };
  language: Language;
  apiKey: string;
}

const StreetViewSimple: React.FC<StreetViewSimpleProps> = ({
  isVisible,
  onClose,
  position,
  language,
  apiKey
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible || !containerRef.current) {
      setIsLoading(false);
      return;
    }

    const loadGoogleMaps = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google?.maps) {
          resolve();
          return;
        }

        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          const checkLoaded = () => {
            if (window.google?.maps) {
              resolve();
            } else {
              setTimeout(checkLoaded, 100);
            }
          };
          checkLoaded();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=streetview`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          if (window.google?.maps) {
            resolve();
          } else {
            reject(new Error('Google Maps API loaded but maps property not found'));
          }
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load Google Maps API'));
        };

        document.head.appendChild(script);
      });
    };

    const initializeStreetView = () => {
      try {
        new window.google.maps.StreetViewPanorama(containerRef.current!, {
          position: position,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          enableCloseButton: false,
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Street View initialization error:', err);
        setError('Failed to initialize Street View');
        setIsLoading(false);
      }
    };

    loadGoogleMaps()
      .then(initializeStreetView)
      .catch(err => {
        console.error('Error loading Street View:', err);
        setError(err.message);
        setIsLoading(false);
      });

  }, [isVisible, apiKey, position]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
      </div>

      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getTranslation('loadingStreetView', language)}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
            <div className="text-center">
              <div className="text-4xl mb-2">📍</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ minHeight: '300px' }}
        />
      </div>
    </div>
  );
};

export default StreetViewSimple;
