# Browser Mode Documentation

MQTT Explorer now supports running as a web application served by a Node.js server, in addition to the existing Electron desktop app.

## Running in Browser Mode

### Quick Start

1. Build the application for browser mode:
   ```bash
   yarn build:server
   ```

2. Start the server:
   ```bash
   yarn start:server
   ```

3. Open your browser and navigate to `http://localhost:3000`

4. You'll be prompted to log in with credentials that were generated on server startup.

### Development Mode

To run in development mode with hot reload:

```bash
yarn dev:server
```

This starts both the webpack dev server and the backend server.

## Authentication

### Environment Variables

You can set custom authentication credentials using environment variables:

```bash
export MQTT_EXPLORER_USERNAME=admin
export MQTT_EXPLORER_PASSWORD=secretpassword
yarn start:server
```

### Generated Credentials

If no environment variables are set, the server will generate credentials on first startup and save them to `data/credentials.json`. The generated credentials will be printed to the console:

```
============================================================
Generated new credentials:
Username: user-abc123
Password: 123e4567-e89b-12d3-a456-426614174000
============================================================
Please save these credentials. They will be persisted to:
/path/to/data/credentials.json
============================================================
```

## Features

### Certificate Upload

In browser mode, certificate files are uploaded directly through the browser using the HTML5 File API. The certificates are:
- Read client-side as base64
- Stored in the connection configuration
- Used when establishing MQTT connections

### Data Storage

In browser mode, all data is stored on the server:
- Credentials: `data/credentials.json`
- Uploaded certificates: `data/certificates/`
- File uploads: `data/uploads/`

### Port Configuration

The default port is 3000. You can change it using the `PORT` environment variable:

```bash
PORT=8080 yarn start:server
```

## Architecture

### Client-Server Communication

- **Electron Mode**: Uses Electron IPC for communication between renderer and main process
- **Browser Mode**: Uses Socket.io WebSockets for real-time communication between browser and server

The application automatically detects the environment and uses the appropriate transport layer.

### Event Bus Abstraction

Both Electron IPC and Socket.io implement the same `EventBusInterface`, allowing the application code to work seamlessly in both modes without modification.

## Differences from Electron Mode

### Browser Mode Limitations

1. **File System Access**: Limited to server-side operations
2. **Native Dialogs**: File selection uses browser file input instead of native dialogs
3. **Auto-Updates**: Not available in browser mode
4. **Tray Icon**: Not available in browser mode

### Browser Mode Advantages

1. **No Installation**: Access from any browser
2. **Cross-Platform**: Works on any device with a modern browser
3. **Remote Access**: Can be deployed on a server for remote access
4. **Multi-User**: Can support authentication for multiple users

## Security Considerations

1. **HTTPS**: For production, always use HTTPS to encrypt credentials and MQTT data
2. **Authentication**: Keep credentials secure and rotate them regularly
3. **Network**: Ensure the server is on a trusted network or behind a firewall
4. **Environment Variables**: Use environment variables for production credentials, not the generated ones

## Deployment

For production deployment:

1. Build the application:
   ```bash
   yarn build:server
   ```

2. Set environment variables:
   ```bash
   export MQTT_EXPLORER_USERNAME=your_username
   export MQTT_EXPLORER_PASSWORD=your_secure_password
   export PORT=3000
   ```

3. Start the server:
   ```bash
   yarn start:server
   ```

4. Use a reverse proxy (nginx, Apache) to add HTTPS and additional security features

## Troubleshooting

### Debugging

Enable detailed Socket.IO connection and lifecycle debugging:

```bash
DEBUG=mqtt-explorer:socketio* yarn start:server
```

Available debug namespaces:
- `mqtt-explorer:socketio` - General Socket.IO events and metrics
- `mqtt-explorer:socketio:connect` - Client connection events
- `mqtt-explorer:socketio:disconnect` - Client disconnection and cleanup
- `mqtt-explorer:socketio:subscriptions` - Subscription lifecycle tracking
- `mqtt-explorer:socketio:connections` - MQTT connection ownership

This will log:
- Client connect/disconnect events
- Subscription counts per socket
- MQTT connection ownership tracking
- Memory leak detection metrics (subscriptions, handlers, connections)

Example output:
```
mqtt-explorer:socketio:connect Client connected: abc123de
mqtt-explorer:socketio [connect] clients=1 subscriptions=8 mqttConns=0 | socket[abc123de]: subs=8 conns=0
mqtt-explorer:socketio:connections Connection my-mqtt owned by socket abc123de (total: 1)
mqtt-explorer:socketio:disconnect Client disconnected: abc123de
mqtt-explorer:socketio:subscriptions Removed 8 subscriptions for socket abc123de
mqtt-explorer:socketio [disconnect] clients=0 subscriptions=0 mqttConns=0 | socket[abc123de]: subs=0 conns=0
```

### Authentication Fails

1. Check the console output for the generated credentials
2. Clear browser session storage: `sessionStorage.clear()` in browser console
3. Restart the server to regenerate credentials

### Connection Issues

1. Check that the server is running: `http://localhost:3000`
2. Check browser console for Socket.io connection errors
3. Verify firewall rules allow the port

### Certificate Upload Issues

In browser mode, certificates are handled differently:
- Use the file upload button to select certificate files
- Files are read and encoded client-side
- Large certificate files (>16KB) will be rejected
