import React from 'react';
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

  // Use the optimized URL from the hook
  const finalUrl = optimizedUrl || processedUrl || src;

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('FacebookImage error:', {
      originalUrl: src,
      processedUrl,
      isFacebookCDN,
      needsAccessToken,
      hasAccessToken,
      error: event
    });

    // If we have a fallback and the current URL failed, try the fallback
    if (fallbackSrc && event.currentTarget.src !== fallbackSrc) {
      event.currentTarget.src = fallbackSrc;
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
      src={finalUrl || processedUrl || src}
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