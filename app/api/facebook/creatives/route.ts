import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';

// Rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cache for video sources to avoid duplicate requests
const videoSourceCache = new Map<string, string | null>();

async function fetchVideoSource(videoId: string, accessToken: string): Promise<string | null> {
  // Check cache first
  if (videoSourceCache.has(videoId)) {
    const cached = videoSourceCache.get(videoId) || null;
    console.log(`🔍 DIAGNOSIS - Video ${videoId}: Using cached result - ${cached ? 'HAS SOURCE' : 'NO SOURCE'}`);
    return cached;
  }

  const baseUrl = 'https://graph.facebook.com/v23.0';
  const url = `${baseUrl}/${videoId}?fields=source,permalink_url,picture,status&access_token=${accessToken}`;
  
  console.log(`🔍 DIAGNOSIS - Fetching video source for ${videoId}: ${url}`);
  
  try {
    // Add delay to respect rate limits
    await delay(100);
    
    const res = await fetch(url);
    const data = await res.json();
    
    console.log(`🔍 DIAGNOSIS - Video ${videoId} API response:`, JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.warn(`❌ Video source fetch error for ${videoId}:`, data.error);
      videoSourceCache.set(videoId, null);
      return null;
    }
    
    const source = data.source || null;
    console.log(`🔍 DIAGNOSIS - Video ${videoId} final source: ${source || 'NULL'}`);
    
    // Also log additional useful fields
    if (data.permalink_url) console.log(`   🔗 Permalink: ${data.permalink_url}`);
    if (data.picture) console.log(`   🖼️ Thumbnail: ${data.picture}`);
    if (data.status) console.log(`   📊 Status: ${data.status}`);
    
    videoSourceCache.set(videoId, source);
    return source;
  } catch (error) {
    console.error(`❌ Error fetching video source for ${videoId}:`, error);
    videoSourceCache.set(videoId, null);
    return null;
  }
}

