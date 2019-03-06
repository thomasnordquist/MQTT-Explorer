BASE_IMAGE=icon.png

function scale44() {
    convert $BASE_IMAGE -resize "$1"x"$1" appx/Square44x44Logo.targetsize-"$1"_altform-unplated.png
    convert $BASE_IMAGE -resize "$1"x"$1" -resize 66% -gravity center -background transparent -extent "$1"x"$1" appx/Square44x44Logo.targetsize-"$1".png
}

function store150() {
    SCALE=$1
    PIXELS=$2
    PIXELSx2=$[ $2 * 2 ]
    convert $BASE_IMAGE -gravity center -resize "$PIXELS"x"$PIXELS" -resize 50% -extent "$PIXELS"x"$PIXELS" appx/Square150x150Logo-scale-$SCALE.png
    convert $BASE_IMAGE -gravity center -resize "$PIXELS"x"$PIXELS" -resize 50% -extent "$PIXELS"x"$PIXELSx2" appx/Square150x300Logo-scale-$SCALE.png
}

# Create Square44x44Logo
convert $BASE_IMAGE -resize 44x44 appx/Square44x44Logo.png
scale44 16
scale44 24
scale44 32
scale44 48
scale44 256

store150 100 150
store150 150 225
store150 200 300
store150 300 450
store150 400 600
