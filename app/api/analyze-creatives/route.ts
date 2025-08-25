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

    // Enhanced validation with better error messages
    const validationErrors = [];
    
    if (!webhookData.accessToken) {
      validationErrors.push('Missing access token');
    }
    
    if (!webhookData.creativeId) {
      validationErrors.push('Missing creative ID');
    }
    
    if (!webhookData.adAccountId) {
      validationErrors.push('Missing ad account ID');
    }

    // Extract image URL from multiple possible field names
    const imageUrl = webhookData.imageUrl || 
                     webhookData.thumbnailUrl || 
                     webhookData.creativeUrl || 
                     webhookData.url ||
                     webhookData.image ||
                     webhookData.thumbnail;
    
    if (!imageUrl) {
      validationErrors.push('Missing image URL (tried: imageUrl, thumbnailUrl, creativeUrl, url, image, thumbnail)');
    }

    // If there are validation errors, return them all at once
    if (validationErrors.length > 0) {
      console.error(`❌ [${sessionId}] Validation errors:`, validationErrors);
      return NextResponse.json({
        error: "Validation failed",
        message: `Multiple validation errors: ${validationErrors.join(', ')}`,
        sessionId: sessionId,
        receivedData: webhookData,
        availableKeys: Object.keys(webhookData),
        validationErrors: validationErrors,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log(`🔗 [${sessionId}] Processing image: ${imageUrl}`);
    console.log(`🔑 [${sessionId}] Access token: ${webhookData.accessToken ? 'Present' : 'Missing'}`);
    console.log(`🆔 [${sessionId}] Creative ID: ${webhookData.creativeId}`);
    console.log(`📊 [${sessionId}] Ad Account ID: ${webhookData.adAccountId}`);

    // Enhanced tokenization logic with better debugging
    const isFacebookUrl = imageUrl.includes('fbcdn.net') || 
                          imageUrl.includes('facebook.com') || 
                          imageUrl.includes('instagram.com') ||
                          imageUrl.includes('cdninstagram.com') ||
                          imageUrl.includes('scontent.xx.fbcdn.net') ||
                          imageUrl.includes('scontent.cdninstagram.com');

    console.log(`🌐 [${sessionId}] URL type: ${isFacebookUrl ? 'Facebook/Instagram CDN' : 'Other'}`);

    let tokenizedUrl = imageUrl; // Always start with the original URL
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
        console.log(`🔗 [${sessionId}] Original URL: ${imageUrl}`);
        console.log(`🔗 [${sessionId}] Tokenized URL: ${tokenizedUrl.substring(0, 100)}...`);
      } else {
        console.log(`ℹ️ [${sessionId}] URL already contains access token`);
        tokenizationMethod = 'already_tokenized';
        tokenizationReason = 'URL already contains access token';
        // Keep the original URL as tokenizedUrl
      }
    } else if (isFacebookUrl && !webhookData.accessToken) {
      console.warn(`⚠️ [${sessionId}] Facebook URL detected but no access token provided`);
      tokenizationMethod = 'facebook_no_token';
      tokenizationReason = 'Facebook URL detected but no access token available';
      // Keep the original URL as tokenizedUrl
    } else {
      console.log(`ℹ️ [${sessionId}] Non-Facebook URL, no tokenization needed`);
      tokenizationMethod = 'non_facebook';
      tokenizationReason = 'Non-Facebook URL, no tokenization required';
      // Keep the original URL as tokenizedUrl
    }

    // Verify tokenizedUrl is never null or undefined
    if (!tokenizedUrl) {
      console.error(`❌ [${sessionId}] CRITICAL ERROR: tokenizedUrl is ${tokenizedUrl}`);
      tokenizedUrl = imageUrl; // Fallback to original URL
    }

    console.log(`🔍 [${sessionId}] Final tokenizedUrl: ${tokenizedUrl}`);

    // Simulate AI optimization (replace with real AI service call)
    const optimizationScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const optimizedImageUrl = `https://ai-optimized-images.example.com/optimized_${Date.now()}.jpg`;

    // Prepare response with guaranteed non-null values
    const response = {
      success: true,
      score: Math.round(optimizationScore / 10), // Convert to 1-10 scale
      aiScore: Math.round(optimizationScore / 10),
      
      // Image URLs - guaranteed to have values
      imageUrl: optimizedImageUrl,
      originalImageUrl: imageUrl,
      optimizedImageUrl: optimizedImageUrl,
      hasOptimizedImage: true,
      
      // Tokenization details - guaranteed to have values
      tokenizationStatus: tokenizationApplied ? 'success' : 'skipped',
      tokenizationMethod: tokenizationMethod,
      tokenizationApplied: tokenizationApplied,
      tokenizationReason: tokenizationReason,
      tokenizedUrl: tokenizedUrl, // This should NEVER be null
      
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
      
      // Enhanced tokenization details with debugging info
      tokenizationDetails: {
        applied: tokenizationApplied,
        method: tokenizationMethod,
        reason: tokenizationReason,
        originalUrl: imageUrl,
        tokenizedUrl: tokenizedUrl, // This should NEVER be null
        isFacebookUrl: isFacebookUrl,
        hasAccessToken: !!webhookData.accessToken,
        timestamp: new Date().toISOString(),
        debug: {
          urlType: isFacebookUrl ? 'facebook' : 'other',
          accessTokenPresent: !!webhookData.accessToken,
          alreadyTokenized: imageUrl.includes('access_token='),
          separatorUsed: imageUrl.includes('?') ? '&' : '?'
        }
      }
    };

    // Final verification that tokenizedUrl is not null
    if (response.tokenizedUrl === null || response.tokenizedUrl === undefined) {
      console.error(`❌ [${sessionId}] CRITICAL ERROR: tokenizedUrl is still null/undefined in response!`);
      response.tokenizedUrl = imageUrl; // Force fallback
    }

    console.log(`✅ [${sessionId}] Analysis completed successfully`);
    console.log(`🎯 [${sessionId}] Score: ${response.score}/10 (${optimizationScore}/100)`);
    console.log(`🖼️ [${sessionId}] Has optimized image: ${response.hasOptimizedImage}`);
    console.log(`🔗 [${sessionId}] Tokenization: ${response.tokenizationStatus}`);
    console.log(`🔗 [${sessionId}] Final tokenizedUrl: ${response.tokenizedUrl}`);

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
