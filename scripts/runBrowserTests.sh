#!/bin/bash
# Browser Mode Test Runner
# 
# This script runs UI tests against the browser mode server (instead of Electron).
# It starts a local mosquitto MQTT broker and the MQTT Explorer server, then runs
# the test suite using Playwright with a headless Chrome browser.
#
# Environment Variables:
#   MQTT_EXPLORER_USERNAME - Username for browser authentication (default: test)
#   MQTT_EXPLORER_PASSWORD - Password for browser authentication (default: test123)
#   PORT - Server port (default: 3000)
#   BROWSER_MODE_URL - URL for browser tests (set automatically)
#   MQTT_BROKER_HOST - MQTT broker host for tests (default: 127.0.0.1)
#   MQTT_BROKER_PORT - MQTT broker port for tests (default: 1883)
#
set -e

function finish {
  set +e
  echo "Exiting, cleaning up.."

  if [[ ! -z "$PID_MOSQUITTO" ]]; then
    echo "Stopping mosquitto ($PID_MOSQUITTO).."
    kill "$PID_MOSQUITTO" || echo "Already stopped"
  fi

  if [[ ! -z "$PID_SERVER" ]]; then
    echo "Stopping server ($PID_SERVER).."
    kill "$PID_SERVER" || echo "Already stopped"
  fi
}

trap finish EXIT

# Start mqtt broker
mosquitto &
export PID_MOSQUITTO=$!
sleep 1

# Set credentials for browser authentication (tests will use these to login)
export MQTT_EXPLORER_USERNAME=${MQTT_EXPLORER_USERNAME:-test}
export MQTT_EXPLORER_PASSWORD=${MQTT_EXPLORER_PASSWORD:-test123}
export PORT=${PORT:-3000}

# Start the browser mode server
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
export MQTT_BROKER_HOST="127.0.0.1"
export MQTT_BROKER_PORT="1883"

yarn test:browser
TEST_EXIT_CODE=$?

echo "Browser tests exited with $TEST_EXIT_CODE"
exit $TEST_EXIT_CODE
