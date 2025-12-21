# GitHub Copilot Agent Instructions for MQTT Explorer

## Overview

MQTT Explorer is an Electron-based desktop application for exploring MQTT brokers. It provides a comprehensive UI for connecting to MQTT brokers, browsing topics, and analyzing message flows.

## Git Commit and PR Guidelines

### Commit Messages

**ALWAYS** use semantic commit message format:

```
<type>: <description>

[optional body]

[optional footer]
```

**Required types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring without changing functionality
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `build:` - Changes to build system or dependencies
- `ci:` - Changes to CI configuration files and scripts
- `chore:` - Other changes that don't modify src or test files

**Examples:**
```bash
feat: add support for MQTT 5.0 protocol
fix: resolve connection timeout issue with SSL/TLS
docs: update installation instructions for Node.js 24
test: add unit tests for message parsing
```

### Pull Request Titles

**ALWAYS** use the same semantic format for PR titles:

```
<type>: <concise description>
```

**Examples:**
- `feat: add WebSocket support for browser mode`
- `fix: prevent memory leak in topic tree rendering`
- `docs: improve agent instructions clarity`

## Working Principles

### Be Thorough and Complete

1. **Always validate your changes** - Run tests, linters, and builds to ensure nothing breaks
2. **Deliver complete solutions** - Don't leave partial implementations or half-fixed bugs
3. **Test edge cases** - Consider and handle error conditions, edge cases, and failure scenarios
4. **Verify the fix works** - Manually test the functionality you changed, take screenshots for UI changes
5. **Follow through** - If a test fails, debug and fix it; don't leave broken tests behind

### Quality Standards

- **Completeness**: Ensure all aspects of the issue are addressed
- **Correctness**: Verify changes work as expected through testing
- **Consistency**: Follow existing code patterns and conventions
- **Clarity**: Write clear code with meaningful variable/function names
- **Minimal changes**: Make surgical, focused changes that solve the problem without unnecessary refactoring

## Technology Stack

