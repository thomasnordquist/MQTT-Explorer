#!/bin/bash
function finish {
  set +e
  echo "Exiting, cleaning up.."

  echo "Stopping TMUX session (record-mobile).."
  tmux kill-session -t record-mobile || echo "Already stopped"

  if [[ ! -z "$PID_MOSQUITTO" ]]; then
    echo "Stopping mosquitto ($PID_MOSQUITTO).."
    kill "$PID_MOSQUITTO" || echo "Already stopped"
  fi

  if [[ ! -z "$PID_VNC" ]]; then
    echo "Stopping VNC ($PID_VNC).."
    kill "$PID_VNC" || echo "Already stopped"
  fi

  if [[ ! -z "$PID_XVFB" ]]; then
    echo "Stopping XVFB ($PID_XVFB).."
    kill "$PID_XVFB" || echo "Already stopped"
  fi

  if [[ ! -z "$PID_SERVER" ]]; then
    echo "Stopping MQTT Explorer server ($PID_SERVER).."
    kill "$PID_SERVER" || echo "Already stopped"
  fi
}

trap finish EXIT
set -e

# Mobile viewport dimensions (Pixel 6 - height must be even for h264)
DIMENSIONS="412x914"
SCR=99

# Start new window manager
Xvfb :$SCR -screen 0 "$DIMENSIONS"x24 -ac &
export PID_XVFB=$!
sleep 2

# Debug with VNC
x11vnc -localhost -rfbport 5900 -passwd "bierbier" -display :$SCR & 
export PID_VNC=$!

# Start mqtt broker
mosquitto &
export PID_MOSQUITTO=$!
sleep 2
npx -y playwright install

# Start MQTT Explorer in browser mode
export MQTT_EXPLORER_USERNAME=admin
export MQTT_EXPLORER_PASSWORD=password
export MQTT_EXPLORER_SKIP_AUTH=true
export DISPLAY=:$SCR
node dist/src/server.js &
export PID_SERVER=$!
sleep 5

# Delete old video
rm -f ./app-mobile*.mp4
rm -f ./qrawvideorgb24-mobile.yuv

# Start recording in tmux
tmux new-session -d -s record-mobile ffmpeg -f x11grab -draw_mouse 0 -video_size $DIMENSIONS -i :$SCR -r 20 -vcodec rawvideo -pix_fmt yuv420p qrawvideorgb24-mobile.yuv

# Start tests
export BROWSER_MODE_URL=http://localhost:3000
DISPLAY=:$SCR node dist/src/spec/demoVideoMobile.js
TEST_EXIT_CODE=$?
echo "Test script exited with $TEST_EXIT_CODE"

# Stop recording
tmux send-keys -t record-mobile q

# Ensure video is written
sleep 5

exit $TEST_EXIT_CODE
