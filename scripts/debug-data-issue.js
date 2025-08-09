const { DateTime } = require('luxon');

// Debug script to identify data fetching issues
async function debugDataIssue() {
  console.log('🔍 Debugging Meta SDK data fetching issues...\n');

  // Test different timezone scenarios
  const timezones = ['America/New_York', 'UTC', 'Europe/London', 'Asia/Tokyo'];
  
  timezones.forEach(timezone => {
    console.log(`\n🌍 Testing timezone: ${timezone}`);
    
    const today = DateTime.now().setZone(timezone).startOf('day');
    const last30Days = today.minus({ days: 29 });
    const last7Days = today.minus({ days: 6 });
    
    console.log(`  Today (${timezone}): ${today.toISO()}`);
    console.log(`  Last 30 days start: ${last30Days.toISO()}`);
    console.log(`  Last 7 days start: ${last7Days.toISO()}`);
    console.log(`  Date range (30d): ${last30Days.toISODate()} to ${today.toISODate()}`);
    console.log(`  Date range (7d): ${last7Days.toISODate()} to ${today.toISODate()}`);
    
    // Check if today is included
    const daysIn30d = today.diff(last30Days, 'days').days + 1;
    const daysIn7d = today.diff(last7Days, 'days').days + 1;
    
    console.log(`  Days in 30d range: ${daysIn30d}`);
    console.log(`  Days in 7d range: ${daysIn7d}`);
  });

  // Test the exact logic from the API routes
  console.log('\n🔧 Testing API route logic...');
  
  const testTimezone = 'America/New_York';
  const today = DateTime.now().setZone(testTimezone).startOf('day');
  
  // Test different date ranges
  const dateRanges = ['last_7d', 'last_30d', 'last_90d'];
  
  dateRanges.forEach(range => {
    let sinceDate, untilDate;
    
    if (range === 'last_7d') {
      sinceDate = today.minus({ days: 6 });
      untilDate = today.endOf('day'); // This includes the full current day
    } else if (range === 'last_30d') {
      sinceDate = today.minus({ days: 29 });
      untilDate = today.endOf('day'); // This includes the full current day
    } else if (range === 'last_90d') {
      sinceDate = today.minus({ days: 89 });
      untilDate = today.endOf('day'); // This includes the full current day
    }
    
    const since = sinceDate.toISODate();
    const until = untilDate.toISODate();
    const expectedDays = untilDate.diff(sinceDate, 'days').days + 1;
    
    console.log(`\n📅 ${range}:`);
    console.log(`  Since: ${since} (${sinceDate.toISO()})`);
    console.log(`  Until: ${until} (${untilDate.toISO()})`);
    console.log(`  Expected days: ${expectedDays}`);
    console.log(`  Includes today: ${untilDate.hasSame(today, 'day')}`);
  });

  // Test potential issues
  console.log('\n⚠️ Potential issues identified:');
  console.log('1. Timezone mismatch between account timezone and server timezone');
  console.log('2. Date range calculation not including the current day properly');
  console.log('3. Facebook API returning incomplete data for recent days');
  console.log('4. Data processing logic filtering out recent days');
  
  console.log('\n🔧 Recommended fixes:');
  console.log('1. Ensure timezone consistency between frontend and backend');
  console.log('2. Add more detailed logging for date range calculations');
  console.log('3. Implement data validation to check for missing days');
  console.log('4. Add fallback logic for incomplete data');
}

// Run the debug function
debugDataIssue().catch(console.error); 