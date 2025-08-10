import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, adAccountId, dateRange = 'last_30d', compare = false } = await request.json();

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
      // Example: If today is 2025-08-10, we want 2024-08-01 .. 2025-07-31
      const endOfPreviousMonth = yesterday.startOf('month').minus({ days: 1 });
      untilDate = endOfPreviousMonth;
      sinceDate = endOfPreviousMonth.minus({ months: 12 }).startOf('month');
    } else {
      // Default to last 30 days
      sinceDate = yesterday.minus({ days: 29 });
      untilDate = yesterday;
    }

    // Format dates as YYYY-MM-DD
    const since = sinceDate.toISODate();
    const until = untilDate.toISODate();

    console.log(`🔍 Debug: Fetching detailed insights from ${since} to ${until} (${dateRange})`);
    console.log(`🌍 Debug: Using timezone: ${accountTimezone}`);

    // Calculate comparison period if requested
    let comparisonData = null;
    if (compare) {
      const periodLength = untilDate.diff(sinceDate, 'days').days + 1;
      const previousSinceDate = sinceDate.minus({ days: periodLength });
      const previousUntilDate = sinceDate.minus({ days: 1 });
      
      const previousSince = previousSinceDate.toISODate();
      const previousUntil = previousUntilDate.toISODate();
      
      console.log(`🔍 Debug: Comparison period: ${previousSince} to ${previousUntil} (${periodLength} days)`);
      
      // Fetch comparison data
      const comparisonInsightsUrl = `${baseUrl}/${adAccountId}/insights?fields=impressions,spend,clicks,actions,action_values,ctr,cpc,cpm&level=account&time_range=${JSON.stringify({ since: previousSince, until: previousUntil })}&time_increment=1&access_token=${accessToken}`;
      console.log(`🔍 Fetching comparison insights: ${comparisonInsightsUrl}`);
      
      const comparisonInsightsResponse = await fetch(comparisonInsightsUrl);
      const comparisonInsightsData = await comparisonInsightsResponse.json();

      if (comparisonInsightsData.error) {
        console.error('Comparison insights API error:', comparisonInsightsData.error);
      } else {
        console.log(`📊 Debug: Comparison insights data:`, comparisonInsightsData.data);
        
        // Process comparison data
        const processedComparisonData = (comparisonInsightsData.data || []).map((day: any) => {
          let revenue = 0;
          if (day.action_values && Array.isArray(day.action_values)) {
            const purchaseAction = day.action_values.find((action: any) => action.action_type === 'purchase');
            if (purchaseAction && purchaseAction.value) {
              revenue = parseFloat(purchaseAction.value);
            }
          }

          const spend = parseFloat(day.spend || 0);
          const roas = spend > 0 ? revenue / spend : 0;

          return {
            date: day.date_start,
            spend: spend,
            revenue: revenue,
            roas: roas,
            clicks: parseInt(day.clicks || 0),
            impressions: parseInt(day.impressions || 0),
            ctr: parseFloat(day.ctr || 0),
            cpc: parseFloat(day.cpc || 0),
            cpm: parseFloat(day.cpm || 0)
          };
        });

        // Fill missing days with zeros for comparison period
        const filledComparisonData = [];
        for (let d = previousSinceDate; d <= previousUntilDate; d = d.plus({ days: 1 })) {
          const dateStr = d.toISODate();
          const existingDay = processedComparisonData.find((day: any) => day.date === dateStr);
          
          if (existingDay) {
            filledComparisonData.push(existingDay);
          } else {
            filledComparisonData.push({
              date: dateStr,
              spend: 0,
              revenue: 0,
              roas: 0,
              clicks: 0,
              impressions: 0,
              ctr: 0,
              cpc: 0,
              cpm: 0
            });
          }
        }

        comparisonData = filledComparisonData;
        console.log(`📊 Debug: Final comparison data (${filledComparisonData.length} days):`, filledComparisonData.slice(0, 3));
      }
    }

    // Get detailed insights with time_increment=1
    const insightsUrl = `${baseUrl}/${adAccountId}/insights?fields=impressions,spend,clicks,actions,action_values,ctr,cpc,cpm&level=account&time_range=${JSON.stringify({ since, until })}&time_increment=1&access_token=${accessToken}`;
    console.log(`🔍 Fetching detailed insights: ${insightsUrl}`);
    
    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();

    if (insightsData.error) {
      console.error('Insights API error:', insightsData.error);
      return NextResponse.json(
        { error: `Facebook API error: ${insightsData.error.message}` },
        { status: 400 }
      );
    }

    console.log(`📊 Debug: Raw insights data:`, insightsData.data);

    // Process the insights data to extract revenue and calculate ROAS
    const processedData = (insightsData.data || []).map((day: any) => {
      // Extract revenue from action_values where action_type === 'purchase'
      let revenue = 0;
      if (day.action_values && Array.isArray(day.action_values)) {
        const purchaseAction = day.action_values.find((action: any) => action.action_type === 'purchase');
        if (purchaseAction && purchaseAction.value) {
          revenue = parseFloat(purchaseAction.value);
        }
      }

      const spend = parseFloat(day.spend || 0);
      const roas = spend > 0 ? revenue / spend : 0;

      return {
        date: day.date_start,
        spend: spend,
        revenue: revenue,
        roas: roas,
        clicks: parseInt(day.clicks || 0),
        impressions: parseInt(day.impressions || 0),
        ctr: parseFloat(day.ctr || 0),
        cpc: parseFloat(day.cpc || 0),
        cpm: parseFloat(day.cpm || 0)
      };
    });

    console.log(`📊 Debug: Processed insights data:`, processedData.slice(0, 3));

    // Fill missing days with zeros
    const filledData = [];
    const startDate = sinceDate;
    const endDate = untilDate;
    
    for (let d = startDate; d <= endDate; d = d.plus({ days: 1 })) {
      const dateStr = d.toISODate();
      const existingDay = processedData.find((day: any) => day.date === dateStr);
      
      if (existingDay) {
        filledData.push(existingDay);
      } else {
        filledData.push({
          date: dateStr,
          spend: 0,
          revenue: 0,
          roas: 0,
          clicks: 0,
          impressions: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0
        });
      }
    }

    console.log(`📊 Debug: Final filled data (${filledData.length} days):`, filledData.slice(0, 3));

    // Calculate summary statistics for comparison
    let summaryStats = null;
    if (compare && comparisonData) {
      const currentTotals = filledData.reduce((acc, day) => ({
        spend: acc.spend + day.spend,
        revenue: acc.revenue + day.revenue,
        clicks: acc.clicks + day.clicks,
        impressions: acc.impressions + day.impressions
      }), { spend: 0, revenue: 0, clicks: 0, impressions: 0 });

      const previousTotals = comparisonData.reduce((acc, day) => ({
        spend: acc.spend + day.spend,
        revenue: acc.revenue + day.revenue,
        clicks: acc.clicks + day.clicks,
        impressions: acc.impressions + day.impressions
      }), { spend: 0, revenue: 0, clicks: 0, impressions: 0 });

      const currentRoas = currentTotals.spend > 0 ? currentTotals.revenue / currentTotals.spend : 0;
      const previousRoas = previousTotals.spend > 0 ? previousTotals.revenue / previousTotals.spend : 0;

      summaryStats = {
        spend: {
          current: currentTotals.spend,
          previous: previousTotals.spend,
          change: previousTotals.spend > 0 ? ((currentTotals.spend - previousTotals.spend) / previousTotals.spend) * 100 : 0
        },
        revenue: {
          current: currentTotals.revenue,
          previous: previousTotals.revenue,
          change: previousTotals.revenue > 0 ? ((currentTotals.revenue - previousTotals.revenue) / previousTotals.revenue) * 100 : 0
        },
        roas: {
          current: currentRoas,
          previous: previousRoas,
          change: previousRoas > 0 ? ((currentRoas - previousRoas) / previousRoas) * 100 : 0
        },
        clicks: {
          current: currentTotals.clicks,
          previous: previousTotals.clicks,
          change: previousTotals.clicks > 0 ? ((currentTotals.clicks - previousTotals.clicks) / previousTotals.clicks) * 100 : 0
        },
        impressions: {
          current: currentTotals.impressions,
          previous: previousTotals.impressions,
          change: previousTotals.impressions > 0 ? ((currentTotals.impressions - previousTotals.impressions) / previousTotals.impressions) * 100 : 0
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        current: filledData,
        previous: comparisonData
      },
      summaryStats,
      accountInfo: {
        name: accountData.name,
        timezone: accountTimezone,
        currency: accountData.currency
      },
      dateRange: {
        since,
        until,
        days: filledData.length,
        comparison: compare ? {
          since: comparisonData ? comparisonData[0]?.date : null,
          until: comparisonData ? comparisonData[comparisonData.length - 1]?.date : null
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Error in insights API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights data' },
      { status: 500 }
    );
  }
} 