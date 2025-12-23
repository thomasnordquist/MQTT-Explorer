# CI/CD Pipeline Documentation

## Overview

MQTT Explorer uses GitHub Actions for continuous integration and testing. The pipeline tests both Electron (desktop) and browser modes.

## Workflows

### Test Workflow (`.github/workflows/tests.yml`)

This workflow runs on pull requests to `master`, `beta`, and `release` branches.

### Docker Browser Build Workflow (`.github/workflows/docker-browser.yml`)

This workflow builds and publishes a Docker image for the browser mode.

**Triggers**:
- Push to `master`, `beta`, or `release` branches (when relevant files change)
- Schedule: Runs every two weeks (1st and 15th of each month at 2:00 AM UTC)
- Manual trigger via workflow_dispatch

**Platforms**: 
- linux/amd64 (x86-64)
- linux/arm64 (Raspberry Pi 3/4/5, Apple Silicon)
- linux/arm/v7 (Raspberry Pi 2/3)

**Image Registry**: GitHub Container Registry (ghcr.io/thomasnordquist/mqtt-explorer)

**Tags**:
- `latest` - Latest build from master branch
- `master` - Latest build from master
- `beta` - Latest build from beta branch
- `release` - Latest build from release branch
- `<branch>-<sha>` - Specific commit builds

**Steps**:
1. Build Docker image with multi-stage build
2. Test basic startup with test credentials
3. Test health check
4. Verify HTTP response
5. Test data directory creation
6. Check Docker image size
7. Start container for frontend tests
8. Test frontend bundles (app.bundle.js, vendors.bundle.js)
9. Push image to GitHub Container Registry
10. Generate build attestation for supply chain security

**Image Features**:
- Multi-stage build for minimal size
- Alpine Linux base with Node.js 24 (~200MB final image)
- Multi-platform support (amd64, arm64, arm/v7)
- Non-root user (UID 1001)
- Health check endpoint
- Proper signal handling with dumb-init
- Persistent data volume at `/app/data`

### Test Workflow (`.github/workflows/tests.yml`)

This workflow runs on pull requests to `master`, `beta`, and `release` branches.

#### Jobs

##### 1. `test` - Electron Mode Tests

Tests the traditional Electron desktop application:

- **Environment**: Custom Docker container (`ghcr.io/thomasnordquist/mqtt-explorer-ui-tests:latest`)
- **Steps**:
  1. Install dependencies with frozen lockfile
  2. Build the Electron application
  3. Run unit tests (app + backend)
  4. Run UI tests with video recording
  5. Upload test video to S3 with 90-day expiration tag
  6. Post demo video to PR as comment
  7. Display test results in GitHub summary

**Artifacts**: 
- UI test video (GIF format) uploaded to S3 using AWS CLI
- Video is tagged with `expiration=90days` for automatic lifecycle deletion
- Video is posted to the PR thread as an embedded image
- Videos expire after 90 days via S3 lifecycle policy

##### 2. `test-browser` - Browser Mode Tests

Tests the new browser/server mode:

- **Environment**: Ubuntu latest with Node.js 20
- **Services**:
  - **Mosquitto MQTT Broker**: Eclipse Mosquitto v2 on port 1883
    - Health checks enabled
    - Anonymous connections allowed
- **Steps**:
  1. Setup Node.js 20
  2. Install dependencies
  3. Build browser mode (`yarn build:server`)
  4. Run unit tests (app + backend)
  5. Start server in background with test credentials
  6. Wait for server to be ready
  7. Run browser smoke tests
  8. Clean up server process

**Environment Variables**:
- `MQTT_EXPLORER_USERNAME=test`
- `MQTT_EXPLORER_PASSWORD=test123`
- `PORT=3000`

## Test Commands

The following npm scripts are used in CI/CD:

```bash
# Unit tests
yarn test              # Run all tests (app + backend)
yarn test:app          # Frontend tests only
yarn test:backend      # Backend tests only

# Build
yarn build             # Build Electron mode
yarn build:server      # Build browser mode

# UI Tests (Electron only)
yarn ui-test           # Run UI tests with video recording
```

## Adding New Tests

### For Electron Mode

Add tests to the `test` job. UI tests should be added to the test suite that `yarn ui-test` runs.

### For Browser Mode

Browser-specific tests should:
1. Use the pre-configured Mosquitto service
2. Connect to `mqtt://mosquitto:1883`
3. Test server endpoints at `http://localhost:3000`

Example:
```yaml
- name: Browser Integration Test
  run: |
    # Test MQTT connection through server
    curl -X POST http://localhost:3000/api/test
```

## Local Testing

