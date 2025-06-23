# GitHub Actions Setup for Automatic Deployment

This guide will help you set up automatic deployment to Google Play Store using GitHub Actions.

## Prerequisites

1. **Expo Account**: Make sure you're logged in to Expo CLI
2. **Google Play Console**: Access to your app in Google Play Console
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Get Expo Token

1. Go to [Expo Settings](https://expo.dev/accounts/[username]/settings/access-tokens)
2. Create a new access token
3. Copy the token (you'll need this for GitHub Secrets)

## Step 2: Set up Google Play Console API

1. **Enable Google Play Console API**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Navigate to Setup → API access
   - Enable the Google Play Android Developer API

2. **Create Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Play Android Developer API
   - Go to IAM & Admin → Service Accounts
   - Create a new service account
   - Download the JSON key file

3. **Grant Permissions**:
   - In Google Play Console, go to Setup → API access
   - Add your service account email
   - Grant "Release apps to testing tracks" permission

## Step 3: Set up GitHub Secrets

In your GitHub repository, go to **Settings → Secrets and Variables → Actions** and add:

1. **EXPO_TOKEN**: Your Expo access token
2. **GOOGLE_SERVICE_ACCOUNT_KEY**: The entire content of your service account JSON file

## Step 4: Choose Your Workflow

You have two workflow options:

### Option 1: Simple Deployment (`deploy.yml`)
- Basic deployment without version management
- Good for testing the setup

### Option 2: Enhanced Deployment (`deploy-with-version.yml`)
- Automatically increments version numbers
- Commits version changes back to repository
- Better error handling and notifications

## Step 5: Test the Setup

1. Make a small change to your code
2. Commit and push to the `main` branch
3. Go to your GitHub repository → Actions tab
4. Monitor the workflow execution

## Workflow Details

### What happens when you push to main:

1. **Checkout**: Downloads your latest code
2. **Setup**: Installs Node.js and dependencies
3. **Version Update**: (Enhanced workflow only) Increments version numbers
4. **Build**: Creates Android App Bundle using EAS
5. **Submit**: Uploads to Google Play Store
6. **Cleanup**: Removes sensitive files

### Deployment Tracks

- **Production**: Direct to production (live users)
- **Internal**: Internal testing track (safer for testing)

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check EAS build logs
   - Ensure all dependencies are properly installed
   - Verify app.json configuration

2. **Submit Fails**:
   - Verify Google Service Account permissions
   - Check if version code is higher than previous
   - Ensure app bundle is properly signed

3. **Version Conflicts**:
   - Manually update version in app.json if needed
   - Check Google Play Console for current version

### Useful Commands:

```bash
# Test EAS build locally
eas build --platform android --profile production

# Test EAS submit locally
eas submit --platform android --latest

# Check build status
eas build:list
```

## Security Notes

- Never commit sensitive keys to your repository
- Use GitHub Secrets for all sensitive data
- Regularly rotate your Expo and Google service account tokens
- Monitor GitHub Actions logs for any security issues

## Next Steps

1. **Set up notifications**: Configure Slack/Discord notifications for deployment status
2. **Add testing**: Include automated tests in your workflow
3. **Staged releases**: Use internal → alpha → beta → production tracks
4. **Rollback strategy**: Keep previous builds available for quick rollback

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify all secrets are properly set
3. Test EAS commands locally first
4. Check Expo and Google Play Console documentation 