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
2. **Include screenshots** - Visual verification is required for UI changes
3. **Handle asynchronous operations properly** - This is an MQTT message queue tool

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
