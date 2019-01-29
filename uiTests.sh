#!/bin/bash

SCR=99
# Start new window manager
Xvfb :$SCR -screen 0 1024x800x24 -ac &
PID_XVFB=$!
sleep 2

DISPLAY=:$SCR ./node_modules/.bin/chromedriver --url-base=wd/hub --port=9515 &
PID_CHROMEDRIVER=$!
sleep 2

# Delete old video
rm ./app.mp4

# Start recoring in tmux
tmux new-session -d -s record ffmpeg -f x11grab -video_size 1024x800 -i :$SCR -codec:v libx264 -r 20 ./app.mp4

# Start tests
node dist/src/spec/webdriverio.js

# Stop recording
tmux send-keys -t record q

kill $PID_XVFB $PID_CHROMEDRIVER
