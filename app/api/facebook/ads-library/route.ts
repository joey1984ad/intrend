import { NextRequest, NextResponse } from 'next/server';
import { FacebookAdsApi } from 'facebook-nodejs-business-sdk';

// Debug utility function
const debugLog = (functionName: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `🔍 [${timestamp}] FacebookAdsLibraryAPI.${functionName}: ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  debugLog('POST', 'Request received', { method: 'POST', url: request.url });

  try {
    const requestBody = await request.json();
    const { accessToken, searchQuery, filters, page = 1, pageSize = 20 } = requestBody;

    debugLog('POST', 'Request body parsed', { 
      searchQuery, 
      filters, 
      page, 
      pageSize,
      hasAccessToken: !!accessToken,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'null'
    });

    if (!accessToken) {
      debugLog('POST', 'Validation failed: No access token provided');
      return NextResponse.json(
        { success: false, error: 'Access token is required' },
        { status: 400 }
      );
    }

    if (!searchQuery || searchQuery.trim() === '') {
      debugLog('POST', 'Validation failed: No search query provided', { searchQuery });
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    debugLog('POST', 'Input validation passed, initializing Facebook SDK');

    // Initialize Facebook SDK
    FacebookAdsApi.init(accessToken);

    // First, test the access token by making a simple request to verify permissions
    debugLog('POST', 'Testing access token validity');
    try {
      const testResponse = await fetch(
        'https://graph.facebook.com/v18.0/me?fields=id,name,permissions',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      debugLog('POST', 'Token validation response received', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        ok: testResponse.ok
      });

      if (!testResponse.ok) {
        const testError = await testResponse.json();
        debugLog('POST', 'Token validation failed', { 
          status: testResponse.status, 
          error: testError 
        });
        
        return NextResponse.json(
          { success: false, error: `Access token validation failed: ${testError.error?.message || 'Invalid token'}` },
          { status: 401 }
        );
      }

      const testData = await testResponse.json();
      debugLog('POST', 'Token validation successful', { 
        userId: testData.id, 
        userName: testData.name,
        permissionsCount: testData.permissions?.data?.length || 0
      });
      
      // Check if user has required permissions
      const permissions = testData.permissions?.data || [];
      const hasAdsRead = permissions.some((p: any) => p.permission === 'ads_read' && p.status === 'granted');
      const hasReadInsights = permissions.some((p: any) => p.permission === 'read_insights' && p.status === 'granted');
      
      debugLog('POST', 'Permission check completed', { 
        hasAdsRead, 
        hasReadInsights,
        allPermissions: permissions.map((p: any) => ({ permission: p.permission, status: p.status }))
      });
      
      if (!hasAdsRead) {
        debugLog('POST', 'Permission check failed: Missing ads_read permission');
        return NextResponse.json(
          { success: false, error: 'Missing required permission: ads_read. Please reconnect your Facebook account with the necessary permissions.' },
          { status: 403 }
        );
      }

      debugLog('POST', 'Permission verification completed successfully');
    } catch (testError) {
      debugLog('POST', 'Token validation error occurred', { error: testError });
      return NextResponse.json(
        { success: false, error: 'Failed to validate access token' },
        { status: 401 }
      );
    }

    // Build search parameters for Facebook Ads Library
    debugLog('POST', 'Building search parameters');
    const searchParams: any = {
      search_terms: searchQuery.trim(),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    // Apply filters
    if (filters) {
      debugLog('POST', 'Applying filters to search parameters', { filters });
      
      if (filters.region && filters.region !== 'all') {
        searchParams.ad_reached_countries = [filters.region];
        debugLog('POST', 'Region filter applied', { region: filters.region });
      }

      if (filters.mediaType && filters.mediaType !== 'all') {
        searchParams.ad_type = filters.mediaType.toUpperCase();
        debugLog('POST', 'Media type filter applied', { mediaType: filters.mediaType });
      }

      if (filters.adType && filters.adType !== 'all') {
        if (filters.adType === 'political') {
          searchParams.ad_type = 'POLITICAL_AND_ISSUE_AD';
        } else if (filters.adType === 'issue') {
          searchParams.ad_type = 'ISSUE_AD';
        } else if (filters.adType === 'election') {
          searchParams.ad_type = 'ELECTION_AD';
        }
        debugLog('POST', 'Ad type filter applied', { adType: filters.adType, mappedType: searchParams.ad_type });
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
        
        debugLog('POST', 'Date range filter applied', { 
          dateRange: filters.dateRange, 
          startDate: searchParams.ad_delivery_date_min,
          endDate: searchParams.ad_delivery_date_max
        });
      }

      if (filters.minSpend || filters.maxSpend) {
        if (filters.minSpend) {
          searchParams.ad_spend_min = parseInt(filters.minSpend) * 100; // Convert to cents
          debugLog('POST', 'Min spend filter applied', { minSpend: filters.minSpend, converted: searchParams.ad_spend_min });
        }
        if (filters.maxSpend) {
          searchParams.ad_spend_max = parseInt(filters.maxSpend) * 100; // Convert to cents
          debugLog('POST', 'Max spend filter applied', { maxSpend: filters.maxSpend, converted: searchParams.ad_spend_max });
        }
      }

      if (filters.publisherPlatforms && filters.publisherPlatforms.length > 0) {
        searchParams.publisher_platforms = filters.publisherPlatforms.map((platform: string) => 
          platform.toUpperCase()
        );
        debugLog('POST', 'Publisher platforms filter applied', { 
          platforms: filters.publisherPlatforms,
          converted: searchParams.publisher_platforms
        });
      }
    }

    debugLog('POST', 'Final search parameters built', searchParams);

    // Make request to Facebook Ads Library API
    debugLog('POST', 'Making request to Facebook Ads Library API');
    const response = await fetch(
      `https://graph.facebook.com/v18.0/ads_archive?${new URLSearchParams(searchParams)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    debugLog('POST', 'Facebook API response received', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorData = await response.json();
      debugLog('POST', 'Facebook API error response', { 
        status: response.status, 
        error: errorData 
      });
      
      if (response.status === 401) {
        debugLog('POST', 'Returning 401: Invalid or expired access token');
        return NextResponse.json(
          { success: false, error: 'Invalid or expired access token' },
          { status: 401 }
        );
      }
      
      if (response.status === 429) {
        debugLog('POST', 'Returning 429: Rate limit exceeded');
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      debugLog('POST', 'Returning generic error response');
      return NextResponse.json(
        { success: false, error: `Facebook API error: ${errorData.error?.message || 'Unknown error'}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    debugLog('POST', 'Facebook API success response received', {
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      hasPaging: !!data.paging,
      hasSummary: !!data.summary,
      summaryTotal: data.summary?.total_count
    });
    
    // Transform Facebook API response to our format
    debugLog('POST', 'Transforming Facebook API response');
    const transformedAds = (data.data || []).map((ad: any, index: number) => {
      const transformed = {
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
      
      debugLog('POST', `Ad ${index + 1} transformed`, {
        originalId: ad.id,
        transformedId: transformed.id,
        pageName: transformed.pageName,
        mediaType: transformed.mediaType
      });
      
      return transformed;
    });

    // Get pagination info
    const paging = data.paging || {};
    const totalResults = data.summary?.total_count || transformedAds.length;
    const hasNextPage = !!paging.next;
    const hasPreviousPage = !!paging.previous;

    debugLog('POST', 'Pagination info calculated', {
      totalResults,
      hasNextPage,
      hasPreviousPage,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalResults / pageSize)
    });

    const responseTime = Date.now() - startTime;
    debugLog('POST', 'Request completed successfully', {
      responseTime: `${responseTime}ms`,
      adsCount: transformedAds.length,
      totalResults,
      totalPages: Math.ceil(totalResults / pageSize)
    });

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
      responseTime: `${responseTime}ms`,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    debugLog('POST', 'Unexpected error occurred', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`
    });
    
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
  debugLog('GET', 'GET method called - not allowed');
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to search ads.' },
    { status: 405 }
  );
}
