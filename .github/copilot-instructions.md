# GitHub Copilot Agent Instructions for MQTT Explorer

## Project Setup

### Building and Running

```bash
# Install dependencies
yarn install

# Build the project
yarn build

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

## MCP Introspection Testing

The project supports MCP (Model Context Protocol) for automated testing with Playwright:

- Use `yarn test:mcp` to run automated UI tests
- Tests launch the app with remote debugging enabled on port 9222
- Connect to `http://localhost:9222` via Chrome DevTools Protocol

## Project Structure

- `app/` - Frontend React application
- `backend/` - Backend models, tests, and connection management
- `src/` - Electron main process and bindings
- `src/spec/` - Test specifications including MCP introspection tests

## Important Notes

- Always run `yarn build` before starting the application
- The app uses Electron (see `package.json` for version)
- MQTT communication is handled via [mqttjs](https://github.com/mqttjs/MQTT.js)
- All code changes should pass linting (`yarn lint`)
