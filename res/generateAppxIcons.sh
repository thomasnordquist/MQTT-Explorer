#!/bin/bash

BASE_IMAGE=icon.png

function scale44() {
    convert $BASE_IMAGE -resize "$1"x"$1" appx/Square44x44Logo.targetsize-"$1"_altform-unplated.png
    convert $BASE_IMAGE -resize "$1"x"$1" -resize 66% -gravity center -background transparent -extent "$1"x"$1" appx/Square44x44Logo.targetsize-"$1".png
}

function storeLogo() {
    SCALE=$1
    PIXELS=$2
    convert $BASE_IMAGE -resize "$PIXELS"x"$PIXELS" appx/StoreLogo-scale-"$SCALE"_altform-unplated.png
}

function square150() {
    SCALE=$1
    PIXELS=$2
    PIXELS_SCALED=$[ $PIXELS / 2 ]

    convert $BASE_IMAGE -gravity center -resize "$PIXELS_SCALED"x"$PIXELS_SCALED" -extent "$PIXELS"x"$PIXELS" appx/Square150x150Logo-scale-$SCALE.png
}

function wide310x150() {
    SCALE=$1
    PIXELS_X=$2
    PIXELS_X_SCALED=$[ $PIXELS_X / 2 ]
    PIXELS_Y=$3
    PIXELS_Y_SCALED=$[ $PIXELS_Y / 2 ]

    convert $BASE_IMAGE -gravity center -resize "$PIXELS_X_SCALED"x"$PIXELS_Y_SCALED" -extent "$PIXELS_X"x"$PIXELS_Y" appx/Wide310x150Logo-scale-$SCALE.png
}

# Create Square44x44Logo
convert $BASE_IMAGE -resize 44x44 appx/Square44x44Logo.png
scale44 16
scale44 24
scale44 32
scale44 48
scale44 256

square150 100 150
square150 150 225
square150 200 300
square150 400 600
convert $BASE_IMAGE -gravity center -resize 75x75 -extent 150x150 appx/Square150x150Logo.png

wide310x150 100 310 150
wide310x150 150 465 225
wide310x150 200 620 300
wide310x150 400 1240 600
convert $BASE_IMAGE -gravity center -resize 160x75 -extent 310x150 appx/Wide310x150Logo.png

storeLogo 100 50
storeLogo 150 75
storeLogo 200 100
storeLogo 400 200
convert $BASE_IMAGE -resize 50x50 appx/StoreLogo.png
