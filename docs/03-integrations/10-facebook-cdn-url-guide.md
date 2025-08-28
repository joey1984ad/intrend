# Facebook CDN URL Access Token Guide

This guide explains how to properly handle Facebook CDN URLs that require access tokens for authentication.

## Overview

Facebook CDN URLs (from domains like `fbcdn.net` and `fbsbx.com`) often require an access token to be appended as a URL parameter for proper access. This is especially important when displaying images from Facebook ads and creatives.

## The Problem

Facebook CDN URLs may return 403 Forbidden or other access errors when accessed directly without proper authentication. The solution is to append the access token as a URL parameter.

## Solution Implementation

### 1. Utility Functions (`lib/facebook-utils.ts`)

The core utility functions handle the logic for appending access tokens:

```typescript
import { appendAccessTokenToImageUrl, isFacebookCDNUrl } from '../lib/facebook-utils';

// Basic usage
const processedUrl = appendAccessTokenToImageUrl(imageUrl, accessToken);

// Check if URL is Facebook CDN
const isFacebook = isFacebookCDNUrl(imageUrl);
```

#### Key Functions:

- `appendAccessTokenToImageUrl(imageUrl, accessToken)` - Appends access token if needed
- `isFacebookCDNUrl(url)` - Checks if URL is from Facebook CDN
- `processImageUrlsWithToken(imageUrls, accessToken)` - Processes multiple URLs
- `createTestUrlWithToken(imageUrl, accessToken)` - Creates test URL with token

### 2. React Hook (`components/hooks/useFacebookImageUrl.ts`)

For React components, use the custom hook:

```typescript
import { useFacebookImageUrl } from '../hooks/useFacebookImageUrl';

function MyComponent({ imageUrl, accessToken }) {
  const { processedUrl, isFacebookCDN, needsAccessToken } = useFacebookImageUrl(imageUrl, accessToken);
  
  return <img src={processedUrl} alt="Facebook image" />;
}
```

### 3. React Component (`components/FacebookImage.tsx`)

For easy image display with automatic token handling:

```typescript
import FacebookImage from '../components/FacebookImage';

function MyComponent({ imageUrl, accessToken }) {
  return (
    <FacebookImage 
      src={imageUrl} 
      accessToken={accessToken}
      alt="Facebook ad image"
      className="w-full h-auto"
    />
  );
}
```

## URL Format Examples

### Original Facebook CDN URLs:
```
https://scontent.fbcdn.net/v/t39.30808-6/123456789_123456789_123456789_n.jpg
https://scontent.fbcdn.net/v/t39.30808-6/123456789_123456789_123456789_n.jpg?stp=dst-jpg_e15
```

### With Access Token Appended:
```
https://scontent.fbcdn.net/v/t39.30808-6/123456789_123456789_123456789_n.jpg?access_token=YOUR_ACCESS_TOKEN
https://scontent.fbcdn.net/v/t39.30808-6/123456789_123456789_123456789_n.jpg?stp=dst-jpg_e15&access_token=YOUR_ACCESS_TOKEN
```

## Implementation Details

### URL Parameter Logic

The utility function automatically determines the correct separator:

- If URL already has `?` parameters: uses `&access_token=`
- If URL has no parameters: uses `?access_token=`
- If URL already has `access_token`: returns original URL unchanged

### Facebook CDN Detection

Recognizes Facebook CDN domains:
- `fbcdn.net`
- `fbsbx.com`

### Error Handling

The `FacebookImage` component includes:
- Automatic fallback to original URL if processed URL fails
- Console warnings for debugging
- Support for custom error handlers
- Fallback image support

## Usage Examples

### 1. Basic API Route Usage

```typescript
// In API routes
import { appendAccessTokenToImageUrl } from '../../../../lib/facebook-utils';

export async function POST(request: NextRequest) {
  const { imageUrl, accessToken } = await request.json();
  
  // Process image URL with access token
  const processedUrl = appendAccessTokenToImageUrl(imageUrl, accessToken);
  
  // Use processed URL for fetching or returning
  const response = await fetch(processedUrl);
  // ...
}
```

### 2. Component Usage

```typescript
// In React components
import { useFacebookImageUrl } from '../hooks/useFacebookImageUrl';

function CreativeCard({ creative, accessToken }) {
  const { processedUrl } = useFacebookImageUrl(creative.imageUrl, accessToken);
  
  return (
    <div className="creative-card">
      <img src={processedUrl} alt={creative.name} />
      <h3>{creative.name}</h3>
    </div>
  );
}
```

### 3. Direct Component Usage

```typescript
// Using the FacebookImage component
import FacebookImage from '../components/FacebookImage';

function CreativeGallery({ creatives, accessToken }) {
  return (
    <div className="gallery">
      {creatives.map(creative => (
        <FacebookImage
          key={creative.id}
          src={creative.imageUrl}
          accessToken={accessToken}
          alt={creative.name}
          className="gallery-image"
          fallbackSrc="/placeholder-image.jpg"
        />
      ))}
    </div>
  );
}
```

## Testing

### Image URL Test Tool

Use the built-in test tool at `/api/facebook/test-image-url` to test individual URLs:

```typescript
// Test a specific image URL
const response = await fetch('/api/facebook/test-image-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    imageUrl: 'https://scontent.fbcdn.net/...', 
    accessToken: 'your_token' 
  })
});

const result = await response.json();
console.log('Test results:', result);
```

### Manual Testing

You can also test URLs manually:

1. Open browser console
2. Look for image URLs in API response logs
3. Copy URLs from `image_url`, `picture`, or `media.image_url` fields
4. Use the ImageURLTest component to test them
5. Check which access method works (direct, with token, with auth header)

## Best Practices

1. **Always use the utility functions** instead of manually appending tokens
2. **Test URLs** before displaying them in production
3. **Handle errors gracefully** with fallback images
4. **Use the React components** for consistent behavior
5. **Monitor console warnings** for debugging access issues
6. **Cache processed URLs** when possible to avoid repeated processing

## Common Issues

### 403 Forbidden Errors
- Usually means the URL needs an access token
- Use `appendAccessTokenToImageUrl()` to fix

### 404 Not Found Errors
- URL may be expired or invalid
- Check if the creative/ad still exists
- Refresh URLs from Facebook API

### Mixed Content Errors
- Ensure URLs use HTTPS
- Facebook CDN URLs should always be HTTPS

### Rate Limiting
- Facebook may rate limit requests
- Implement proper caching
- Use batch processing when possible

## Migration Guide

### From Manual Token Appending

**Before:**
```typescript
const separator = imageUrl.includes('?') ? '&' : '?';
const urlWithToken = `${imageUrl}${separator}access_token=${accessToken}`;
```

**After:**
```typescript
import { appendAccessTokenToImageUrl } from '../lib/facebook-utils';
const urlWithToken = appendAccessTokenToImageUrl(imageUrl, accessToken);
```

### From Direct Image Tags

**Before:**
```typescript
<img src={creative.imageUrl} alt="Creative" />
```

**After:**
```typescript
import FacebookImage from '../components/FacebookImage';
<FacebookImage src={creative.imageUrl} accessToken={accessToken} alt="Creative" />
```

This implementation ensures consistent, reliable handling of Facebook CDN URLs across your application. 