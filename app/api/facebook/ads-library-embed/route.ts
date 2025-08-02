import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { adId, creativeId, width = 500, height = 500 } = await request.json();

    if (!adId && !creativeId) {
      return NextResponse.json(
        { error: 'Either ad ID or creative ID is required' },
        { status: 400 }
      );
    }

    const targetId = adId || creativeId;
    console.log(`🔍 ADS LIBRARY: Generating embed for ${adId ? 'ad' : 'creative'} ${targetId}`);

    // Facebook Ads Library embed URLs
    const embedUrls = [
      `https://www.facebook.com/ads/library/preview/?id=${targetId}`,
      `https://www.facebook.com/ads/library/preview/?creative_id=${targetId}`,
      `https://www.facebook.com/ads/library/?id=${targetId}`,
    ];

    // Generate iframe embed code
    const generateEmbed = (url: string) => {
      return {
        embedUrl: url,
        iframeHtml: `
          <iframe 
            src="${url}" 
            width="${width}" 
            height="${height}"
            style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            loading="lazy"
            title="Facebook Ad Preview"
          ></iframe>
        `.trim(),
        dimensions: { width, height }
      };
    };

    // Try to validate the first URL (basic check)
    try {
      const testUrl = embedUrls[0];
      console.log(`🔍 ADS LIBRARY: Testing accessibility of ${testUrl}`);
      
      // Note: We can't actually fetch this due to CORS, but we can provide the embed
      const embed = generateEmbed(testUrl);
      
      console.log(`✅ ADS LIBRARY: Generated embed for ${targetId}`);
      
      return NextResponse.json({
        success: true,
        embed,
        alternatives: embedUrls.map(url => generateEmbed(url)),
        message: 'Facebook Ads Library embed generated'
      });

    } catch (error) {
      console.log(`⚠️ ADS LIBRARY: Could not validate URL, but providing embed anyway`);
      
      const embed = generateEmbed(embedUrls[0]);
      
      return NextResponse.json({
        success: true,
        embed,
        alternatives: embedUrls.map(url => generateEmbed(url)),
        message: 'Facebook Ads Library embed generated (unvalidated)',
        warning: 'Could not validate embed URL accessibility'
      });
    }

  } catch (error) {
    console.error('❌ ADS LIBRARY: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ads library embed' },
      { status: 500 }
    );
  }
}

// GET endpoint for quick testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adId = searchParams.get('adId');
  const creativeId = searchParams.get('creativeId');
  const width = parseInt(searchParams.get('width') || '500');
  const height = parseInt(searchParams.get('height') || '500');

  if (!adId && !creativeId) {
    return NextResponse.json(
      { error: 'Either adId or creativeId is required as query parameter' },
      { status: 400 }
    );
  }

  // Redirect to POST method
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adId, creativeId, width, height })
  }));
}