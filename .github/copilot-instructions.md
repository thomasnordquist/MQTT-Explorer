# GitHub Copilot Agent Instructions for MQTT Explorer

## Test Suites

MQTT Explorer has several test suites to ensure code quality and reliability:

### Unit Tests

**App tests** - Frontend component and logic tests:
```bash
yarn test:app
# Or: cd app && yarn test
```

**Backend tests** - Data model and business logic tests:
```bash
yarn test:backend
# Or: cd backend && yarn test
```

**Run all unit tests**:
```bash
yarn test
```

### Integration Tests

**UI test suite** - Independent, deterministic browser tests:
```bash
yarn test:ui
# Requires: yarn build
```

**Demo video generation** - UI test recording with video capture:
```bash
yarn test:demo-video
# Requires: Xvfb, mosquitto broker, tmux, ffmpeg
# For development: Use ./scripts/uiTests.sh for full video recording setup
```

**MCP introspection tests** - Model Context Protocol tests:
```bash
yarn test:mcp
```

**Run all tests** (unit + demo-video):
```bash
yarn test:all
```

### CI/CD Test Execution

In CI environments, tests run in isolated containers with all dependencies pre-installed:
- `test` job: Runs unit tests (app + backend)
- `ui-tests` job: Runs UI test suite with screenshots
- `demo-video` job: Generates demo video with full recording setup
- `test-browser` job: Runs browser mode smoke tests

## Debugging Browser Mode

### Prerequisites
- Node.js 24 or higher
- Yarn package manager
- Running Mosquitto MQTT broker (for testing)

### Development Mode (with Hot Reload)

1. **Set credentials (required):**
   ```bash
   export MQTT_EXPLORER_USERNAME=admin
   export MQTT_EXPLORER_PASSWORD=your_password
   ```

2. **Start development servers:**
   ```bash
   yarn dev:server
   ```
   This runs two servers in parallel:
   - Backend server on http://localhost:3000 (serves API, WebSocket, authentication)
   - Webpack dev server on http://localhost:8080 (serves frontend with hot reload)

3. **Access the application:**
   - Navigate to http://localhost:8080 (NOT :3000)
   - Webpack dev server proxies API/WebSocket requests to backend on port 3000
   - Hot reload enabled - changes to React components update automatically

### Production Mode (Production Build)

1. **Build the browser version:**
   ```bash
   yarn build:server
   ```
   This compiles TypeScript and builds the optimized webpack bundle

2. **Start the server:**
   ```bash
   # Set credentials (required) - these are for the browser login page
   export MQTT_EXPLORER_USERNAME=admin
   export MQTT_EXPLORER_PASSWORD=your_password
   
   # Start server
   yarn start:server
   # OR: node dist/src/server.js
   ```
   Server will run on http://localhost:3000 (serves both frontend and backend)

3. **Login to the application:**
   - Navigate to http://localhost:3000
   - Enter the username and password you set in the environment variables
   - Click "LOGIN" button
   - After successful login, the main application will load
   - The MQTT Connection modal will appear where you can configure broker connections

### Debugging with Browser DevTools

1. **Open browser DevTools:**
   - Navigate to http://localhost:3000
   - Press F12 or right-click → Inspect
   
2. **Check Console tab:**
   - Look for JavaScript errors
   - CSP (Content Security Policy) errors indicate security header issues
   - Network errors indicate API/WebSocket connection issues

3. **Check Network tab:**
   - Verify static assets load correctly (JS bundles, CSS)
   - Check WebSocket connection status
   - Monitor API calls for authentication issues

