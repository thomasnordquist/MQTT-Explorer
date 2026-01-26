# Docker Fix Testing - CI Environment Limitations

## Issue
The CI environment has network restrictions that prevent Docker builds from downloading npm/yarn dependencies, resulting in ETIMEDOUT errors during `yarn install` inside Docker builds.

## Testing Approach

Since we cannot build the full Docker image in CI, we verify the fix works through equivalent testing:

### 1. **Local Build** (Equivalent to Docker Build)
```bash
yarn build:server
```
This produces `dist/src/server.js` - the exact file that runs in the Docker container.

### 2. **Server Execution Test**
```bash
node dist/src/server.js
```
Runs the same compiled code that the Docker container runs.

### 3. **Header Verification Test**
```bash
node src/spec/docker-header-test.mjs
```
Tests from outside the server (like a real user) using Playwright to verify:
- Headers are not sent
- Page loads from different origins (localhost + 127.0.0.1)
- No console errors

### 4. **Integration Tests**
```bash
./scripts/runBrowserTests.sh
```
Runs comprehensive browser-mode tests to ensure no regressions.

## Why This Verifies the Docker Fix

1. **Same Code**: `dist/src/server.js` tested locally IS what runs in Docker
   - Dockerfile line 39: `COPY --from=builder /build/dist ./dist`
   - Dockerfile line 69: `CMD ["node", "dist/src/server.js"]`

2. **Same Behavior**: Node.js executes JavaScript identically whether in Alpine Linux (Docker) or the test environment

3. **Same Configuration**: The helmet configuration in `src/server.ts` compiles to `dist/src/server.js` and behaves identically

## Dockerfile Verification

The `Dockerfile.browser` correctly:
- ✅ Builds: `RUN yarn build:server` (line 19)
- ✅ Copies: `COPY --from=builder /build/dist ./dist` (line 39)
- ✅ Runs: `CMD ["node", "dist/src/server.js"]` (line 69)

## Production Deployment

The official pre-built images at `ghcr.io/thomasnordquist/mqtt-explorer:*` are built by the main CI pipeline which has proper network access and will include this fix once merged.

## Test Results

### Header Verification ✅
```
localhost:3000 test:  ✅ PASSED
127.0.0.1:3000 test:  ✅ PASSED

All problematic headers correctly disabled:
  ✓ origin-agent-cluster: (not set)
  ✓ cross-origin-embedder-policy: (not set)
  ✓ cross-origin-opener-policy: (not set)
  ✓ cross-origin-resource-policy: (not set)
```

### Integration Tests ✅
```
8 passing (1m)
  ✓ Connection management
  ✓ Tree navigation
  ✓ Search functionality
  ✓ Clipboard operations
  ✓ File operations
```

## Manual Verification Steps

If you want to verify the Docker image manually with network access:

```bash
# Build the image
docker build -f Dockerfile.browser -t mqtt-explorer:test .

# Run the container
docker run -d -p 3000:3000 \
  -e MQTT_EXPLORER_SKIP_AUTH=true \
  mqtt-explorer:test

# Test with curl
curl -I http://localhost:3000 | grep -i "origin\|cross"
# Should show no origin-agent-cluster or cross-origin headers

# Test with browser
# Open http://localhost:3000 and http://127.0.0.1:3000
# Both should load without blank pages
```
