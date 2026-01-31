# copilot-instructions.md - Agent Long-Term Memory

## META-INSTRUCTIONS (IMMUTABLE)

1. **Long-term memory**: If you learn something during a session that would save time in future sessions, add it to `.github/copilot-instructions.md`
2. **Paper knowledge must go**: If something is no longer true, update or remove it immediately
3. **Evaluate after every session**: Consider whether the instructions need updates based on what you learned
4. **Concise and useful**: All information must be actionable, current, and concise

## Code Formatting and Linting

**Before committing code, always run:**
- `yarn lint:prettier:fix` - Format all TypeScript files with Prettier
- `yarn lint:fix` - Fix ESLint and Prettier issues

**Check code quality:**
- `yarn lint` - Check Prettier, ESLint, and spell checking
- `yarn lint:prettier` - Check Prettier formatting only
- `yarn lint:eslint` - Check ESLint only

## Test Commands

**Unit tests:**
- `yarn test` - All unit tests (app + backend)
- `yarn test:app` - Frontend tests only
- `yarn test:backend` - Backend tests only

**LLM integration tests:**
- Requires API key (OpenAI or Gemini)
- **Setup**: Run `./scripts/setup-llm-env.sh` to create `.env.llm-tests` from injected secrets
- **Usage**: `source .env.llm-tests && ./scripts/run-llm-tests.sh`
- **Note**: The `.env.llm-tests` file must be sourced to get the LLM access token before running tests
- Tests make real API calls and cost ~$0.01-$0.05 per run
- See `app/src/services/spec/README.md` for details

**Integration tests:**
- `yarn test:ui` - Browser tests (requires `yarn build` first)
- `yarn test:demo-video` - UI recording (requires Xvfb, mosquitto, tmux, ffmpeg)
- `yarn test:mcp` - Model Context Protocol tests
- `yarn test:all` - All tests (unit + demo-video)
- `./scripts/runBrowserTests.sh` - Browser mode UI tests (requires mosquitto service)
- `./scripts/uiTests.sh` - Demo video tests with Electron (requires Xvfb, mosquitto)

**CI jobs:** `test`, `ui-tests`, `demo-video`, `test-browser`, `browser-ui-tests`

**Important:** 
- Browser UI tests require MQTT broker. In CI, GitHub Actions health checks ensure the mosquitto service is ready before tests run.
- Demo video tests use the same test scenarios as browser tests - if browser tests pass, demo video tests should pass too (they use identical selectors in `src/spec/scenarios/`)

## Debugging Demo Video / UI Tests

When demo video tests fail in CI but you need to debug locally:

**Prerequisites:**
```bash
# Install required packages
sudo apt-get install xvfb mosquitto tmux ffmpeg

# Ensure mosquitto is stopped (script will start its own instance)
sudo systemctl stop mosquitto
```

**Steps to debug:**
1. Build the project: `yarn build`
2. Run the demo video tests: `ELECTRON_DISABLE_SANDBOX=1 ./scripts/uiTests.sh`
3. If tests fail, check the error messages for:
   - Missing `data-test` or `data-test-type` attributes
   - Elements not visible (hidden, outside viewport, or covered by overlays)
   - Click interception (tooltips, dialogs blocking clicks)
   - XPath selector issues (check the data-test value format)

**Common issues:**
- **"locator not visible"**: Element exists but is hidden or outside viewport
- **"locator.click intercepted"**: Another element (tooltip, dialog) is covering the click target
- **Empty `data-test` attribute**: For simple numeric values, ensure you're using the topic name, not `props.literal.path` (which is empty for non-JSON values)
- **"Process failed to launch"**: Electron can't start - ensure DISPLAY is set and Xvfb is running

**Environment-specific notes:**
- Demo video tests use Electron with Xvfb (virtual display)
- Browser tests use Chromium without Electron (easier to debug locally)
- CI environment has proper Electron setup - if local tests are flaky, trust CI results
- Both test types use the same scenario files in `src/spec/scenarios/`

**Material-UI Tooltip considerations:**
- Tooltips wrap their children and create overlay divs
- Test attributes (`data-test-type`, `data-test`) must be on the inner clickable element that's passed as a child to the Tooltip
- Mouse event handlers (onMouseEnter, onMouseLeave, ref) go on outer wrapper
- onClick handler and test attributes go on the span inside the Tooltip
- The clickable child inside the Tooltip is what Playwright should target

