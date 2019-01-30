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
  yarn
cd ..

# Build
yarn
yarn build
rm -rf node_modules
yarn install --production

rm -rf app/node_modules

cd "$ORIGINAL_DIR"
