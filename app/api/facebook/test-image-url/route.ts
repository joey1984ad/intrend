import { NextRequest, NextResponse } from 'next/server';
import { appendAccessTokenToImageUrl, isFacebookCDNUrl } from '../../../../lib/facebook-utils';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, accessToken } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 IMAGE URL TEST: Testing ${imageUrl}`);

    const testResults: any = {
      originalUrl: imageUrl,
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Direct URL access (no auth)
    console.log(`\n🔍 Test 1: Direct URL access (no authentication)`);
    try {
      const directResponse = await fetch(imageUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      testResults.tests.direct = {
        status: directResponse.status,
        statusText: directResponse.statusText,
        success: directResponse.ok,
        headers: Object.fromEntries(directResponse.headers.entries()),
        redirected: directResponse.redirected,
        finalUrl: directResponse.url
      };

      console.log(`   Status: ${directResponse.status} ${directResponse.statusText}`);
      console.log(`   Success: ${directResponse.ok}`);
      console.log(`   Redirected: ${directResponse.redirected}`);
      console.log(`   Final URL: ${directResponse.url}`);
      console.log(`   Headers:`, Object.fromEntries(directResponse.headers.entries()));

    } catch (error) {
      testResults.tests.direct = {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
      console.log(`   ❌ Error: ${error}`);
    }

    // Test 2: URL with access_token parameter
    if (accessToken) {
      console.log(`\n🔍 Test 2: URL with access_token parameter`);
      const urlWithToken = appendAccessTokenToImageUrl(imageUrl, accessToken);
      
      try {
        const tokenResponse = await fetch(urlWithToken, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        testResults.tests.withToken = {
          url: urlWithToken,
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          success: tokenResponse.ok,
          headers: Object.fromEntries(tokenResponse.headers.entries()),
          redirected: tokenResponse.redirected,
          finalUrl: tokenResponse.url
        };

        console.log(`   Status: ${tokenResponse.status} ${tokenResponse.statusText}`);
        console.log(`   Success: ${tokenResponse.ok}`);
        console.log(`   Redirected: ${tokenResponse.redirected}`);
        console.log(`   Final URL: ${tokenResponse.url}`);

      } catch (error) {
        testResults.tests.withToken = {
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        };
        console.log(`   ❌ Error: ${error}`);
      }
    }

    // Test 3: Authorization header approach
    if (accessToken) {
      console.log(`\n🔍 Test 3: Authorization header approach`);
      try {
        const authResponse = await fetch(imageUrl, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        testResults.tests.withAuthHeader = {
          status: authResponse.status,
          statusText: authResponse.statusText,
          success: authResponse.ok,
          headers: Object.fromEntries(authResponse.headers.entries()),
          redirected: authResponse.redirected,
          finalUrl: authResponse.url
        };

        console.log(`   Status: ${authResponse.status} ${authResponse.statusText}`);
        console.log(`   Success: ${authResponse.ok}`);

      } catch (error) {
        testResults.tests.withAuthHeader = {
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        };
        console.log(`   ❌ Error: ${error}`);
      }
    }

    // Test 4: Facebook Graph API image endpoint
    if (accessToken) {
      console.log(`\n🔍 Test 4: Facebook Graph API image endpoint approach`);
      
      // Try to extract image ID from URL if it's a Facebook CDN URL
      const facebookImageIdMatch = imageUrl.match(/\/([0-9]+)_/);
      if (facebookImageIdMatch) {
        const imageId = facebookImageIdMatch[1];
        const graphApiUrl = `https://graph.facebook.com/v23.0/${imageId}?fields=source,url&access_token=${accessToken}`;
        
        try {
          const graphResponse = await fetch(graphApiUrl);
          const graphData = await graphResponse.json();

          testResults.tests.graphApi = {
            imageId,
            graphApiUrl,
            status: graphResponse.status,
            success: !graphData.error,
            response: graphData
          };

          console.log(`   Image ID: ${imageId}`);
          console.log(`   Status: ${graphResponse.status}`);
          console.log(`   Response:`, graphData);

        } catch (error) {
          testResults.tests.graphApi = {
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false
          };
        }
      } else {
        testResults.tests.graphApi = {
          skipped: true,
          reason: 'Could not extract Facebook image ID from URL'
        };
      }
    }

    // Test 5: Content type and size check for successful responses
    const successfulTest = Object.values(testResults.tests).find((test: any) => test.success);
    if (successfulTest && !successfulTest.error) {
      console.log(`\n🔍 Test 5: Content analysis for successful response`);
      try {
        const contentUrl = successfulTest.finalUrl || successfulTest.url || imageUrl;
        const contentResponse = await fetch(contentUrl, {
          method: 'GET',
          headers: successfulTest.url?.includes('access_token') ? {} : 
                   accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
        });

        if (contentResponse.ok) {
          const contentLength = contentResponse.headers.get('content-length');
          const contentType = contentResponse.headers.get('content-type');
          
          testResults.tests.contentAnalysis = {
            contentType,
            contentLength: contentLength ? parseInt(contentLength) : null,
            isImage: contentType?.startsWith('image/') || false,
            success: true
          };

          console.log(`   Content-Type: ${contentType}`);
          console.log(`   Content-Length: ${contentLength} bytes`);
          console.log(`   Is Image: ${contentType?.startsWith('image/')}`);
        }
      } catch (error) {
        testResults.tests.contentAnalysis = {
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        };
      }
    }

    // Test 6: URL analysis and patterns
    console.log(`\n🔍 Test 6: URL pattern analysis`);
    const urlAnalysis = {
      domain: new URL(imageUrl).hostname,
      isFacebookCDN: isFacebookCDNUrl(imageUrl),
      isHTTPS: imageUrl.startsWith('https://'),
      hasParameters: imageUrl.includes('?'),
      parameters: new URL(imageUrl).searchParams.entries ? 
                  Object.fromEntries(new URL(imageUrl).searchParams.entries()) : {},
      pathSegments: new URL(imageUrl).pathname.split('/').filter(Boolean)
    };

    testResults.urlAnalysis = urlAnalysis;
    console.log(`   Domain: ${urlAnalysis.domain}`);
    console.log(`   Is Facebook CDN: ${urlAnalysis.isFacebookCDN}`);
    console.log(`   Has Parameters: ${urlAnalysis.hasParameters}`);
    console.log(`   Parameters:`, urlAnalysis.parameters);

    // Generate recommendations
    const recommendations = generateImageUrlRecommendations(testResults);
    testResults.recommendations = recommendations;

    console.log(`\n📊 IMAGE URL TEST COMPLETE`);
    console.log(`   Original URL: ${imageUrl}`);
    console.log(`   Direct access: ${testResults.tests.direct?.success ? '✅' : '❌'}`);
    console.log(`   With token: ${testResults.tests.withToken?.success ? '✅' : '❌'}`);
    console.log(`   With auth header: ${testResults.tests.withAuthHeader?.success ? '✅' : '❌'}`);

    return NextResponse.json({
      success: true,
      testResults,
      summary: {
        originalUrl: imageUrl,
        anyMethodWorked: Object.values(testResults.tests).some((test: any) => test.success),
        recommendedMethod: recommendations.length > 0 ? recommendations[0].method : null,
        isAccessible: Object.values(testResults.tests).some((test: any) => test.success)
      }
    });

  } catch (error) {
    console.error('❌ IMAGE URL TEST: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Image URL test failed' },
      { status: 500 }
    );
  }
}

