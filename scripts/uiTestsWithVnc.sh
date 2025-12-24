#!/bin/bash
function finish {
  set +e
  echo "Exiting, cleaning up.."

  echo "Stopping noVNC server.."
  pkill -f "websockify.*6080" || echo "Already stopped"

  echo "Stopping TMUX session (record).."
  tmux kill-session -t record || echo "Already stopped"

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
}

trap finish EXIT
set -e

DIMENSIONS="1024x720"
SCR=99

# Setup noVNC if not already done
if [ ! -d "/tmp/noVNC" ]; then
  echo "noVNC not found. Running setup..."
  ./scripts/setup-novnc.sh
fi

# Start new window manager
echo "Starting Xvfb..."
Xvfb :$SCR -screen 0 "$DIMENSIONS"x24 -ac &
export PID_XVFB=$!
sleep 2

# Start VNC server
echo "Starting VNC server..."
x11vnc -localhost -rfbport 5900 -passwd "bierbier" -display :$SCR & 
export PID_VNC=$!
sleep 1

# Start noVNC web server
echo "Starting noVNC web server on port 6080..."
/tmp/noVNC/utils/novnc_proxy --vnc localhost:5900 --listen 6080 &
export PID_NOVNC=$!
sleep 2

# Start mqtt broker
echo "Starting mosquitto..."
mosquitto &
export PID_MOSQUITTO=$!
sleep 1

# Delete old video
rm -f ./app*.mp4
rm -f ./qrawvideorgb24.yuv

# Start recording in tmux
echo "Starting screen recording..."
tmux new-session -d -s record ffmpeg -f x11grab -draw_mouse 0 -video_size $DIMENSIONS -i :$SCR -r 20 -vcodec rawvideo -pix_fmt yuv420p qrawvideorgb24.yuv

echo ""
echo "=========================================="
echo "🎥 UI Test Environment Ready!"
echo "=========================================="
echo ""
echo "📺 View the test in your browser:"
echo "   1. Open the 'PORTS' tab in VS Code"
echo "   2. Find port 6080 and click 'Open in Browser'"
echo "   3. Click 'Connect' (password: bierbier)"
echo ""
echo "Starting tests in 3 seconds..."
echo ""
sleep 3

# Start tests
DISPLAY=:$SCR node dist/src/spec/demoVideo.js
TEST_EXIT_CODE=$?
echo "Test script exited with $TEST_EXIT_CODE"

# Stop recording
tmux send-keys -t record q

# Ensure video is written
sleep 5

echo ""
echo "=========================================="
echo "✅ Tests completed!"
echo "=========================================="
echo ""

exit $TEST_EXIT_CODE
