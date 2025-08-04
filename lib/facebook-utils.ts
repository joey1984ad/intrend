/**
 * Facebook CDN URL utilities
 * Handles appending access tokens to Facebook CDN URLs for proper authentication
 */

/**
 * Appends access token to Facebook CDN URL if needed
 * @param imageUrl - The original image URL
 * @param accessToken - Facebook access token
 * @returns URL with access token appended if needed
 */
export function appendAccessTokenToImageUrl(imageUrl: string, accessToken: string): string {
  if (!imageUrl || !accessToken) {
    return imageUrl;
  }

  // Check if URL already has access_token parameter
  if (imageUrl.includes('access_token=')) {
    return imageUrl;
  }

  // Check if it's a Facebook CDN URL
  const isFacebookCDN = imageUrl.includes('fbcdn.net') || imageUrl.includes('fbsbx.com');
  
  // For Facebook CDN URLs, always append access token
  // For other URLs, we can still append it as it might be needed
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}access_token=${accessToken}`;
}

/**
 * Checks if a URL is a Facebook CDN URL
 * @param url - The URL to check
 * @returns true if it's a Facebook CDN URL
 */
export function isFacebookCDNUrl(url: string): boolean {
  return url.includes('fbcdn.net') || url.includes('fbsbx.com');
}

/**
 * Processes an array of image URLs and appends access tokens where needed
 * @param imageUrls - Array of image URL objects with source and url properties
 * @param accessToken - Facebook access token
 * @returns Array of processed image URLs
 */
export function processImageUrlsWithToken(
  imageUrls: Array<{ source: string; url: string }>, 
  accessToken: string
): Array<{ source: string; url: string; processedUrl: string }> {
  return imageUrls.map(({ source, url }) => ({
    source,
    url,
    processedUrl: appendAccessTokenToImageUrl(url, accessToken)
  }));
}

/**
 * Creates a URL with access token for testing purposes
 * @param imageUrl - The original image URL
 * @param accessToken - Facebook access token
 * @returns URL with access token appended
 */
export function createTestUrlWithToken(imageUrl: string, accessToken: string): string {
  return appendAccessTokenToImageUrl(imageUrl, accessToken);
}

/**
 * Creates a high-resolution thumbnail URL for Facebook CDN images
 * @param imageUrl - The original image URL
 * @param accessToken - Facebook access token
 * @param width - Desired width (default: 1080)
 * @param height - Desired height (default: 1080)
 * @param quality - JPEG quality (default: 95)
 * @returns High-resolution URL with access token
 */
export function createHighResThumbnailUrl(
  imageUrl: string | null | undefined, 
  accessToken: string,
  width: number = 1080,
  height: number = 1080,
  quality: number = 95
): string | undefined {
  if (!imageUrl) return undefined;
  
  // Only process Facebook CDN URLs
  if (!isFacebookCDNUrl(imageUrl)) {
    return imageUrl;
  }
  
  // If URL already has size parameters, just add access token
  if (/([?&](width|height)=\d+)/i.test(imageUrl)) {
    return appendAccessTokenToImageUrl(imageUrl, accessToken);
  }
  
  const separator = imageUrl.includes('?') ? '&' : '?';
  const highResUrl = `${imageUrl}${separator}width=${width}&height=${height}&quality=${quality}`;
  
  return appendAccessTokenToImageUrl(highResUrl, accessToken);
}

/**
 * Creates optimized thumbnail URLs for different content types
 * @param imageUrl - The original image URL
 * @param accessToken - Facebook access token
 * @param contentType - Type of content for optimal sizing
 * @returns Optimized URL with access token
 */
export function createOptimizedThumbnailUrl(
  imageUrl: string | null | undefined,
  accessToken: string,
  contentType: 'video' | 'carousel' | 'dynamic' | 'image' = 'image'
): string | undefined {
  if (!imageUrl) return undefined;
  
  // Only process Facebook CDN URLs
  if (!isFacebookCDNUrl(imageUrl)) {
    return imageUrl;
  }
  
  // If URL already has size parameters, just add access token
  if (/([?&](width|height)=\d+)/i.test(imageUrl)) {
    return appendAccessTokenToImageUrl(imageUrl, accessToken);
  }
  
  // Different optimizations for different content types
  let width = 1080;
  let height = 1080;
  let quality = 95;
  
  switch (contentType) {
    case 'video':
      // Videos often benefit from 16:9 aspect ratio for better poster quality
      width = 1280;
      height = 720;
      quality = 98; // Higher quality for video thumbnails
      break;
    case 'carousel':
    case 'dynamic':
      // Carousels and dynamic ads often use square or 4:5 aspect ratio
      width = 1080;
      height = 1080;
      quality = 95;
      break;
    case 'image':
    default:
      // Standard images - use square format for consistency
      width = 1080;
      height = 1080;
      quality = 95;
      break;
  }
  
  const separator = imageUrl.includes('?') ? '&' : '?';
  const optimizedUrl = `${imageUrl}${separator}width=${width}&height=${height}&quality=${quality}`;
  
  return appendAccessTokenToImageUrl(optimizedUrl, accessToken);
} 