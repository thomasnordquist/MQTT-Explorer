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
