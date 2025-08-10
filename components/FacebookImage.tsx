import React, { useEffect, useMemo, useState } from 'react';
import { useFacebookImageUrl } from './hooks/useFacebookImageUrl';

interface FacebookImageProps {
  src: string | null | undefined;
  accessToken: string | null | undefined;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  fallbackSrc?: string;
  onError?: (error: Event) => void;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
  style?: React.CSSProperties;
  contentType?: 'video' | 'carousel' | 'dynamic' | 'image';
}

/**
 * Component for displaying Facebook images with automatic access token handling
 * Automatically appends access tokens to Facebook CDN URLs when needed
 */
export const FacebookImage: React.FC<FacebookImageProps> = ({
  src,
  accessToken,
  alt = 'Facebook image',
  className = '',
  width,
  height,
  fallbackSrc,
  onError,
  onLoad,
  loading = 'lazy',
  style,
  contentType = 'image',
  ...props
}) => {
  const { processedUrl, optimizedUrl, isFacebookCDN, needsAccessToken, hasAccessToken } = useFacebookImageUrl(src, accessToken, contentType);

  // Robust fallback chain: optimized → token-appended → original → provided fallback
  const candidateUrls = useMemo(() => {
    const urls: Array<string | null | undefined> = [optimizedUrl, processedUrl, src, fallbackSrc];
    const seen = new Set<string>();
    return urls.filter((u): u is string => {
      if (!u) return false;
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }, [optimizedUrl, processedUrl, src, fallbackSrc]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [candidateUrls.length, src, accessToken, contentType]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('FacebookImage error:', {
      originalUrl: src,
      processedUrl,
      isFacebookCDN,
      needsAccessToken,
      hasAccessToken,
      error: event
    });

    // Try next candidate in chain
    const nextIndex = currentIndex + 1;
    if (nextIndex < candidateUrls.length) {
      setCurrentIndex(nextIndex);
      event.currentTarget.src = candidateUrls[nextIndex] as string;
      return;
    }

    // Call the original onError handler
    if (onError) {
      onError(event.nativeEvent);
    }
  };

  const handleLoad = () => {
    if (onLoad) {
      onLoad();
    }
  };

  // If no source URL, render a placeholder
  if (!src) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
        {...props}
      >
        <span className="text-gray-500 text-sm">No image</span>
      </div>
    );
  }

  return (
    <img
      src={candidateUrls[currentIndex]}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default FacebookImage; 