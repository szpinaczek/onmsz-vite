import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { getTranslation } from './i18n/translations';
import type { Language } from '@/types/map';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface StreetViewMinimalProps {
  isVisible: boolean;
  onClose: () => void;
  position: { lat: number; lng: number };
  language: Language;
  apiKey: string;
}

const StreetViewMinimal: React.FC<StreetViewMinimalProps> = ({
  isVisible,
  onClose,
  position,
  language,
  apiKey
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoaded, loadError } = useGoogleMaps(apiKey);

  useEffect(() => {
    console.log("StreetViewMinimal effect", { isVisible, position, isLoaded, loadError });
    
    if (!isVisible || !position || !isLoaded || !containerRef.current) {
      return;
    }

    try {
      setLoading(true);
      
      // Ensure container is visible
      containerRef.current.style.display = 'block';
      containerRef.current.style.width = '100%';
      containerRef.current.style.height = '100%';

      // Initialize Street View
      const panorama = new window.google.maps.StreetViewPanorama(
        containerRef.current,
        {
          position,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          enableCloseButton: false,
          addressControl: false,
          linksControl: false,
          panControl: false,
          zoomControl: false,
          fullscreenControl: false
        }
      );

      panorama.setVisible(true);
      setLoading(false);
      console.log("Street View initialized successfully");
    } catch (err) {
      console.error("Street View initialization error:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }

  }, [isVisible, position, language, isLoaded, loadError]);

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
        {loading && (
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

        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
            <div className="text-center">
              <div className="text-4xl mb-2">❌</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
