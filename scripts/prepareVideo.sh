#!/bin/bash
DIMENSIONS="1024x720"
GIF_SCALE="1024"

ffmpeg -s:v $DIMENSIONS -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24.yuv app2.mp4

# The video starts with a few blank frames, we want to know when the stop
ffprobe -f lavfi -i "movie=app2.mp4,blackdetect[out0]" -show_entries tags=lavfi.black_start,lavfi.black_end -of default=nw=1 -v quiet > ffmpeg_info
END_OF_BLACK=`cat ffmpeg_info | grep end | head -n1 | cut -d'=' -f2`

# Remove grey frames at the beginning (app start and splash screen)
END_OF_BLACK=`awk "BEGIN {print $END_OF_BLACK+0.8; exit}"`

# Trim black frames at start
ffmpeg -s:v $DIMENSIONS -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24.yuv -ss $END_OF_BLACK  app.mp4

# Generate gif palette
ffmpeg -y -s:v $DIMENSIONS -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24.yuv -vf "fps=10,scale=$GIF_SCALE:-1:flags=lanczos,palettegen" palette1024.png

# Create gif
ffmpeg -s:v $DIMENSIONS -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24.yuv -i palette1024.png -ss $END_OF_BLACK -filter_complex "fps=10,scale=$GIF_SCALE:-1:flags=lanczos[x];[x][1:v]paletteuse" app720.gif

# Clean up
rm ffmpeg_info palette*.png qrawvideorgb24.yuv

mv app.mp4 ui-test.mp4
mv app720.gif ui-test.gif

# Cut video into segments based on scenes.json
echo "Cutting video into segments..."
if [ -f "scenes.json" ]; then
  ./scripts/cutVideoSegments.sh
else
  echo "Warning: scenes.json not found, skipping segment creation"
fi

