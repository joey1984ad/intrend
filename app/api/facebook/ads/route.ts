import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { saveFacebookSession, saveCampaignData, saveMetricsCache } from '@/lib/db';

// Simple in-memory cache for campaign/insights responses
// Keyed by adAccountId + dateRange
type CachedEntry = { timestampMs: number; payload: any };
const campaignsCache = new Map<string, CachedEntry>();

export async function POST(request: NextRequest) {
  try {
    const { accessToken, adAccountId, dateRange = 'last_30d', userId, compare = false, cacheTtlHours = 6, refresh = false } = await request.json();
    // Cache key and TTL handling
    const cacheKey = JSON.stringify({ adAccountId, dateRange, compare });
    const ttlMs = Math.max(0, Number(cacheTtlHours) || 0) * 60 * 60 * 1000;

    if (!refresh && ttlMs > 0) {
      const existing = campaignsCache.get(cacheKey);
      if (existing && Date.now() - existing.timestampMs < ttlMs) {
        console.log(`🗄️ [CACHE HIT] campaigns for ${cacheKey} (age ${(Date.now() - existing.timestampMs) / 1000}s)`);
        return NextResponse.json(existing.payload);
      }
      if (existing) {
        console.log('🗑️ [CACHE EXPIRED] Removing stale cache for', cacheKey);
        campaignsCache.delete(cacheKey);
      }
    }

    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        { error: 'Access token and ad account ID are required' },
        { status: 400 }
      );
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
    
    // Use timezone-aware date calculations
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
      // Last 12 complete months ending at the end of the previous month
      const endOfPreviousMonth = yesterday.startOf('month').minus({ days: 1 });
      untilDate = endOfPreviousMonth;
      sinceDate = endOfPreviousMonth.minus({ months: 12 }).startOf('month');
    } else {
      // Default to last 30 days
      sinceDate = yesterday.minus({ days: 29 });
      untilDate = yesterday;
    }

    // Format dates as YYYY-MM-DD (ensure until date is inclusive)
    const since = sinceDate.toISODate();
    const until = untilDate.toISODate();

    // Calculate expected number of days for validation
    const expectedDays = untilDate.diff(sinceDate, 'days').days + 1;

    // Use direct Graph API calls instead of Business SDK
    const timeRange = JSON.stringify({ since, until });

    // --- Improved logging ---
    console.log(`🔍 [DEBUG] Fetching data for adAccountId=${adAccountId}`);
    console.log(`🔍 [DEBUG] Date range: since=${since}, until=${until} (inclusive)`);
    console.log(`🔍 [DEBUG] Expected days: ${expectedDays}`);
    console.log(`🔍 [DEBUG] Time range JSON: ${timeRange}`);
    console.log(`🔍 [DEBUG] Using timezone: ${accountTimezone}`);

    // --- Fetch summary insights for the period (time_increment=all) ---
    const summaryInsightsUrl = `${baseUrl}/${adAccountId}/insights?fields=spend,impressions,clicks,reach,frequency,cpc,cpm,ctr,actions,action_values&level=account&time_range=${timeRange}&time_increment=all&access_token=${accessToken}`;
    console.log(`🔍 [DEBUG] Fetching summary insights: ${summaryInsightsUrl}`);
    const summaryInsightsResponse = await fetch(summaryInsightsUrl);
    const summaryInsightsData = await summaryInsightsResponse.json();

    // Prefer summary totals to avoid incorrect reach aggregation and ensure period-accurate metrics
    let summaryTotals: {
      totalSpent: number;
      totalClicks: number;
      totalImpressions: number;
      totalReach: number;
      avgCPC: number;
      avgCPM: number;
      avgCTR: number;
    } | null = null;

    if (summaryInsightsData.error) {
      console.error('[DEBUG] Summary insights API error:', summaryInsightsData.error);
    } else {
      console.log('[DEBUG] Summary insights data:', summaryInsightsData.data);
      if (summaryInsightsData.data && summaryInsightsData.data.length > 0) {
        const s = summaryInsightsData.data[0] || {};
        const totalSpent = parseFloat(s.spend || 0);
        const totalClicks = parseInt(s.clicks || 0);
        const totalImpressions = parseInt(s.impressions || 0);
        const totalReach = parseInt(s.reach || 0);
        // cpc/cpm/ctr can come as strings
        const avgCPC = s.cpc != null ? parseFloat(s.cpc) : (totalClicks > 0 ? totalSpent / totalClicks : 0);
        const avgCPM = s.cpm != null ? parseFloat(s.cpm) : (totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0);
        const avgCTR = s.ctr != null ? parseFloat(String(s.ctr)) : (totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0);

        summaryTotals = {
          totalSpent,
          totalClicks,
          totalImpressions,
          totalReach,
          avgCPC,
          avgCPM,
          avgCTR,
        };
        console.log(`[DEBUG] Summary spend for period: $${totalSpent}`);
      }
    }

    // Get campaigns
    const campaignsResponse = await fetch(
      `${baseUrl}/${adAccountId}/campaigns?fields=id,name,status,objective,start_time,stop_time,daily_budget,lifetime_budget,budget_remaining&access_token=${accessToken}`
    );
    const campaignsData = await campaignsResponse.json();

    if (campaignsData.error) {
      console.error('Campaigns API error:', campaignsData.error);
      return NextResponse.json(
        { error: `Facebook API error: ${campaignsData.error.message}` },
        { status: 400 }
      );
    }

    // Get insights for each campaign
    const campaignsWithInsights = [];
    for (const campaign of campaignsData.data || []) {
      try {
        // Use aggregated insights for the whole period to avoid picking just the first day
        const insightsUrl = `${baseUrl}/${campaign.id}/insights?fields=impressions,clicks,spend,reach,frequency,cpc,cpm,ctr,actions,action_values&time_range=${timeRange}&time_increment=all&access_token=${accessToken}`;
        console.log(`🔍 Fetching insights for campaign ${campaign.id}: ${insightsUrl}`);
        
        const insightsResponse = await fetch(insightsUrl);
        const insightsData = await insightsResponse.json();
        
        if (insightsData.error) {
          console.error(`Insights API error for campaign ${campaign.id}:`, insightsData.error);
          // Add campaign without insights
          campaignsWithInsights.push({
            ...campaign,
            insights: { impressions: 0, clicks: 0, spend: 0, reach: 0, cpc: 0, cpm: 0, ctr: '0%' }
          });
        } else {
          console.log(`📊 Campaign ${campaign.id} insights data:`, insightsData.data);
          // Add campaign with aggregated insights for the period
          const insights = insightsData.data && insightsData.data.length > 0 ? insightsData.data[0] : {
            impressions: 0, clicks: 0, spend: 0, reach: 0, cpc: 0, cpm: 0, ctr: '0%'
          };
          campaignsWithInsights.push({
            ...campaign,
            insights
          });
        }
      } catch (error) {
        console.error(`Error fetching insights for campaign ${campaign.id}:`, error);
        campaignsWithInsights.push({
          ...campaign,
          insights: { impressions: 0, clicks: 0, spend: 0, reach: 0, cpc: 0, cpm: 0, ctr: '0%' }
        });
      }
    }

    // Get account-level insights
    const accountInsightsUrl = `${baseUrl}/${adAccountId}/insights?fields=impressions,clicks,spend,reach,frequency,cpc,cpm,ctr,actions,action_values&level=account&time_range=${timeRange}&time_increment=1&access_token=${accessToken}`;
    console.log(`🔍 Fetching account insights: ${accountInsightsUrl}`);
    
    const accountInsightsResponse = await fetch(accountInsightsUrl);
    const accountInsightsData = await accountInsightsResponse.json();

    if (accountInsightsData.error) {
      console.error('Account insights API error:', accountInsightsData.error);
    } else {
      console.log(`📊 Account insights data:`, accountInsightsData.data);
      if (accountInsightsData.data && accountInsightsData.data.length > 0) {
        const spends = accountInsightsData.data.map((d: any) => d.spend);
        console.log(`[DEBUG] Daily spend values:`, spends);
      }
    }

    // Calculate account-level totals from insights data with validation
    let accountTotals = {
      totalSpent: 0,
      totalClicks: 0,
      totalImpressions: 0,
      totalReach: 0,
      avgCPC: 0,
      avgCPM: 0,
      avgCTR: 0
    };

    // If summary totals are available and date coverage looks complete, prefer them to avoid over/undercounting
    if (summaryTotals && expectedDays >= 1) {
      accountTotals = summaryTotals;
    } else if (accountInsightsData.data && accountInsightsData.data.length > 0) {
      console.log(`📊 Debug: Processing ${accountInsightsData.data.length} days of account insights`);
      console.log(`📊 Debug: Expected days: ${expectedDays}, Actual days: ${accountInsightsData.data.length}`);
      console.log(`📊 Debug: Sample daily data:`, accountInsightsData.data.slice(0, 3));
      
      // Validate data completeness
      if (accountInsightsData.data.length !== expectedDays) {
        console.warn(`⚠️ Warning: Expected ${expectedDays} days but got ${accountInsightsData.data.length} days`);
      }
      
      // Sum up all daily insights to get account totals
      accountTotals = accountInsightsData.data.reduce((totals: any, day: any) => {
        const daySpend = parseFloat(day.spend || 0);
        const dayClicks = parseInt(day.clicks || 0);
        const dayImpressions = parseInt(day.impressions || 0);
        const dayReach = parseInt(day.reach || 0);
        
        console.log(`📊 Debug: Day ${day.date_start}: spend=${daySpend}, clicks=${dayClicks}, impressions=${dayImpressions}`);
        
        return {
          totalSpent: totals.totalSpent + daySpend,
          totalClicks: totals.totalClicks + dayClicks,
          totalImpressions: totals.totalImpressions + dayImpressions,
          totalReach: totals.totalReach + dayReach,
          avgCPC: 0, // Will calculate after summing
          avgCPM: 0, // Will calculate after summing
          avgCTR: 0  // Will calculate after summing
        };
      }, accountTotals);

      // Calculate averages
      accountTotals.avgCPC = accountTotals.totalClicks > 0 ? accountTotals.totalSpent / accountTotals.totalClicks : 0;
      accountTotals.avgCPM = accountTotals.totalImpressions > 0 ? (accountTotals.totalSpent / accountTotals.totalImpressions) * 1000 : 0;
      accountTotals.avgCTR = accountTotals.totalImpressions > 0 ? (accountTotals.totalClicks / accountTotals.totalImpressions) * 100 : 0;
    }

    console.log(`📊 Account totals calculated:`, accountTotals);

    // If comparison mode is enabled, fetch data for previous period
    let previousPeriodData = null;
    if (compare) {
      console.log(`🔄 Comparison mode enabled - fetching previous period data`);
      
      // Calculate previous period dates (same duration as current period)
      const periodDuration = untilDate.diff(sinceDate, 'days').days + 1;
      const previousSinceDate = sinceDate.minus({ days: periodDuration });
      const previousUntilDate = sinceDate.minus({ days: 1 });
      
      const previousSince = previousSinceDate.toISODate();
      const previousUntil = previousUntilDate.toISODate();
      const previousTimeRange = JSON.stringify({ since: previousSince, until: previousUntil });
      
      console.log(`📅 Previous period: ${previousSince} to ${previousUntil} (${periodDuration} days)`);
      
      // Fetch previous period account insights (use summary totals for consistency)
      const previousSummaryUrl = `${baseUrl}/${adAccountId}/insights?fields=spend,impressions,clicks,reach,frequency,cpc,cpm,ctr,actions,action_values&level=account&time_range=${previousTimeRange}&time_increment=all&access_token=${accessToken}`;
      console.log(`🔍 Fetching previous period summary insights: ${previousSummaryUrl}`);
      const previousSummaryResp = await fetch(previousSummaryUrl);
      const previousSummaryData = await previousSummaryResp.json();

      let previousTotals = {
        totalSpent: 0,
        totalClicks: 0,
        totalImpressions: 0,
        totalReach: 0,
        avgCPC: 0,
        avgCPM: 0,
        avgCTR: 0
      };

      if (previousSummaryData.error) {
        console.error('Previous period summary insights API error:', previousSummaryData.error);
      } else if (previousSummaryData.data && previousSummaryData.data.length > 0) {
        const ps = previousSummaryData.data[0] || {};
        const totalSpent = parseFloat(ps.spend || 0);
        const totalClicks = parseInt(ps.clicks || 0);
        const totalImpressions = parseInt(ps.impressions || 0);
        const totalReach = parseInt(ps.reach || 0);
        const avgCPC = ps.cpc != null ? parseFloat(ps.cpc) : (totalClicks > 0 ? totalSpent / totalClicks : 0);
        const avgCPM = ps.cpm != null ? parseFloat(ps.cpm) : (totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0);
        const avgCTR = ps.ctr != null ? parseFloat(String(ps.ctr)) : (totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0);

        previousTotals = {
          totalSpent,
          totalClicks,
          totalImpressions,
          totalReach,
          avgCPC,
          avgCPM,
          avgCTR,
        };
      }

      console.log(`📊 Previous period totals calculated:`, previousTotals);
      
      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      previousPeriodData = {
        totals: previousTotals,
        insights: [],
        dateRange: { since: previousSince, until: previousUntil },
        changes: {
          totalSpent: calculateChange(accountTotals.totalSpent, previousTotals.totalSpent),
          totalClicks: calculateChange(accountTotals.totalClicks, previousTotals.totalClicks),
          totalImpressions: calculateChange(accountTotals.totalImpressions, previousTotals.totalImpressions),
          totalReach: calculateChange(accountTotals.totalReach, previousTotals.totalReach),
          avgCPC: calculateChange(accountTotals.avgCPC, previousTotals.avgCPC),
          avgCPM: calculateChange(accountTotals.avgCPM, previousTotals.avgCPM),
          avgCTR: calculateChange(accountTotals.avgCTR, previousTotals.avgCTR)
        }
      };
    }

    // Get ad sets
    const adSetsResponse = await fetch(
      `${baseUrl}/${adAccountId}/adsets?fields=id,name,status,daily_budget,lifetime_budget,targeting,optimization_goal&access_token=${accessToken}`
    );
    const adSetsData = await adSetsResponse.json();

    if (adSetsData.error) {
      console.error('Ad sets API error:', adSetsData.error);
    }

    // Get ads
    const adsResponse = await fetch(
      `${baseUrl}/${adAccountId}/ads?fields=id,name,status,creative,adset_id&access_token=${accessToken}`
    );
    const adsData = await adsResponse.json();

    if (adsData.error) {
      console.error('Ads API error:', adsData.error);
    }

    console.log(`📊 Debug: Returning ${campaignsWithInsights.length} campaigns with insights`);
    console.log(`📊 Debug: Sample campaign data:`, campaignsWithInsights.slice(0, 2));
    
    // Save data to database if userId is provided
    if (userId && campaignsWithInsights.length > 0) {
      try {
        // Save Facebook session
        const sessionId = await saveFacebookSession(userId, accessToken, adAccountId);
        
        if (sessionId) {
          // Save campaign data
          await saveCampaignData(sessionId, campaignsWithInsights, dateRange);
          
          // Save metrics cache with account totals
          const metrics = [
            { label: 'Total Spend', value: `$${accountTotals.totalSpent.toFixed(2)}` },
            { label: 'Total Clicks', value: accountTotals.totalClicks.toLocaleString() },
            { label: 'Total Impressions', value: accountTotals.totalImpressions.toLocaleString() },
            { label: 'Total Reach', value: accountTotals.totalReach.toLocaleString() },
            { label: 'Avg. CPC', value: `$${accountTotals.avgCPC.toFixed(2)}` },
            { label: 'Avg. CPM', value: `$${accountTotals.avgCPM.toFixed(2)}` },
            { label: 'Avg. CTR', value: `${accountTotals.avgCTR.toFixed(2)}%` }
          ];
          
          await saveMetricsCache(sessionId, metrics, dateRange);
          console.log(`✅ Data saved to database for user ${userId}`);
        }
      } catch (dbError) {
        console.error('❌ Database save error:', dbError);
        // Continue with API response even if database save fails
      }
    }
    
    const responsePayload = {
      success: true,
      campaigns: campaignsWithInsights,
      insights: accountInsightsData.data || [],
      adSets: adSetsData.data || [],
      ads: adsData.data || [],
      dateRange: { since, until },
      accountTotals: accountTotals,
      accountInfo: {
        timezone: accountTimezone,
        currency: accountData.currency,
        name: accountData.name
      },
      validation: {
        expectedDays,
        actualDays: accountInsightsData.data ? accountInsightsData.data.length : 0,
        dataComplete: accountInsightsData.data ? accountInsightsData.data.length === expectedDays : false
      },
      comparison: previousPeriodData
    };

    // Save to in-memory cache
    if (ttlMs > 0) {
      campaignsCache.set(cacheKey, { timestampMs: Date.now(), payload: responsePayload });
      console.log('🗃️ [CACHE SAVE] campaigns for', cacheKey);
    }

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    console.error('Facebook ads API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch Facebook ads data. Please check your permissions and ad account access.' },
      { status: 500 }
    );
  }
} 