# CI/CD Pipeline Documentation

## Overview

MQTT Explorer uses GitHub Actions for continuous integration and testing. The pipeline tests both Electron (desktop) and browser modes.

## Workflows

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
  5. Upload test video to S3
  6. Display test results in GitHub summary

**Artifacts**: UI test video (GIF format) uploaded to S3

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