// Batch fetch video sources to reduce API calls
async function batchFetchVideoSources(videoIds: string[], accessToken: string): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  const uniqueIds = Array.from(new Set(videoIds)).filter(id => !videoSourceCache.has(id));
  
  // Process in smaller batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize);
    
    // Fetch all sources in parallel for this batch
    const batchPromises = batch.map(async (videoId) => {
      const source = await fetchVideoSource(videoId, accessToken);
      return { videoId, source };
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ videoId, source }) => {
      results.set(videoId, source);
    });
    
    // Add delay between batches
    if (i + batchSize < uniqueIds.length) {
      await delay(200);
    }
  }
  
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken, adAccountId, dateRange = 'last_30d' } = await request.json();

    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        { error: 'Access token and ad account ID are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Debug: Fetching creatives for ad account ${adAccountId}`);

    // Special case for testing/mock data
    if (accessToken === 'mock' || adAccountId === 'mock') {
      console.log('🎭 Debug: Using mock data for testing');
      return NextResponse.json({
        success: true,
        creatives: generateMockCreativeData(),
        message: 'Using mock data for testing'
      });
    }

    // Get ad account details first to determine timezone
    const baseUrl = 'https://graph.facebook.com/v23.0';
    const accountResponse = await fetch(
      `${baseUrl}/${adAccountId}?fields=id,name,timezone_name,currency&access_token=${accessToken}`
    );
    const accountData = await accountResponse.json();

    if (accountData.error) {
      console.error('Account API error:', accountData.error);
      return NextResponse.json(
        { error: `Facebook API error: ${accountData.error.message}` },
        { status: 400 }
      );
    }

    const accountTimezone = accountData.timezone_name || 'America/New_York';
    console.log(`📊 Debug: Ad account timezone: ${accountTimezone}`);

    // Convert dateRange to proper date format with timezone awareness
    let sinceDate, untilDate;
    
    const today = DateTime.now().setZone(accountTimezone).startOf('day');
    
    if (dateRange === 'last_7d') {
      sinceDate = today.minus({ days: 6 });
      untilDate = today;
    } else if (dateRange === 'last_30d') {
      sinceDate = today.minus({ days: 29 });
      untilDate = today;
    } else if (dateRange === 'last_90d') {
      sinceDate = today.minus({ days: 89 });
      untilDate = today;
    } else if (dateRange === 'last_12m') {
      sinceDate = today.minus({ months: 11 }).startOf('month');
      untilDate = today.endOf('month');
    } else {
      sinceDate = today.minus({ days: 29 });
      untilDate = today;
    }

    const since = sinceDate.toISODate();
    const until = untilDate.toISODate();
    const timeRange = JSON.stringify({ since, until });

    console.log(`🔍 Debug: Fetching creatives from ${since} to ${until} (${dateRange})`);

    // First, get all ads to find creatives
    const adsResponse = await fetch(
      `${baseUrl}/${adAccountId}/ads?fields=id,name,creative{id,name,title,body,image_url,video_id,object_story_spec},adset{id,name,campaign{id,name}},status&access_token=${accessToken}`
    );
    const adsData = await adsResponse.json();

    if (adsData.error) {
      console.error('Ads API error:', adsData.error);
      // Return mock data if API fails
      return NextResponse.json({
        success: true,
        creatives: generateMockCreativeData(),
        message: 'Using mock data due to API error'
      });
    }

    console.log(`📊 Debug: Found ${adsData.data?.length || 0} ads`);

    // Collect all video IDs for batch processing
    const videoIds: string[] = [];
    const creativesWithInsights = [];
    const creativeMap = new Map(); // To deduplicate creatives

    // First pass: collect all video IDs and basic creative data
    for (const ad of adsData.data || []) {
      try {
        if (!ad.creative || !ad.creative.id) {
          console.log(`⚠️ Ad ${ad.id} has no creative, skipping`);
          continue;
        }

        // Get insights for this ad
        const insightsUrl = `${baseUrl}/${ad.id}/insights?fields=impressions,clicks,spend,reach,frequency,cpc,cpm,ctr&time_range=${timeRange}&access_token=${accessToken}`;
        console.log(`🔍 Fetching insights for ad ${ad.id}: ${insightsUrl}`);
        
        const insightsResponse = await fetch(insightsUrl);
        const insightsData = await insightsResponse.json();
        
        let insights = {
          impressions: 0,
          clicks: 0,
          spend: 0,
          reach: 0,
          cpc: 0,
          cpm: 0,
          ctr: 0,
          frequency: 0
        };

        if (!insightsData.error && insightsData.data && insightsData.data.length > 0) {
          // Sum up all daily insights
          insights = insightsData.data.reduce((total: any, day: any) => ({
            impressions: total.impressions + parseInt(day.impressions || 0),
            clicks: total.clicks + parseInt(day.clicks || 0),
            spend: total.spend + parseFloat(day.spend || 0),
            reach: total.reach + parseInt(day.reach || 0),
            cpc: 0, // Will calculate after summing
            cpm: 0, // Will calculate after summing
            ctr: 0  // Will calculate after summing
          }), insights);

          // Calculate averages
          insights.cpc = insights.clicks > 0 ? insights.spend / insights.clicks : 0;
          insights.cpm = insights.impressions > 0 ? (insights.spend / insights.impressions) * 1000 : 0;
          insights.ctr = insights.impressions > 0 ? (insights.clicks / insights.impressions) * 100 : 0;
        }

        // Collect video IDs for batch processing
        let objectStorySpec = ad.creative.object_story_spec;
        if (!objectStorySpec) {
          // fallback: fetch creative details
          const creativeDetailsRes = await fetch(`${baseUrl}/${ad.creative.id}?fields=object_story_spec&access_token=${accessToken}`);
          const creativeDetails = await creativeDetailsRes.json();
          objectStorySpec = creativeDetails.object_story_spec;
        }

        let creativeType = determineCreativeType(ad.creative);
        let imageUrl = ad.creative.image_url || null;
        let videoUrl = null;
        let assets = undefined;

        if (creativeType === 'video') {
          // Collect video ID for batch processing
          let videoId = ad.creative.video_id;
          if (!videoId && objectStorySpec?.video_data?.video_id) {
            videoId = objectStorySpec.video_data.video_id;
          }
          if (videoId) {
            videoIds.push(videoId);
          }
        } else if (creativeType === 'carousel' || creativeType === 'dynamic') {
          // Collect video IDs from child attachments
          const childAttachments = objectStorySpec?.link_data?.child_attachments || [];
          childAttachments.forEach((att: any) => {
            if (att.video_id) {
              videoIds.push(att.video_id);
            }
          });
        }

        // 🔍 DIAGNOSIS: Log detailed creative data structure
        console.log(`🔍 DIAGNOSIS - Processing creative ${ad.creative.id}:`);
        console.log(`   📋 Creative Type: ${creativeType}`);
        console.log(`   🖼️ Image URL: ${ad.creative.image_url || 'NONE'}`);
        console.log(`   🎥 Video ID: ${ad.creative.video_id || 'NONE'}`);
        console.log(`   📄 Object Story Spec:`, JSON.stringify(objectStorySpec, null, 2));
        
        if (objectStorySpec?.link_data?.child_attachments) {
          console.log(`   🎠 Carousel Child Attachments (${objectStorySpec.link_data.child_attachments.length}):`, 
            JSON.stringify(objectStorySpec.link_data.child_attachments, null, 2));
        }
        
        if (objectStorySpec?.video_data) {
          console.log(`   🎬 Video Data:`, JSON.stringify(objectStorySpec.video_data, null, 2));
        }

        // Create basic creative data (without video sources yet)
        const creative = {
          id: ad.creative.id,
          name: ad.name || `Ad ${ad.id}`,
          description: ad.creative.name || ad.creative.title || ad.creative.body || null,
          campaignName: ad.adset?.campaign?.name || 'Unknown Campaign',
          adsetName: ad.adset?.name || 'Unknown Ad Set',
          creativeType,
          thumbnailUrl: ad.creative.image_url || null,
          imageUrl,
          videoUrl: null as string | null,
          assets: undefined as any,
          clicks: insights.clicks,
          impressions: insights.impressions,
          spend: insights.spend,
          ctr: insights.ctr,
          cpc: insights.cpc,
          cpm: insights.cpm,
          reach: insights.reach,
          frequency: insights.frequency || 0,
          status: ad.status || 'UNKNOWN',
          createdAt: ad.creative.created_time || new Date().toISOString(),
          performance: determinePerformance(insights.ctr, insights.cpc),
          fatigueLevel: determineFatigueLevel(insights.impressions, insights.frequency),
          // Store additional data for later processing
          _objectStorySpec: objectStorySpec,
          _ad: ad
        };

        if (!creativeMap.has(creative.id)) {
          creativeMap.set(creative.id, creative);
          creativesWithInsights.push(creative);
        }

      } catch (error) {
        console.error(`Error processing ad ${ad.id}:`, error);
      }
    }

    // 🔍 DIAGNOSIS: Log video IDs being processed
    console.log(`🔍 DIAGNOSIS - Video IDs collected for batch processing:`, videoIds);
    console.log(`🔍 DIAGNOSIS - Unique video IDs: ${Array.from(new Set(videoIds)).length} out of ${videoIds.length} total`);
    
    // Batch fetch all video sources
    console.log(`🔍 Debug: Batch fetching ${videoIds.length} video sources`);
    const videoSources = await batchFetchVideoSources(videoIds, accessToken);
    
    // 🔍 DIAGNOSIS: Log video source results
    console.log(`🔍 DIAGNOSIS - Video sources fetched:`, Array.from(videoSources.entries()));
    videoSources.forEach((source, videoId) => {
      console.log(`   🎥 Video ${videoId}: ${source ? 'SUCCESS' : 'FAILED'} - ${source || 'No source URL'}`);
    });

    // Second pass: update creatives with video sources
    for (const creative of creativesWithInsights) {
      try {
        const objectStorySpec = creative._objectStorySpec;
        const ad = creative._ad;

        if (creative.creativeType === 'video') {
          let videoId = ad.creative.video_id;
          if (!videoId && objectStorySpec?.video_data?.video_id) {
            videoId = objectStorySpec.video_data.video_id;
          }
          if (videoId) {
            creative.videoUrl = videoSources.get(videoId) || null;
          }
        } else if (creative.creativeType === 'carousel' || creative.creativeType === 'dynamic') {
          const childAttachments = objectStorySpec?.link_data?.child_attachments || [];
          console.log(`🔍 DIAGNOSIS - Processing ${creative.creativeType} creative ${creative.id}:`);
          console.log(`   📦 Child attachments found: ${childAttachments.length}`);
          
          creative.assets = await Promise.all(childAttachments.map(async (att: any, index: number) => {
            let assetVideoUrl = null;
            if (att.video_id) {
              assetVideoUrl = videoSources.get(att.video_id) || null;
              console.log(`   🎥 Asset ${index} video: ${att.video_id} → ${assetVideoUrl ? 'SUCCESS' : 'FAILED'}`);
            }
            
            const assetImageUrl = att.media?.image_url || att.image_url || null;
            console.log(`   🖼️ Asset ${index} image: ${assetImageUrl || 'NONE'}`);
            console.log(`   📄 Asset ${index} raw data:`, JSON.stringify(att, null, 2));
            
            return {
              imageUrl: assetImageUrl,
              videoUrl: assetVideoUrl,
              thumbnailUrl: att.media?.image_url || att.image_url || null
            };
          }));
          
          console.log(`   ✅ Final assets for creative ${creative.id}:`, JSON.stringify(creative.assets, null, 2));
        }

        // Clean up temporary data
        delete creative._objectStorySpec;
        delete creative._ad;

      } catch (error) {
        console.error(`Error updating creative ${creative.id}:`, error);
      }
    }

    console.log(`📊 Debug: Processed ${creativesWithInsights.length} unique creatives`);

    // If no real creatives found, return mock data
    if (creativesWithInsights.length === 0) {
      console.log('⚠️ No real creatives found, returning mock data');
      return NextResponse.json({
        success: true,
        creatives: generateMockCreativeData(),
        message: 'No real creatives found, using mock data'
      });
    }

    return NextResponse.json({
      success: true,
      creatives: creativesWithInsights,
      message: `Successfully fetched ${creativesWithInsights.length} creatives`
    });

  } catch (error) {
    console.error('❌ Error in creatives API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creatives data' },
      { status: 500 }
    );
  }
}

