#!/bin/bash
set -e

yarn ui-test
yarn upload-video-artifacts
