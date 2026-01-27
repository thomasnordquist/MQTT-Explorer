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
export LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=100  # Default: 100 tokens

# Example: Increase token limit for more context
export LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=200

# Example: Decrease token limit to reduce API costs
export LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=50
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
export LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=100

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
ENV LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=100

EXPOSE 3000
CMD ["node", "dist/src/server.js"]
```

```bash
# Run with docker
docker run -d \
  -e OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx \
  -e LLM_PROVIDER=openai \
  -e LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=100 \
  -e MQTT_AUTO_CONNECT_HOST=mqtt.example.com \
  -p 3000:3000 \
  mqtt-explorer
```

## Context Generation with Token Limits

The `LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT` controls how many tokens are allocated for neighboring topics in the context. Here's what happens:

### With Default 100 Tokens

```
Topic Path: sensors/living_room/temperature
Value: 22.5
Status: Retained

Related Topics (5 shown):
  humidity: 65
  pressure: 1013.25
  air_quality: {"pm25":12,"pm10":8,"co2":450,"voc":120}
  motion: false
  light_level: 450

Message Count: 1
Subtopics: 0
```

### With 50 Tokens (Reduced)

```
Topic Path: sensors/living_room/temperature
Value: 22.5
Status: Retained

Related Topics (3 shown):
  humidity: 65
  pressure: 1013.25
  air_quality: {"pm25":12,"pm10":8...

Message Count: 1
Subtopics: 0
```

### With 200 Tokens (Increased)

```
Topic Path: sensors/living_room/temperature
Value: 22.5
Status: Retained

Related Topics (8 shown):
  humidity: 65
  pressure: 1013.25
  air_quality: {"pm25":12,"pm10":8,"co2":450,"voc":120}
  motion: false
  light_level: 450
  battery: 85
  signal_strength: -45
  last_seen: 2026-01-26T23:45:00Z

Message Count: 1
Subtopics: 0
```

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

If you're seeing truncated context:
```bash
# Increase the token limit
export LLM_NEIGHBORING_TOPICS_TOKEN_LIMIT=200
```

### Want to Use UI Configuration

Simply don't set the environment variables - the UI configuration will be used instead.
