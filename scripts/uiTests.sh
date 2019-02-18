#!/bin/bash

function finish {
  echo "Exiting, cleaning up"
  tmux send-keys -t record q || echo "No tmux was running"
  #echo kill $PID_XVFB $PID_CHROMEDRIVER $PID_MOSQUITTO
  #kill $PID_XVFB $PID_CHROMEDRIVER $PID_MOSQUITTO
}

trap finish EXIT

DIMENSIONS="1024x700"
SCR=99
# Start new window manager
Xvfb :$SCR -screen 0 "$DIMENSIONS"x24 -ac &
export PID_XVFB=$!
sleep 2

# Debug with VNC
while [ "$TEST_EXIT_CODE" = "" ]; do x11vnc -localhost -passwd "bierbier" -display :$SCR; done &
export PID_VNC=$!

# Start mqtt broker
mosquitto &
export PID_MOSQUITTO=$!

DISPLAY=:$SCR ./node_modules/.bin/chromedriver --url-base=wd/hub --port=9515 &
export PID_CHROMEDRIVER=$!
sleep 2

# Delete old video
rm ./app.mp4 || echo no need to delete ./app.mp4

# Start recoring in tmux
tmux new-session -d -s record ffmpeg -f x11grab -draw_mouse 0 -video_size $DIMENSIONS -i :$SCR -codec:v libx264 -r 20 ./app.mp4

# Start tests
node dist/src/spec/webdriverio.js
TEST_EXIT_CODE=$?
echo "Webriver exitet with $TEST_EXIT_CODE"

# Stop recording
tmux send-keys -t record q

# Ensure video is written
sleep 5

# Process the video
./scripts/prepareVideo.sh

exit $TEST_EXIT_CODE
