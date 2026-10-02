import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface VerticalImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  isBlackAndWhite?: boolean;
}

export const VerticalImage: React.FC<VerticalImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle = '9:16 Vertical Study',
  fallbackSubtitle = 'PixelPulse Darkroom Archive',
  isBlackAndWhite = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-rose-500">
          <Camera className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-zinc-200 max-w-[22ch] truncate">
          {fallbackTitle}
        </p>
        <p className="text-xs text-zinc-500 mt-1">{fallbackSubtitle}</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-zinc-950 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
          <Camera className="w-6 h-6 text-zinc-700" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${isBlackAndWhite ? 'grayscale contrast-125' : ''}`}
      />
    </div>
  );
};