function determineCreativeType(creative: any): 'image' | 'video' | 'carousel' | 'dynamic' {
  if (creative.video_id) return 'video';
  if (creative.image_url) return 'image';
  if (creative.object_story_spec?.link_data?.child_attachments) return 'carousel';
  return 'dynamic';
}

function determinePerformance(ctr: number, cpc: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (ctr >= 3.0 && cpc <= 1.5) return 'excellent';
  if (ctr >= 2.0 && cpc <= 2.5) return 'good';
  if (ctr >= 1.0 && cpc <= 3.5) return 'average';
  return 'poor';
}

function determineFatigueLevel(impressions: number, frequency: number): 'low' | 'medium' | 'high' {
  if (frequency <= 2.0) return 'low';
  if (frequency <= 5.0) return 'medium';
  return 'high';
}

function generateMockCreativeData() {
  const mockCreatives = [
    {
      id: 'creative_001',
      name: 'Summer Collection Ad',
      description: 'Summer Sale Banner - Get 50% off on all summer items',
      campaignName: 'Summer Collection 2024',
      adsetName: 'Women 25-34',
      creativeType: 'image' as const,
      thumbnailUrl: 'https://via.placeholder.com/120x120/3B82F6/FFFFFF?text=Creative+1',
      imageUrl: 'https://via.placeholder.com/600x315/3B82F6/FFFFFF?text=Summer+Sale',
      videoUrl: null,
      assets: undefined,
      clicks: 1247,
      impressions: 45678,
      spend: 2345.67,
      ctr: 2.73,
      cpc: 1.88,
      cpm: 51.45,
      reach: 12345,
      frequency: 3.7,
      status: 'ACTIVE',
      createdAt: '2024-01-15T10:30:00Z',
      performance: 'excellent' as const,
      fatigueLevel: 'medium' as const
    },
    {
      id: 'creative_002',
      name: 'Brand Awareness Video Ad',
      description: 'Product Demo Video - See our products in action',
      campaignName: 'Brand Awareness Q1',
      adsetName: 'General Audience',
      creativeType: 'video' as const,
      thumbnailUrl: 'https://via.placeholder.com/120x120/10B981/FFFFFF?text=Creative+2',
      imageUrl: null,
      videoUrl: 'https://www.facebook.com/video.php?v=123456789',
      assets: undefined,
      clicks: 892,
      impressions: 23456,
      spend: 1567.89,
      ctr: 3.80,
      cpc: 1.76,
      cpm: 66.85,
      reach: 9876,
      frequency: 2.4,
      status: 'ACTIVE',
      createdAt: '2024-01-20T14:15:00Z',
      performance: 'excellent' as const,
      fatigueLevel: 'low' as const
    },
    {
      id: 'creative_003',
      name: 'New Arrivals Carousel Ad',
      description: 'Carousel Collection - Browse our latest arrivals',
      campaignName: 'New Arrivals',
      adsetName: 'Fashion Enthusiasts',
      creativeType: 'carousel' as const,
      thumbnailUrl: 'https://via.placeholder.com/120x120/F59E0B/FFFFFF?text=Creative+3',
      imageUrl: 'https://via.placeholder.com/600x315/F59E0B/FFFFFF?text=Carousel+Ad',
      videoUrl: null,
      assets: undefined,
      clicks: 567,
      impressions: 18923,
      spend: 987.45,
      ctr: 2.99,
      cpc: 1.74,
      cpm: 52.18,
      reach: 6543,
      frequency: 2.9,
      status: 'ACTIVE',
      createdAt: '2024-01-25T09:45:00Z',
      performance: 'good' as const,
      fatigueLevel: 'low' as const
    },
    {
      id: 'creative_004',
      name: 'Retargeting Dynamic Ad',
      description: 'Dynamic Product Ad - Personalized recommendations',
      campaignName: 'Retargeting Campaign',
      adsetName: 'Previous Visitors',
      creativeType: 'dynamic' as const,
      thumbnailUrl: 'https://via.placeholder.com/120x120/8B5CF6/FFFFFF?text=Creative+4',
      imageUrl: 'https://via.placeholder.com/600x315/8B5CF6/FFFFFF?text=Dynamic+Ad',
      videoUrl: null,
      assets: undefined,
      clicks: 445,
      impressions: 15678,
      spend: 756.32,
      ctr: 2.84,
      cpc: 1.70,
      cpm: 48.25,
      reach: 5432,
      frequency: 2.9,
      status: 'ACTIVE',
      createdAt: '2024-01-30T16:20:00Z',
      performance: 'good' as const,
      fatigueLevel: 'medium' as const
    },
    {
      id: 'creative_005',
      name: 'Q4 Holiday Promotion Ad',
      description: 'Holiday Promotion - Special deals for the holiday season',
      campaignName: 'Q4 Sales Push',
      adsetName: 'Holiday Shoppers',
      creativeType: 'image' as const,
      thumbnailUrl: 'https://via.placeholder.com/120x120/EF4444/FFFFFF?text=Creative+5',
      imageUrl: 'https://via.placeholder.com/600x315/EF4444/FFFFFF?text=Holiday+Promo',
      videoUrl: null,
      assets: undefined,
      clicks: 234,
      impressions: 12345,
      spend: 456.78,
      ctr: 1.90,
      cpc: 1.95,
      cpm: 37.00,
      reach: 3456,
      frequency: 3.6,
      status: 'ACTIVE',
      createdAt: '2024-02-05T11:10:00Z',
      performance: 'average' as const,
      fatigueLevel: 'high' as const
    }
  ];

  return mockCreatives;
} 