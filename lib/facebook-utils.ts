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

  // If URL already has access_token parameter
  if (imageUrl.includes('access_token=')) {
    return imageUrl;
  }

  // Only append for Facebook-family URLs we know require it
  if (!isFacebookCDNUrl(imageUrl)) {
    return imageUrl;
  }

  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}access_token=${accessToken}`;
}

/**
 * Checks if a URL is a Facebook CDN URL
 * @param url - The URL to check
 * @returns true if it's a Facebook CDN URL
 */
export function isFacebookCDNUrl(url: string): boolean {
  if (!url) return false;
  // Treat all Facebook-family image hosts as optimizable
  // Common hosts seen in creatives and previews:
  // - scontent.xx.fbcdn.net (FB CDN)
  // - lookaside.facebook.com (creative previews)
  // - graph.facebook.com (picture endpoints)
  // - fbsbx.com (attachments)
  // - cdninstagram.com / akamaihd.net (legacy/IG mirrors)
  return (
    url.includes('fbcdn.net') ||
    url.includes('fbsbx.com') ||
    url.includes('lookaside.facebook.com') ||
    url.includes('graph.facebook.com') ||
    url.includes('facebook.com') ||
    url.includes('cdninstagram.com') ||
    url.includes('akamaihd.net')
  );
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
  
  console.log(`🔍 Processing FB CDN URL for ${contentType}:`, imageUrl);

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
      console.log(`🎥 Using video optimized params: ${width}x${height} q=${quality}`);
      break;
    case 'carousel':
    case 'dynamic':
      // Carousels and dynamic ads often use square or 4:5 aspect ratio
      width = 1080;
      height = 1350; // 4:5 aspect ratio often used in feed
      quality = 95;
      console.log(`🎠 Using carousel/dynamic optimized params: ${width}x${height} q=${quality}`);
      break;
    case 'image':
    default:
      // Standard images - use square format for consistency
      width = 1080;
      height = 1080;
      quality = 95;
      console.log(`🖼️ Using standard image params: ${width}x${height} q=${quality}`);
      break;
  }

  try {
    const urlObj = new URL(imageUrl);
    const originalPath = urlObj.pathname;
    console.log(`🔍 Original pathname:`, originalPath);

    // Handle various low-res path patterns
    urlObj.pathname = urlObj.pathname
      // Replace /p64x64 or /p64x64/ variants (profile/picture sizes)
      .replace(/\/p\d+x\d+(?=\/|$)/i, `/p${width}x${height}`)
      // Replace /s64x64 variants (small sizes)
      .replace(/\/s\d+x\d+(?=\/|$)/i, `/s${width}x${height}`)
      // Replace /t64x64 variants (table/thumbnail size) - this is the main culprit
      .replace(/\/t\d+x\d+(?=\/|$)/i, `/t${width}x${height}`)
      // Replace /w64/ or /h64/ variants (width/height specific)
      .replace(/\/w\d+(?=\/|$)/gi, `/w${width}`)
      .replace(/\/h\d+(?=\/|$)/gi, `/h${height}`)
      // Handle additional patterns that Facebook uses for low-res
      .replace(/\/c\d+x\d+(?=\/|$)/i, `/c${width}x${height}`) // crop variants
      .replace(/\/n\d+x\d+(?=\/|$)/i, `/n${width}x${height}`) // normal variants
      .replace(/\/q\d+(?=\/|$)/i, `/q${quality}`) // quality variants
      // Handle table-specific patterns more aggressively
      .replace(/table_\d+x\d+/gi, `table_${width}x${height}`);

    // Strip low-res query params that Facebook uses for tables and thumbnails
    ['table', 'width', 'height', 'w', 'h', 'size', 'thumbnail', 'thumb', 'small', 'low_res'].forEach(param => {
      if (urlObj.searchParams.has(param)) {
        console.log(`🗑️ Removing low-res param: ${param}=${urlObj.searchParams.get(param)}`);
        urlObj.searchParams.delete(param);
      }
    });

    // Normalize/upgrade Facebook 'type' hints when present (graph picture endpoint)
    if (urlObj.searchParams.has('type')) {
      const typeVal = (urlObj.searchParams.get('type') || '').toLowerCase();
      if (['thumb', 'thumbnail', 'small', 'normal'].includes(typeVal)) {
        console.log(`🔁 Upgrading type=${typeVal} → large`);
        urlObj.searchParams.set('type', 'large');
      }
    }

    // Many fbcdn URLs embed size constraints in the stp param (e.g., stp=dst-jpg_p64x64)
    // If present, upsize any embedded pWxH/sWxH/tWxH segments to our target
    if (urlObj.searchParams.has('stp')) {
      const originalStp = urlObj.searchParams.get('stp') || '';
      const upgradedStp = originalStp
        .replace(/_p\d+x\d+(?=_|$)/i, `_p${width}x${height}`)
        .replace(/_s\d+x\d+(?=_|$)/i, `_s${width}x${height}`)
        .replace(/_t\d+x\d+(?=_|$)/i, `_t${width}x${height}`)
        .replace(/_q\d+(?=_|$)/i, `_q${quality}`)
        // Remove table-thumbnail tokens like _tt6 that can force tiny table variants
        .replace(/_tt\d+(?=_|$)/i, '');
      if (upgradedStp !== originalStp) {
        console.log(`🔧 Upsized stp: ${originalStp} → ${upgradedStp}`);
        urlObj.searchParams.set('stp', upgradedStp);
      }
    }
 
    if (originalPath !== urlObj.pathname) {
      console.log(`✨ Updated pathname:`, urlObj.pathname);
    }

    // Normalize query params to enforce high-res
    // Handle both width/height and possible w/h variants
    urlObj.searchParams.set('width', String(width));
    urlObj.searchParams.set('height', String(height));
    urlObj.searchParams.set('quality', String(quality));
    // Some variants use w/h
    urlObj.searchParams.set('w', String(width));
    urlObj.searchParams.set('h', String(height));
    
    // Force high-res by removing any Facebook table/thumbnail flags (again, post-normalization)
    ['table', 'thumb', 'thumbnail'].forEach(param => urlObj.searchParams.delete(param));
    // Remove Facebook's EDM gating/variant hints when present to avoid tiny crops
    ['edm', 'edm_id', 'ur', 'st'].forEach(param => urlObj.searchParams.delete(param));
    
    // Override any size constraints with our high-res values
    console.log(`📏 Applied high-res params: width=${width}, height=${height}, quality=${quality}`);

    // Ensure access token present
    if (accessToken) {
      urlObj.searchParams.set('access_token', accessToken);
    }

    // Leave 'stp' parameter intact (Facebook uses it for smart crop). We only adjust explicit width/height params above.
 
    const finalUrl = urlObj.toString();
    console.log(`✅ Final optimized URL:`, finalUrl);
    return finalUrl;
  } catch {
    // Fallback to simple concatenation if URL parsing fails
    const separator = imageUrl.includes('?') ? '&' : '?';
    const optimizedUrl = `${imageUrl}${separator}width=${width}&height=${height}&quality=${quality}`;
    return appendAccessTokenToImageUrl(optimizedUrl, accessToken);
  }
} 