4. **Common Issues:**

   **Blank page / CSP errors:**
   - Symptom: Console shows `EvalError: ... violates Content Security Policy`
   - Cause: webpack runtime requires `unsafe-eval` for code splitting
   - Fix: Add `'unsafe-eval'` to `scriptSrc` in `src/server.ts` helmet config
   
   **Authentication loop:**
   - Symptom: Login dialog keeps reappearing
   - Cause: WebSocket authentication failing
   - Debug: Check browser Network tab → WS → Messages
   - Check: Server logs for authentication errors
   
   **Theme errors:**
   - Symptom: App loads but styling is broken
   - Cause: Material-UI theme not loading correctly
   - Check: Console for theme-related errors
   - Verify: Both ThemeProvider and LegacyThemeProvider in `app/src/index.tsx`
   
   **Expected console warnings (non-fatal):**
   - React 18 type warnings with Material-UI v5 components (dozens of "Failed prop type" warnings)
   - `TypeError: Cannot read properties of undefined (reading 'on')` from IpcRendererEventBus - this is expected in browser mode as there's no Electron IPC
   - MUI locale warnings for `en-US` - expected, app uses available locales
   - `componentWillReceiveProps` deprecation warnings - from legacy TreeComponent
   - ACE editor autocomplete warnings - expected, features not imported
   - CSP worker violation for ACE editor - known issue, editor still functions
   
   These warnings don't prevent the application from functioning correctly.

### Using Playwright for Automated Testing

```bash
# Start server in background
export MQTT_EXPLORER_USERNAME=admin
export MQTT_EXPLORER_PASSWORD=test123
node dist/src/server.js &

# Use Playwright browser tool (in Copilot agent context)
playwright-browser_navigate http://localhost:3000
playwright-browser_take_screenshot --filename debug.png
playwright-browser_console_messages  # Check for errors
```

### Expected UI Flow

1. **Login Page** (https://github.com/user-attachments/assets/383305e1-2169-433c-a668-5a05da0c343a)
   - Enter username and password from environment variables
   - Click "LOGIN" button
   
2. **Main Application After Login** (https://github.com/user-attachments/assets/cc4d665f-2665-4289-b2fc-dc4986f9ab5b)
   - Application loads with sidebar, topic tree, value panel, and publish panel
   - MQTT Connection modal appears automatically for first-time setup
   - Configure broker connection (host, port, credentials, etc.)
   - Click "CONNECT" to establish MQTT connection
   
3. **Application Features:**
   - Topic tree on the left shows MQTT topic hierarchy
   - Value panel shows selected topic's message content
   - Publish panel allows sending MQTT messages
   - Charts panel for numeric value visualization
   - Settings drawer for app configuration

### Debugging WebSocket Connection

1. **Check server logs:**
   ```bash
   node dist/src/server.js 2>&1 | tee server.log
   ```

2. **Check browser WebSocket:**
   - DevTools → Network → WS tab
   - Look for socket.io connection
   - Check Messages tab for authentication handshake

3. **Common WebSocket issues:**
   - CORS errors: Check `ALLOWED_ORIGINS` environment variable
   - Authentication errors: Verify credentials in sessionStorage
   - Connection refused: Server not running or port blocked

### Development vs Production

**Development mode:**
```bash
yarn dev:server
# Runs webpack-dev-server with hot reload
# More verbose error messages
# Source maps enabled
```

**Production mode:**
```bash
NODE_ENV=production yarn build:server
NODE_ENV=production node dist/src/server.js
# Minified bundles
# Generic error messages (security)
# HSTS enabled
```

### Build Artifacts

After `yarn build:server`, check:
- `dist/src/server.js` - Compiled server code
- `app/build/*.js` - Webpack bundles
- `app/build/index.html` - Entry point HTML

### Troubleshooting Checklist

- [ ] Node.js version >=24
- [ ] `yarn install` completed without errors  
- [ ] TypeScript compilation successful (`npx tsc`)
- [ ] Webpack build successful (check `app/build/` directory)
- [ ] Server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Login dialog appears
- [ ] No CSP errors in console
- [ ] WebSocket connects successfully
- [ ] App renders after login

### Security Considerations

When debugging, be aware that:
- `unsafe-eval` in CSP is required for webpack but reduces security
- Credentials should never be hardcoded (use environment variables)
- In production, use HTTPS with a reverse proxy (nginx/Apache)
- Rate limiting is active (5 auth attempts per 15 min per IP)
- File upload size limit is 16MB

### Related Files

- `src/server.ts` - Express server with security middleware
- `app/webpack.browser.config.mjs` - Browser-specific webpack config  
- `app/src/browserEventBus.ts` - Socket.io client for browser mode
- `app/src/components/BrowserAuthWrapper.tsx` - Authentication dialog
- `app/src/index.tsx` - React app entry point with theme providers
