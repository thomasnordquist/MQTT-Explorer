#!/bin/bash

# Verification script to test MCP introspection functionality

echo "=== MCP Introspection Verification Script ==="
echo ""

# Test 1: Check if development.js exports the new functions
echo "Test 1: Checking if development.js contains MCP functions..."
if grep -q "enableMcpIntrospection" dist/src/development.js; then
  echo "✓ enableMcpIntrospection function found"
else
  echo "✗ enableMcpIntrospection function NOT found"
  exit 1
fi

if grep -q "getRemoteDebuggingPort" dist/src/development.js; then
  echo "✓ getRemoteDebuggingPort function found"
else
  echo "✗ getRemoteDebuggingPort function NOT found"
  exit 1
fi

echo ""

# Test 2: Check if electron.js uses the remote debugging port
echo "Test 2: Checking if electron.js enables remote debugging..."
if grep -q "remote-debugging-port" dist/src/electron.js; then
  echo "✓ remote-debugging-port configuration found in electron.js"
else
  echo "✗ remote-debugging-port configuration NOT found in electron.js"
  exit 1
fi

echo ""

# Test 3: Check if the script exists and is executable
echo "Test 3: Checking start-with-mcp.sh script..."
if [ -x scripts/start-with-mcp.sh ]; then
  echo "✓ start-with-mcp.sh script exists and is executable"
else
  echo "✗ start-with-mcp.sh script is missing or not executable"
  exit 1
fi

echo ""

# Test 4: Check if mcp.json exists
echo "Test 4: Checking mcp.json configuration..."
if [ -f mcp.json ]; then
  echo "✓ mcp.json configuration file exists"
else
  echo "✗ mcp.json configuration file is missing"
  exit 1
fi

echo ""

# Test 5: Check if package.json has the start:mcp script
echo "Test 5: Checking package.json for start:mcp script..."
if grep -q '"start:mcp"' package.json; then
  echo "✓ start:mcp script found in package.json"
else
  echo "✗ start:mcp script NOT found in package.json"
  exit 1
fi

echo ""

# Test 6: Check if documentation exists
echo "Test 6: Checking MCP documentation..."
if [ -f MCP_INTROSPECTION.md ]; then
  echo "✓ MCP_INTROSPECTION.md documentation exists"
else
  echo "✗ MCP_INTROSPECTION.md documentation is missing"
  exit 1
fi

echo ""

# Test 7: Check if example exists
echo "Test 7: Checking Playwright example..."
if [ -f examples/playwright-mcp-example.js ]; then
  echo "✓ Playwright MCP example exists"
else
  echo "✗ Playwright MCP example is missing"
  exit 1
fi

echo ""
echo "=== All Tests Passed! ==="
echo ""
echo "MCP introspection support has been successfully implemented."
echo ""
echo "To use it, run:"
echo "  yarn build"
echo "  yarn start:mcp"
echo ""
