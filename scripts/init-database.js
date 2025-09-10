const { initDatabase } = require('../lib/db.ts');

async function runInit() {
  try {
    console.log('🔄 Initializing database schema...');
    await initDatabase();
    console.log('✅ Database schema initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

runInit();
