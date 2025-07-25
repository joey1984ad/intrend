const fs = require('fs');
const path = require('path');

console.log('🔧 Facebook App Setup Helper');
console.log('=============================\n');

console.log('📋 To fix your Facebook API approval issue, you need to:');
console.log('\n1. Get your Facebook App credentials');
console.log('2. Generate an access token');
console.log('3. Configure your environment');
console.log('4. Make real API calls\n');

console.log('📝 Step 1: Get Your Facebook App Credentials');
console.log('---------------------------------------------');
console.log('1. Go to: https://developers.facebook.com/');
console.log('2. Select your app');
console.log('3. Go to Settings → Basic');
console.log('4. Copy your App ID and App Secret\n');

console.log('🔑 Step 2: Generate Access Token');
console.log('--------------------------------');
console.log('1. Go to: https://developers.facebook.com/tools/explorer/');
console.log('2. Select your app from dropdown');
console.log('3. Click "Get Token" → "Get User Access Token"');
console.log('4. Add these permissions:');
console.log('   - ads_read');
console.log('   - ads_management');
console.log('   - read_insights');
console.log('5. Click "Generate Access Token"');
console.log('6. Copy the token\n');

console.log('⚙️  Step 3: Configure Environment');
console.log('--------------------------------');

const envPath = path.join(__dirname, '..', '.env');
const envContent = `# Facebook App Configuration
# Replace these with your actual Facebook App credentials
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_ACCESS_TOKEN=your_generated_access_token_here

# Optional: Facebook App Domain (for production)
NEXT_PUBLIC_FACEBOOK_APP_DOMAIN=your-domain.com
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with template');
  console.log('📝 Edit the .env file with your actual credentials\n');
} catch (error) {
  console.log('⚠️  Could not create .env file:', error.message);
  console.log('📝 Create .env file manually with the content above\n');
}

console.log('🧪 Step 4: Test Your Configuration');
console.log('---------------------------------');
console.log('After updating .env with your credentials, run:');
console.log('npm run test:facebook\n');

console.log('📈 Step 5: Monitor API Activity');
console.log('--------------------------------');
console.log('1. Run the test script daily for 15 days');
console.log('2. Check your Facebook App Dashboard → Analytics → API Usage');
console.log('3. Ensure successful API calls are being made\n');

console.log('🔄 Step 6: Re-submit for Review');
console.log('--------------------------------');
console.log('After 15 days of successful API calls:');
console.log('1. Go to your Facebook App Dashboard');
console.log('2. Re-submit for Ads Management Standard Access');
console.log('3. Include updated description with real API usage\n');

console.log('📚 For detailed instructions, see: FACEBOOK_API_FIX_GUIDE.md');
console.log('🚀 Your app will be approved once Facebook sees real API activity!'); 