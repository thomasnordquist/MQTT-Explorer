# Mobile Testing Guide

This document describes how to run and debug mobile UI tests for MQTT Explorer.

## Overview

The mobile tests simulate MQTT Explorer running in a mobile browser (Google Pixel 6 viewport: 412x914px) and generate demo videos showing the mobile user experience.

## Prerequisites

### System Dependencies
```bash
sudo apt-get install -y ffmpeg tmux xvfb x11vnc mosquitto
```

### Node Dependencies
```bash
yarn install
npx playwright install --with-deps chromium
```

## Running Mobile Tests

### 1. Build the Application
```bash
yarn build:server  # For browser mode
```

### 2. Run Tests
```bash
./scripts/uiTestsMobile.sh
```

This will:
- Start Xvfb (virtual framebuffer)
- Start mosquitto MQTT broker
- Start MQTT Explorer server in browser mode
- Run Playwright tests with mobile viewport
- Record video of the test session

### 3. Post-Process Video
```bash
./scripts/prepareVideoMobile.sh
```

This converts the raw video to MP4 and GIF formats and creates individual segments for each test scene.

## Output Files

- `ui-test-mobile.mp4` - Full mobile test video (MP4)
- `ui-test-mobile.gif` - Full mobile test video (GIF)
- `segment-mobile-*.gif` - Individual scene segments
- `scenes-mobile.json` - Scene timing metadata

All video files are automatically excluded from git (see `.gitignore`).

## Debugging

### View Test in VNC

During test execution, you can connect with VNC to watch in real-time:
```bash
# Password: bierbier
vncviewer localhost:5900
```

### Common Issues

#### 1. Playwright Browsers Not Installed
**Error:** `Executable doesn't exist at .../chromium_headless_shell-1200/chrome-headless-shell`

**Solution:**
```bash
npx playwright install --with-deps chromium
```

#### 2. Video Encoding Fails
**Error:** `height not divisible by 2`

**Solution:** Ensure viewport height is even. Mobile viewport is set to 412x914 (not 915).

#### 3. Elements Outside Viewport
**Error:** `element is outside of the viewport`

**Solution:** The fix adds `scrollIntoViewIfNeeded()` before clicking elements. For modal/dialog elements that intercept clicks, use `force: true`.

#### 4. MQTT Broker Already Running
**Error:** `Address already in use` on port 1883

**Solution:** Kill existing mosquitto process:
```bash
pkill mosquitto
```

## Mobile UI Enhancements

The tests revealed several mobile UI improvements that were implemented:

### 1. Connection Dialog Responsiveness
Added responsive CSS to `ConnectionSetup.tsx`:
- Mobile viewports use 95vw width and 85vh height
- Enabled scrolling on the right panel
- Hide profile list on mobile to save space

### 2. Click Handling
Enhanced `clickOn` helper in `util/index.ts`:
- Added `scrollIntoViewIfNeeded()` to ensure elements are in viewport
- Support for `force: true` to bypass overlay elements

### 3. Tree Node Expansion
Updated `expandTopic` helper:
- Use `force: true` for tree clicks to bypass accordion overlays
- Better handling of nested topic expansion

## Test Scenes

The mobile demo includes these scenes:

1. **mobile_intro** - Introduction screen
2. **mobile_connect** - Connect to MQTT broker
3. **mobile_browse_topics** - Browse topic tree
4. **mobile_search** - Search and filter topics
5. **mobile_view_message** - View message details
6. **mobile_json_view** - JSON formatting display
7. **mobile_clipboard** - Copy operations
8. **mobile_plots** - Numeric data visualization
9. **mobile_menu** - Settings and menu
10. **mobile_end** - Conclusion screen

## CI Integration

Mobile tests run in the `demo-video-mobile` job in `.github/workflows/tests.yml`:

```yaml
demo-video-mobile:
  runs-on: ubuntu-latest
  container:
    image: ghcr.io/thomasnordquist/mqtt-explorer-ui-tests:latest
  steps:
    - name: Generate Mobile Demo Video
      run: ./scripts/uiTestsMobile.sh
    - name: Post-processing
      run: ./scripts/prepareVideoMobile.sh
```

Videos are uploaded to S3 and linked in PR comments.

## Technical Notes

### Viewport Configuration
- **Width:** 412px (Pixel 6)
- **Height:** 914px (must be even for h264 encoding)
- **Device Scale Factor:** 2.625
- **Mobile Mode:** Enabled with touch events

### Video Recording
- Raw video: YUV420P format
- Frame rate: 20 fps
- Recording tool: ffmpeg via tmux

### Post-Processing
- MP4 encoding: h264 codec
- GIF palette: 256 colors optimized per segment
- Segment creation: Based on scene timing in `scenes-mobile.json`

## Future Improvements

Potential areas for enhancement:

1. **Touch Gestures** - Add swipe and pinch interactions
2. **Performance** - Optimize for slower mobile networks
3. **Accessibility** - Larger touch targets, better contrast
4. **PWA Support** - Add manifest for "add to home screen"
5. **Orientation** - Test landscape mode

## References

- [MOBILE_COMPATIBILITY.md](./MOBILE_COMPATIBILITY.md) - Mobile compatibility strategy
- [Playwright Device Emulation](https://playwright.dev/docs/emulation)
- [Material-UI Responsive Design](https://mui.com/material-ui/customization/breakpoints/)
