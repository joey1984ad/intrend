import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, creativeId, adFormat = 'DESKTOP_FEED_STANDARD' } = await request.json();

    if (!accessToken || !creativeId) {
      return NextResponse.json(
        { error: 'Access token and creative ID are required' },
        { status: 400 }
      );
    }

    // Special case for testing/mock data
    if (accessToken === 'mock' || creativeId === 'mock') {
      console.log('🎭 Debug: Using mock preview data for testing');
      return NextResponse.json({
        success: true,
        previewHtml: generateMockPreviewHtml(),
        message: 'Using mock preview data for testing'
      });
    }

    const baseUrl = 'https://graph.facebook.com/v23.0';
    const previewUrl = `${baseUrl}/${creativeId}/previews?ad_format=${adFormat}&access_token=${accessToken}`;

    console.log(`🔍 Debug: Fetching preview for creative ${creativeId} with format ${adFormat}`);

    const response = await fetch(previewUrl);
    const data = await response.json();

    if (data.error) {
      console.error('Preview API error:', data.error);
      return NextResponse.json(
        { error: `Facebook API error: ${data.error.message}` },
        { status: 400 }
      );
    }

    // The API returns an array of previews, we'll use the first one
    const preview = data.data?.[0];
    if (!preview || !preview.body) {
      console.error('No preview data found');
      return NextResponse.json(
        { error: 'No preview data available for this creative' },
        { status: 404 }
      );
    }

    // Extract the HTML snippet from the preview
    const previewHtml = preview.body;

    return NextResponse.json({
      success: true,
      previewHtml,
      adFormat,
      creativeId
    });

  } catch (error) {
    console.error('❌ Error in creative preview API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creative preview' },
      { status: 500 }
    );
  }
}

function generateMockPreviewHtml(): string {
  // Generate mock HTML snippets for different creative types
  const mockPreviews = [
    // Image creative
    `<div style="width: 280px; height: 280px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-family: Arial, sans-serif; font-size: 18px; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <div>
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">Summer Sale</div>
        <div style="font-size: 14px; opacity: 0.9;">Get 50% off on all summer items</div>
      </div>
    </div>`,
    
    // Video creative
    `<div style="width: 280px; height: 280px; background: #000; border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: rgba(255, 255, 255, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <div style="width: 0; height: 0; border-left: 15px solid #000; border-top: 10px solid transparent; border-bottom: 10px solid transparent; margin-left: 3px;"></div>
      </div>
      <div style="position: absolute; bottom: 16px; left: 16px; color: white; font-family: Arial, sans-serif;">
        <div style="font-size: 16px; font-weight: bold;">Product Demo</div>
        <div style="font-size: 12px; opacity: 0.8;">See our products in action</div>
      </div>
    </div>`,
    
    // Carousel creative
    `<div style="width: 280px; height: 280px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <div style="width: 80px; height: 80px; background: #e3f2fd; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #1976d2;">Item 1</div>
        <div style="width: 80px; height: 80px; background: #f3e5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #7b1fa2;">Item 2</div>
        <div style="width: 80px; height: 80px; background: #e8f5e8; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #388e3c;">Item 3</div>
      </div>
      <div style="position: absolute; bottom: 16px; left: 16px; color: #333; font-family: Arial, sans-serif;">
        <div style="font-size: 16px; font-weight: bold;">New Arrivals</div>
        <div style="font-size: 12px; opacity: 0.7;">Browse our latest collection</div>
      </div>
    </div>`,
    
    // Dynamic creative
    `<div style="width: 280px; height: 280px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-family: Arial, sans-serif; text-align: center; position: relative;">
      <div>
        <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Personalized for You</div>
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 12px;">Based on your interests</div>
        <div style="background: rgba(255, 255, 255, 0.2); padding: 8px 12px; border-radius: 4px; font-size: 12px;">Dynamic Content</div>
      </div>
    </div>`
  ];

  // Return a random mock preview
  return mockPreviews[Math.floor(Math.random() * mockPreviews.length)];
} 