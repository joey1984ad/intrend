#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Google OAuth Setup Helper');
console.log('=============================\n');

console.log('To fix Google Sign-In, you need to:\n');

console.log('1. 📝 Go to Google Cloud Console:');
console.log('   https://console.cloud.google.com/\n');

console.log('2. 🆔 Create OAuth 2.0 credentials:');
console.log('   - Create a new project or select existing');
console.log('   - Enable Google+ API');
console.log('   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"');
console.log('   - Set application type to "Web application"\n');

console.log('3. 🔗 Add authorized redirect URIs:');
console.log('   - http://localhost:3000/api/auth/google/callback (for development)');
console.log('   - https://yourdomain.com/api/auth/google/callback (for production)\n');

console.log('4. 📋 Copy the credentials and add to your .env.local file:\n');

const envContent = `# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
`;

console.log(envContent);

console.log('5. 🔄 Restart your development server after adding the environment variables\n');

console.log('6. 🧪 Test the configuration:');
console.log('   - Go to /signup page');
console('   - Look for the "Google Sign-In Configuration Test" section');
console.log('   - It should show "✅ Set" for Client ID\n');

console.log('7. 🚀 Try Google Sign-In again!\n');

console.log('❓ If you still have issues:');
console.log('   - Check browser console for errors');
console.log('   - Verify redirect URI matches exactly in Google Cloud Console');
console.log('   - Ensure environment variables are loaded (restart dev server)');
console.log('   - Check that the API route /api/auth/google/callback exists\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('GOOGLE_CLIENT_ID')) {
    console.log('✅ .env.local file exists and contains Google configuration');
  } else {
    console.log('⚠️  .env.local file exists but missing Google configuration');
  }
} else {
  console.log('❌ .env.local file not found. Please create it with the configuration above.');
}
