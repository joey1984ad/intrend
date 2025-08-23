import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const accessToken = searchParams.get('token');

    // Validate required parameters
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Validate that it's a Facebook CDN URL
    const facebookDomains = [
      'fbcdn.net', 'fbsbx.com', 'facebook.com', 'fb.com',
      'instagram.com', 'cdninstagram.com', 'igcdn.com'
    ];

    const isFacebookCDN = facebookDomains.some(domain => 
      imageUrl.includes(domain)
    );

    if (!isFacebookCDN) {
      return NextResponse.json(
        { error: 'Only Facebook CDN URLs are supported' },
        { status: 400 }
      );
    }

    console.log(`🔄 Proxying Facebook image:`, imageUrl);

    // Build the tokenized URL
    const separator = imageUrl.includes('?') ? '&' : '?';
    const tokenizedUrl = `${imageUrl}${separator}access_token=${accessToken}`;

    // Fetch the image from Facebook CDN
    const response = await fetch(tokenizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Intrend-Image-Proxy/1.0)',
        'Referer': 'https://facebook.com/',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch image: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the content type and check if it's actually an image
    const contentType = response.headers.get('content-type') || '';
    
    if (!contentType.startsWith('image/')) {
      console.error(`❌ Facebook returned non-image content: ${contentType}`);
      return NextResponse.json(
        { 
          error: 'Facebook returned non-image content',
          details: `Expected image, got: ${contentType}`,
          status: response.status
        },
        { status: 422 } // Unprocessable Entity
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();

    console.log(`✅ Successfully proxied Facebook image:`, {
      originalUrl: imageUrl,
      tokenizedUrl: tokenizedUrl,
      contentType: contentType,
      size: imageBuffer.byteLength
    });

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*', // Allow CORS
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ Image proxy error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to proxy image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
