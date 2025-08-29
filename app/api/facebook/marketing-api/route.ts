import { NextRequest, NextResponse } from 'next/server';

// Debug utility function
const debugLog = (functionName: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `🔍 [${timestamp}] FacebookMarketingAPI.${functionName}: ${message}`;
  
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
    const { accessToken, dataType, filters, page = 1, pageSize = 20 } = requestBody;

    debugLog('POST', 'Request body parsed', { 
      dataType, 
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

    if (!dataType) {
      debugLog('POST', 'Validation failed: No data type specified');
      return NextResponse.json(
        { success: false, error: 'Data type is required (campaigns, ads, insights, etc.)' },
        { status: 400 }
      );
    }

    debugLog('POST', 'Input validation passed, proceeding with Marketing API request');

    // Build API endpoint based on data type
    let apiEndpoint = '';
    let fields = '';

    switch (dataType) {
      case 'campaigns':
        apiEndpoint = 'me/campaigns';
        fields = 'id,name,status,objective,created_time,start_time,stop_time,spend_cap,special_ad_categories';
        break;
      case 'adsets':
        apiEndpoint = 'me/adsets';
        fields = 'id,name,status,campaign_id,targeting,created_time,start_time,end_time,budget_amount,budget_remaining';
        break;
      case 'ads':
        apiEndpoint = 'me/ads';
        fields = 'id,name,status,adset_id,campaign_id,creative,created_time,updated_time,ad_review_feedback';
        break;
      case 'insights':
        apiEndpoint = 'me/insights';
        fields = 'campaign_id,adset_id,ad_id,impressions,clicks,spend,reach,frequency,cpm,cpc,ctr,actions';
        break;
      case 'adaccounts':
        apiEndpoint = 'me/adaccounts';
        fields = 'id,name,account_status,currency,timezone_name,timezone_offset_hours';
        break;
      case 'pages':
        apiEndpoint = 'me/accounts';
        fields = 'id,name,category,fan_count,verification_status,connected_instagram_account';
        break;
      default:
        debugLog('POST', 'Invalid data type specified', { dataType });
        return NextResponse.json(
          { success: false, error: `Invalid data type: ${dataType}. Supported types: campaigns, adsets, ads, insights, adaccounts, pages` },
          { status: 400 }
        );
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      fields,
      limit: pageSize.toString(),
      offset: ((page - 1) * pageSize).toString(),
    });

    // Add filters if provided
    if (filters) {
      debugLog('POST', 'Applying filters', { filters });
      
      if (filters.status && filters.status !== 'all') {
        queryParams.append('filtering', JSON.stringify([{ field: 'status', operator: 'IN', value: [filters.status] }]));
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
        
        queryParams.append('time_range', JSON.stringify({
          since: startDate.toISOString().split('T')[0],
          until: now.toISOString().split('T')[0]
        }));
      }
    }

    // Make request to Facebook Marketing API
    const apiUrl = `https://graph.facebook.com/v18.0/${apiEndpoint}?${queryParams}`;
    debugLog('POST', 'Making request to Facebook Marketing API', { apiUrl });

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    debugLog('POST', 'Facebook API response received', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
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
          { success: false, error: 'Invalid or expired access token. Please reconnect your Facebook account.' },
          { status: 401 }
        );
      }
      
      if (response.status === 403) {
        debugLog('POST', 'Returning 403: Insufficient permissions');
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions. Please ensure your app has the required Marketing API permissions.' },
          { status: 403 }
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
      hasSummary: !!data.summary
    });

    // Transform response data
    const transformedData = (data.data || []).map((item: any, index: number) => {
      const transformed = {
        id: item.id,
        name: item.name || 'Unnamed',
        status: item.status || 'UNKNOWN',
        createdTime: item.created_time || null,
        updatedTime: item.updated_time || null,
        ...item // Include all original fields
      };
      
      debugLog('POST', `Item ${index + 1} transformed`, {
        originalId: item.id,
        transformedId: transformed.id,
        name: transformed.name
      });
      
      return transformed;
    });

    // Get pagination info
    const paging = data.paging || {};
    const totalResults = data.summary?.total_count || transformedData.length;
    const hasNextPage = !!paging.next;
    const hasPreviousPage = !!paging.previous;

    const responseTime = Date.now() - startTime;
    debugLog('POST', 'Request completed successfully', {
      responseTime: `${responseTime}ms`,
      itemsCount: transformedData.length,
      totalResults,
      dataType
    });

    return NextResponse.json({
      success: true,
      data: transformedData,
      totalResults,
      hasNextPage,
      hasPreviousPage,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalResults / pageSize),
      dataType,
      responseTime: `${responseTime}ms`,
      apiEndpoint
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
    { success: false, error: 'Method not allowed. Use POST to fetch marketing data.' },
    { status: 405 }
  );
}
