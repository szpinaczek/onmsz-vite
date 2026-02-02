import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { getTranslation } from './i18n/translations';
import type { Language } from '@/types/map';

interface StreetViewProps {
  isVisible: boolean;
  onClose: () => void;
  position: { lat: number; lng: number };
  language: Language;
  apiKey: string;
}

const StreetViewIframeSimple: React.FC<StreetViewProps> = ({
  isVisible,
  onClose,
  position,
  language,
  apiKey
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeUrl, setIframeUrl] = useState<string>('');

  useEffect(() => {
    if (isVisible && position) {
      const url = `https://www.google.com/maps/embed?pb=!1m0!3m2!1sen!2spl!4v1!5m1!1e4&layer=c&cbll=${position.lat},${position.lng}&cbp=13,0,,0,0&key=${apiKey}`;
      setIframeUrl(url);
      setIsLoading(true);
      
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, position, apiKey]);

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

        {iframeUrl && (
          <iframe
            src={iframeUrl}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '300px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setIsLoading(false)}
            title="Google Street View"
          />
        )}
      </div>
    </div>
  );
};

export default StreetViewIframeSimple;
