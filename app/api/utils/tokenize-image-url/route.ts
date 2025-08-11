import { NextRequest, NextResponse } from 'next/server';
import { createOptimizedThumbnailUrl, appendAccessTokenToImageUrl } from '@/lib/facebook-utils';

// POST /api/utils/tokenize-image-url - Helper endpoint for n8n to create secure, high-res image URLs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔧 Image URL Tokenizer: Processing request');
    
    const {
      imageUrl,
      accessToken,
      contentType = 'image',
      optimize = true
    } = body;

    // Validate required fields
    if (!imageUrl || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: imageUrl, accessToken' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid imageUrl format' },
        { status: 400 }
      );
    }

    // Validate content type
    const validContentTypes = ['image', 'video', 'carousel', 'dynamic'];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid contentType. Must be one of: ${validContentTypes.join(', ')}` },
        { status: 400 }
      );
    }

    let processedUrl: string;

    if (optimize) {
      // Use optimized thumbnail URL for better quality
      const optimizedUrl = createOptimizedThumbnailUrl(
        imageUrl, 
        accessToken, 
        contentType as 'video' | 'carousel' | 'dynamic' | 'image'
      );
      processedUrl = optimizedUrl || appendAccessTokenToImageUrl(imageUrl, accessToken);
    } else {
      // Just append access token
      processedUrl = appendAccessTokenToImageUrl(imageUrl, accessToken);
    }

    console.log(`✅ Image URL Tokenizer: Processed ${contentType} image URL`);

    return NextResponse.json({
      success: true,
      originalUrl: imageUrl,
      processedUrl,
      contentType,
      optimized: optimize,
      message: 'Image URL tokenized successfully'
    });

  } catch (error: any) {
    console.error('❌ Image URL Tokenizer API error:', error);
    return NextResponse.json(
      { error: 'Failed to process image URL' },
      { status: 500 }
    );
  }
}

// GET /api/utils/tokenize-image-url - Get processing info (for testing)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    endpoint: '/api/utils/tokenize-image-url',
    method: 'POST',
    description: 'Helper endpoint for n8n to create secure, high-resolution Facebook image URLs',
    parameters: {
      imageUrl: 'string (required) - Facebook CDN image URL',
      accessToken: 'string (required) - Facebook access token',
      contentType: 'string (optional) - image|video|carousel|dynamic (default: image)',
      optimize: 'boolean (optional) - Apply optimization for high-res (default: true)'
    },
    response: {
      success: 'boolean',
      originalUrl: 'string',
      processedUrl: 'string',
      contentType: 'string',
      optimized: 'boolean',
      message: 'string'
    }
  });
}
