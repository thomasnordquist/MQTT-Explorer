# MCP Introspection Support

MQTT Explorer supports MCP (Model Context Protocol) introspection for automated testing with Playwright.

## Configuration

The `mcp.json` file contains the MCP server configuration for Playwright integration.

## Technical Details

When the `--enable-mcp-introspection` flag is used, the application enables Chrome DevTools Protocol on port 9222 (default) for remote debugging and automation.

See `.github/copilot-instructions.md` for usage instructions and testing guidelines.
