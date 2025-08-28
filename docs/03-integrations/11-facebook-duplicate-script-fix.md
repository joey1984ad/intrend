# Facebook Duplicate Script Loading Fix

## Problem Description

The error "FB.login() called before FB.init()" was occurring because the Facebook SDK script (`all.js`) was being loaded multiple times, causing race conditions and initialization conflicts.

## Root Causes

1. **Multiple Script Loading Paths**: The Facebook script was being loaded in multiple places:
   - `FacebookSDKManager.performInitialization()`
   - `createGlobalFacebookInitPromise()`
   - `facebook-utils.ts` functions

2. **Race Conditions**: Multiple initialization attempts happening simultaneously
3. **No Coordination**: Different parts of the code trying to load the script independently

## Solution Implemented

### 1. Centralized Script Loading

Created a single `loadFacebookScript()` function that ensures the script is loaded only once:

```typescript
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

  // Load script only once
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
```

### 2. Global Script Loading Flag

Added a global flag to track script loading state:

```typescript
declare global {
  interface Window {
    // ... other properties
    __facebookScriptLoaded?: boolean; // Global flag to prevent duplicate script loading
  }
}
```

### 3. Updated All Initialization Functions

Modified all initialization functions to use the centralized script loader:

- `FacebookSDKManager.performInitialization()`
- `createGlobalFacebookInitPromise()`
- `facebook-utils.ts` functions

### 4. Static Class Flag

Added a static flag in the SDK manager to coordinate script loading:

```typescript
class FacebookSDKManager {
  public static scriptLoaded = false; // Public static flag to prevent multiple script loads
  // ... rest of class
}
```

## How It Works Now

1. **First Call**: When any initialization function is called, it checks if the script is already loaded
2. **Script Loading**: If not loaded, the centralized `loadFacebookScript()` function loads it once
3. **Subsequent Calls**: All subsequent calls skip script loading and just wait for initialization
4. **Coordination**: All initialization methods coordinate through the global flags

## Benefits

- ✅ **No More Duplicate Scripts**: Facebook SDK script loads only once
- ✅ **Eliminated Race Conditions**: Proper coordination between initialization methods
- ✅ **Faster Loading**: No redundant script downloads
- ✅ **Better Error Handling**: Clear logging of what's happening
- ✅ **Maintainable Code**: Single source of truth for script loading

## Usage Examples

### Simple Initialization
```typescript
// This will load the script only once, even if called multiple times
await ensureFacebookReady('your-app-id');
```

### Global Promise Approach
```typescript
// This will reuse the existing promise if already created
const initPromise = createGlobalFacebookInitPromise('your-app-id');
await initPromise;
```

### SDK Manager
```typescript
// The SDK manager will coordinate with global initialization
const sdkManager = FacebookSDKManager.getInstance();
await sdkManager.initialize('your-app-id');
```

## Debugging

The system now provides clear logging:

- `📜 Facebook script already loaded, skipping...` - Script already exists
- `📜 Facebook script element already exists, marking as loaded...` - Script element found
- `📜 Loading Facebook SDK script (first time)...` - First time loading
- `🌐 Global Facebook init promise already exists, reusing...` - Reusing existing promise

## Prevention Tips

1. **Always use the centralized functions** instead of manually loading the script
2. **Check for existing initialization** before creating new promises
3. **Use the global flags** to coordinate between different parts of your app
4. **Implement proper error handling** with timeouts and retries

## Testing

To verify the fix works:

1. Open browser dev tools
2. Check Network tab for Facebook script requests
3. You should see only ONE request to `connect.facebook.net/en_US/sdk.js`
4. Console should show coordination messages
5. No more "FB.login() called before FB.init()" errors

## Files Modified

- `components/FacebookLogin.tsx` - Main component with centralized script loading
- `lib/facebook-utils.ts` - Utility functions with centralized script loading
- Added global script loading coordination

This fix ensures that your Facebook SDK initialization is robust, efficient, and error-free.
