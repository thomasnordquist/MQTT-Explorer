#!/bin/bash
cp app.mp4 original.mp4
# The video starts with a few blank frames, we want to know when the stop
ffprobe -f lavfi -i "movie=app.mp4,blackdetect[out0]" -show_entries tags=lavfi.black_start,lavfi.black_end -of default=nw=1 -v quiet > ffmpeg_info
END_OF_BLACK=`cat ffmpeg_info | grep end | head -n1 | cut -d'=' -f2`

END_OF_BLACK=$[ $END_OF_BLACK + 2.2 ]
# Trim black frames at start
ffmpeg -ss $END_OF_BLACK -i app.mp4 app2.mp4
mv app2.mp4 app.mp4

# Generate gif palette
ffmpeg -y -i app.mp4 -vf fps=10,scale=720:-1:flags=lanczos,palettegen palette.png

# Create gif
ffmpeg -i app.mp4 -i palette.png -filter_complex "fps=10,scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse" app.gif

# Clean up
rm ffmpeg_info palette.png

mv app.mp4 ui-test.mp4
mv app.gif ui-test.gif
