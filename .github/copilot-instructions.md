# GitHub Copilot Agent Instructions for MQTT Explorer

## Debugging Browser Mode

### Prerequisites
- Node.js 24 or higher
- Yarn package manager
- Running Mosquitto MQTT broker (for testing)

### Building Browser Mode

1. **Build the browser version:**
   ```bash
   yarn build:server
   ```
   This compiles TypeScript and builds the webpack bundle with `webpack.browser.config.mjs`

2. **Start the server:**
   ```bash
   # Set credentials (required)
   export MQTT_EXPLORER_USERNAME=admin
   export MQTT_EXPLORER_PASSWORD=your_password
   
   # Start server
   node dist/src/server.js
   ```
   Server will run on http://localhost:3000

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
