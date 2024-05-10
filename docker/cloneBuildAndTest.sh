#!/bin/bash
set -e

yarn install --frozen-lockfile
yarn build

yarn ui-test
yarn upload-video-artifacts
