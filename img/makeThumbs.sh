convert screen1.png -resize 33% screen1_small.png
convert screen2.png -resize 33% screen2_small.png
convert screen3.png -resize 33% screen3_small.png
convert screen_dark_mode.png -resize 33% screen_dark_mode_small.png

convert -size 2560x1600 xc:black -fill white -draw "polygon 0,0 0,2560 2200,0" framemask.png
convert screen_dark_mode.png framemask.png -alpha off -compose copy_opacity -composite first_half.png
convert -respect-parenthesis screen4.png \( framemask.png -negate \) -alpha off -compose copy_opacity -composite second_half.png
convert *_half.png -compose over -composite screen-composite.png

convert screen-composite.png -resize 33% screen-composite_small.png
rm framemask.png *_half.png

optipng *.png
