import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { creativeId: string } }
) {
  try {
    const { creativeId } = params;
    
    console.log(`🔍 Fetching creative data for ID: ${creativeId}`);
    
    // Get the Facebook access token from the request headers or query params
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || 
                       request.nextUrl.searchParams.get('access_token');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Facebook access token is required' },
        { status: 401 }
      );
    }
    
    // Fetch creative data from Facebook Graph API
    const facebookApiUrl = `https://graph.facebook.com/v18.0/${creativeId}`;
    const fields = 'id,name,creative_type,image_url,thumbnail_url,object_story_spec,status,created_time,updated_time';
    
    const response = await fetch(`${facebookApiUrl}?fields=${fields}&access_token=${accessToken}`);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Facebook API error: ${response.status}`, errorData);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch creative from Facebook',
          facebookError: errorData,
          status: response.status
        },
        { status: response.status }
      );
    }
    
    const creativeData = await response.json();
    
    console.log(`✅ Successfully fetched creative data for ID: ${creativeId}`);
    
    // Return the creative data
    return NextResponse.json({
      success: true,
      creative: creativeData,
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching creative data:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error while fetching creative data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { creativeId: string } }
) {
  try {
    const { creativeId } = params;
    const body = await request.json();
    
    console.log(`📝 Processing creative data for ID: ${creativeId}`, body);
    
    // This endpoint can be used for updating creative data or triggering analysis
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: `Creative ${creativeId} processed successfully`,
      receivedData: body,
      processedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error processing creative data:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error while processing creative data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
