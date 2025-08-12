import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { appendAccessTokenToImageUrl } from '../../../../lib/facebook-utils';
import { saveCreativesCache, getCreativesCache } from '@/lib/db';

// Rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cache for video sources to avoid duplicate requests
const videoSourceCache = new Map<string, string | null>();

/**
 * Two-step process for fetching video sources:
 * 1. First get video_id from creative
 * 2. Then fetch video source: GET /{video-id}?fields=source&access_token={token}
 * 3. The 'source' field contains the actual MP4 URL
 */
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
    
    // Primary: Use the 'source' field which contains the MP4 URL
    let source = data.source || null;
    
    // Fallback: If source is not available, try permalink_url (though this is usually not direct MP4)
    if (!source && data.permalink_url) {
      console.log(`⚠️ Video ${videoId}: No direct source URL, but permalink available: ${data.permalink_url}`);
    }
    
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

// Simple in-memory cache for creatives responses
type CreativeCacheEntry = { timestampMs: number; payload: any };
const creativesCache = new Map<string, CreativeCacheEntry>();

export async function POST(request: NextRequest) {
  try {
    const { accessToken, adAccountId, dateRange = 'last_30d', cacheTtlHours = 6, refresh = false } = await request.json();

    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        { error: 'Access token and ad account ID are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Debug: Fetching creatives for ad account ${adAccountId}`);

    // Cache key and TTL handling
    const cacheKey = JSON.stringify({ adAccountId, dateRange });
    const ttlMs = Math.max(0, Number(cacheTtlHours) || 0) * 60 * 60 * 1000;

    // Try persistent DB cache first
    if (!refresh && cacheTtlHours > 0) {
      const dbCached = await getCreativesCache(adAccountId, dateRange, cacheTtlHours);
      if (dbCached) {
        console.log(`🗄️ [DB CACHE HIT] creatives for ${cacheKey}`);
        return NextResponse.json(dbCached);
      }
    }

    // Then check in-memory cache
    if (!refresh && ttlMs > 0) {
      const existing = creativesCache.get(cacheKey);
      if (existing && Date.now() - existing.timestampMs < ttlMs) {
        console.log(`🗄️ [MEM CACHE HIT] creatives for ${cacheKey} (age ${(Date.now() - existing.timestampMs) / 1000}s)`);
        return NextResponse.json(existing.payload);
      }
      if (existing) {
        console.log('🗑️ [MEM CACHE EXPIRED] Removing stale cache for', cacheKey);
        creativesCache.delete(cacheKey);
      }
    }

    // Special case for testing/mock data
    if (accessToken === 'mock' || adAccountId === 'mock') {
      console.log('🎭 Debug: Using mock data for testing');
      return NextResponse.json({
        success: true,
        creatives: generateMockCreativeData(adAccountId),
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
    
    // Use yesterday as end date to ensure complete data availability
    const today = DateTime.now().setZone(accountTimezone).startOf('day');
    const yesterday = today.minus({ days: 1 });
    
    if (dateRange === 'last_7d') {
      // Last 7 days: from 7 days ago to yesterday (inclusive) - 7 complete days
      sinceDate = yesterday.minus({ days: 6 });
      untilDate = yesterday;
    } else if (dateRange === 'last_30d') {
      // Last 30 days: from 30 days ago to yesterday (inclusive) - 30 complete days
      sinceDate = yesterday.minus({ days: 29 });
      untilDate = yesterday;
    } else if (dateRange === 'last_90d') {
      // Last 90 days: from 90 days ago to yesterday (inclusive) - 90 complete days
      sinceDate = yesterday.minus({ days: 89 });
      untilDate = yesterday;
    } else if (dateRange === 'last_12m') {
      // Last 12 months: from 12 months ago to end of last month - complete months
      sinceDate = yesterday.minus({ months: 12 }).startOf('month');
      untilDate = yesterday.endOf('month');
    } else {
      // Default to last 30 days
      sinceDate = yesterday.minus({ days: 29 });
      untilDate = yesterday;
    }

    const since = sinceDate.toISODate();
    const until = untilDate.toISODate();
    const timeRange = JSON.stringify({ since, until });

    console.log(`🔍 Debug: Fetching creatives from ${since} to ${until} (${dateRange})`);

    // First, get all ads to find creatives - with expanded fields to capture all possible image/video sources
    const fieldsQuery = [
      'id',
      'name', 
      'creative{id,name,title,body,image_url,image_hash,video_id,thumbnail_url,object_story_spec,asset_feed_spec,call_to_action,url_tags}',
      'adset{id,name,campaign{id,name}}',
      'status'
    ].join(',');
    
    console.log(`🔍 API COMPARISON: Requesting fields: ${fieldsQuery}`);
    
    const adsResponse = await fetch(
      `${baseUrl}/${adAccountId}/ads?fields=${fieldsQuery}&access_token=${accessToken}`
    );
    const adsData = await adsResponse.json();
    
    console.log(`🔍 API COMPARISON: Raw ads response:`, JSON.stringify(adsData, null, 2));

    if (adsData.error) {
      console.error('Ads API error:', adsData.error);
      // Return mock data if API fails
      return NextResponse.json({
        success: true,
        creatives: generateMockCreativeData(adAccountId),
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
        let imageUrl = extractImageUrl(ad.creative, objectStorySpec);
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
          // Collect video IDs from all possible carousel paths
          console.log(`🔍 VIDEO ID COLLECTION - Checking all carousel paths for video IDs:`);
          
          // Path 1: link_data.child_attachments
          const linkDataChildAttachments = objectStorySpec?.link_data?.child_attachments || [];
          console.log(`   📦 Path 1 - link_data.child_attachments: ${linkDataChildAttachments.length} items`);
          linkDataChildAttachments.forEach((att: any, index: number) => {
            if (att.video_id) {
              videoIds.push(att.video_id);
              console.log(`     [${index}] 🎥 Found video_id: ${att.video_id}`);
            }
          });
          
          // Path 2: video_data.child_attachments (sometimes used for carousel videos)
          const videoDataChildAttachments = objectStorySpec?.video_data?.child_attachments || [];
          console.log(`   📦 Path 2 - video_data.child_attachments: ${videoDataChildAttachments.length} items`);
          videoDataChildAttachments.forEach((att: any, index: number) => {
            if (att.video_id) {
              videoIds.push(att.video_id);
              console.log(`     [${index}] 🎥 Found video_id: ${att.video_id}`);
            }
          });
          
          // Path 3: multi_share_end_card (if it contains videos)
          const multiShareEndCard = objectStorySpec?.link_data?.multi_share_end_card;
          if (multiShareEndCard?.video_id) {
            videoIds.push(multiShareEndCard.video_id);
            console.log(`   📦 Path 3 - multi_share_end_card.video_id: ${multiShareEndCard.video_id}`);
          }
          
          console.log(`   📊 Total video IDs collected for this carousel: ${videoIds.length}`);
        }

        // 🔍 API COMPARISON: Detailed field-by-field analysis
        console.log(`\n🔍 API COMPARISON - Creative ${ad.creative.id} Field Analysis:`);
        console.log(`==========================================`);
        
        // Core fields that should contain media
        const coreFields = {
          'creative.image_url': ad.creative.image_url,
          'creative.image_hash': ad.creative.image_hash,
          'creative.video_id': ad.creative.video_id,
          'creative.thumbnail_url': ad.creative.thumbnail_url,
          'creative.asset_feed_spec': ad.creative.asset_feed_spec,
        };
        
        console.log(`📊 CORE MEDIA FIELDS:`);
        Object.entries(coreFields).forEach(([field, value]) => {
          console.log(`   ${field}: ${value ? (typeof value === 'object' ? JSON.stringify(value) : value) : '❌ NULL/UNDEFINED'}`);
        });
        
        // Object story spec deep dive
        console.log(`\n📄 OBJECT_STORY_SPEC Analysis:`);
        if (objectStorySpec) {
          console.log(`   ✅ object_story_spec EXISTS`);
          console.log(`   📸 link_data: ${objectStorySpec.link_data ? '✅ EXISTS' : '❌ MISSING'}`);
          console.log(`   🎬 video_data: ${objectStorySpec.video_data ? '✅ EXISTS' : '❌ MISSING'}`);
          console.log(`   🖼️ photo_data: ${objectStorySpec.photo_data ? '✅ EXISTS' : '❌ MISSING'}`);
          
          if (objectStorySpec.link_data) {
            console.log(`   📸 link_data.image_url: ${objectStorySpec.link_data.image_url || '❌ MISSING'}`);
            console.log(`   📸 link_data.picture: ${objectStorySpec.link_data.picture || '❌ MISSING'}`);
            console.log(`   🎠 link_data.child_attachments: ${objectStorySpec.link_data.child_attachments ? `✅ ${objectStorySpec.link_data.child_attachments.length} items` : '❌ MISSING'}`);
            
            if (objectStorySpec.link_data.child_attachments) {
              console.log(`   🎠 CHILD_ATTACHMENTS Details:`);
              objectStorySpec.link_data.child_attachments.forEach((att: any, idx: number) => {
                console.log(`     [${idx}] image_url: ${att.image_url || '❌'}`);
                console.log(`     [${idx}] video_id: ${att.video_id || '❌'}`);
                console.log(`     [${idx}] media.image_url: ${att.media?.image_url || '❌'}`);
                console.log(`     [${idx}] picture: ${att.picture || '❌'}`);
                console.log(`     [${idx}] Full object:`, JSON.stringify(att, null, 6));
              });
            }
          }
          
          if (objectStorySpec.video_data) {
            console.log(`   🎬 video_data.video_id: ${objectStorySpec.video_data.video_id || '❌ MISSING'}`);
            console.log(`   🎬 video_data.image_url: ${objectStorySpec.video_data.image_url || '❌ MISSING'}`);
            console.log(`   🎬 video_data.picture: ${objectStorySpec.video_data.picture || '❌ MISSING'}`);
          }
          
          if (objectStorySpec.photo_data) {
            console.log(`   🖼️ photo_data.url: ${objectStorySpec.photo_data.url || '❌ MISSING'}`);
            console.log(`   🖼️ photo_data.picture: ${objectStorySpec.photo_data.picture || '❌ MISSING'}`);
          }
        } else {
          console.log(`   ❌ object_story_spec is NULL/UNDEFINED`);
        }
        
        // Full creative object for reference
        console.log(`\n📋 FULL CREATIVE OBJECT:`);
        console.log(JSON.stringify(ad.creative, null, 2));
        
        // 🔍 IMAGE URL TESTING: Test any image URLs found
        const imageUrlsToTest = [];
        if (ad.creative.image_url) imageUrlsToTest.push({ source: 'creative.image_url', url: ad.creative.image_url });
        if (ad.creative.thumbnail_url) imageUrlsToTest.push({ source: 'creative.thumbnail_url', url: ad.creative.thumbnail_url });
        if (objectStorySpec?.link_data?.image_url) imageUrlsToTest.push({ source: 'link_data.image_url', url: objectStorySpec.link_data.image_url });
        if (objectStorySpec?.link_data?.picture) imageUrlsToTest.push({ source: 'link_data.picture', url: objectStorySpec.link_data.picture });
        if (objectStorySpec?.video_data?.image_url) imageUrlsToTest.push({ source: 'video_data.image_url', url: objectStorySpec.video_data.image_url });
        if (objectStorySpec?.photo_data?.url) imageUrlsToTest.push({ source: 'photo_data.url', url: objectStorySpec.photo_data.url });
        
        if (objectStorySpec?.link_data?.child_attachments) {
          objectStorySpec.link_data.child_attachments.forEach((att: any, idx: number) => {
            if (att.image_url) imageUrlsToTest.push({ source: `child_attachments[${idx}].image_url`, url: att.image_url });
            if (att.media?.image_url) imageUrlsToTest.push({ source: `child_attachments[${idx}].media.image_url`, url: att.media.image_url });
            if (att.picture) imageUrlsToTest.push({ source: `child_attachments[${idx}].picture`, url: att.picture });
          });
        }
        
        if (imageUrlsToTest.length > 0) {
          console.log(`\n🔍 IMAGE URL ACCESSIBILITY TEST:`);
          for (const { source, url } of imageUrlsToTest.slice(0, 3)) { // Test first 3 to avoid too many requests
            console.log(`   Testing ${source}: ${url}`);
            try {
              // Quick HEAD request to test accessibility
              const testResponse = await fetch(url, { 
                method: 'HEAD',
                signal: AbortSignal.timeout(3000) // 3 second timeout
              });
              console.log(`   ✅ ${source}: ${testResponse.status} ${testResponse.statusText} ${testResponse.ok ? '(ACCESSIBLE)' : '(NOT ACCESSIBLE)'}`);
              
              // Test with access token if direct access fails
              if (!testResponse.ok && accessToken) {
                const urlWithToken = appendAccessTokenToImageUrl(url, accessToken);
                try {
                  const tokenTestResponse = await fetch(urlWithToken, { 
                    method: 'HEAD',
                    signal: AbortSignal.timeout(3000)
                  });
                  console.log(`   🔑 ${source} with token: ${tokenTestResponse.status} ${tokenTestResponse.statusText} ${tokenTestResponse.ok ? '(ACCESSIBLE)' : '(NOT ACCESSIBLE)'}`);
                } catch (tokenError) {
                  console.log(`   ❌ ${source} with token: Error - ${tokenError}`);
                }
              }
            } catch (error) {
              console.log(`   ❌ ${source}: Error - ${error}`);
            }
          }
        } else {
          console.log(`   ⚠️ No image URLs found in creative ${ad.creative.id}`);
        }
        
        console.log(`==========================================\n`);
        
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
          thumbnailUrl: imageUrl, // Use the same priority-extracted image URL for thumbnail
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
          adAccountId: adAccountId, // Add the ad account ID to each creative
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
          console.log(`🔍 DIAGNOSIS - Processing ${creative.creativeType} creative ${creative.id}:`);
          
          // Use comprehensive carousel asset extraction
          creative.assets = extractCarouselAssets(objectStorySpec, videoSources);
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
        creatives: generateMockCreativeData(adAccountId),
        message: 'No real creatives found, using mock data'
      });
    }

    const responsePayload = {
      success: true,
      creatives: creativesWithInsights,
      message: `Successfully fetched ${creativesWithInsights.length} creatives`
    };

    // Save to caches
    if (ttlMs > 0) {
      creativesCache.set(cacheKey, { timestampMs: Date.now(), payload: responsePayload });
      console.log('🗃️ [MEM CACHE SAVE] creatives for', cacheKey);
      // Also persist to DB (non-blocking)
      saveCreativesCache(adAccountId, dateRange, responsePayload).catch((e) =>
        console.warn('⚠️ Failed to persist creatives cache:', e)
      );
    }

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('❌ Error in creatives API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creatives data' },
      { status: 500 }
    );
  }
}

/**
 * Extract image URL from creative in priority order:
 * 1. creative.image_url
 * 2. creative.object_story_spec.link_data.picture  
 * 3. creative.object_story_spec.link_data.image_url
 * 4. creative.object_story_spec.video_data.image_url (video poster)
 * 5. creative.thumbnail_url
 * Returns the first one that exists
 */
function extractImageUrl(creative: any, objectStorySpec: any): string | null {
  console.log(`🔍 IMAGE URL EXTRACTION - Checking fields in priority order:`);
  
  // Priority 1: creative.image_url
  if (creative.image_url) {
    console.log(`   ✅ Priority 1 - creative.image_url: ${creative.image_url}`);
    return creative.image_url;
  }
  console.log(`   ❌ Priority 1 - creative.image_url: MISSING`);
  
  // Priority 2: creative.object_story_spec.link_data.picture
  if (objectStorySpec?.link_data?.picture) {
    console.log(`   ✅ Priority 2 - link_data.picture: ${objectStorySpec.link_data.picture}`);
    return objectStorySpec.link_data.picture;
  }
  console.log(`   ❌ Priority 2 - link_data.picture: MISSING`);
  
  // Priority 3: creative.object_story_spec.link_data.image_url
  if (objectStorySpec?.link_data?.image_url) {
    console.log(`   ✅ Priority 3 - link_data.image_url: ${objectStorySpec.link_data.image_url}`);
    return objectStorySpec.link_data.image_url;
  }
  console.log(`   ❌ Priority 3 - link_data.image_url: MISSING`);
  
  // Priority 4: object_story_spec.video_data.image_url (video poster)
  if (objectStorySpec?.video_data?.image_url) {
    console.log(`   ✅ Priority 4 - video_data.image_url: ${objectStorySpec.video_data.image_url}`);
    return objectStorySpec.video_data.image_url;
  }
  console.log(`   ❌ Priority 4 - video_data.image_url: MISSING`);

  // Priority 5: creative.thumbnail_url
  if (creative.thumbnail_url) {
    console.log(`   ✅ Priority 5 - creative.thumbnail_url: ${creative.thumbnail_url}`);
    return creative.thumbnail_url;
  }
  console.log(`   ❌ Priority 5 - creative.thumbnail_url: MISSING`);
  
  console.log(`   ❌ No image URL found in any priority field`);
  return null;
}

/**
 * Comprehensive carousel asset extraction from all possible Facebook API paths:
 * - creative.object_story_spec.link_data.child_attachments[].image_url
 * - creative.object_story_spec.link_data.child_attachments[].picture
 * - creative.object_story_spec.link_data.multi_share_end_card
 * - Sometimes in: creative.object_story_spec.video_data.child_attachments
 */
function extractCarouselAssets(objectStorySpec: any, videoSources: Map<string, string | null>): any[] {
  const assets: any[] = [];
  
  console.log(`🔍 CAROUSEL ASSET EXTRACTION - Checking all possible paths:`);
  
  // Path 1: link_data.child_attachments (primary path)
  const linkDataChildAttachments = objectStorySpec?.link_data?.child_attachments || [];
  console.log(`   📦 Path 1 - link_data.child_attachments: ${linkDataChildAttachments.length} items`);
  
  linkDataChildAttachments.forEach((att: any, index: number) => {
    let assetImageUrl = null;
    let assetVideoUrl = null;
    
    // Check all possible image URL paths for this attachment
    if (att.image_url) {
      assetImageUrl = att.image_url;
      console.log(`     [${index}] ✅ image_url: ${assetImageUrl}`);
    } else if (att.picture) {
      assetImageUrl = att.picture;
      console.log(`     [${index}] ✅ picture: ${assetImageUrl}`);
    } else if (att.media?.image_url) {
      assetImageUrl = att.media.image_url;
      console.log(`     [${index}] ✅ media.image_url: ${assetImageUrl}`);
    } else {
      console.log(`     [${index}] ❌ No image URL found in attachment`);
    }
    
    // Check for video
    if (att.video_id) {
      assetVideoUrl = videoSources.get(att.video_id) || null;
      console.log(`     [${index}] 🎥 video_id: ${att.video_id} → ${assetVideoUrl ? 'SUCCESS' : 'FAILED'}`);
    }
    
    if (assetImageUrl || assetVideoUrl) {
      assets.push({
        imageUrl: assetImageUrl,
        videoUrl: assetVideoUrl,
        thumbnailUrl: assetImageUrl // Use image URL as thumbnail
      });
    }
  });
  
  // Path 2: link_data.multi_share_end_card
  const multiShareEndCard = objectStorySpec?.link_data?.multi_share_end_card;
  if (multiShareEndCard) {
    console.log(`   📦 Path 2 - multi_share_end_card: EXISTS`);
    let endCardImageUrl = null;
    
    if (multiShareEndCard.image_url) {
      endCardImageUrl = multiShareEndCard.image_url;
      console.log(`     ✅ multi_share_end_card.image_url: ${endCardImageUrl}`);
    } else if (multiShareEndCard.picture) {
      endCardImageUrl = multiShareEndCard.picture;
      console.log(`     ✅ multi_share_end_card.picture: ${endCardImageUrl}`);
    }
    
    if (endCardImageUrl) {
      assets.push({
        imageUrl: endCardImageUrl,
        videoUrl: null,
        thumbnailUrl: endCardImageUrl
      });
    }
  } else {
    console.log(`   📦 Path 2 - multi_share_end_card: ❌ MISSING`);
  }
  
  // Path 3: video_data.child_attachments (sometimes used for carousel videos)
  const videoDataChildAttachments = objectStorySpec?.video_data?.child_attachments || [];
  console.log(`   📦 Path 3 - video_data.child_attachments: ${videoDataChildAttachments.length} items`);
  
  videoDataChildAttachments.forEach((att: any, index: number) => {
    let assetImageUrl = null;
    let assetVideoUrl = null;
    
    // Check all possible image URL paths for this attachment
    if (att.image_url) {
      assetImageUrl = att.image_url;
      console.log(`     [${index}] ✅ image_url: ${assetImageUrl}`);
    } else if (att.picture) {
      assetImageUrl = att.picture;
      console.log(`     [${index}] ✅ picture: ${assetImageUrl}`);
    } else if (att.media?.image_url) {
      assetImageUrl = att.media.image_url;
      console.log(`     [${index}] ✅ media.image_url: ${assetImageUrl}`);
    } else if (att.thumbnail_url) {
      assetImageUrl = att.thumbnail_url;
      console.log(`     [${index}] ✅ thumbnail_url: ${assetImageUrl}`);
    } else {
      console.log(`     [${index}] ❌ No image URL found in video_data attachment`);
    }
    
    // Check for video
    if (att.video_id) {
      assetVideoUrl = videoSources.get(att.video_id) || null;
      console.log(`     [${index}] 🎥 video_id: ${att.video_id} → ${assetVideoUrl ? 'SUCCESS' : 'FAILED'}`);
    }
    
    if (assetImageUrl || assetVideoUrl) {
      assets.push({
        imageUrl: assetImageUrl,
        videoUrl: assetVideoUrl,
        thumbnailUrl: assetImageUrl
      });
    }
  });
  
  // Path 4: Additional fallback paths in link_data
  const linkData = objectStorySpec?.link_data;
  if (linkData) {
    console.log(`   📦 Path 4 - Additional link_data paths:`);
    
    // Check link_data.image_url
    if (linkData.image_url) {
      console.log(`     ✅ link_data.image_url: ${linkData.image_url}`);
      assets.push({
        imageUrl: linkData.image_url,
        videoUrl: null,
        thumbnailUrl: linkData.image_url
      });
    }
    
    // Check link_data.picture
    if (linkData.picture) {
      console.log(`     ✅ link_data.picture: ${linkData.picture}`);
      assets.push({
        imageUrl: linkData.picture,
        videoUrl: null,
        thumbnailUrl: linkData.picture
      });
    }
  }
  
  console.log(`   📊 Total assets extracted: ${assets.length}`);
  return assets;
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

function generateMockCreativeData(adAccountId: string = 'mock_account') {
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
      fatigueLevel: 'medium' as const,
      adAccountId: adAccountId
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
      fatigueLevel: 'low' as const,
      adAccountId: adAccountId
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
      fatigueLevel: 'low' as const,
      adAccountId: adAccountId
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
      fatigueLevel: 'medium' as const,
      adAccountId: adAccountId
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