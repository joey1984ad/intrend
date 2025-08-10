import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');
  const adAccountId = searchParams.get('adAccountId');
  const dateRange = searchParams.get('dateRange') || 'last_30d';

  if (!accessToken || !adAccountId) {
    return NextResponse.json({ error: 'Access token and ad account ID are required' });
  }

  try {
    const baseUrl = 'https://graph.facebook.com/v23.0';

    // Get ad account details first to determine timezone
    const accountResponse = await fetch(
      `${baseUrl}/${adAccountId}?fields=id,name,timezone_name,currency&access_token=${accessToken}`
    );
    const accountData = await accountResponse.json();

    if (accountData.error) {
      console.error('Test: Account API error:', accountData.error);
      return NextResponse.json({ error: accountData.error });
    }

    const accountTimezone = accountData.timezone_name || 'America/New_York';
    console.log(`📊 Test: Ad account timezone: ${accountTimezone}`);

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

    // Calculate expected number of days for validation
    const expectedDays = untilDate.diff(sinceDate, 'days').days + 1;

    console.log(`🔍 Test: Fetching data from ${since} to ${until} (${dateRange})`);
    console.log(`📅 Test: Expected days in range: ${expectedDays}`);
    console.log(`🌍 Test: Using timezone: ${accountTimezone}`);

    // Test all date ranges to show the calculations
    const testAllRanges = () => {
      const ranges = ['last_7d', 'last_30d', 'last_90d', 'last_12m'];
      const results: Record<string, any> = {};
      
      ranges.forEach(range => {
        const testToday = DateTime.now().setZone(accountTimezone).startOf('day');
        
        let testSince: DateTime, testUntil: DateTime;
        if (range === 'last_7d') {
          testSince = testToday.minus({ days: 6 });
          testUntil = testToday;
        } else if (range === 'last_30d') {
          testSince = testToday.minus({ days: 29 });
          testUntil = testToday;
        } else if (range === 'last_90d') {
          testSince = testToday.minus({ days: 89 });
          testUntil = testToday;
        } else if (range === 'last_12m') {
          testSince = testToday.minus({ months: 11 }).startOf('month');
          testUntil = testToday.endOf('month');
        } else {
          // Default fallback
          testSince = testToday.minus({ days: 29 });
          testUntil = testToday;
        }
        
        const testSinceStr = testSince.toISODate();
        const testUntilStr = testUntil.toISODate();
        const testDays = testUntil.diff(testSince, 'days').days + 1;
        
        results[range] = {
          since: testSinceStr,
          until: testUntilStr,
          days: testDays,
          description: `${testDays} days from ${testSinceStr} to ${testUntilStr}`
        };
      });
      
      return results;
    };

    // Get account-level insights
    const timeRange = JSON.stringify({ since, until });
    const accountInsightsUrl = `${baseUrl}/${adAccountId}/insights?fields=impressions,clicks,spend,reach,frequency,cpc,cpm,ctr,actions,action_values&time_range=${timeRange}&time_increment=1&access_token=${accessToken}`;
    console.log(`🔍 Test: Fetching account insights: ${accountInsightsUrl}`);
    
    const accountInsightsResponse = await fetch(accountInsightsUrl);
    const accountInsightsData = await accountInsightsResponse.json();

    if (accountInsightsData.error) {
      console.error('Test: Account insights API error:', accountInsightsData.error);
      return NextResponse.json({ error: accountInsightsData.error });
    }

    // Calculate totals with validation
    let totals = {
      totalSpent: 0,
      totalClicks: 0,
      totalImpressions: 0,
      totalReach: 0,
      avgCPC: 0,
      avgCPM: 0,
      avgCTR: 0
    };

    if (accountInsightsData.data && accountInsightsData.data.length > 0) {
      console.log(`📊 Test: Processing ${accountInsightsData.data.length} days of account insights`);
      console.log(`📊 Test: Expected days: ${expectedDays}, Actual days: ${accountInsightsData.data.length}`);
      
      // Validate data completeness
      const dataComplete = accountInsightsData.data.length === expectedDays;
      if (!dataComplete) {
        console.warn(`⚠️ Test Warning: Expected ${expectedDays} days but got ${accountInsightsData.data.length} days`);
      }

      totals = accountInsightsData.data.reduce((acc: any, day: any) => {
        const daySpend = parseFloat(day.spend || 0);
        const dayClicks = parseInt(day.clicks || 0);
        const dayImpressions = parseInt(day.impressions || 0);
        const dayReach = parseInt(day.reach || 0);
        
        console.log(`📊 Test: Day ${day.date_start}: spend=${daySpend}, clicks=${dayClicks}, impressions=${dayImpressions}`);
        
        return {
          totalSpent: acc.totalSpent + daySpend,
          totalClicks: acc.totalClicks + dayClicks,
          totalImpressions: acc.totalImpressions + dayImpressions,
          totalReach: acc.totalReach + dayReach,
          avgCPC: 0,
          avgCPM: 0,
          avgCTR: 0
        };
      }, totals);

      totals.avgCPC = totals.totalClicks > 0 ? totals.totalSpent / totals.totalClicks : 0;
      totals.avgCPM = totals.totalImpressions > 0 ? (totals.totalSpent / totals.totalImpressions) * 1000 : 0;
      totals.avgCTR = totals.totalImpressions > 0 ? (totals.totalClicks / totals.totalImpressions) * 100 : 0;
    }

    return NextResponse.json({
      dateRange: { since, until },
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
      allDateRanges: testAllRanges(),
      rawData: accountInsightsData.data,
      calculatedTotals: totals,
      sampleDays: accountInsightsData.data ? accountInsightsData.data.slice(0, 3) : []
    });

  } catch (error) {
    console.error('Test: Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' });
  }
} 