#!/bin/bash
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

# Disable authentication for browser tests
export MQTT_EXPLORER_SKIP_AUTH=true
export PORT=${PORT:-3000}

# Start the browser mode server
node dist/src/server.js &
export PID_SERVER=$!

# Wait for server to be ready (max 60 seconds)
echo "Waiting for server to start..."
for i in {1..60}; do
  if curl -f http://localhost:${PORT} > /dev/null 2>&1; then
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
