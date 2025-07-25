const fs = require('fs');
const path = require('path');

const envContent = `# Facebook App Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_ACCESS_TOKEN=EAAFeUYIEjjkBPMGj0ZB3bBOOTezkYdbZCW10KZCMADV0FXUdqW9hxbRAWa1Qy9oyYqTIiyNzWZAdsi0xVJZAZBDxHCfMEeej2uTilZAbHrnZCgZC8MJmL4pv3S4eaMyX4DBdxtmRoHrN4wTqQcFE7TFjLeGRjvZAbduB3ENtKi3hyCZCvuzeSYV9JslkD6UG9V5l02EgUoYoy8ZCX8ZAyz7BW1cdN0ErWEYStMorcX2nHByIRtLzT
NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=your-domain.com
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
  console.log('📝 Token length:', envContent.match(/FACEBOOK_ACCESS_TOKEN=(.+)/)[1].length);
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
} 