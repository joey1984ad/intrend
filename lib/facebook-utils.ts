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