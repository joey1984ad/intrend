const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Facebook SDK for Localhost Development\n');

// Create .env.local content
const envContent = `# Facebook App Configuration for Localhost Development
# Get these from https://developers.facebook.com/

# Replace with your actual Facebook App ID
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here

# Replace with your actual Facebook App Secret
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Optional: Facebook App Domain (for production)
NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=localhost

# Development server URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, '..', '.env.local');

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists');
    console.log('📝 Please update it manually with the following content:\n');
    console.log(envContent);
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
    console.log('📝 Please update it with your actual Facebook App credentials\n');
  }
} catch (error) {
  console.log('❌ Could not create .env.local file:', error.message);
  console.log('📝 Please create it manually with the following content:\n');
  console.log(envContent);
}

console.log('📋 Next Steps:');
console.log('1. Go to https://developers.facebook.com/');
console.log('2. Select your app (or create a new one)');
console.log('3. Go to Settings → Basic');
console.log('4. Copy your App ID and App Secret');
console.log('5. Update .env.local with your credentials');
console.log('6. Configure Facebook App settings (see LOCALHOST_FACEBOOK_SETUP.md)');
console.log('7. Start your dev server: npm run dev');
console.log('8. Test at http://localhost:3000\n');

console.log('🔗 For detailed setup instructions, see: LOCALHOST_FACEBOOK_SETUP.md'); 