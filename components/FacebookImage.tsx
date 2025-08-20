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
 * Bypasses CORS restrictions using blob-based image loading
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
  
  // State for blob-based image loading
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingBlob, setIsLoadingBlob] = useState(false);
  const [blobLoadError, setBlobLoadError] = useState(false);

  // Robust fallback chain: blob → optimized → token-appended → original → provided fallback
  const candidateUrls = useMemo(() => {
    const urls: Array<string | null | undefined> = [blobUrl, optimizedUrl, processedUrl, src, fallbackSrc];
    const seen = new Set<string>();
    return urls.filter((u): u is string => {
      if (!u) return false;
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }, [blobUrl, optimizedUrl, processedUrl, src, fallbackSrc]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when URLs change
  useEffect(() => {
    setCurrentIndex(0);
    setBlobLoadError(false);
  }, [candidateUrls.length, src, accessToken, contentType]);

  // Load image as blob to bypass CORS restrictions
  const loadImageAsBlob = async (imageUrl: string) => {
    if (!isFacebookCDN || !accessToken) return null;
    
    try {
      setIsLoadingBlob(true);
      setBlobLoadError(false);
      
      console.log(`🔄 Loading Facebook image as blob:`, imageUrl);
      
      const response = await fetch(imageUrl, {
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      console.log(`✅ Facebook image loaded as blob successfully`);
      setBlobUrl(url);
      return url;
      
    } catch (error) {
      console.warn(`⚠️ Failed to load Facebook image as blob:`, error);
      setBlobLoadError(true);
      return null;
    } finally {
      setIsLoadingBlob(false);
    }
  };

  // Try to load Facebook images as blob when component mounts
  useEffect(() => {
    if (isFacebookCDN && accessToken && processedUrl && !blobUrl && !blobLoadError) {
      loadImageAsBlob(processedUrl);
    }
  }, [isFacebookCDN, accessToken, processedUrl, blobUrl, blobLoadError]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const currentUrl = candidateUrls[currentIndex];
    console.warn('FacebookImage error:', {
      currentUrl,
      originalUrl: src,
      processedUrl,
      blobUrl,
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
    console.log(`✅ FacebookImage loaded successfully:`, candidateUrls[currentIndex]);
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

  // Show loading state while trying to load blob
  if (isLoadingBlob && isFacebookCDN && accessToken) {
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
      crossOrigin={isFacebookCDN ? "anonymous" : undefined}
      {...props}
    />
  );
};

export default FacebookImage; 