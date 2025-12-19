# Devcontainer Setup for MQTT Explorer

This directory contains the development container configuration for GitHub Codespaces and VS Code Remote - Containers.

## What's Included

- **Node.js 18**: JavaScript runtime environment
- **MQTT Broker (Mosquitto)**: Pre-configured Eclipse Mosquitto MQTT broker on port 1883
- **VS Code Extensions**: ESLint, Prettier, TypeScript, Docker, and GitLens
- **Port Forwarding**: Automatic forwarding for:
  - Port 3000: MQTT Explorer Server (browser mode)
  - Port 8080: Webpack Dev Server
  - Port 1883: MQTT Broker

## Getting Started

### GitHub Codespaces

1. Click the green "Code" button on the repository
2. Select "Codespaces" tab
3. Click "Create codespace on [branch]"
4. Wait for the container to build and start
5. Run `yarn dev:server` to start the browser mode
6. Or run `yarn dev` to start Electron mode (requires X11 forwarding)

### VS Code Remote - Containers

1. Install the "Remote - Containers" extension in VS Code
2. Open the repository in VS Code
3. Click "Reopen in Container" when prompted
4. Wait for the container to build
5. Run development commands as usual

## Development Commands

After the container starts, you can use any of the standard commands:

```bash
# Install dependencies (done automatically)
yarn install

# Run in browser mode
yarn dev:server

# Build browser mode
yarn build:server
yarn start:server

# Run tests
yarn test

# Lint code
yarn lint
```

## MQTT Broker

A Mosquitto MQTT broker is automatically started and accessible at:
- Host: `localhost`
- Port: `1883`
- Anonymous connections: Allowed (development only)

You can connect the MQTT Explorer to `mqtt://localhost:1883` for testing.

## Environment Variables

The devcontainer sets these environment variables:
- `MQTT_EXPLORER_USERNAME=dev`
- `MQTT_EXPLORER_PASSWORD=dev123`

These are used for browser mode authentication.

## Customization

You can modify:
- `.devcontainer/devcontainer.json` - VS Code settings and extensions
- `.devcontainer/docker-compose.yml` - Container services and configuration
- `.devcontainer/mosquitto.conf` - MQTT broker configuration
