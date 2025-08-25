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

/**
 * Enhanced Facebook SDK Initialization Utilities
 * 
 * These functions provide multiple solutions to prevent "FB.login() called before FB.init()" errors:
 * 
 * 1. ensureFBInit() - Simple callback-based approach with retry logic
 * 2. ensureFacebookReady() - Comprehensive async utility
 * 3. createGlobalFacebookInitPromise() - Global Promise-based initialization
 */

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
    __facebookSDKInitialized?: boolean;
    __facebookSDKPromise?: Promise<boolean>;
    __facebookSDKRetryCount?: number;
    fbInitialized?: boolean;
    __facebookInitPromise?: Promise<void>;
    __facebookScriptLoaded?: boolean; // Global flag to prevent duplicate script loading
  }
}

/**
 * Centralized Facebook SDK script loader
 * Ensures the script is loaded only once across the entire application
 */
function loadFacebookScript(): void {
  if (window.__facebookScriptLoaded) {
    console.log('📜 Facebook script already loaded, skipping...');
    return;
  }

  if (document.querySelector('script[src*="connect.facebook.net"]')) {
    console.log('📜 Facebook script element already exists, marking as loaded...');
    window.__facebookScriptLoaded = true;
    return;
  }

  console.log('📜 Loading Facebook SDK script (first time)...');
  window.__facebookScriptLoaded = true;

  (function(d, s, id) {
    var js: HTMLScriptElement, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s) as HTMLScriptElement; js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    js.async = true;
    js.defer = true;
    js.crossOrigin = "anonymous";
    if (fjs && fjs.parentNode) {
      fjs.parentNode.insertBefore(js, fjs);
    } else {
      d.head.appendChild(js);
    }
  }(document, 'script', 'facebook-jssdk'));
}

/**
 * Solution 3: Enhanced FB Status Checking Function
 * Ensures Facebook SDK is ready before executing callback
 */
export function ensureFBInit(callback: () => void, maxAttempts = 50): void {
  if (typeof window !== 'undefined' && 
      window.FB && 
      window.__facebookSDKInitialized && 
      typeof window.FB.getLoginStatus === 'function' &&
      typeof window.FB.login === 'function' &&
      typeof window.FB.api === 'function') {
    console.log('✅ ensureFBInit: FB is ready, executing callback immediately');
    callback();
  } else {
    if (maxAttempts > 0) {
      console.log(`⏳ ensureFBInit: FB not ready, retrying in 100ms... (${maxAttempts} attempts left)`);
      setTimeout(() => {
        ensureFBInit(callback, maxAttempts - 1);
      }, 100);
    } else {
      console.error('❌ ensureFBInit: FB initialization timeout after maximum attempts');
    }
  }
}

/**
 * Global Facebook SDK initialization with Promise-based approach
 * Creates a global promise that can be reused across components
 */
export function createGlobalFacebookInitPromise(appId: string): Promise<void> {
  if (window.__facebookInitPromise) {
    console.log('🌐 Global Facebook init promise already exists, reusing...');
    return window.__facebookInitPromise;
  }

  console.log('🔧 Creating global Facebook init promise for App ID:', appId);
  
  window.__facebookInitPromise = new Promise<void>((resolve, reject) => {
    // Set fbAsyncInit BEFORE loading the script
    window.fbAsyncInit = () => {
      try {
        console.log('🔧 Global fbAsyncInit fired, calling FB.init...');
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: true,
          version: 'v23.0'
        });
        window.__facebookSDKInitialized = true;
        window.fbInitialized = true;
        console.log('✅ Global FB initialized successfully');
        resolve();
      } catch (error) {
        console.error('❌ Global FB initialization failed:', error);
        reject(error);
      }
    };

    // Use centralized script loader to prevent duplicates
    loadFacebookScript();

    // Fallback timeout
    setTimeout(() => {
      if (!window.FB || !window.__facebookSDKInitialized) {
        const error = new Error('Global Facebook SDK initialization timeout');
        console.error('❌ Global Facebook init timeout:', error);
        reject(error);
      }
    }, 15000);
  });

  return window.__facebookInitPromise;
}

/**
 * Comprehensive Facebook readiness utility that combines all solutions
 * Use this function to ensure Facebook is fully ready before any operations
 */
export async function ensureFacebookReady(appId: string): Promise<void> {
  // Solution 1: Check if already ready
  if (window.FB && window.__facebookSDKInitialized && 
      typeof window.FB.login === 'function' && 
      typeof window.FB.getLoginStatus === 'function' && 
      typeof window.FB.api === 'function') {
    console.log('✅ ensureFacebookReady: FB already ready');
    return;
  }

  // Solution 2: Use global Promise-based approach
  if (window.__facebookInitPromise) {
    console.log('🌐 ensureFacebookReady: Using existing global init promise');
    await window.__facebookInitPromise;
    return;
  }

  // Solution 3: Create new global promise and wait
  console.log('🔧 ensureFacebookReady: Creating new global init promise');
  await createGlobalFacebookInitPromise(appId);
  
  // Final validation
  if (!window.FB || !window.__facebookSDKInitialized) {
    throw new Error('Facebook SDK failed to initialize properly');
  }
}

/**
 * Utility function to check if Facebook SDK is ready
 */
export function isFacebookReady(): boolean {
  return typeof window !== 'undefined' && 
         window.FB && 
         window.__facebookSDKInitialized && 
         typeof window.FB.login === 'function' && 
         typeof window.FB.getLoginStatus === 'function' && 
         typeof window.FB.api === 'function';
}

/**
 * Safe Facebook login wrapper that ensures SDK is ready
 */
