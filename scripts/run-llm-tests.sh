#!/bin/bash

# LLM Integration Test Runner
# 
# This script runs the live LLM integration tests with proper environment setup.
# 
# Requirements:
# - OpenAI API key or Gemini API key
# - Node.js >= 20
# - All dependencies installed
#
# Usage:
#   ./scripts/run-llm-tests.sh
#
# Or with custom API key:
#   OPENAI_API_KEY=sk-your-key ./scripts/run-llm-tests.sh

set -e

echo "🤖 LLM Integration Test Runner"
echo "================================"
echo ""

# Check for API key
if [ -z "$OPENAI_API_KEY" ] && [ -z "$GEMINI_API_KEY" ] && [ -z "$LLM_API_KEY" ]; then
    echo "❌ Error: No API key found"
    echo ""
    echo "Please set one of the following environment variables:"
    echo "  - OPENAI_API_KEY=sk-your-key"
    echo "  - GEMINI_API_KEY=your-key"
    echo "  - LLM_API_KEY=your-key"
    echo ""
    echo "Example:"
    echo "  OPENAI_API_KEY=sk-... ./scripts/run-llm-tests.sh"
    exit 1
fi

# Detect which API key is set
if [ -n "$OPENAI_API_KEY" ]; then
    echo "✓ OpenAI API key detected (length: ${#OPENAI_API_KEY})"
    export LLM_PROVIDER=${LLM_PROVIDER:-openai}
elif [ -n "$GEMINI_API_KEY" ]; then
    echo "✓ Gemini API key detected (length: ${#GEMINI_API_KEY})"
    export LLM_PROVIDER=${LLM_PROVIDER:-gemini}
elif [ -n "$LLM_API_KEY" ]; then
    echo "✓ Generic LLM API key detected (length: ${#LLM_API_KEY})"
    export LLM_PROVIDER=${LLM_PROVIDER:-openai}
fi

echo "✓ LLM Provider: $LLM_PROVIDER"
echo ""

# Enable live tests
export RUN_LLM_TESTS=true

echo "📋 Test Configuration:"
echo "  - RUN_LLM_TESTS: $RUN_LLM_TESTS"
echo "  - LLM_PROVIDER: $LLM_PROVIDER"
echo ""

echo "🧪 Running tests..."
echo ""

# Navigate to app directory and run tests
cd "$(dirname "$0")/../app"

# Run tests with live LLM integration enabled
yarn test

echo ""
echo "✅ Tests complete!"
