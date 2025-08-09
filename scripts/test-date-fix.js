const { DateTime } = require('luxon');

// Test the date range calculation fix
function testDateRanges() {
  console.log('🧪 Testing date range calculations...');
  
  const accountTimezone = 'America/New_York';
  const today = DateTime.now().setZone(accountTimezone).startOf('day');
  
  console.log(`📅 Today (${accountTimezone}): ${today.toISO()}`);
  console.log(`📅 Today start of day: ${today.startOf('day').toISO()}`);
  console.log(`📅 Today end of day: ${today.endOf('day').toISO()}`);
  
  // Test the old way (problematic)
  const oldUntilDate = today;
  console.log(`❌ Old until date: ${oldUntilDate.toISO()}`);
  
  // Test the new way (fixed)
  const newUntilDate = today.plus({ days: 1 }).minus({ milliseconds: 1 });
  console.log(`✅ New until date: ${newUntilDate.toISO()}`);
  
  // Test different date ranges
  const dateRanges = ['last_7d', 'last_30d', 'last_90d', 'last_12m'];
  
  dateRanges.forEach(range => {
    console.log(`\n📊 Testing ${range}:`);
    
    let sinceDate, untilDate;
    
    if (range === 'last_7d') {
      sinceDate = today.minus({ days: 6 });
      untilDate = today.plus({ days: 1 }).minus({ milliseconds: 1 });
    } else if (range === 'last_30d') {
      sinceDate = today.minus({ days: 29 });
      untilDate = today.plus({ days: 1 }).minus({ milliseconds: 1 });
    } else if (range === 'last_90d') {
      sinceDate = today.minus({ days: 89 });
      untilDate = today.plus({ days: 1 }).minus({ milliseconds: 1 });
    } else if (range === 'last_12m') {
      sinceDate = today.minus({ months: 11 }).startOf('month');
      untilDate = today.endOf('day');
    }
    
    const since = sinceDate.toISODate();
    const until = untilDate.toISODate();
    const expectedDays = untilDate.diff(sinceDate, 'days').days + 1;
    
    console.log(`  Since: ${since}`);
    console.log(`  Until: ${until}`);
    console.log(`  Expected days: ${expectedDays}`);
    console.log(`  Date range: ${sinceDate.toISO()} to ${untilDate.toISO()}`);
  });
}

// Test timezone handling
function testTimezoneHandling() {
  console.log('\n🌍 Testing timezone handling...');
  
  const timezones = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo'];
  
  timezones.forEach(tz => {
    const tzToday = DateTime.now().setZone(tz).startOf('day');
    const tzUntil = tzToday.plus({ days: 1 }).minus({ milliseconds: 1 });
    
    console.log(`\n${tz}:`);
    console.log(`  Today start: ${tzToday.toISO()}`);
    console.log(`  Until date: ${tzUntil.toISO()}`);
    console.log(`  Local time: ${tzToday.toLocaleString(DateTime.DATETIME_FULL)}`);
  });
}

// Run tests
testDateRanges();
testTimezoneHandling();

console.log('\n✅ Date range fix test completed!'); 