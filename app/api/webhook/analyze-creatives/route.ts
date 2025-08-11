import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`🚀 [${requestId}] Webhook triggered for batch creative analysis`);
  console.log(`⏰ [${requestId}] Start time: ${new Date().toISOString()}`);
  
  try {
    // Log request details
    console.log(`📡 [${requestId}] Request method: ${request.method}`);
    console.log(`🌐 [${requestId}] Request URL: ${request.url}`);
    console.log(`🔑 [${requestId}] Request headers:`, Object.fromEntries(request.headers.entries()));
    
    // Parse request body
    const body = await request.text();
    console.log(`📦 [${requestId}] Raw request body:`, body);
    
    let payload;
    try {
      payload = JSON.parse(body);
      console.log(`✅ [${requestId}] Successfully parsed JSON payload:`, payload);
    } catch (parseError) {
      console.error(`❌ [${requestId}] Failed to parse JSON payload:`, parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON payload',
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // Validate required fields for batch analysis
    const requiredFields = ['accessToken', 'adAccountId', 'dateRange', 'selectedCreativeIds'];
    const missingFields = requiredFields.filter(field => !payload[field]);
    
    if (missingFields.length > 0) {
      console.error(`❌ [${requestId}] Missing required fields:`, missingFields);
      console.log(`📋 [${requestId}] Received payload keys:`, Object.keys(payload));
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          requestId,
          timestamp: new Date().toISOString(),
          receivedFields: Object.keys(payload)
        },
        { status: 400 }
      );
    }
    
    console.log(`✅ [${requestId}] All required fields present`);
    console.log(`🔑 [${requestId}] Access token length: ${payload.accessToken?.length || 0}`);
    console.log(`🏢 [${requestId}] Ad account ID: ${payload.adAccountId}`);
    console.log(`📅 [${requestId}] Date range: ${payload.dateRange}`);
    console.log(`🎯 [${requestId}] Selected creative IDs: ${payload.selectedCreativeIds?.length || 0} creatives`);
    
    // Check if n8n webhook URL is configured
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.error(`❌ [${requestId}] N8N_WEBHOOK_URL environment variable not set`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'N8N webhook URL not configured on server',
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
    
    console.log(`🔗 [${requestId}] N8N webhook URL configured: ${n8nWebhookUrl}`);
    
    // Prepare payload for n8n
    const n8nPayload = {
      accessToken: payload.accessToken,
      adAccountId: payload.adAccountId,
      dateRange: payload.dateRange,
      batchSize: payload.batchSize || Math.min(payload.selectedCreativeIds.length, 12),
      baseUrl: payload.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      selectedCreativeIds: payload.selectedCreativeIds,
      requestId: requestId,
      timestamp: new Date().toISOString(),
      source: 'batch-creative-analysis'
    };
    
    console.log(`📤 [${requestId}] Sending payload to n8n:`, n8nPayload);
    
    // Call n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Intrend-Creative-Analyzer/1.0',
        'X-Request-ID': requestId,
        'X-Source': 'batch-creative-analysis'
      },
      body: JSON.stringify(n8nPayload)
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`⏱️ [${requestId}] N8N response time: ${responseTime}ms`);
    console.log(`📡 [${requestId}] N8N response status: ${n8nResponse.status}`);
    console.log(`📡 [${requestId}] N8N response headers:`, Object.fromEntries(n8nResponse.headers.entries()));
    
    // Get response body
    let n8nResponseBody;
    try {
      n8nResponseBody = await n8nResponse.text();
      console.log(`📥 [${requestId}] N8N response body:`, n8nResponseBody);
    } catch (bodyError) {
      console.error(`❌ [${requestId}] Failed to read N8N response body:`, bodyError);
      n8nResponseBody = 'Unable to read response body';
    }
    
    if (!n8nResponse.ok) {
      console.error(`❌ [${requestId}] N8N webhook failed:`, {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        body: n8nResponseBody,
        responseTime
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: `N8N webhook failed: ${n8nResponse.status} ${n8nResponse.statusText}`,
          details: n8nResponseBody,
          requestId,
          timestamp: new Date().toISOString(),
          responseTime,
          n8nStatus: n8nResponse.status
        },
        { status: n8nResponse.status }
      );
    }
    
    // Try to parse N8N response as JSON
    let n8nResult;
    try {
      n8nResult = JSON.parse(n8nResponseBody);
      console.log(`✅ [${requestId}] Successfully parsed N8N JSON response:`, n8nResult);
    } catch (jsonError) {
      console.warn(`⚠️ [${requestId}] N8N response is not valid JSON:`, jsonError);
      n8nResult = { rawResponse: n8nResponseBody };
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`🎉 [${requestId}] Batch creative analysis completed successfully`);
    console.log(`⏱️ [${requestId}] Total processing time: ${totalTime}ms`);
    
    return NextResponse.json({
      success: true,
      message: `Batch analysis started for ${payload.selectedCreativeIds.length} creatives`,
      requestId,
      timestamp: new Date().toISOString(),
      responseTime,
      totalTime,
      n8nResult,
      creativesCount: payload.selectedCreativeIds.length
    });
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`💥 [${requestId}] Unexpected error in batch creative analysis:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during batch analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
        requestId,
        timestamp: new Date().toISOString(),
        responseTime: errorTime
      },
      { status: 500 }
    );
  }
}
