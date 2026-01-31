#!/bin/bash

# Script to set up environment variables for LLM tests
# This script writes injected secrets to a .env file for easy sourcing

set -e

ENV_FILE=".env.llm-tests"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "========================================"
echo "  LLM Test Environment Setup           "
echo "========================================"
echo ""

# Check for injected secrets
if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ OPENAI_API_KEY found in environment"
    echo "export OPENAI_API_KEY='$OPENAI_API_KEY'" > "$ENV_FILE"
    echo "export RUN_LLM_TESTS=true" >> "$ENV_FILE"
    echo ""
    echo "✅ Created $ENV_FILE with OPENAI_API_KEY"
elif [ -n "$GEMINI_API_KEY" ]; then
    echo "✅ GEMINI_API_KEY found in environment"
    echo "export GEMINI_API_KEY='$GEMINI_API_KEY'" > "$ENV_FILE"
    echo "export RUN_LLM_TESTS=true" >> "$ENV_FILE"
    echo ""
    echo "✅ Created $ENV_FILE with GEMINI_API_KEY"
elif [ -n "$LLM_API_KEY" ]; then
    echo "✅ LLM_API_KEY found in environment"
    echo "export LLM_API_KEY='$LLM_API_KEY'" > "$ENV_FILE"
    echo "export LLM_PROVIDER='${LLM_PROVIDER:-openai}'" >> "$ENV_FILE"
    echo "export RUN_LLM_TESTS=true" >> "$ENV_FILE"
    echo ""
    echo "✅ Created $ENV_FILE with LLM_API_KEY"
else
    echo "❌ No API key found in environment"
    echo ""
    echo "To create the .env file manually, run:"
    echo "  echo 'export OPENAI_API_KEY=sk-your-key' > $ENV_FILE"
    echo "  echo 'export RUN_LLM_TESTS=true' >> $ENV_FILE"
    echo ""
    exit 1
fi

# Make the file readable only by the current user for security
chmod 600 "$ENV_FILE"

echo ""
echo "To use the environment variables:"
echo "  source $ENV_FILE"
echo "  ./scripts/run-llm-tests.sh"
echo ""
echo "Or in a single command:"
echo "  source $ENV_FILE && ./scripts/run-llm-tests.sh"
echo ""
echo "⚠️  Remember: Never commit $ENV_FILE to version control!"
echo "    (It's already in .gitignore)"
