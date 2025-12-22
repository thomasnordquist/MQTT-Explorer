#!/bin/bash
# Quick one-liner to run MQTT Explorer in browser mode with demo credentials
# 
# This pulls and runs the latest dev image from GitHub Container Registry
# Demo credentials: username=demo, password=demo (ephemeral, for testing only)
#
# Usage: ./run-demo.sh

docker run --rm -p 3000:3000 \
  -e MQTT_EXPLORER_USERNAME=demo \
  -e MQTT_EXPLORER_PASSWORD=demo \
  ghcr.io/thomasnordquist/mqtt-explorer:dev

# Alternative: If you prefer Docker Hub (uncomment below and comment above)
# docker run --rm -p 3000:3000 \
#   -e MQTT_EXPLORER_USERNAME=demo \
#   -e MQTT_EXPLORER_PASSWORD=demo \
#   thomasnordquist/mqtt-explorer:dev
