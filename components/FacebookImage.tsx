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
 * Uses backend image proxy to bypass CORS restrictions and display Facebook CDN images
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
  
  // State for proxy URL
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [isLoadingProxy, setIsLoadingProxy] = useState(false);
  const [proxyError, setProxyError] = useState(false);

  // Create proxy URL for Facebook CDN images
  const createProxyUrl = useMemo(() => {
    if (!isFacebookCDN || !accessToken || !src) return null;
    
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(src)}&token=${encodeURIComponent(accessToken)}`;
      return proxyUrl;
    } catch (error) {
      console.warn('Failed to create proxy URL:', error);
      return null;
    }
  }, [isFacebookCDN, accessToken, src]);

  // Robust fallback chain: proxy → optimized → token-appended → original → provided fallback
  const candidateUrls = useMemo(() => {
    const urls: Array<string | null | undefined> = [proxyUrl, optimizedUrl, processedUrl, src, fallbackSrc];
    const seen = new Set<string>();
    return urls.filter((u): u is string => {
      if (!u) return false;
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }, [proxyUrl, optimizedUrl, processedUrl, src, fallbackSrc]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when URLs change
  useEffect(() => {
    setCurrentIndex(0);
    setProxyError(false);
  }, [candidateUrls.length, src, accessToken, contentType]);

  // Set proxy URL when available
  useEffect(() => {
    if (createProxyUrl && !proxyUrl) {
      setProxyUrl(createProxyUrl);
    }
  }, [createProxyUrl, proxyUrl]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const currentUrl = candidateUrls[currentIndex];
    console.warn('FacebookImage error:', {
      currentUrl,
      originalUrl: src,
      proxyUrl,
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
    const loadedUrl = candidateUrls[currentIndex];
    console.log(`✅ FacebookImage loaded successfully:`, {
      url: loadedUrl,
      isProxy: loadedUrl === proxyUrl,
      isFacebookCDN,
      hasAccessToken
    });
    
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

  // Show loading state while proxy URL is being created
  if (isLoadingProxy && isFacebookCDN && accessToken) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
        {...props}
      >
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
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