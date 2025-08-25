import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🔍 [${sessionId}] Webhook received:`, JSON.stringify(webhookData, null, 2));

    // Check if this is a test request
    if (webhookData.test === true) {
      console.log(`✅ [${sessionId}] Test request received`);
      return NextResponse.json({
        status: "success",
        message: "Webhook test successful",
        connected: true,
        timestamp: new Date().toISOString(),
        version: "2.0-optimized",
        webhookUrl: webhookData.webhookUrl,
        executionMode: webhookData.executionMode || 'production'
      });
    }

    // Validate required fields
    if (!webhookData.accessToken) {
      console.error(`❌ [${sessionId}] Access token missing`);
      return NextResponse.json({
        error: "Missing access token",
        message: "Facebook access token is required but not provided in webhook",
        sessionId: sessionId,
        receivedData: webhookData,
        availableKeys: Object.keys(webhookData),
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    if (!webhookData.creativeId) {
      console.error(`❌ [${sessionId}] Creative ID missing`);
      return NextResponse.json({
        error: "Missing creative ID",
        message: "Creative ID is required but not provided in webhook",
        sessionId: sessionId,
        receivedData: webhookData,
        availableKeys: Object.keys(webhookData),
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    if (!webhookData.adAccountId) {
      console.error(`❌ [${sessionId}] Ad account ID missing`);
      return NextResponse.json({
        error: "Missing ad account ID",
        message: "Ad account ID is required but not provided in webhook",
        sessionId: sessionId,
        receivedData: webhookData,
        availableKeys: Object.keys(webhookData),
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Extract image URL
    const imageUrl = webhookData.imageUrl || webhookData.thumbnailUrl || webhookData.creativeUrl;
    
    if (!imageUrl) {
      console.error(`❌ [${sessionId}] No image URL found`);
      return NextResponse.json({
        error: "Missing image URL",
        message: "Image URL is required for analysis",
        sessionId: sessionId,
        receivedData: webhookData,
        availableKeys: Object.keys(webhookData),
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log(`🔗 [${sessionId}] Processing image: ${imageUrl}`);

    // Tokenization logic
    const isFacebookUrl = imageUrl.includes('fbcdn.net') || 
                          imageUrl.includes('facebook.com') || 
                          imageUrl.includes('instagram.com') ||
                          imageUrl.includes('cdninstagram.com') ||
                          imageUrl.includes('scontent.xx.fbcdn.net') ||
                          imageUrl.includes('scontent.cdninstagram.com');

    let tokenizedUrl = imageUrl;
    let tokenizationApplied = false;
    let tokenizationMethod = 'none';
    let tokenizationReason = 'No tokenization needed';

    if (isFacebookUrl && webhookData.accessToken) {
      console.log(`🔑 [${sessionId}] Facebook URL detected, applying access token...`);
      
      if (!imageUrl.includes('access_token=')) {
        const separator = imageUrl.includes('?') ? '&' : '?';
        tokenizedUrl = `${imageUrl}${separator}access_token=${webhookData.accessToken}`;
        tokenizationApplied = true;
        tokenizationMethod = 'facebook_cdn';
        tokenizationReason = 'Facebook CDN URL tokenized with access token';
        
        console.log(`✅ [${sessionId}] Access token added to Facebook URL`);
      } else {
        console.log(`ℹ️ [${sessionId}] URL already contains access token`);
        tokenizationMethod = 'already_tokenized';
        tokenizationReason = 'URL already contains access token';
      }
    } else if (isFacebookUrl && !webhookData.accessToken) {
      console.warn(`⚠️ [${sessionId}] Facebook URL detected but no access token provided`);
      tokenizationMethod = 'facebook_no_token';
      tokenizationReason = 'Facebook URL detected but no access token available';
    } else {
      console.log(`ℹ️ [${sessionId}] Non-Facebook URL, no tokenization needed`);
      tokenizationMethod = 'non_facebook';
      tokenizationReason = 'Non-Facebook URL, no tokenization required';
    }

    // Simulate AI optimization (replace with real AI service call)
    const optimizationScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const optimizedImageUrl = `https://ai-optimized-images.example.com/optimized_${Date.now()}.jpg`;

    // Prepare response
    const response = {
      success: true,
      score: Math.round(optimizationScore / 10), // Convert to 1-10 scale
      aiScore: Math.round(optimizationScore / 10),
      
      // Image URLs
      imageUrl: optimizedImageUrl,
      originalImageUrl: imageUrl,
      optimizedImageUrl: optimizedImageUrl,
      hasOptimizedImage: true,
      
      // Tokenization details
      tokenizationStatus: tokenizationApplied ? 'success' : 'skipped',
      tokenizationMethod: tokenizationMethod,
      tokenizationApplied: tokenizationApplied,
      tokenizationReason: tokenizationReason,
      tokenizedUrl: tokenizedUrl,
      
      // Analysis data
      analysis: `Creative optimized with AI scoring ${optimizationScore}/100. Enhanced visual appeal and improved engagement potential.`,
      analysisText: `AI optimization completed successfully! Your creative scored ${optimizationScore}/100 with improvements in visual appeal and engagement.`,
      
      // Optimization details
      optimizationStatus: 'completed',
      optimizationScore: optimizationScore,
      improvements: [
        'Enhanced visual appeal and contrast',
        'Improved color balance and saturation',
        'Optimized composition for better engagement'
      ],
      
      // Standard fields
      recommendations: [
        'Consider A/B testing with different color schemes',
        'Add audience-specific visual elements',
        'Highlight competitive advantages more prominently'
      ],
      suggestions: [
        'Consider A/B testing with different color schemes',
        'Add audience-specific visual elements',
        'Highlight competitive advantages more prominently'
      ],
      confidence: optimizationScore / 100,
      confidenceScore: optimizationScore / 100,
      
      // Dimensions
      dimensions: {
        visualAppeal: optimizationScore,
        brandAlignment: optimizationScore - 5,
        messageClarity: optimizationScore - 8,
        callToAction: optimizationScore - 3,
        targetAudience: optimizationScore - 7,
        competitiveAdvantage: optimizationScore - 10,
        compliance: 95
      },
      
      strengths: [
        'High visual impact and modern aesthetic',
        'Clear brand messaging and positioning',
        'Strong call-to-action visibility'
      ],
      issues: [
        'Could benefit from more specific audience targeting elements',
        'Competitive advantages could be highlighted more prominently'
      ],
      compliance: ['AI optimized and compliant'],
      
      // Ad variations
      adVariations: [
        'High-contrast version for better visibility',
        'Audience-targeted version with demographic elements',
        'Competitive advantage highlighted version'
      ],
      variationCount: 3,
      optimizationFlags: ['AI enhanced', 'Performance optimized'],
      performanceFlags: ['High engagement potential', 'Conversion optimized'],
      
      // Metadata
      metadata: {
        sessionId: sessionId,
        workflowVersion: '2.0-optimized',
        processingTime: Date.now(),
        analyzedAt: new Date().toISOString(),
        optimizationCompleted: true,
        aiService: 'simulated',
        model: 'simulated'
      },
      
      // Tokenization details
      tokenizationDetails: {
        applied: tokenizationApplied,
        method: tokenizationMethod,
        reason: tokenizationReason,
        originalUrl: imageUrl,
        tokenizedUrl: tokenizedUrl,
        isFacebookUrl: isFacebookUrl,
        hasAccessToken: !!webhookData.accessToken,
        timestamp: new Date().toISOString()
      }
    };

    console.log(`✅ [${sessionId}] Analysis completed successfully`);
    console.log(`🎯 [${sessionId}] Score: ${response.score}/10 (${optimizationScore}/100)`);
    console.log(`🖼️ [${sessionId}] Has optimized image: ${response.hasOptimizedImage}`);
    console.log(`🔗 [${sessionId}] Tokenization: ${response.tokenizationStatus}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({
      error: "Webhook processing failed",
      message: error.message,
      timestamp: new Date().toISOString(),
      workflowVersion: '2.0-optimized'
    }, { status: 500 });
  }
}
