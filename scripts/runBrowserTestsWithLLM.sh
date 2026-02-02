#!/bin/bash
# Browser Mode Test Runner with LLM Support
# 
# This script runs UI tests against the browser mode server with LLM features enabled.
# It starts a mosquitto MQTT broker automatically and cleans it up on exit.
# The broker address is configured via environment variables.
#
# Environment Variables:
#   MQTT_EXPLORER_USERNAME - Username for browser authentication (default: test)
#   MQTT_EXPLORER_PASSWORD - Password for browser authentication (default: test123)
#   PORT - Server port (default: 3000)
#   BROWSER_MODE_URL - URL for browser tests (set automatically)
#   TESTS_MQTT_BROKER_HOST - MQTT broker host for tests (required, default: 127.0.0.1)
#   TESTS_MQTT_BROKER_PORT - MQTT broker port for tests (default: 1883)
#   USE_MOBILE_VIEWPORT - Enable mobile viewport (default: false, set to 'true' for mobile tests)
#   OPENAI_API_KEY - OpenAI API key for LLM features (required for LLM tests)
#   GEMINI_API_KEY - Gemini API key alternative (optional)
#   LLM_API_KEY - Generic LLM API key (optional)
#   LLM_PROVIDER - LLM provider to use: 'openai' or 'gemini' (default: openai)
#
set -e

function finish {
  set +e
  echo "Exiting, cleaning up.."

  if [[ ! -z "$PID_SERVER" ]]; then
    echo "Stopping server ($PID_SERVER).."
    kill "$PID_SERVER" || echo "Already stopped"
  fi

  if [[ ! -z "$PID_MOSQUITTO" ]]; then
    echo "Stopping mosquitto ($PID_MOSQUITTO).."
    kill "$PID_MOSQUITTO" || echo "Already stopped"
  fi
}

trap finish EXIT

# Check for LLM API key
if [[ -z "$OPENAI_API_KEY" ]] && [[ -z "$GEMINI_API_KEY" ]] && [[ -z "$LLM_API_KEY" ]]; then
  echo "Error: No LLM API key found!"
  echo "Please set one of: OPENAI_API_KEY, GEMINI_API_KEY, or LLM_API_KEY"
  echo ""
  echo "Example:"
  echo "  OPENAI_API_KEY=sk-... ./scripts/runBrowserTestsWithLLM.sh"
  exit 1
fi

# Determine which API key is set
if [[ -n "$OPENAI_API_KEY" ]]; then
  echo "Using OpenAI API key (length: ${#OPENAI_API_KEY})"
  export LLM_PROVIDER=${LLM_PROVIDER:-openai}
elif [[ -n "$GEMINI_API_KEY" ]]; then
  echo "Using Gemini API key (length: ${#GEMINI_API_KEY})"
  export LLM_PROVIDER=${LLM_PROVIDER:-gemini}
elif [[ -n "$LLM_API_KEY" ]]; then
  echo "Using generic LLM API key (length: ${#LLM_API_KEY})"
  export LLM_PROVIDER=${LLM_PROVIDER:-openai}
fi

echo "LLM Provider: $LLM_PROVIDER"

# Start mqtt broker
mosquitto &
export PID_MOSQUITTO=$!
sleep 1
npx -y playwright install

# Set credentials for browser authentication (tests will use these to login)
export MQTT_EXPLORER_USERNAME=${MQTT_EXPLORER_USERNAME:-test}
export MQTT_EXPLORER_PASSWORD=${MQTT_EXPLORER_PASSWORD:-test123}
export PORT=${PORT:-3000}

# Start the browser mode server with LLM support
echo "Starting server with LLM support..."
node dist/src/server.js &
export PID_SERVER=$!

# Wait for server to be ready (max 60 seconds)
echo "Waiting for server to start..."
for i in {1..60}; do
  if curl -f --connect-timeout 5 --max-time 10 http://localhost:${PORT} > /dev/null 2>&1; then
    echo "Server started successfully after $i seconds"
    break
  fi
  if [ $i -eq 60 ]; then
    echo "Server failed to start within 60 seconds"
    exit 1
  fi
  sleep 1
done

# Run browser tests
export BROWSER_MODE_URL="http://localhost:${PORT}"
export TESTS_MQTT_BROKER_HOST="${TESTS_MQTT_BROKER_HOST:-127.0.0.1}"
export TESTS_MQTT_BROKER_PORT="${TESTS_MQTT_BROKER_PORT:-1883}"
# Enable mobile viewport for mobile UI tests
export USE_MOBILE_VIEWPORT="${USE_MOBILE_VIEWPORT:-false}"

echo "Using MQTT broker at $TESTS_MQTT_BROKER_HOST:$TESTS_MQTT_BROKER_PORT"
if [ "$USE_MOBILE_VIEWPORT" = "true" ]; then
  echo "Mobile viewport: ENABLED (412x914)"
else
  echo "Mobile viewport: DISABLED (desktop 1280x720)"
fi

yarn test:browser
TEST_EXIT_CODE=$?

echo "Browser tests exited with $TEST_EXIT_CODE"
exit $TEST_EXIT_CODE