**Example:**
```tsx
// ❌ WRONG - attributes on outer wrapper, Tooltip wraps and hides them
<Tooltip title="...">
  <span onClick={...} data-test-type="Button" data-test="example">
    <Icon />
  </span>
</Tooltip>

// ✅ CORRECT - attributes on the actual clickable child inside Tooltip
<span ref={ref} onMouseEnter={...} onMouseLeave={...}>
  <Tooltip title="...">
    <span onClick={...} data-test-type="Button" data-test="example">
      <Icon />
    </span>
  </Tooltip>
</span>
```

**data-test value format:**
- ShowChart: Use last segment of topic path (e.g., "heater" for "kitchen/coffee_maker/heater")
- ChartSettings: Use full topic + dotPath (e.g., "kitchen/coffee_maker/heater-" with trailing dash when dotPath is empty)
- Test XPaths use `contains(@data-test, "substring")` so partial matches work

## Running Browser Tests Locally

**Prerequisites:**
```bash
# Install mosquitto (if not already installed)
sudo apt-get install mosquitto

# Start mosquitto service
sudo systemctl start mosquitto
sudo systemctl status mosquitto
```

**Run browser tests:**
```bash
# Build server and run tests
yarn build:server
./scripts/runBrowserTests.sh
```

The script automatically:
- Starts a local mosquitto broker
- Builds the TypeScript code
- Starts the browser mode server on port 3000
- Runs Playwright tests in browser mode
- Cleans up processes on exit

**Test environment variables:**
- `MQTT_EXPLORER_USERNAME` - Browser auth username (default: test)
- `MQTT_EXPLORER_PASSWORD` - Browser auth password (default: test123)
- `PORT` - Server port (default: 3000)
- `TESTS_MQTT_BROKER_HOST` - MQTT broker host (default: 127.0.0.1)
- `TESTS_MQTT_BROKER_PORT` - MQTT broker port (default: 1883)
- `USE_MOBILE_VIEWPORT` - Enable mobile viewport (default: false)

**Common test failures after UI changes:**
- Update test selectors in `src/spec/ui-tests.spec.ts` if UI structure changes
- Use `data-testid` attributes for stable test selectors
- Avoid using role + name selectors for dynamic content (use direct testid selectors instead)

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

## Styling Conventions

When modifying or creating UI components, follow the styling patterns documented in <a>STYLING.md</a>.

**Key points for AI agents:**
- Use Material-UI (MUI) v7 components with `withStyles` HOC for styling
- Access theme colors via `theme.palette.*`, spacing via `theme.spacing()`, typography via `theme.typography.*`
- Support both light and dark modes with theme-conditional styling
- Import Material-UI colors: `import { blueGrey, amber, green, red } from '@mui/material/colors'`

## Mobile Testing Workflow

**Prerequisites for mobile testing:**
```bash
# Install Playwright browsers
npx playwright install --with-deps chromium

# Configure mosquitto to allow anonymous connections (for local testing)
echo "listener 1883
allow_anonymous true" | sudo tee /etc/mosquitto/conf.d/allow-anonymous.conf
sudo systemctl restart mosquitto
```

**Interactive testing with mobile viewport:**
```bash
# Set up environment
export MQTT_EXPLORER_SKIP_AUTH=true
export MQTT_AUTO_CONNECT_HOST=127.0.0.1

# Build and start server
yarn build:server
node dist/src/server.js

# In another terminal, run Playwright test with mobile viewport
# Create test script with viewport: { width: 412, height: 914 }
# Always INSPECT the rendered output, don't rely on assumptions
```

**Key lesson**: Mobile tree visibility issues often stem from:
1. CSS flex/absolute positioning conflicts
2. Missing Redux state updates (connection not propagated to frontend)
3. MQTT broker authentication (mosquitto requires `allow_anonymous true` for testing)
4. Timing issues (frontend subscribing to events after backend emits them)

**Server-side auto-connect** (for testing):
```bash
export MQTT_AUTO_CONNECT_HOST=127.0.0.1
export MQTT_AUTO_CONNECT_PORT=1883  # optional
export MQTT_AUTO_CONNECT_PROTOCOL=mqtt  # optional
```

