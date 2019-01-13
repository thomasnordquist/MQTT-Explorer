#!/bin/bash
set -e

ORIGINAL_DIR=`pwd`
DIR=build/clean

rm -rf "$DIR" || echo "Directory did not exist"
mkdir -p "$DIR"

git clone .git "$DIR"
cd $DIR


# App
cd app
  npm install
cd ..

# Backend
cd backend
  npm install;
  #npm run test
cd ..

# Build
npm run build
rm -rf app/node_modules
cd "$ORIGINAL_DIR"

exit 0
docker run --rm -ti \
 --env ELECTRON_CACHE="/root/.cache/electron" \
 --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
 --env GH_TOKEN="$GH_TOKEN" \
 -v ${PWD}:/project \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 electronuserland/builder:wine node_modules/.bin/ts-node build.ts
