# macOS Notarization Setup

This document explains how to set up notarization for macOS builds of MQTT Explorer.

## Overview

macOS notarization is a security feature required by Apple for all software distributed outside the Mac App Store. Starting with macOS 10.15 (Catalina), all software must be notarized to run without warnings on macOS.

## Prerequisites

1. An active Apple Developer account
2. Xcode command line tools installed on the build machine
3. An app-specific password for notarization

## Setup Steps

### 1. Create an App-Specific Password

1. Sign in to [appleid.apple.com](https://appleid.apple.com)
2. Navigate to "Sign-In and Security" section
3. Under "App-Specific Passwords", click "Generate an app-specific password"
4. Enter a descriptive name (e.g., "MQTT Explorer Notarization")
5. Copy the generated password (you won't be able to see it again)

### 2. Find Your Team ID

1. Sign in to [developer.apple.com](https://developer.apple.com/account)
2. Navigate to "Membership Details"
3. Copy your Team ID (a 10-character alphanumeric string)

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

- `APPLE_ID`: Your Apple ID email address (e.g., `your.email@example.com`)
- `APPLE_APP_SPECIFIC_PASSWORD`: The app-specific password created in step 1
- `APPLE_TEAM_ID`: Your Team ID from step 2

To add secrets:
1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret" for each of the above

## How It Works

### Build Configuration

The notarization process is configured in `package.json`:

```json
{
  "build": {
    "mac": {
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "res/entitlements.mac.plist",
      "entitlementsInherit": "res/entitlements.mac.inherit.plist"
    },
    "afterSign": "./dist/scripts/notarize.js"
  }
}
```

### Notarization Script

The `scripts/notarize.ts` script handles the notarization process:

1. Checks if the build is for macOS
2. Verifies that required environment variables are set
3. Submits the app to Apple's notarization service
4. Waits for notarization to complete
5. Staples the notarization ticket to the app

### Entitlements

Different entitlements are used for different build types:

- **DMG builds** (regular distribution):
  - `res/entitlements.mac.plist` - Main entitlements
  - `res/entitlements.mac.inherit.plist` - Inherited entitlements for child processes

- **MAS builds** (Mac App Store):
  - `res/entitlements.mas.plist` - App Store specific entitlements

### CI/CD Integration

The GitHub Actions workflow (`platform-builds.yml`) automatically:

1. Builds the macOS app when code is pushed to `release` or `beta` branches
2. Signs the app with the developer certificate
3. Notarizes the app using the configured secrets
4. Publishes the notarized app to GitHub releases

## Troubleshooting

### Notarization Fails

If notarization fails, check:

1. **Credentials**: Ensure all three secrets are correctly set in GitHub
2. **App-specific password**: Verify it hasn't expired or been revoked
3. **Team ID**: Confirm it matches your developer account
4. **Entitlements**: Ensure the entitlements files are valid and appropriate for your app

### Checking Notarization Status

You can check the notarization status of a built app:

```bash
# Check if an app is notarized
spctl -a -vv /path/to/MQTT\ Explorer.app

# Check notarization history
xcrun notarytool history --apple-id your.email@example.com --team-id YOUR_TEAM_ID
```

### Local Testing

To test notarization locally:

```bash
# Set environment variables
export APPLE_ID="your.email@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"
export APPLE_TEAM_ID="YOUR_TEAM_ID"

# Build and notarize
yarn build
yarn package mac
```

## Security Considerations

- Never commit Apple credentials to the repository
- Use app-specific passwords, not your main Apple ID password
- Rotate app-specific passwords periodically
- Limit access to GitHub secrets to trusted maintainers only

## References

- [Apple Notarization Documentation](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [electron-builder Code Signing](https://www.electron.build/code-signing)
- [@electron/notarize](https://github.com/electron/notarize)
