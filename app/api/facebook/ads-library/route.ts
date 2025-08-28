import { NextRequest, NextResponse } from 'next/server';
import { FacebookAdsApi } from 'facebook-nodejs-business-sdk';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, searchQuery, filters, page = 1, pageSize = 20 } = await request.json();

    console.log('Received request:', { searchQuery, filters, page, pageSize });

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token is required' },
        { status: 400 }
      );
    }

    if (!searchQuery || searchQuery.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Initialize Facebook SDK
    FacebookAdsApi.init(accessToken);

    // First, test the access token by making a simple request to verify permissions
    try {
      const testResponse = await fetch(
        'https://graph.facebook.com/v18.0/me?fields=id,name,permissions',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!testResponse.ok) {
        const testError = await testResponse.json();
        console.error('Token validation failed:', testError);
        return NextResponse.json(
          { success: false, error: `Access token validation failed: ${testError.error?.message || 'Invalid token'}` },
          { status: 401 }
        );
      }

      const testData = await testResponse.json();
      console.log('Token validation successful:', { userId: testData.id, userName: testData.name });
      
      // Check if user has required permissions
      const permissions = testData.permissions?.data || [];
      const hasAdsRead = permissions.some((p: any) => p.permission === 'ads_read' && p.status === 'granted');
      const hasReadInsights = permissions.some((p: any) => p.permission === 'read_insights' && p.status === 'granted');
      
      if (!hasAdsRead) {
        return NextResponse.json(
          { success: false, error: 'Missing required permission: ads_read. Please reconnect your Facebook account with the necessary permissions.' },
          { status: 403 }
        );
      }

      console.log('User permissions verified:', { hasAdsRead, hasReadInsights });
    } catch (testError) {
      console.error('Error validating access token:', testError);
      return NextResponse.json(
        { success: false, error: 'Failed to validate access token' },
        { status: 401 }
      );
    }

    // Build search parameters for Facebook Ads Library
    const searchParams: any = {
      search_terms: searchQuery.trim(),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    // Apply filters
    if (filters) {
      if (filters.region && filters.region !== 'all') {
        searchParams.ad_reached_countries = [filters.region];
      }

      if (filters.mediaType && filters.mediaType !== 'all') {
        searchParams.ad_type = filters.mediaType.toUpperCase();
      }

      if (filters.adType && filters.adType !== 'all') {
        if (filters.adType === 'political') {
          searchParams.ad_type = 'POLITICAL_AND_ISSUE_AD';
        } else if (filters.adType === 'issue') {
          searchParams.ad_type = 'ISSUE_AD';
        } else if (filters.adType === 'election') {
          searchParams.ad_type = 'ELECTION_AD';
        }
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (filters.dateRange) {
          case 'last_7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'last_30d':
            startDate.setDate(now.getDate() - 30);
            break;
          case 'last_90d':
            startDate.setDate(now.getDate() - 90);
            break;
          case 'last_12m':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        searchParams.ad_delivery_date_min = startDate.toISOString().split('T')[0];
        searchParams.ad_delivery_date_max = now.toISOString().split('T')[0];
      }

      if (filters.minSpend || filters.maxSpend) {
        if (filters.minSpend) {
          searchParams.ad_spend_min = parseInt(filters.minSpend) * 100; // Convert to cents
        }
        if (filters.maxSpend) {
          searchParams.ad_spend_max = parseInt(filters.maxSpend) * 100; // Convert to cents
        }
      }

      if (filters.publisherPlatforms && filters.publisherPlatforms.length > 0) {
        searchParams.publisher_platforms = filters.publisherPlatforms.map((platform: string) => 
          platform.toUpperCase()
        );
      }
    }

    console.log('Facebook API search params:', searchParams);

    // Make request to Facebook Ads Library API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/ads_archive?${new URLSearchParams(searchParams)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API error:', errorData);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired access token' },
          { status: 401 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Facebook API error: ${errorData.error?.message || 'Unknown error'}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Facebook API response:', data);
    
    // Transform Facebook API response to our format
    const transformedAds = (data.data || []).map((ad: any) => ({
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
    }));

    // Get pagination info
    const paging = data.paging || {};
    const totalResults = data.summary?.total_count || transformedAds.length;
    const hasNextPage = !!paging.next;
    const hasPreviousPage = !!paging.previous;

    return NextResponse.json({
      success: true,
      ads: transformedAds,
      totalResults,
      hasNextPage,
      hasPreviousPage,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalResults / pageSize),
      searchParams,
    });

  } catch (error) {
    console.error('Error in Facebook Ads Library API:', error);
    
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

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to search ads.' },
    { status: 405 }
  );
}