export async function safeFacebookLogin(
  appId: string, 
  callback: (response: any) => void, 
  options?: any
): Promise<void> {
  await ensureFacebookReady(appId);
  
  if (typeof window.FB.login === 'function') {
    window.FB.login(callback, options);
  } else {
    throw new Error('Facebook login method not available');
  }
}

/**
 * Safe Facebook API wrapper that ensures SDK is ready
 */
export async function safeFacebookAPI(
  appId: string, 
  path: string, 
  method: string = 'GET', 
  params?: any
): Promise<any> {
  await ensureFacebookReady(appId);
  
  if (typeof window.FB.api === 'function') {
    return new Promise((resolve, reject) => {
      window.FB.api(path, method, params, (response: any) => {
        if (response && !response.error) {
          resolve(response);
        } else {
          reject(response?.error || new Error('Facebook API call failed'));
        }
      });
    });
  } else {
    throw new Error('Facebook API method not available');
  }
} 

// Facebook API Configuration
export const FACEBOOK_API_VERSION = 'v18.0';
export const ADS_LIBRARY_ENDPOINT = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/ads_archive`;

// Required permissions for Ads Library access
export const ADS_LIBRARY_PERMISSIONS = [
  'ads_read',
  'read_insights',
  'pages_read_engagement'
];

// Rate limiting configuration
export const ADS_LIBRARY_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Facebook allows 200 requests per minute for Ads Library
  standardHeaders: true,
  legacyHeaders: false,
};

// Default search parameters
export const DEFAULT_SEARCH_PARAMS = {
  limit: 20,
  offset: 0,
  search_terms: '',
  ad_reached_countries: ['US'],
};

// Media type mappings
export const MEDIA_TYPE_MAPPINGS = {
  image: 'IMAGE',
  video: 'VIDEO',
  carousel: 'CAROUSEL_ALBUM',
  dynamic: 'DYNAMIC',
};

// Ad type mappings
export const AD_TYPE_MAPPINGS = {
  political: 'POLITICAL_AND_ISSUE_AD',
  issue: 'ISSUE_AD',
  election: 'ELECTION_AD',
  commercial: 'REGULAR_AD',
};

// Platform mappings
export const PLATFORM_MAPPINGS = {
  facebook: 'FACEBOOK',
  instagram: 'INSTAGRAM',
  messenger: 'MESSENGER',
  audience_network: 'AUDIENCE_NETWORK',
};

// Date range calculations
export const getDateRange = (range: string) => {
  const now = new Date();
  let startDate = new Date();
  
  switch (range) {
    case 'last_7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'last_30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case 'last_90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case 'last_12m':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return null;
  }
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0],
  };
};

// Currency formatting
export const formatCurrency = (amount: string | number, currency: string = 'USD') => {
  const num = typeof amount === 'string' ? parseInt(amount) : amount;
  if (isNaN(num)) return '$0';
  
  if (num >= 1000000) {
    return `${currency === 'USD' ? '$' : currency}${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${currency === 'USD' ? '$' : currency}${(num / 1000).toFixed(1)}K`;
  }
  return `${currency === 'USD' ? '$' : currency}${num.toLocaleString()}`;
};

// Impressions formatting
export const formatImpressions = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseInt(amount) : amount;
  if (isNaN(num)) return '0';
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

// Date formatting
export const formatDate = (dateString: string, format: 'short' | 'long' = 'short') => {
  const date = new Date(dateString);
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Platform icon mapping
export const getPlatformIcon = (platform: string) => {
  const normalizedPlatform = platform.toLowerCase();
  
  switch (normalizedPlatform) {
    case 'facebook':
      return '📘';
    case 'instagram':
      return '📷';
    case 'messenger':
      return '💬';
    case 'audience_network':
      return '🌐';
    default:
      return '📱';
  }
};

// Status color mapping
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'PAUSED':
      return 'bg-yellow-100 text-yellow-800';
    case 'DELETED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Media type icon mapping
export const getMediaIcon = (mediaType: string) => {
  switch (mediaType.toLowerCase()) {
    case 'video':
      return '🎥';
    case 'image':
      return '🖼️';
    case 'carousel':
      return '🔄';
    case 'dynamic':
      return '⚡';
    default:
      return '📄';
  }
};

// Validation functions
export const validateAccessToken = (token: string) => {
  return token && token.length > 0;
};

export const validateSearchQuery = (query: string) => {
  return query && query.trim().length > 0;
};

export const validateFilters = (filters: any) => {
  if (!filters) return true;
  
  // Add validation logic as needed
  return true;
};

// Error handling
export const handleFacebookAPIError = (error: any, status: number) => {
  if (status === 401) {
    return 'Invalid or expired access token. Please reconnect your Facebook account.';
  }
  
  if (status === 429) {
    return 'Rate limit exceeded. Please try again later.';
  }
  
  if (status === 403) {
    return 'Access denied. Please check your Facebook permissions.';
  }
  
  if (error?.error?.message) {
    return `Facebook API error: ${error.error.message}`;
  }
  
  return 'An unexpected error occurred while communicating with Facebook.';
};

// Cache configuration
export const CACHE_CONFIG = {
  TTL: 3600, // 1 hour in seconds
  MAX_SIZE: 100, // Maximum number of cached items
  STALE_WHILE_REVALIDATE: 300, // 5 minutes in seconds
};

// Export configuration
export const EXPORT_CONFIG = {
  MAX_RESULTS: 1000,
  SUPPORTED_FORMATS: ['csv', 'json'],
  CSV_DELIMITER: ',',
  CSV_QUOTE_CHAR: '"',
}; 