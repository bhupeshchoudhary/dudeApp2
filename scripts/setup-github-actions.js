#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 GitHub Actions Setup for Ratana App');
console.log('=====================================\n');

console.log('📋 Prerequisites Checklist:');
console.log('1. ✅ Expo account (you have this)');
console.log('2. ✅ Google Play Console access (you have this)');
console.log('3. ✅ GitHub repository (you have this)\n');

console.log('🔧 Setup Steps:\n');

console.log('Step 1: Get Expo Token');
console.log('- Go to: https://expo.dev/accounts/[username]/settings/access-tokens');
console.log('- Create a new access token');
console.log('- Copy the token\n');

console.log('Step 2: Set up Google Play Console API');
console.log('- Go to: https://play.google.com/console');
console.log('- Navigate to Setup → API access');
console.log('- Enable Google Play Android Developer API');
console.log('- Create a service account in Google Cloud Console');
console.log('- Download the JSON key file\n');

console.log('Step 3: Add GitHub Secrets');
console.log('- Go to your GitHub repository');
console.log('- Settings → Secrets and Variables → Actions');
console.log('- Add EXPO_TOKEN: [your expo token]');
console.log('- Add GOOGLE_SERVICE_ACCOUNT_KEY: [entire JSON content]\n');

console.log('Step 4: Choose Workflow');
console.log('- deploy.yml: Simple deployment');
console.log('- deploy-with-version.yml: With auto version management');
console.log('- staged-deploy.yml: Internal testing first\n');

console.log('Step 5: Test');
console.log('- Make a small change to your code');
console.log('- Commit and push to main branch');
console.log('- Check Actions tab in GitHub\n');

console.log('📚 Documentation:');
console.log('- See GITHUB_ACTIONS_SETUP.md for detailed instructions');
console.log('- Check EAS documentation: https://docs.expo.dev/eas/');
console.log('- Google Play Console API: https://developers.google.com/android-publisher\n');

console.log('🎯 Next Steps:');
console.log('1. Set up the secrets mentioned above');
console.log('2. Choose your preferred workflow');
console.log('3. Test with a small change');
console.log('4. Monitor the deployment process\n');

console.log('✅ You\'re all set! Happy deploying! 🚀'); 