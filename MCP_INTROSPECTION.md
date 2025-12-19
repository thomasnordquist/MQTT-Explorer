# MCP Introspection Support

This document explains how to use MCP (Model Context Protocol) introspection with MQTT Explorer for deterministic testing and automation with tools like GitHub Copilot with Playwright.

## What is MCP Introspection?

MCP introspection allows external tools to interact with and control the MQTT Explorer Electron application through the Chrome DevTools Protocol (CDP). This enables:

- Deterministic automated testing with Playwright
- GitHub Copilot agent mode integration
- Remote debugging and inspection of the application
- Automated UI testing and interaction

## Prerequisites

- Node.js >= 18
- Yarn package manager
- MQTT Explorer built from source

## Quick Start

### Option 1: Using the npm script (Recommended)

```bash
# Build the application first
yarn build

# Start with MCP introspection enabled
yarn start:mcp
```

### Option 2: Using the shell script directly

```bash
# Build the application first
yarn build

# Start with default debugging port (9222)
./scripts/start-with-mcp.sh

# Or specify a custom port
REMOTE_DEBUG_PORT=9223 ./scripts/start-with-mcp.sh
```

### Option 3: Manual electron launch

```bash
# Build the application first
yarn build

# Start with MCP flags
electron . --enable-mcp-introspection --remote-debugging-port=9222
```

## Using with Playwright

Once the application is running with MCP introspection enabled, you can connect to it using Playwright:

```javascript
const { chromium } = require('playwright');

(async () => {
  // Connect to the running Electron app
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  
  // Now you can interact with the page
  await page.screenshot({ path: 'screenshot.png' });
  
  // ... perform your tests ...
  
  await browser.close();
})();
```

## Using with GitHub Copilot Agent Mode

When using GitHub Copilot with Playwright MCP server:

1. Ensure the MCP configuration is set up (see `mcp.json`)
2. Start MQTT Explorer with MCP introspection:
   ```bash
   yarn start:mcp
   ```
3. Use Copilot agent commands to interact with the running application

## Configuration

### MCP Configuration File

The `mcp.json` file in the root directory contains the MCP server configuration for Playwright:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-playwright"
      ],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "0"
      }
    }
  }
}
```

### Remote Debugging Port

The default remote debugging port is `9222`. You can customize it by:

1. Setting the `REMOTE_DEBUG_PORT` environment variable:
   ```bash
   REMOTE_DEBUG_PORT=9223 yarn start:mcp
   ```

2. Passing the `--remote-debugging-port` flag directly:
   ```bash
   electron . --enable-mcp-introspection --remote-debugging-port=9223
   ```

## Troubleshooting

### Port Already in Use

If you get an error that the port is already in use, either:
- Stop the other process using that port
- Use a different port with `REMOTE_DEBUG_PORT` environment variable

### Cannot Connect

Ensure that:
1. The application is running with the `--enable-mcp-introspection` flag
2. The remote debugging port matches between the application and your client
3. No firewall is blocking the connection

## Security Considerations

When running with MCP introspection enabled:

- The application exposes debugging capabilities on a local port
- Only run this in development/testing environments
- Do not expose the debugging port to untrusted networks
- Do not run with introspection in production

## Related Files

- `src/development.ts` - Helper functions for MCP introspection mode
- `src/electron.ts` - Main Electron process with MCP support
- `scripts/start-with-mcp.sh` - Convenience script to start with MCP
- `mcp.json` - MCP server configuration
- `src/spec/demoVideo.ts` - Example Playwright test implementation

## Further Reading

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Electron Remote Debugging](https://www.electronjs.org/docs/latest/tutorial/debugging-main-process)
