import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, adId, format = 'DESKTOP_FEED_STANDARD' } = await request.json();

    if (!accessToken || !adId) {
      return NextResponse.json(
        { error: 'Access token and ad ID are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 AD PREVIEW: Generating preview for ad ${adId} with format ${format}`);

    const baseUrl = 'https://graph.facebook.com/v23.0';
    
    // Facebook Ad Preview API endpoint
    const previewUrl = `${baseUrl}/${adId}/previews?ad_format=${format}&access_token=${accessToken}`;
    
    console.log(`🔍 AD PREVIEW: Request URL: ${previewUrl}`);

    const response = await fetch(previewUrl);
    const data = await response.json();

    if (data.error) {
      console.error(`❌ AD PREVIEW: Error for ad ${adId}:`, data.error);
      
      // If standard preview fails, try alternative formats
      const fallbackFormats = [
        'MOBILE_FEED_STANDARD',
        'RIGHT_COLUMN_STANDARD',
        'DESKTOP_FEED_STANDARD',
        'MOBILE_BANNER',
        'MOBILE_INTERSTITIAL'
      ];

      for (const fallbackFormat of fallbackFormats) {
        if (fallbackFormat === format) continue; // Skip the one we already tried
        
        console.log(`🔄 AD PREVIEW: Trying fallback format ${fallbackFormat} for ad ${adId}`);
        const fallbackUrl = `${baseUrl}/${adId}/previews?ad_format=${fallbackFormat}&access_token=${accessToken}`;
        
        try {
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackData = await fallbackResponse.json();
          
          if (!fallbackData.error && fallbackData.data && fallbackData.data.length > 0) {
            console.log(`✅ AD PREVIEW: Success with fallback format ${fallbackFormat}`);
            return NextResponse.json({
              success: true,
              preview: fallbackData.data[0],
              format: fallbackFormat,
              fallback: true
            });
          }
        } catch (fallbackError) {
          console.log(`❌ AD PREVIEW: Fallback format ${fallbackFormat} failed:`, fallbackError);
        }
      }

      return NextResponse.json(
        { error: `Facebook API error: ${data.error.message}`, details: data.error },
        { status: 400 }
      );
    }

    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { error: 'No preview data returned from Facebook' },
        { status: 404 }
      );
    }

    const preview = data.data[0];
    console.log(`✅ AD PREVIEW: Successfully generated preview for ad ${adId}`);
    console.log(`   📋 Preview type: ${preview.ad_format || 'Unknown'}`);
    console.log(`   🔗 Preview body length: ${preview.body?.length || 0} characters`);

    return NextResponse.json({
      success: true,
      preview,
      format,
      fallback: false
    });

  } catch (error) {
    console.error('❌ AD PREVIEW: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ad preview' },
      { status: 500 }
    );
  }
}

// GET endpoint for quick testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adId = searchParams.get('adId');
  const accessToken = searchParams.get('accessToken');
  const format = searchParams.get('format') || 'DESKTOP_FEED_STANDARD';

  if (!accessToken || !adId) {
    return NextResponse.json(
      { error: 'Access token and ad ID are required as query parameters' },
      { status: 400 }
    );
  }

  // Redirect to POST method
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, adId, format })
  }));
}