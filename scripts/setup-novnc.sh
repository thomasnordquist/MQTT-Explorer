#!/bin/bash
set -e

echo "Setting up noVNC for browser-based VNC access..."

# Install noVNC and websockify if not already installed
if [ ! -d "/tmp/noVNC" ]; then
  echo "Downloading noVNC..."
  cd /tmp
  git clone --depth 1 https://github.com/novnc/noVNC.git
  cd noVNC
  git clone --depth 1 https://github.com/novnc/websockify.git
  echo "noVNC installed successfully!"
else
  echo "noVNC already installed at /tmp/noVNC"
fi

echo ""
echo "✓ Setup complete!"
echo ""
echo "To use noVNC with your tests:"
echo "  1. Run: yarn test:ui:vnc"
echo "  2. Open the forwarded port 6080 in your browser"
echo "  3. Click 'Connect' (password: bierbier)"
echo ""
