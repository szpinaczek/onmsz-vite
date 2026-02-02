import React, { useEffect, useRef } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface StreetViewTestProps {
  apiKey: string;
}

const StreetViewTest: React.FC<StreetViewTestProps> = ({ apiKey }) => {
  const { isLoaded, loadError } = useGoogleMaps(apiKey);
  const panoramaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded || !window.google?.maps || !panoramaRef.current) return;

    console.log("Creating Street View panorama");
    const panorama = new window.google.maps.StreetViewPanorama(
      panoramaRef.current,
      {
        position: { lat: 51.8086928, lng: 19.4710456 }, // Center of Lodz
        pov: { heading: 0, pitch: 0 },
        zoom: 1
      }
    );
    panorama.setVisible(true);
    console.log("Street View panorama created");
  }, [isLoaded]);

  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading Google Maps API...</div>;
  }

  return (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      <h2 className="p-2 text-center bg-white dark:bg-gray-900 border-b">
        Street View Test
      </h2>
      <div ref={panoramaRef} className="w-full h-[350px]" />
    </div>
  );
};

export default StreetViewTest;
