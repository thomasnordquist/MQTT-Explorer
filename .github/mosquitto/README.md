# Mosquitto Test Image

This directory contains a custom mosquitto Docker image for CI testing.

## Purpose

The mosquitto 2.x default configuration has `allow_anonymous false`, which prevents test connections with empty credentials. This custom image pre-configures mosquitto to allow anonymous connections for testing purposes.

## Configuration

The image is built with the following mosquitto configuration:
- `listener 1883` - Listen on port 1883
- `allow_anonymous true` - Allow anonymous connections
- `persistence false` - Disable persistence for tests

## Building the Image

The image is automatically built and published to GitHub Container Registry by the `build-mosquitto.yml` workflow when:
- Changes are pushed to master/beta/release branches that modify this Dockerfile
- The workflow is manually triggered

## Usage in Workflows

The image is used in GitHub Actions workflows as:

```yaml
services:
  mosquitto:
    image: ghcr.io/thomasnordquist/mqtt-explorer/mosquitto-test:latest
    ports:
      - 1883:1883
    options: >-
      --health-cmd "mosquitto_sub -t '$SYS/#' -C 1"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

## Local Testing

To build and test locally:

```bash
docker build -t mosquitto-test .
docker run -d -p 1883:1883 mosquitto-test
mosquitto_pub -h localhost -t test/topic -m "hello"
```