function generateImageUrlRecommendations(testResults: any) {
  const recommendations = [];

  // Check which method worked
  if (testResults.tests.direct?.success) {
    recommendations.push({
      method: 'direct',
      description: 'Direct URL access works - no authentication needed',
      action: 'Use original URL as-is',
      priority: 'high'
    });
  }

  if (testResults.tests.withToken?.success && !testResults.tests.direct?.success) {
    recommendations.push({
      method: 'token_parameter',
      description: 'URL works with access_token parameter',
      action: 'Append ?access_token={token} to image URLs',
      priority: 'high'
    });
  }

  if (testResults.tests.withAuthHeader?.success && !testResults.tests.direct?.success) {
    recommendations.push({
      method: 'auth_header',
      description: 'URL works with Authorization header',
      action: 'Use Authorization: Bearer {token} header when fetching images',
      priority: 'medium'
    });
  }

  if (testResults.tests.graphApi?.success) {
    recommendations.push({
      method: 'graph_api',
      description: 'Facebook Graph API can provide image source',
      action: 'Use Graph API to get current image URL',
      priority: 'low'
    });
  }

  // Check for common issues
  if (testResults.tests.direct?.status === 403) {
    recommendations.push({
      method: 'proxy_needed',
      description: 'Image requires authentication - 403 Forbidden',
      action: 'Implement server-side proxy with access token',
      priority: 'high'
    });
  }

  if (testResults.tests.direct?.status === 404) {
    recommendations.push({
      method: 'url_expired',
      description: 'Image URL appears to be expired - 404 Not Found',
      action: 'Refresh image URLs from Facebook API',
      priority: 'critical'
    });
  }

  if (testResults.urlAnalysis?.isFacebookCDN && Object.values(testResults.tests).every((test: any) => !test.success)) {
    recommendations.push({
      method: 'facebook_cdn_auth',
      description: 'Facebook CDN URLs may require special authentication',
      action: 'Implement Facebook-specific image proxy or use different image fields',
      priority: 'high'
    });
  }

  return recommendations;
}

// GET endpoint for quick testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('imageUrl');
  const accessToken = searchParams.get('accessToken');

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'imageUrl is required as query parameter' },
      { status: 400 }
    );
  }

  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, accessToken })
  }));
}