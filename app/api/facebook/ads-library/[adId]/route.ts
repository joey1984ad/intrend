import { NextRequest, NextResponse } from 'next/server';
import bizSdk from 'facebook-nodejs-business-sdk';

export async function GET(
  request: NextRequest,
  { params }: { params: { adId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token is required' },
        { status: 400 }
      );
    }

    const { adId } = params;

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    // Initialize Facebook SDK
    bizSdk.FacebookAdsApi.init(accessToken);

    // Make request to Facebook Ads Library API for specific ad
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${adId}?fields=id,ad_creative_body,ad_creative_link_title,ad_creative_link_description,ad_creative_link_caption,ad_snapshot_url,page_id,page_name,ad_delivery_start_time,ad_delivery_stop_time,currency,ad_spend,ad_reached_count,publisher_platforms,ad_type,ad_status,ad_reached_countries,disclaimer,ad_category`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API error:', errorData);
      
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired access token' },
          { status: 401 }
        );
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Ad not found' },
          { status: 404 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Facebook API error: ${errorData.error?.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const ad = await response.json();
    
    // Transform Facebook API response to our format
    const transformedAd = {
      id: ad.id,
      adCreativeBody: ad.ad_creative_body || '',
      adCreativeLinkTitle: ad.ad_creative_link_title || '',
      adCreativeLinkDescription: ad.ad_creative_link_description || '',
      adCreativeLinkCaption: ad.ad_creative_link_caption || '',
      imageUrl: ad.ad_snapshot_url ? `${ad.ad_snapshot_url}/image` : null,
      videoUrl: ad.ad_snapshot_url ? `${ad.ad_snapshot_url}/video` : null,
      thumbnailUrl: ad.ad_snapshot_url ? `${ad.ad_snapshot_url}/thumbnail` : null,
      pageName: ad.page_name || 'Unknown Page',
      pageId: ad.page_id || '',
      adDeliveryStartTime: ad.ad_delivery_start_time || '',
      adDeliveryStopTime: ad.ad_delivery_stop_time || null,
      adSnapshotUrl: ad.ad_snapshot_url || '',
      currency: ad.currency || 'USD',
      spend: {
        lowerBound: ad.ad_spend?.lower_bound || '0',
        upperBound: ad.ad_spend?.upper_bound || '0',
      },
      impressions: {
        lowerBound: ad.ad_reached_count?.lower_bound || '0',
        upperBound: ad.ad_reached_count?.upper_bound || '0',
      },
      publisherPlatforms: ad.publisher_platforms || [],
      mediaType: ad.ad_type?.toLowerCase() || 'image',
      status: ad.ad_status || 'ACTIVE',
      region: ad.ad_reached_countries?.[0] || 'US',
      disclaimer: ad.disclaimer || null,
      adType: ad.ad_type || null,
      adCategory: ad.ad_category || null,
    };

    return NextResponse.json({
      success: true,
      ad: transformedAd,
    });

  } catch (error) {
    console.error('Error in Facebook Ads Library Single Ad API:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use GET to retrieve ad details.' },
    { status: 405 }
  );
}
