import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { getTranslation } from './i18n/translations';
import type { Language } from '@/types/map';

interface StreetViewIframeProps {
  isVisible: boolean;
  onClose: () => void;
  position: { lat: number; lng: number };
  language: Language;
  apiKey?: string;
}

const StreetViewIframe: React.FC<StreetViewIframeProps> = ({
  isVisible,
  onClose,
  position,
  language,
  apiKey
}) => {
  const [iframeSrc, setIframeSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Create Google Street View URL for iframe
      // Using direct URL format without JavaScript API
      const src = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${position.lat},${position.lng}&heading=${heading}&pitch=${pitch}&fov=${120 - (zoom * 30)}`;
      setIframeSrc(src);
    }
  }, [isVisible, position, heading, pitch, zoom, apiKey]);

  const handleResetView = () => {
    setHeading(0);
    setPitch(0);
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom(z => Math.min(z + 1, 3));
  };

  const handleZoomOut = () => {
    setZoom(z => Math.max(z - 1, 0));
  };

  const handlePanLeft = () => {
    setHeading(h => (h - 45 + 360) % 360);
  };

  const handlePanRight = () => {
    setHeading(h => (h + 45) % 360);
  };

  const handlePanUp = () => {
    setPitch(p => Math.min(p + 15, 90));
  };

  const handlePanDown = () => {
    setPitch(p => Math.max(p - 15, -90));
  };

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
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

      <div className="flex-1 relative">
        <iframe
          src={iframeSrc}
          className="w-full h-full"
          style={{ border: 'none' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        {/* Simple pan controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-full p-2 shadow-lg">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePanLeft}
              className="h-8 w-8 p-0 rounded-full"
              title="Pan Left"
            >
              <span className="text-sm font-bold">←</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePanRight}
              className="h-8 w-8 p-0 rounded-full"
              title="Pan Right"
            >
              <span className="text-sm font-bold">→</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePanUp}
              className="h-8 w-8 p-0 rounded-full"
              title="Pan Up"
            >
              <span className="text-sm font-bold">↑</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePanDown}
              className="h-8 w-8 p-0 rounded-full"
              title="Pan Down"
            >
              <span className="text-sm font-bold">↓</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreetViewIframe;
