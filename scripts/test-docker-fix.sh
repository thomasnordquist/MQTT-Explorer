#!/bin/bash
# Docker-based test for MQTT Explorer
# This script builds the Docker image and tests it with Playwright

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Docker-based Test for MQTT Explorer${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Cleaning up...${NC}"
    
    if [ ! -z "$CONTAINER_ID" ]; then
        echo "Stopping container $CONTAINER_ID..."
        docker stop $CONTAINER_ID 2>/dev/null || true
        docker rm $CONTAINER_ID 2>/dev/null || true
    fi
    
    if [ ! -z "$MOSQUITTO_PID" ]; then
        echo "Stopping mosquitto (PID: $MOSQUITTO_PID)..."
        kill $MOSQUITTO_PID 2>/dev/null || true
    fi
}

trap cleanup EXIT

# Check if mosquitto is already running
if pgrep mosquitto > /dev/null; then
    echo -e "${GREEN}✓ Mosquitto is already running${NC}"
    MOSQUITTO_PID=""
else
    # Start mosquitto for testing
    echo -e "${YELLOW}Starting mosquitto MQTT broker...${NC}"
    mosquitto -v &
    MOSQUITTO_PID=$!
    sleep 2
    
    # Check if mosquitto is running
    if ! ps -p $MOSQUITTO_PID > /dev/null; then
        echo -e "${RED}Failed to start mosquitto${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Mosquitto started (PID: $MOSQUITTO_PID)${NC}"
fi

# Build Docker image with retries and better error handling
echo ""
echo -e "${YELLOW}Building Docker image...${NC}"
echo "This may take several minutes as it downloads dependencies and builds the app..."

# Try building with buildkit for better caching and network handling
export DOCKER_BUILDKIT=1

BUILD_SUCCESS=false
MAX_RETRIES=2

for i in $(seq 1 $MAX_RETRIES); do
    echo "Build attempt $i of $MAX_RETRIES..."
    
    if docker build \
        -f Dockerfile.browser \
        -t mqtt-explorer:test \
        --progress=plain \
        . 2>&1 | tee /tmp/docker-build.log; then
        
        BUILD_SUCCESS=true
        break
    else
        echo -e "${YELLOW}Build attempt $i failed${NC}"
        
        if [ $i -lt $MAX_RETRIES ]; then
            echo "Retrying in 5 seconds..."
            sleep 5
        fi
    fi
done

if [ "$BUILD_SUCCESS" = false ]; then
    echo -e "${RED}❌ Docker build failed after $MAX_RETRIES attempts${NC}"
    echo ""
    echo "Last 50 lines of build log:"
    tail -50 /tmp/docker-build.log
    exit 1
fi

echo -e "${GREEN}✓ Docker image built successfully${NC}"

# Run the container
echo ""
echo -e "${YELLOW}Starting Docker container...${NC}"

CONTAINER_ID=$(docker run -d \
    -p 3000:3000 \
    -e MQTT_EXPLORER_SKIP_AUTH=true \
    -e NODE_ENV=development \
    mqtt-explorer:test)

echo "Container ID: $CONTAINER_ID"

# Wait for container to be healthy
echo "Waiting for container to be ready..."
MAX_WAIT=60
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    # Check if container is still running
    if ! docker ps --filter "id=$CONTAINER_ID" --format "{{.ID}}" | grep -q "$CONTAINER_ID"; then
        echo -e "${RED}❌ Container stopped unexpectedly${NC}"
        echo ""
        echo "Container logs:"
        docker logs $CONTAINER_ID
        exit 1
    fi
    
    # Try to connect
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Container is responding${NC}"
        break
    fi
    
    sleep 1
    WAITED=$((WAITED + 1))
    
    if [ $((WAITED % 10)) -eq 0 ]; then
        echo "Still waiting... ($WAITED seconds elapsed)"
    fi
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo -e "${RED}❌ Container failed to respond within $MAX_WAIT seconds${NC}"
    echo ""
    echo "Container logs:"
    docker logs $CONTAINER_ID
    exit 1
fi

# Show container info
echo ""
echo -e "${YELLOW}Container Information:${NC}"
docker ps --filter "id=$CONTAINER_ID" --format "table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

# Check container health
echo ""
echo -e "${YELLOW}Checking container health...${NC}"
HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_ID 2>/dev/null || echo "no healthcheck")
echo "Health status: $HEALTH_STATUS"

# Show some container logs
echo ""
echo -e "${YELLOW}Container logs (last 20 lines):${NC}"
docker logs --tail 20 $CONTAINER_ID

# Install playwright if needed
echo ""
echo -e "${YELLOW}Ensuring Playwright is available...${NC}"
if ! npx playwright --version > /dev/null 2>&1; then
    echo "Installing Playwright..."
    npm install -g playwright@1.57.0
    npx playwright install chromium
fi

# Run the header verification test
echo ""
echo -e "${YELLOW}Running header verification test with Playwright...${NC}"
echo ""

node src/spec/docker-header-test.mjs

TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Docker image works correctly!${NC}"
    echo -e "${GREEN}The fix resolves the blank page issue.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}❌ TESTS FAILED${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
