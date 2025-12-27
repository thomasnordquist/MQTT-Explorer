#!/bin/bash
# Mobile demo video post-processing script
# Converts raw mobile video to MP4 and GIF, then cuts into segments

DIMENSIONS="412x914"
GIF_SCALE="412"

ffmpeg -s:v $DIMENSIONS -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24-mobile.yuv app2-mobile.mp4

# The video starts with a few blank frames, we want to know when they stop
ffprobe -f lavfi -i "movie=app2-mobile.mp4,blackdetect[out0]" -show_entries tags=lavfi.black_start,lavfi.black_end -of default=nw=1 -v quiet > ffmpeg_info_mobile
END_OF_BLACK=`cat ffmpeg_info_mobile | grep end | head -n1 | cut -d'=' -f2`

# Remove grey frames at the beginning (app start and splash screen)
END_OF_BLACK=`awk "BEGIN {print $END_OF_BLACK+0.8; exit}"`

# Trim black frames at start
ffmpeg -s:v $DIMENSIONS -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24-mobile.yuv -ss $END_OF_BLACK app-mobile.mp4

# Generate gif palette
ffmpeg -y -s:v $DIMENSIONS -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24-mobile.yuv -vf "fps=10,scale=$GIF_SCALE:-1:flags=lanczos,palettegen" palette-mobile.png

# Create gif
ffmpeg -s:v $DIMENSIONS -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24-mobile.yuv -i palette-mobile.png -ss $END_OF_BLACK -filter_complex "fps=10,scale=$GIF_SCALE:-1:flags=lanczos[x];[x][1:v]paletteuse" app-mobile.gif

# Clean up
rm ffmpeg_info_mobile palette-mobile.png qrawvideorgb24-mobile.yuv app2-mobile.mp4

mv app-mobile.mp4 ui-test-mobile.mp4
mv app-mobile.gif ui-test-mobile.gif

# Cut video into segments based on scenes-mobile.json
echo "Cutting mobile video into segments..."
if [ -f "scenes-mobile.json" ]; then
  node ./scripts/cutVideoSegmentsMobile.js
else
  echo "Warning: scenes-mobile.json not found, skipping segment creation"
fi
