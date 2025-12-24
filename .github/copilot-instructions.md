# copilot-instructions.md - Agent Long-Term Memory

## META-INSTRUCTIONS (IMMUTABLE)

1. **Long-term memory**: If you learn something during a session that would save time in future sessions, add it to `.github/copilot-instructions.md`
2. **Paper knowledge must go**: If something is no longer true, update or remove it immediately
3. **Evaluate after every session**: Consider whether the instructions need updates based on what you learned
4. **Concise and useful**: All information must be actionable, current, and concise

## Test Commands

**Unit tests:**
- `yarn test` - All unit tests (app + backend)
- `yarn test:app` - Frontend tests only
- `yarn test:backend` - Backend tests only

**Integration tests:**
- `yarn test:ui` - Browser tests (requires `yarn build` first)
- `yarn test:demo-video` - UI recording (requires Xvfb, mosquitto, tmux, ffmpeg)
- `yarn test:mcp` - Model Context Protocol tests
- `yarn test:all` - All tests (unit + demo-video)
- `./scripts/runBrowserTests.sh` - Browser mode UI tests (requires mosquitto service)

**CI jobs:** `test`, `ui-tests`, `demo-video`, `test-browser`, `browser-ui-tests`

**Important:** Browser UI tests require MQTT broker. In CI, GitHub Actions health checks ensure the mosquitto service is ready before tests run.

## Browser Mode

**Prerequisites:** Node.js ≥24, Yarn, Mosquitto broker (for testing)

**Development (hot reload):**
```bash
export MQTT_EXPLORER_USERNAME=admin MQTT_EXPLORER_PASSWORD=yourpass
yarn dev:server
# Backend: http://localhost:3000, Frontend: http://localhost:8080 (use this one)
```

**Production:**
```bash
yarn build:server
export MQTT_EXPLORER_USERNAME=admin MQTT_EXPLORER_PASSWORD=yourpass
yarn start:server  # http://localhost:3000
```

**Build artifacts:** `dist/src/server.js`, `app/build/*.js`, `app/build/index.html`

## Debugging Browser Mode

**DevTools checks:**
- Console: JavaScript errors, CSP errors (security headers), WebSocket issues
- Network: Static asset loading, WebSocket status, API auth

**Common issues:**
- **Blank page/CSP errors:** Add `'unsafe-eval'` to `scriptSrc` in `src/server.ts` helmet config
- **Auth loop:** WebSocket auth failing - check Network → WS → Messages and server logs
- **Theme errors:** Verify both ThemeProvider and LegacyThemeProvider in `app/src/index.tsx`

**Expected warnings (non-fatal):**
- React 18 + Material-UI v5 type warnings
- IpcRendererEventBus errors (no Electron IPC in browser mode)
- MUI locale, componentWillReceiveProps, ACE editor warnings

**WebSocket debugging:**
```bash
node dist/src/server.js 2>&1 | tee server.log
# Check DevTools → Network → WS → Messages for handshake
# CORS: check ALLOWED_ORIGINS env var
```

**Security notes:**
- `unsafe-eval` in CSP required for webpack (security tradeoff)
- Never hardcode credentials (use env vars)
- Production: use HTTPS with reverse proxy
- Rate limit: 5 auth attempts/15min/IP
- File upload limit: 16MB

**Key files:**
- `src/server.ts` - Express server, security middleware
- `app/webpack.browser.config.mjs` - Browser webpack config
- `app/src/browserEventBus.ts` - Socket.io client
- `app/src/components/BrowserAuthWrapper.tsx` - Auth dialog
- `app/src/index.tsx` - React entry, theme providers
