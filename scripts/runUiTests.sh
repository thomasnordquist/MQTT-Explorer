#!/bin/bash
set -e

function finish {
  set +e
  echo "Exiting, cleaning up.."

  if [[ ! -z "$PID_MOSQUITTO" ]]; then
    echo "Stopping mosquitto ($PID_MOSQUITTO).."
    kill "$PID_MOSQUITTO" || echo "Already stopped"
  fi

  if [[ ! -z "$PID_XVFB" ]]; then
    echo "Stopping XVFB ($PID_XVFB).."
    kill "$PID_XVFB" || echo "Already stopped"
  fi
}

trap finish EXIT

DIMENSIONS="1024x720"
SCR=99

# Start new window manager
Xvfb :$SCR -screen 0 "$DIMENSIONS"x24 -ac &
export PID_XVFB=$!
sleep 2

# Start mqtt broker with test configuration
mosquitto -c mosquitto-test.conf &
export PID_MOSQUITTO=$!
sleep 2
echo "Mosquitto started with PID: $PID_MOSQUITTO"

# Run UI tests
DISPLAY=:$SCR yarn test:ui
TEST_EXIT_CODE=$?

echo "UI tests exited with $TEST_EXIT_CODE"
exit $TEST_EXIT_CODE
