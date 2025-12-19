#!/bin/bash

# Script to launch MQTT Explorer with MCP introspection enabled
# This allows tools like GitHub Copilot with Playwright MCP to interact with the app

REMOTE_DEBUG_PORT="${REMOTE_DEBUG_PORT:-9222}"

echo "Starting MQTT Explorer with MCP introspection enabled"
echo "Remote debugging port: $REMOTE_DEBUG_PORT"
echo ""
echo "You can now use Playwright MCP or other debugging tools to connect to the app"
echo "Connect to: http://localhost:$REMOTE_DEBUG_PORT"
echo ""

# Build the app if needed
if [ ! -d "dist" ]; then
  echo "Building the app..."
  yarn build
fi

# Start the app with MCP introspection flags
electron . --enable-mcp-introspection --remote-debugging-port=$REMOTE_DEBUG_PORT "$@"
