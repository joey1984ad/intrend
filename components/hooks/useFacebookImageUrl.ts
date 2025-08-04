import { useMemo } from 'react';
import { appendAccessTokenToImageUrl, isFacebookCDNUrl, createOptimizedThumbnailUrl } from '../../lib/facebook-utils';

/**
 * React hook for handling Facebook image URLs with access tokens
 * @param imageUrl - The original image URL
 * @param accessToken - Facebook access token
 * @param contentType - Type of content for optimal sizing
 * @returns Object with processed URL and utility functions
 */
export function useFacebookImageUrl(
  imageUrl: string | null | undefined, 
  accessToken: string | null | undefined,
  contentType: 'video' | 'carousel' | 'dynamic' | 'image' = 'image'
) {
  const processedUrl = useMemo(() => {
    if (!imageUrl || !accessToken) {
      return imageUrl;
    }
    return appendAccessTokenToImageUrl(imageUrl, accessToken);
  }, [imageUrl, accessToken]);

  const optimizedUrl = useMemo(() => {
    if (!imageUrl || !accessToken) {
      return imageUrl;
    }
    return createOptimizedThumbnailUrl(imageUrl, accessToken, contentType);
  }, [imageUrl, accessToken, contentType]);

  const isFacebookCDN = useMemo(() => {
    if (!imageUrl) return false;
    return isFacebookCDNUrl(imageUrl);
  }, [imageUrl]);

  const needsAccessToken = useMemo(() => {
    if (!imageUrl) return false;
    return isFacebookCDNUrl(imageUrl) && !imageUrl.includes('access_token=');
  }, [imageUrl]);

  return {
    originalUrl: imageUrl,
    processedUrl,
    optimizedUrl,
    isFacebookCDN,
    needsAccessToken,
    hasAccessToken: Boolean(accessToken),
    // Utility function to create a URL with token for any URL
    createUrlWithToken: (url: string) => {
      if (!accessToken) return url;
      return appendAccessTokenToImageUrl(url, accessToken);
    },
    // Utility function to create optimized URL for content type
    createOptimizedUrl: (url: string, type: 'video' | 'carousel' | 'dynamic' | 'image' = 'image') => {
      if (!accessToken) return url;
      return createOptimizedThumbnailUrl(url, accessToken, type);
    }
  };
} 