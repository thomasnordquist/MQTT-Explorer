# Environment Variables for LLM Integration

This document provides examples of how to configure the AI Assistant using environment variables for server deployments.

## Basic Configuration

```bash
# Set up OpenAI as the provider
export LLM_PROVIDER=openai
export OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx

# Or use Gemini
export LLM_PROVIDER=gemini
export GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxx

# Or use the generic LLM_API_KEY (works with either provider)
export LLM_PROVIDER=openai
export LLM_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
```

## Advanced Configuration

```bash
# Configure token limit for neighboring topics context
export LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=500  # Default: 500 tokens (increased for better device detection)

# Example: Increase token limit for large home automation setups
export LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=1000

# Example: Decrease token limit to reduce API costs (may reduce proposal quality)
export LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=200
```

## Complete Example for Server Deployment

```bash
#!/bin/bash
# start-mqtt-explorer.sh

# MQTT Connection
export MQTT_EXPLORER_SKIP_AUTH=true  # Or configure authentication
export MQTT_AUTO_CONNECT_HOST=mqtt.example.com
export MQTT_AUTO_CONNECT_PORT=1883

# LLM Configuration
export LLM_PROVIDER=gemini
export GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxx
export LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=500

# Start the server
node dist/src/server.js
```

## Docker Example

```dockerfile
# Dockerfile
FROM node:24-alpine

WORKDIR /app
COPY . .
RUN yarn install && yarn build:server

# Environment variables can be set at runtime
ENV LLM_PROVIDER=openai
ENV LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=500

EXPOSE 3000
CMD ["node", "dist/src/server.js"]
```

```bash
# Run with docker
docker run -d \
  -e OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx \
  -e LLM_PROVIDER=openai \
  -e LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=500 \
  -e MQTT_AUTO_CONNECT_HOST=mqtt.example.com \
  -p 3000:3000 \
  mqtt-explorer
```

## Context Generation with Token Limits

The `LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT` controls how many tokens are allocated for neighboring topics in the context. The default has been increased from 100 to 500 tokens to provide better device relationship detection and enable multi-device automation proposals.

### With Default 500 Tokens (Recommended)

```
Topic Path: home/living_room/light
Value: {"state":"ON","brightness":75,"color_temp":350}
Status: Retained

Related Topics (18 shown):
  home/living_room: {"scene":"evening"}
  home/living_room/thermostat: {"temperature":22.5,"target":23,"mode":"heat"}
  home/living_room/motion: true
  home/living_room/humidity: 65
  home/living_room/light/set: (command topic)
  home/living_room/light/availability: "online"
  home/living_room/light/config: {"transition":0.5,"fade":true}
  home/living_room/blinds: {"position":75,"state":"open"}
  home/living_room/blinds/set: (command topic)
  home/living_room/tv: {"power":"ON","input":"HDMI1"}
  home/kitchen/light: {"state":"ON","brightness":100}
  home/bedroom/light: {"state":"OFF"}
  home/living_room/light/brightness/set: (command topic)
  home/living_room/light/color/set: (command topic)
  home/living_room/motion_sensor/battery: 95
  home/living_room/motion_sensor/last_motion: "2026-01-27T19:45:30Z"

Message Count: 42
Subtopics: 5
```

**Benefits:** AI can see full room context (multiple devices), detect controllable devices (set topics), understand device hierarchies (parent/child relationships), and propose coordinated multi-device actions like "turn off all living room devices" or "set evening scene".

### With 200 Tokens (Reduced - May Miss Context)

```
Topic Path: home/living_room/light
Value: {"state":"ON","brightness":75,"color_temp":350}
Status: Retained

Related Topics (8 shown):
  home/living_room: {"scene":"evening"}
  home/living_room/thermostat: {"temperature":22.5,"target":23}
  home/living_room/motion: true
  home/living_room/light/set: (command topic)
  home/living_room/blinds: {"position":75}
  home/kitchen/light: {"state":"ON","brightness":100}

Message Count: 42
Subtopics: 5
```

**Limitations:** Less context = fewer multi-device proposals, may miss related devices in same room.

### With 1000 Tokens (Maximum - For Large Setups)

Use for extensive home automation with many rooms and devices. Provides comprehensive context including grandchildren, cousins, and extended device relationships.

## Priority Order

The AI Assistant checks configuration in this order:

1. **Environment Variables** (highest priority)
   - Provider-specific: `OPENAI_API_KEY`, `GEMINI_API_KEY`
   - Generic fallback: `LLM_API_KEY`
   - Provider selection: `LLM_PROVIDER`
   - Token limit: `LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT`

2. **localStorage** (browser/UI configuration)
   - Set via the configuration dialog in the UI
   - Only used if environment variables are not set

3. **Defaults** (lowest priority)
   - Provider: `openai`
   - Token limit: `100`

## Security Recommendations

- **Never commit API keys** to version control
- Use environment variables or secrets management
- In production, use `.env` files (not committed) or container secrets
- Rotate API keys regularly
- Monitor API usage and set billing alerts

## Troubleshooting

### API Key Not Working

Check priority order:
```bash
# Check if env vars are set
echo $OPENAI_API_KEY
echo $LLM_API_KEY
echo $LLM_PROVIDER

# Verify they're available to the Node process
node -e "console.log(process.env.OPENAI_API_KEY)"
```

### Token Limit Too Low

If you're seeing truncated context or poor multi-device proposals:
```bash
# Increase the token limit (recommended: 500-1000 for home automation)
export LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=1000
```

**Note:** The default was increased from 100 to 500 tokens to better support:
- Multi-device detection and relationships
- Hierarchical topic structures (parent → children → grandchildren)
- Room-level automation proposals
- Complex home automation scenarios

### Want to Use UI Configuration

Simply don't set the environment variables - the UI configuration will be used instead.
