import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, adAccountId } = await request.json();

    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        { error: 'Access token and ad account ID are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 API COMPARISON: Testing different field combinations for ${adAccountId}`);

    const baseUrl = 'https://graph.facebook.com/v23.0';
    const results: any = {};

    // Test 1: Original minimal fields (what might have worked before)
    const originalFields = 'id,name,creative{id,name,title,body,image_url,video_id,object_story_spec},adset{id,name,campaign{id,name}},status';
    console.log(`\n🔍 Testing ORIGINAL fields: ${originalFields}`);
    
    try {
      const originalResponse = await fetch(
        `${baseUrl}/${adAccountId}/ads?fields=${originalFields}&limit=3&access_token=${accessToken}`
      );
      const originalData = await originalResponse.json();
      results.original = {
        fields: originalFields,
        response: originalData,
        success: !originalData.error
      };
      console.log(`   ✅ Original response:`, JSON.stringify(originalData, null, 2));
    } catch (error) {
      results.original = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test 2: Expanded fields (current implementation)
    const expandedFields = 'id,name,creative{id,name,title,body,image_url,image_hash,video_id,thumbnail_url,object_story_spec,asset_feed_spec,call_to_action,url_tags},adset{id,name,campaign{id,name}},status';
    console.log(`\n🔍 Testing EXPANDED fields: ${expandedFields}`);
    
    try {
      const expandedResponse = await fetch(
        `${baseUrl}/${adAccountId}/ads?fields=${expandedFields}&limit=3&access_token=${accessToken}`
      );
      const expandedData = await expandedResponse.json();
      results.expanded = {
        fields: expandedFields,
        response: expandedData,
        success: !expandedData.error
      };
      console.log(`   ✅ Expanded response:`, JSON.stringify(expandedData, null, 2));
    } catch (error) {
      results.expanded = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test 3: Creative-focused fields
    const creativeFields = 'id,name,creative{id,name,title,body,image_url,image_hash,video_id,thumbnail_url,object_story_spec{link_data{image_url,picture,child_attachments{image_url,video_id,media,picture}},video_data{video_id,image_url,picture},photo_data{url,picture}},asset_feed_spec{images,videos,bodies,descriptions,link_urls,call_to_actions}}';
    console.log(`\n🔍 Testing CREATIVE-FOCUSED fields: ${creativeFields}`);
    
    try {
      const creativeResponse = await fetch(
        `${baseUrl}/${adAccountId}/ads?fields=${creativeFields}&limit=3&access_token=${accessToken}`
      );
      const creativeData = await creativeResponse.json();
      results.creativeFocused = {
        fields: creativeFields,
        response: creativeData,
        success: !creativeData.error
      };
      console.log(`   ✅ Creative-focused response:`, JSON.stringify(creativeData, null, 2));
    } catch (error) {
      results.creativeFocused = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test 4: Individual creative details (if we have creative IDs from previous tests)
    if (results.original?.response?.data?.length > 0) {
      const firstCreativeId = results.original.response.data[0].creative?.id;
      if (firstCreativeId) {
        console.log(`\n🔍 Testing INDIVIDUAL CREATIVE: ${firstCreativeId}`);
        
        try {
          const individualResponse = await fetch(
            `${baseUrl}/${firstCreativeId}?fields=id,name,title,body,image_url,image_hash,video_id,thumbnail_url,object_story_spec,asset_feed_spec,call_to_action,url_tags,effective_object_story_spec&access_token=${accessToken}`
          );
          const individualData = await individualResponse.json();
          results.individual = {
            creativeId: firstCreativeId,
            response: individualData,
            success: !individualData.error
          };
          console.log(`   ✅ Individual creative response:`, JSON.stringify(individualData, null, 2));
        } catch (error) {
          results.individual = { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    }

    // Test 5: Facebook API version comparison
    const versionTests = ['v23.0', 'v19.0', 'v18.0'];
    results.versionComparison = {};
    
    for (const version of versionTests) {
      console.log(`\n🔍 Testing API VERSION: ${version}`);
      try {
        const versionResponse = await fetch(
          `https://graph.facebook.com/${version}/${adAccountId}/ads?fields=${originalFields}&limit=1&access_token=${accessToken}`
        );
        const versionData = await versionResponse.json();
        results.versionComparison[version] = {
          success: !versionData.error,
          response: versionData
        };
        console.log(`   ✅ Version ${version} response:`, JSON.stringify(versionData, null, 2));
      } catch (error) {
        results.versionComparison[version] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    // Test 6: Check what fields are actually available
    console.log(`\n🔍 Testing FIELD INTROSPECTION:`);
    try {
      const metadataResponse = await fetch(
        `${baseUrl}/${adAccountId}/ads?metadata=1&access_token=${accessToken}`
      );
      const metadataData = await metadataResponse.json();
      results.fieldMetadata = {
        success: !metadataData.error,
        response: metadataData
      };
      console.log(`   ✅ Field metadata:`, JSON.stringify(metadataData, null, 2));
    } catch (error) {
      results.fieldMetadata = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Analysis summary
    const analysis = {
      timestamp: new Date().toISOString(),
      apiVersion: 'v23.0',
      comparison: {
        originalWorked: results.original?.success && results.original?.response?.data?.length > 0,
        expandedWorked: results.expanded?.success && results.expanded?.response?.data?.length > 0,
        creativeWorked: results.creativeFocused?.success && results.creativeFocused?.response?.data?.length > 0,
        individualWorked: results.individual?.success
      },
      imageUrlSources: {
        creative_image_url: false,
        link_data_image_url: false,
        link_data_picture: false,
        video_data_image_url: false,
        photo_data_url: false,
        child_attachments_image_url: false,
        child_attachments_media_image_url: false
      }
    };

    // Check which sources have image URLs
    const checkImageSources = (data: any) => {
      if (data?.response?.data) {
        data.response.data.forEach((ad: any) => {
          if (ad.creative) {
            if (ad.creative.image_url) analysis.imageUrlSources.creative_image_url = true;
            
            const spec = ad.creative.object_story_spec;
            if (spec?.link_data?.image_url) analysis.imageUrlSources.link_data_image_url = true;
            if (spec?.link_data?.picture) analysis.imageUrlSources.link_data_picture = true;
            if (spec?.video_data?.image_url) analysis.imageUrlSources.video_data_image_url = true;
            if (spec?.photo_data?.url) analysis.imageUrlSources.photo_data_url = true;
            
            if (spec?.link_data?.child_attachments) {
              spec.link_data.child_attachments.forEach((att: any) => {
                if (att.image_url) analysis.imageUrlSources.child_attachments_image_url = true;
                if (att.media?.image_url) analysis.imageUrlSources.child_attachments_media_image_url = true;
              });
            }
          }
        });
      }
    };

    checkImageSources(results.original);
    checkImageSources(results.expanded);
    checkImageSources(results.creativeFocused);
    
    if (results.individual?.response) {
      const creative = results.individual.response;
      if (creative.image_url) analysis.imageUrlSources.creative_image_url = true;
      // ... similar checks for individual creative
    }

    console.log(`\n📊 ANALYSIS SUMMARY:`, JSON.stringify(analysis, null, 2));

    return NextResponse.json({
      success: true,
      analysis,
      results,
      recommendations: generateRecommendations(analysis, results)
    });

  } catch (error) {
    console.error('❌ API COMPARISON: Unexpected error:', error);
    return NextResponse.json(
      { error: 'API comparison failed' },
      { status: 500 }
    );
  }
}

function generateRecommendations(analysis: any, results: any) {
  const recommendations = [];

  if (!analysis.comparison.originalWorked) {
    recommendations.push({
      issue: 'Original field combination not working',
      suggestion: 'Facebook may have deprecated or changed required permissions for basic image_url field',
      action: 'Check app permissions and review Facebook API changelog'
    });
  }

  const imageSourcesFound = Object.values(analysis.imageUrlSources).some(Boolean);
  if (!imageSourcesFound) {
    recommendations.push({
      issue: 'No image URLs found in any location',
      suggestion: 'Facebook may have moved image URLs to a different field or require additional permissions',
      action: 'Test with different permission scopes or API versions'
    });
  }

  if (analysis.comparison.individualWorked && !analysis.comparison.originalWorked) {
    recommendations.push({
      issue: 'Individual creative calls work but bulk ad calls do not',
      suggestion: 'May need to fetch creatives separately rather than through ads endpoint',
      action: 'Modify API strategy to fetch ad IDs first, then individual creative details'
    });
  }

  return recommendations;
}

// GET endpoint for quick testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');
  const adAccountId = searchParams.get('adAccountId');

  if (!accessToken || !adAccountId) {
    return NextResponse.json(
      { error: 'Access token and ad account ID are required as query parameters' },
      { status: 400 }
    );
  }

  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, adAccountId })
  }));
}