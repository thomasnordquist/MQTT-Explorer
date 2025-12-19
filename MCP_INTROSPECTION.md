# MCP Introspection Support

MQTT Explorer supports MCP (Model Context Protocol) introspection for automated testing with Playwright.

## Usage

Start the application with MCP introspection enabled:

```bash
yarn build
electron . --enable-mcp-introspection
```

This enables remote debugging via Chrome DevTools Protocol on port 9222.

## Testing

Run the automated test:

```bash
yarn test:mcp
```

## Configuration

The default remote debugging port is 9222. You can customize it:

```bash
electron . --enable-mcp-introspection --remote-debugging-port=9223
```

## For Developers

When writing tests for this MQTT message queue tool:
- Tests must be deterministic
- Account for asynchronous message sending/receiving
- Use proper wait strategies for MQTT message propagation
- Take screenshots to verify UI state
