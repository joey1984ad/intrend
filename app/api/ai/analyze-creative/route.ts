import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the n8n webhook URL from environment variables
    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'n8n webhook URL not configured' },
        { status: 500 }
      );
    }

    console.log('🚀 Proxying AI analysis request to n8n:', {
      creativeId: body.creativeId,
      adAccountId: body.adAccountId,
      webhookUrl: n8nWebhookUrl
    });

    // Forward the request to n8n
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Intrend-AI-Analysis/1.0'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      console.error('❌ n8n webhook error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `n8n webhook error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    
    console.log('✅ AI analysis request successful:', {
      creativeId: body.creativeId,
      status: response.status
    });

    return NextResponse.json({
      success: true,
      message: 'AI analysis request sent successfully',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error in AI analysis proxy:', error);
    
    let errorMessage = 'Failed to process AI analysis request';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check if n8n is running.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
