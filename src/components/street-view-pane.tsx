import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { getTranslation } from './i18n/translations';
import type { Language } from '@/types/map';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface StreetViewPaneProps {
  isVisible: boolean;
  onClose: () => void;
  position: { lat: number; lng: number };
  language: Language;
  apiKey: string;
}

const StreetViewPane: React.FC<StreetViewPaneProps> = ({
  isVisible,
  onClose,
  position,
  language,
  apiKey
}) => {
  const panoramaRef = useRef<HTMLDivElement>(null);
  const panoramaInstanceRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { isLoaded, loadError } = useGoogleMaps(apiKey);

  // Create or update Street View panorama
  useEffect(() => {
    if (!isVisible || !position || !isLoaded || !window.google?.maps || !panoramaRef.current) {
      return;
    }

    setIsLoading(true);

    if (!panoramaInstanceRef.current) {
      // Create panorama instance
      panoramaInstanceRef.current = new window.google.maps.StreetViewPanorama(
        panoramaRef.current,
        {
          position: position,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          enableCloseButton: false,
          addressControl: true,
          linksControl: true,
          panControl: true,
          zoomControl: false,
          fullscreenControl: false
        }
      );
    } else {
      // Update existing panorama
      panoramaInstanceRef.current.setPosition(position);
      panoramaInstanceRef.current.setPov({ heading: 0, pitch: 0 });
      panoramaInstanceRef.current.setZoom(1);
    }

    // panoramaInstanceRef.current.setVisible(true);
    setIsLoading(false);

  }, [isVisible, position, language, isLoaded]);

  const handleResetView = () => {
    if (panoramaInstanceRef.current) {
      panoramaInstanceRef.current.setPov({ heading: 0, pitch: 0 });
      panoramaInstanceRef.current.setZoom(1);
    }
  };

  const handleZoomIn = () => {
    if (panoramaInstanceRef.current) {
      const currentZoom = panoramaInstanceRef.current.getZoom();
      panoramaInstanceRef.current.setZoom(Math.min(currentZoom + 1, 3));
    }
  };

  const handleZoomOut = () => {
    if (panoramaInstanceRef.current) {
      const currentZoom = panoramaInstanceRef.current.getZoom();
      panoramaInstanceRef.current.setZoom(Math.max(currentZoom - 1, 0));
    }
  };

  if (!isVisible) return null;

  // If API failed to load
  if (loadError) {
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
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {getTranslation('streetViewError', language)}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {loadError.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If API is still loading
  if (!isLoaded) {
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
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getTranslation('loadingStreetView', language)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {getTranslation('streetView', language)}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
            title={getTranslation('zoomOut', language)}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetView}
            className="h-8 w-8 p-0"
            title={getTranslation('resetView', language)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
            title={getTranslation('zoomIn', language)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
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
      </div>

      {/* Content */}
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

        {/* Panorama container - always visible */}
        <div ref={panoramaRef} className="w-full h-full" style={{ minHeight: '300px', display: 'block' }} />
      </div>
    </div>
  );
};

export default StreetViewPane;
           