#!/bin/bash
# Build an unsigned-for-distribution MQTT Explorer .app for THIS Mac (arm64) and
# ad-hoc re-sign it so it launches locally.
#
# Why re-sign: electron-builder ad-hoc signs the main binary but Electron Framework
# keeps a different signature identity; with the hardened runtime, dyld refuses to
# load it ("different Team IDs"). We re-sign everything ad-hoc and add the
# disable-library-validation entitlement. The result is local-only: it will not
# pass Gatekeeper on other machines.
#
# Usage: scripts/build-mac-local.sh [--skip-build]
set -euo pipefail

cd "$(dirname "$0")/.."

APP="build/mac-arm64/MQTT Explorer.app"

if [ "${1:-}" != "--skip-build" ]; then
  yarn build
  CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac dir --arm64 --publish never
fi

[ -d "$APP" ] || { echo "Missing $APP (run without --skip-build)" >&2; exit 1; }

ENT="$(mktemp -t mqtt-explorer-ent).plist"
trap 'rm -f "$ENT"' EXIT
cp res/entitlements.mac.plist "$ENT"
/usr/libexec/PlistBuddy -c "Add :com.apple.security.cs.disable-library-validation bool true" "$ENT"

codesign --force --deep --sign - --options runtime --entitlements "$ENT" "$APP"
codesign --verify --deep --strict "$APP"

echo "Built and re-signed: $PWD/$APP"