- **Frontend**: React 18.x with Material-UI v5/v6
- **Backend**: Node.js with TypeScript
- **Desktop Framework**: Electron 39.x
- **MQTT Client**: [mqttjs](https://github.com/mqttjs/MQTT.js) v5.x
- **State Management**: Redux with redux-thunk
- **Build Tools**: webpack, TypeScript compiler
- **Testing**: Mocha + Chai for unit tests, Playwright for browser mode tests
- **Node.js**: Version 24 or higher required

## Project Setup

### Building and Running

```bash
# Install dependencies
yarn install

# Build the project
yarn build

# Set password for browser testing
export MQTT_EXPLORER_USERNAME=admin
export MQTT_EXPLORER_PASSWORD=secretpassword

# Start the application
yarn start

# Start in development mode
yarn dev
```

### Running with MCP Introspection (for testing)

```bash
# Build first
yarn build

# Start with MCP introspection enabled
electron . --enable-mcp-introspection

# Or with custom port
electron . --enable-mcp-introspection --remote-debugging-port=9223
```

See `mcp.json` in the repository root for MCP configuration.

## Writing Tests

### Requirements for All Tests

1. **Tests MUST be deterministic** - They should produce the same results every time they run
2. **Tests MUST be independent** - Each test should be able to run in isolation without depending on other tests
3. **Include screenshots** - Visual verification is required for UI changes
4. **Handle asynchronous operations properly** - This is an MQTT message queue tool

### Best Practices for UI Tests

#### 1. Use Given-When-Then Pattern
Structure tests with clear Given-When-Then comments to make them readable:

```typescript
it('Given a JSON message sent to topic foo/bar/baz, the tree should display nested topics', async function () {
  // Given: Mock MQTT publishes JSON to foo/bar/baz
  // When: We wait for the topic to appear in the tree
  // Then: Topic hierarchy should be visible (foo -> bar -> baz)
})
```

#### 2. Wait for Elements, Don't Use Fixed Delays
Prefer `waitFor` over `sleep` whenever possible:

```typescript
// ✓ Good: Wait for specific element
const topic = await page.locator('span[data-test-topic="kitchen"]')
await topic.waitFor({ state: 'visible', timeout: 5000 })

// ✗ Bad: Fixed delay without verification
await sleep(5000)
```

#### 3. Use Meaningful Assertions
Every test should have explicit assertions that verify the expected state:

```typescript
// ✓ Good: Explicit assertion with meaningful message
const treeNodes = await page.locator('[class*="TreeNode"]')
const count = await treeNodes.count()
expect(count).to.be.greaterThan(0, 'Topic tree should contain nodes')

// ✗ Bad: No assertion, only screenshot
await page.screenshot({ path: 'test.png' })
```

#### 4. Test Data-Driven Scenarios
Write tests that describe the data flow:

```typescript
it('Given messages sent to livingroom/lamp/state and livingroom/lamp/brightness, both should appear under livingroom/lamp', async function () {
  // Test implementation verifies the specific data flow
})
```

#### 5. Use Data Test Attributes
Leverage `data-test-*` attributes for reliable selectors:

```typescript
// ✓ Good: Use data-test attributes
const topic = await page.locator('span[data-test-topic="kitchen"]')

// ⚠ Acceptable: Use role/text when data attributes aren't available
const button = await page.locator('//button/span[contains(text(),"Connect")]')

// ✗ Bad: Rely on CSS classes that may change
const topic = await page.locator('.MuiTreeItem-label')
```

#### 6. Verify Multiple Aspects
Test should verify both state and UI:

```typescript
// Verify the action completed
const isVisible = await disconnectButton.isVisible()
expect(isVisible).to.be.true

// Capture screenshot for visual verification
await page.screenshot({ path: 'test-screenshot-connection.png' })
```

#### 7. Handle MQTT Asynchronous Nature
Account for message propagation time:

```typescript
// Publish message
await mockClient.publish('topic/name', 'value')

// Wait for UI to update
await page.locator(`text="value"`).waitFor({ timeout: 5000 })

// Verify state
const value = await page.textContent('.message-value')
expect(value).toBe('value')
```

### Handling MQTT Asynchronous Operations

MQTT is inherently asynchronous. When writing tests:

- **Wait for message propagation**: Use proper wait strategies (e.g., `await page.waitForSelector()`, `await sleep()`)
- **Don't assume immediate updates**: Messages take time to send, receive, and update the UI
- **Use event-based waiting**: Wait for specific UI elements or state changes rather than fixed timeouts when possible
- **Account for network latency**: MQTT broker communication involves network round trips

### Example Test Pattern

```typescript
// 1. Perform action (e.g., publish message)
await publishMessage(topic, payload)

// 2. Wait for UI to update (not just arbitrary sleep)
await page.waitForSelector(`text="${expectedValue}"`, { timeout: 5000 })

// 3. Verify state
const value = await page.textContent('.message-value')
expect(value).toBe(expectedValue)

// 4. Take screenshot for verification
await page.screenshot({ path: 'test-result.png' })
```

### Running Tests

```bash
# Run all tests
yarn test

# Run specific test suites
yarn test:app
yarn test:backend
yarn test:mcp

# Run linters
yarn lint
yarn lint:fix
```

### Running UI Tests (yarn test:ui)

The UI tests require specific setup in the test environment:

**Prerequisites:**
1. **Xvfb (X Virtual Framebuffer)** - Required for headless Electron testing
   ```bash
   # Start Xvfb on display :99
   Xvfb :99 -screen 0 1024x720x24 -ac &
   export DISPLAY=:99
   ```

2. **Mosquitto MQTT Broker** - Required for MQTT message testing
   ```bash
   # Install mosquitto
   sudo apt-get install -y mosquitto mosquitto-clients
   
   # Start mosquitto service
   sudo systemctl start mosquitto
   
   # Verify it's running on port 1883
   sudo systemctl status mosquitto
   ```

3. **@types/node** - Required for TypeScript compilation
   ```bash
   yarn add -D @types/node
   ```

**Running UI Tests:**
```bash
# Build the application first
yarn build

# Run UI tests with proper display
DISPLAY=:99 yarn test:ui
```

**Common Issues:**
- **"Timeout exceeded" in before hook**: Mosquitto is not running or not accessible on port 1883
- **"Cannot find type definition file for 'node'"**: Run `yarn add -D @types/node`
- **Electron fails to launch**: Xvfb is not running or DISPLAY variable not set
- **Tests hang**: Check if old Electron/mosquitto processes are still running and kill them

**Environment Cleanup:**
```bash
# Kill old Electron processes
ps aux | grep electron | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null

# Kill old mosquitto processes (if running custom instance)
ps aux | grep mosquitto | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null
```

## MCP Introspection Testing

The project supports MCP (Model Context Protocol) for automated testing:

- Run tests: `yarn test:mcp`
- Configuration: `mcp.json` in repository root
- Tests launch the app with remote debugging on port 9222

## Project Structure

- `app/` - Frontend React application
- `backend/` - Backend models, tests, and connection management
- `src/` - Electron main process and bindings
- `src/spec/` - Test specifications including MCP introspection tests

## Code Style and Formatting

### Linting

The project uses TSLint with Airbnb config and Prettier for code formatting:

```bash
# Run all linters
yarn lint

# Run linters individually
yarn lint:prettier    # Check Prettier formatting
yarn lint:tslint      # Check TSLint rules
yarn lint:spellcheck  # Check spelling in code

# Auto-fix issues
yarn lint:fix         # Fix TSLint and Prettier issues
yarn lint:tslint:fix  # Fix TSLint issues only
yarn lint:prettier:fix # Fix Prettier issues only
```

### Code Style Rules

- **Semicolons**: Never use semicolons (enforced by TSLint and Prettier)
- **Quotes**: Single quotes for strings
- **Indentation**: 2 spaces
- **Line length**: Maximum 120 characters (Prettier) / 200 characters (TSLint)
- **Arrow functions**: No parentheses for single parameters (`x => x + 1`)
- **Trailing commas**: Required for multiline objects and arrays (ES5 compatible)

### TypeScript Guidelines

- Enable strict null checks and no implicit any
- Use TypeScript interfaces for data structures
- Prefer `const` over `let`, avoid `var`
- Use type inference when possible, explicit types when clarity is needed

## Dependency Management

### Adding Dependencies

```bash
# Add to root project
yarn add <package-name>

# Add to app (frontend)
cd app && yarn add <package-name>

# Add to backend
cd backend && yarn add <package-name>

# Add dev dependencies
yarn add -D <package-name>
```

### Important Dependency Notes

- Main dependencies are in the root `package.json`
- Frontend React app has its own dependencies in `app/package.json`
- Backend models and logic have dependencies in `backend/package.json`
- Always use `--frozen-lockfile` in CI to ensure reproducible builds
- Run `yarn install` after pulling changes that modify `yarn.lock`

## Debugging

### Development Mode

```bash
# Start with hot reload for frontend
yarn dev

# This runs two processes in parallel:
# 1. webpack-dev-server for the React app (port varies)
# 2. Electron in development mode with the --development flag
```

### Debugging TypeScript

- Source maps are enabled in `tsconfig.json`
- Use `ts-node` for running TypeScript files directly
- Backend tests can be debugged with: `cd backend && yarn test-inspect`

### Common Issues

- **Build fails**: Clear `dist/` and `app/build/` directories, then rebuild
- **Electron won't start**: Ensure `yarn build` completed successfully
- **Tests fail**: Check if MQTT broker (mosquitto) is running for integration tests
- **UI not updating**: In dev mode, ensure webpack-dev-server is running

## Deployment and Packaging

### Creating Releases

```bash
# Prepare release (updates version, changelog)
yarn prepare-release

# Package the application for distribution
yarn package

# Package with Docker (for consistent builds)
yarn package-with-docker
```

### Release Workflow

- **Semantic commits required**: All commits must use semantic format (`feat:`, `fix:`, etc.)
- **Beta releases**: Create PR to `beta` branch with semantic commits
- **Production releases**: Create PR to `release` branch with semantic commits
- Semantic-release automatically handles versioning and changelog based on commit messages
- Builds are created for Windows, macOS, and Linux

### Build Artifacts

- Output directory: `build/`
- Supported formats: DMG (macOS), EXE/NSIS (Windows), AppImage/Snap (Linux), AppX (Windows Store)
- Code signing is configured via `res/` directory certificates and provisioning profiles

## Important Notes

- **Always build first**: Run `yarn build` before starting the application
- **Node.js requirement**: Version 24 or higher
- **Linting**: All code changes must pass `yarn lint`
- **MQTT library**: Communication handled via [mqttjs](https://github.com/mqttjs/MQTT.js)
- **Workspace structure**: Separate package.json files for root, app, and backend
