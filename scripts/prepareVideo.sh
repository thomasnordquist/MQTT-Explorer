#!/bin/bash
# cp app.mp4 original.mp4
ffmpeg -s:v 1024x700 -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24.yuv app2.mp4
# The video starts with a few blank frames, we want to know when the stop
ffprobe -f lavfi -i "movie=app2.mp4,blackdetect[out0]" -show_entries tags=lavfi.black_start,lavfi.black_end -of default=nw=1 -v quiet > ffmpeg_info
END_OF_BLACK=`cat ffmpeg_info | grep end | head -n1 | cut -d'=' -f2`

END_OF_BLACK=`awk "BEGIN {print $END_OF_BLACK+0.8; exit}"`
# Trim black frames at start
ffmpeg -ss $END_OF_BLACK -i app2.mp4 app.mp4
# mv app2.mp4 app.mp4

# ffmpeg -s:v 1024x700 -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24.yuv
# Generate gif palette
# ffmpeg -y -s:v 1024x700 -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24.yuv -vf fps=10,scale=720:-1:flags=lanczos,palettegen palette.png
ffmpeg -y -s:v 1024x700 -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24.yuv -vf fps=10,scale=1024:-1:flags=lanczos,palettegen palette1024.png

# Create gif
# ffmpeg -s:v 1024x700 -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24.yuv -i palette.png -ss $END_OF_BLACK -filter_complex "fps=10,scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse" app.gif
ffmpeg -s:v 1024x700 -r 20 -f rawvideo -pix_fmt yuv420p -i qrawvideorgb24.yuv -i palette1024.png -ss $END_OF_BLACK -filter_complex "fps=10,scale=1024:-1:flags=lanczos[x];[x][1:v]paletteuse" app1024.gif

# Clean up
rm ffmpeg_info palette*.png qrawvideorgb24.yuv

# mv app.mp4 ui-test.mp4
# mv app.gif ui-test.gif
mv app1024.gif ui-test.gif
