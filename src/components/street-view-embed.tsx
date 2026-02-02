import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { getTranslation } from './i18n/translations';
import type { Language } from '@/types/map';

interface StreetViewEmbedProps {
  isVisible: boolean;
  onClose: () => void;
  position: { lat: number; lng: number };
  language: Language;
  apiKey: string;
}

const StreetViewEmbed: React.FC<StreetViewEmbedProps> = ({
  isVisible,
  onClose,
  position,
  language,
  apiKey
}) => {
  const [iframeSrc, setIframeSrc] = useState('');

  useEffect(() => {
    setIframeSrc(
      `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${position.lat},${position.lng}&heading=0&pitch=0&fov=90`
    );
  }, [position, apiKey]);

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

      <div className="flex-1">
        <iframe
          src={iframeSrc}
          className="w-full h-full"
          style={{ border: '0' }}
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default StreetViewEmbed;