### Docker Browser Mode

```bash
# Build the image locally (for your platform)
docker build -f Dockerfile.browser -t mqtt-explorer:local .

# Build for specific platform (e.g., Raspberry Pi)
docker buildx build --platform linux/arm64 -f Dockerfile.browser -t mqtt-explorer:local-arm64 .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e MQTT_EXPLORER_USERNAME=test \
  -e MQTT_EXPLORER_PASSWORD=test123 \
  mqtt-explorer:local

# Test the server
curl http://localhost:3000

# Check logs
docker logs <container-id>

# Stop and remove
docker stop <container-id>
docker rm <container-id>
```

See [DOCKER.md](DOCKER.md) for complete documentation.

### Electron Mode

```bash
yarn build
yarn test
yarn ui-test
```

### Browser Mode

```bash
# Start Mosquitto in Docker
docker run -d -p 1883:1883 eclipse-mosquitto:2

# Build and test
yarn build:server
yarn test

# Start server
MQTT_EXPLORER_USERNAME=test MQTT_EXPLORER_PASSWORD=test123 yarn start:server

# Run manual tests
curl http://localhost:3000
```

## GitHub Codespaces / Devcontainer

The repository includes a devcontainer configuration that automatically sets up:
- Node.js 20
- MQTT broker (Mosquitto)
- All development dependencies
- Port forwarding for development

See [.devcontainer/README.md](.devcontainer/README.md) for details.

## S3 Configuration for Demo Videos

### Required S3 Lifecycle Policy

Demo videos uploaded from PRs are tagged with `expiration=90days` and require an S3 lifecycle policy to automatically delete them after 90 days.

**Important**: The `video.mp4` file in the gh-pages branch is NOT tagged and will NOT expire.

#### Setting up the Lifecycle Policy

1. Create a file named `s3-lifecycle-pr-videos.json`:

```json
{
  "Rules": [
    {
      "ID": "ExpirePRDemoVideosAfter90Days",
      "Status": "Enabled",
      "Filter": {
        "Tag": {
          "Key": "expiration",
          "Value": "90days"
        }
      },
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

2. Apply the policy to your S3 bucket:

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket YOUR_BUCKET_NAME \
  --lifecycle-configuration file://s3-lifecycle-pr-videos.json
```

3. Verify the policy:

```bash
aws s3api get-bucket-lifecycle-configuration --bucket YOUR_BUCKET_NAME
```

#### How It Works

- **PR demo videos**: Uploaded with filename pattern `pr-{number}-{timestamp}.gif` and tagged with:
  - `expiration=90days` - Used by lifecycle policy for automatic deletion
  - `Source=github-actions` - Identifies source of upload
  - `Type=pr-demo-video` - Categorizes the object type
- **S3 lifecycle rule**: Automatically deletes objects tagged with `expiration=90days` after 90 days
- **Upload mechanism**: AWS CLI v2 is installed directly, authentication is configured via `aws-actions/configure-aws-credentials@v4` GitHub Action, then `aws s3api put-object` is used with object tagging support
- **gh-pages video**: `video.mp4` in gh-pages branch is served from GitHub Pages, not S3, so it persists indefinitely

#### Required AWS Credentials

The workflow requires the following secrets/variables:
- `vars.AWS_KEY_ID` - AWS access key ID (requires `s3:PutObject` and `s3:PutObjectTagging` permissions)
- `secrets.AWS_SECRET_ACCESS_KEY` - AWS secret access key
- `vars.AWS_BUCKET` - S3 bucket name
- AWS region: `eu-central-1` (hardcoded in workflow)

The S3 bucket must have:
- **Bucket policy for public read access**: Since ACLs are disabled (BucketOwnerEnforced), a bucket policy must grant public read access to uploaded objects
- Object tagging enabled
- Lifecycle policy configured as described above

**Example S3 Bucket Policy for Public Read Access**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

The workflow uses AWS CLI v2 installed directly and `aws-actions/configure-aws-credentials@v4` action for secure credential management.

## Troubleshooting

### Browser Tests Failing

1. **Server won't start**: Check if port 3000 is already in use
2. **MQTT connection fails**: Ensure Mosquitto service is healthy
3. **Timeout errors**: Increase timeout in "Wait for Server" step

### Electron Tests Failing

1. **UI tests timeout**: Check if the Docker container has display access
2. **Build fails**: Verify all dependencies are in yarn.lock

## Future Improvements

- [ ] Add E2E browser tests with Playwright
- [ ] Test WebSocket connections in browser mode
- [ ] Add performance benchmarks
- [ ] Test with different MQTT broker versions
- [ ] Add security scanning for browser mode
