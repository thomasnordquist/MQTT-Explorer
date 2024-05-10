#!/bin/bash
function finish {
  set +e
  echo "Exiting, cleaning up.."

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

# Delete old video
rm -f ./app*.mp4
rm -f ./qrawvideorgb24.yuv

# Start recoring in tmux
# tmux new-session -d -s record ffmpeg -f x11grab -draw_mouse 0 -video_size $DIMENSIONS -i :$SCR -codec:v libx264 -r 20 ./app.mp4
tmux new-session -d -s record ffmpeg -f x11grab -draw_mouse 0 -video_size $DIMENSIONS -i :$SCR -r 20 -vcodec rawvideo -pix_fmt yuv420p qrawvideorgb24.yuv

# Start tests
DISPLAY=:$SCR node dist/src/spec/demoVideo.js
TEST_EXIT_CODE=$?
echo "Test script exited with $TEST_EXIT_CODE"

# Stop recording
tmux send-keys -t record q

# Ensure video is written
sleep 5

exit $TEST_EXIT_CODE
