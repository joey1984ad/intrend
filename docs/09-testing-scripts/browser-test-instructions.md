# Browser Testing Instructions for Image Proxy

## Quick Browser Test

1. **Open your browser** and go to `http://localhost:3000`
2. **Open Developer Tools** (F12 or right-click → Inspect)
3. **Go to Console tab**
4. **Test with a real Facebook URL**:

```javascript
// Replace with your actual Facebook image URL
const testUrl = 'https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/YOUR_ACTUAL_IMAGE_ID_n.jpg';
const accessToken = 'YOUR_ACCESS_TOKEN'; // From .env.local

// Test the proxy
fetch(`/api/proxy-image?url=${encodeURIComponent(testUrl)}&token=${encodeURIComponent(accessToken)}`)
  .then(response => {
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Content-Length:', response.headers.get('content-length'));
    
    if (response.ok) {
      return response.blob();
    } else {
      return response.json();
    }
  })
  .then(data => {
    if (data instanceof Blob) {
      console.log('✅ SUCCESS: Got image blob, size:', data.size, 'bytes');
      // Create a preview
      const url = URL.createObjectURL(data);
      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '200px';
      document.body.appendChild(img);
    } else {
      console.log('❌ ERROR:', data);
    }
  })
  .catch(error => {
    console.error('❌ Network Error:', error);
  });
```

## How to Get Real Facebook Image URLs

### Method 1: Facebook Ads Manager
1. Go to [Facebook Ads Manager](https://www.facebook.com/adsmanager/)
2. Click on any active ad
3. Look for the creative preview
4. Right-click on the image → "Copy image address"
5. The URL will look like: `https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/...`

### Method 2: Facebook Business Manager
1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Navigate to Assets → Ad Creatives
3. Click on any creative
4. Copy the image URL from the preview

### Method 3: Your Webhook Data
1. Check your webhook logs for recent ad updates
2. Look for `image_url` or `thumbnail_url` fields
3. Copy these URLs for testing

## Expected Results

- **200 OK**: Image successfully proxied (check the image preview)
- **403 Forbidden**: Facebook denied access (URL expired or token invalid)
- **422 Unprocessable**: Facebook returned HTML instead of image
- **400 Bad Request**: Missing parameters

## Troubleshooting

- **403 Errors**: Check if your access token is valid and has the right permissions
- **422 Errors**: The URL might be expired or pointing to non-image content
- **Network Errors**: Make sure your Next.js server is running on port 3000
