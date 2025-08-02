import { useMemo } from 'react';
import { appendAccessTokenToImageUrl, isFacebookCDNUrl } from '../../lib/facebook-utils';

/**
 * React hook for handling Facebook image URLs with access tokens
 * @param imageUrl - The original image URL
 * @param accessToken - Facebook access token
 * @returns Object with processed URL and utility functions
 */
export function useFacebookImageUrl(imageUrl: string | null | undefined, accessToken: string | null | undefined) {
  const processedUrl = useMemo(() => {
    if (!imageUrl || !accessToken) {
      return imageUrl;
    }
    return appendAccessTokenToImageUrl(imageUrl, accessToken);
  }, [imageUrl, accessToken]);

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
    isFacebookCDN,
    needsAccessToken,
    hasAccessToken: Boolean(accessToken),
    // Utility function to create a URL with token for any URL
    createUrlWithToken: (url: string) => {
      if (!accessToken) return url;
      return appendAccessTokenToImageUrl(url, accessToken);
    }
  };
} 