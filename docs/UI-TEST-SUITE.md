# UI Test Suite Documentation

## Overview

The UI test suite validates the core functionality of MQTT Explorer through automated browser tests. These tests are independent, deterministic, and based on the scenarios from the demo video.

## Test Categories

### 1. Connection Management
- **Connect to MQTT broker**: Validates successful connection to an MQTT broker

### 2. Topic Tree Navigation
- **Display topic hierarchy**: Verifies topics are displayed after connection
- **Search and filter topics**: Tests the search functionality

### 3. Message Visualization
- **JSON formatted messages**: Validates JSON message formatting
- **Numeric plots**: Tests chart visualization for numeric topics
- **Message diffs**: Verifies diff display functionality

### 4. Clipboard Operations
- **Copy topic to clipboard**: Tests topic copying functionality
- **Copy value to clipboard**: Tests value copying functionality

### 5. SparkplugB Support
- **Decode SparkplugB messages**: Validates SparkplugB decoding

### 6. Settings and Configuration
- **Settings menu**: Tests opening and displaying settings
- **Advanced connection settings**: Validates advanced connection options

## Running Tests

### Prerequisites

1. **MQTT Broker**: A mosquitto MQTT broker must be running (handled automatically by the test script)
2. **Built Application**: Run `yarn build` before testing
3. **Dependencies**: Install with `yarn install`

### Commands

```bash
# Run UI tests with automated setup (recommended)
./scripts/runUiTests.sh

# Or directly (requires manual MQTT broker setup)
yarn test:ui

# Run demo video generation (different from UI tests)
yarn ui-test
```

**Note:** There are two separate UI-related commands:
- `yarn test:ui` - Runs the automated UI test suite (new)
- `yarn ui-test` - Generates the demo video (existing)

### In CI/CD

The UI tests run in parallel with:
- Unit tests (`test` job)
- Demo video generation (`demo-video` job)

```bash
# Triggered automatically on pull requests
# See .github/workflows/tests.yml
```

## Test Architecture

### Structure

```
src/spec/
├── ui-tests.spec.ts          # Main test suite
├── scenarios/                # Test scenario implementations
│   ├── connect.ts
│   ├── searchTree.ts
│   ├── showNumericPlot.ts
│   └── ...
├── util/                     # Test utilities
│   ├── index.ts
│   └── expandTopic.ts
├── mock-mqtt.ts              # MQTT broker mock
└── mock-sparkplugb.ts        # SparkplugB mock
```

### Test Isolation

Each test:
- Runs independently
- Has its own setup/teardown (handled by Mocha hooks)
- Does not depend on other tests
- Produces deterministic results

### Shared Resources

- **MQTT Mock**: Started once in `before()` hook, stopped in `after()` hook
- **Electron App**: Single instance shared across tests for performance
- **Page Object**: Reused across tests to maintain state

## Best Practices

### 1. Determinism

Tests use explicit waits and assertions:

```typescript
// ✓ Good: Wait for specific elements
await page.locator('//button/span[contains(text(),"Disconnect")]').waitFor()

// ✗ Bad: Fixed delays without verification
await sleep(5000)
```

### 2. Independence

Each test can run in isolation:

```typescript
it('should search topics', async () => {
  // Performs complete search operation
  await searchTree('temp', page)
  // Cleans up state
  await clearSearch(page)
})
```

### 3. Visual Verification

All tests capture screenshots for manual verification:

```typescript
await page.screenshot({ path: 'test-screenshot-connection.png' })
```

## Screenshots

Test screenshots are:
- Saved with `test-screenshot-` prefix
- Excluded from git (in `.gitignore`)
- Uploaded as CI artifacts for review
- Retained for 30 days in GitHub Actions

## Extending Tests

To add a new test:

1. **Create or reuse a scenario** in `src/spec/scenarios/`
2. **Add test case** in `ui-tests.spec.ts`:

```typescript
it('should perform new action', async function () {
  await newScenario(page)
  await sleep(1000)
  
  // Assert expected state
  const element = await page.locator('//selector')
  await expect(element.isVisible()).to.eventually.be.true
  
  // Capture screenshot
  await page.screenshot({ path: 'test-screenshot-new-action.png' })
})
```

3. **Run and verify**: `./scripts/runUiTests.sh`

## Troubleshooting

### Tests timeout

- Increase timeout: `this.timeout(90000)` in test or suite
- Check MQTT broker is running
- Verify Xvfb display server is active

### Screenshots not captured

- Ensure write permissions in working directory
- Check disk space
- Verify path doesn't contain invalid characters

### Connection failures

- Confirm mosquitto is running on port 1883
- Check firewall settings
- Verify mock-mqtt.ts connects properly

## Comparison with Demo Video

| Aspect | Demo Video | UI Test Suite |
|--------|-----------|---------------|
| **Purpose** | Marketing/documentation | Automated testing |
| **Output** | GIF/video file | Test results + screenshots |
| **Runtime** | ~60-120 seconds | ~30-60 seconds |
| **CI Job** | `demo-video` | `ui-tests` |
| **Execution** | Sequential scenarios | Independent test cases |
| **Failure Handling** | Fails entire video | Isolated test failures |

Both share the same scenario implementations in `src/spec/scenarios/`.
