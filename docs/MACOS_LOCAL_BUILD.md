# Building and Installing MQTT Explorer Locally on macOS

This guide covers building MQTT Explorer from source on an Apple Silicon Mac
without Apple code-signing credentials, packaging it as a `.app` bundle, and
replacing the copy in `/Applications`.

The result is an ad-hoc signed bundle. It runs fine on the machine that built
it and on other Macs if the user allows it in Gatekeeper, but it is not
notarized and cannot be distributed through the Mac App Store.

## Prerequisites

| Requirement | Notes |
|---|---|
| macOS on Apple Silicon | The steps below build `arm64` only. Change `--arm64` to `--x64` for Intel. |
| Node.js 20 or newer | The project declares `>=20`. Node 23 works. |
| Yarn 1.x | `npm install -g yarn` |
| Xcode Command Line Tools | Needed for `codesign`. |

No Apple Developer account, signing identity, or provisioning profile is
required for this workflow.

### About the `--ignore-engines` flag

One dev-only dependency, `semantic-release`, declares an engine range that
rejects Node 23. It is only used for publishing releases and is not part of the
build. Passing `--ignore-engines` to `yarn install` skips that check. If you
are on Node 22 or 24 the flag is unnecessary but harmless.

## Step 1: Build a clean copy of the repository

The packaging step must run against a tree that contains only production
dependencies. The simplest way to get one is to clone the current branch into
`build/clean`, build there, and then prune. Run this from the repository root
(or from a worktree root).

```bash
rm -rf build/clean \
  && git clone -q . build/clean \
  && cd build/clean \
  && yarn install --frozen-lockfile --ignore-engines \
  && yarn build \
  && rm -rf node_modules \
  && yarn install --production --frozen-lockfile --ignore-engines \
  && rm -rf app/node_modules \
  && cd ../..
```

What this does:

1. Clones the committed state of the current branch. Uncommitted changes are
   not included, so commit first if you need them.
2. Installs all dependencies, including the `app` subproject (the root
   `install` script handles that).
3. Runs `yarn build`, which compiles the Electron main process and backend
   with `tsc` into `dist/`, and bundles the React UI with webpack into
   `app/build/`.
4. Replaces `node_modules` with a production-only install so dev tooling is
   not shipped inside the bundle.
5. Removes `app/node_modules`, which is large and not needed at runtime because
   the UI is already bundled.

Expect several webpack warnings about re-exported types from
`backend/src/Model/index.ts`. They are type-only exports that webpack cannot
see and do not affect the build.

## Step 2: Package the `.app` bundle

Run `electron-builder` from the repository root, pointing it at the clean tree.
`electron-builder` is a dev dependency, so it is run from the root
`node_modules`, not from `build/clean`.

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false ./node_modules/.bin/electron-builder \
  --projectDir build/clean --mac dir --arm64 --publish never
```

Flags:

- `-c.electronVersion=<version>` is strongly recommended on a machine that
  also has the dev `node_modules/electron`. See the Electron UUID collision
  entry under Troubleshooting for why. Pick a patch release adjacent to the
  one in `devDependencies`.
- `CSC_IDENTITY_AUTO_DISCOVERY=false` stops electron-builder from searching
  the keychain for a signing identity.
- `--mac dir` produces an unpacked `.app` directory rather than a DMG.
- `--publish never` prevents any attempt to upload to GitHub Releases.

The notarization hook in `scripts/notarize.ts` detects that `APPLE_ID`,
`APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` are unset and skips itself.

Output lands at:

```
build/clean/build/mac-arm64/MQTT Explorer.app
```

## Step 3: Re-sign the bundle (required)

**Do not skip this step.** Without a signing identity, electron-builder
ad-hoc signs only the outer application binary. The embedded
`Electron Framework.framework` keeps Electron's own team signature. macOS
refuses to load a framework whose Team ID differs from the process, and the
app dies on launch with:

```
dyld: Library not loaded: @rpath/Electron Framework.framework/Electron Framework
Reason: ... mapping process and mapped file (non-platform) have different Team IDs
```

Re-signing the whole bundle ad-hoc makes every component consistent:

```bash
codesign --force --deep --sign - "build/clean/build/mac-arm64/MQTT Explorer.app"
```

Verify:

```bash
codesign --verify --deep --strict "build/clean/build/mac-arm64/MQTT Explorer.app" && echo OK
```

This also drops the hardened-runtime flag from the main binary. That is
expected for an ad-hoc build and matches how a locally built copy normally
runs.

## Step 4: Test before installing

Launch straight from the build folder:

```bash
open "build/clean/build/mac-arm64/MQTT Explorer.app"
```

Confirm it opens, then connect to a broker. If macOS prompts for Local Network
access, allow it. See the troubleshooting section below.

## Step 5: Replace the copy in `/Applications`

1. Quit every running MQTT Explorer instance, including the one from the
   build folder.

2. Move the old app aside rather than deleting it, so you can roll back:

   ```bash
   mv "/Applications/MQTT Explorer.app" ~/Desktop/MQTT-Explorer-old.app
   ```

3. Copy the new bundle in:

   ```bash
   cp -R "build/clean/build/mac-arm64/MQTT Explorer.app" /Applications/
   ```

4. Launch from `/Applications` or Spotlight.

5. Once satisfied, delete the Desktop copy.

### Rolling back

```bash
rm -rf "/Applications/MQTT Explorer.app"
mv ~/Desktop/MQTT-Explorer-old.app "/Applications/MQTT Explorer.app"
```

## Where settings and connections are stored

MQTT Explorer keeps saved connection profiles, including host, port,
protocol, username, password, subscriptions, and certificate references, in a
single JSON file:

```
~/Library/Application Support/MQTT-Explorer/settings.json
```

The path is assembled in `src/electron.ts` from Electron's `userData`
directory plus `settings.json`. The file is a small lowdb store with one
top-level key, `ConnectionManager_connections`, holding every saved profile
keyed by connection ID.

Points worth knowing:

- Passwords are stored in plain text in this file. Treat it accordingly and
  do not commit or share it.
- The file is tied to the app's user-data directory, not to the bundle. It
  survives replacing the app in `/Applications`, and a freshly built copy
  picks up existing connections unchanged.
- Deleting the file resets the connection list. Quit the app first.
- When running in browser/server mode (`yarn start:server`), the equivalent
  file is `data/settings.json` relative to the server's working directory.

The other items in that directory (`Cache`, `Cookies`, `Preferences`, and so
on) are standard Chromium/Electron files and hold no MQTT Explorer settings.

## Troubleshooting

### `connect EHOSTUNREACH <ip>:<port> - Local(<ip>:<port>)`

This is Node's raw socket error, passed through unchanged. The TCP connection
never reached the broker, so credentials and ACLs are not involved.

First rule out the network from a Terminal:

```bash
ping -c 3 <broker-ip>
```

```bash
nc -z -G 3 <broker-ip> 1883
```

If both succeed but the app still fails, the cause is the per-app
**Local Network** privacy permission on macOS. Apple's technote TN3179
documents the rules that matter here:

- Command-line tools run from Terminal, *including any child processes they
  spawn*, are automatically allowed. A development build started with
  `yarn start` from a terminal or IDE therefore always works, and proves
  nothing about the installed app.
- An app launched from Finder, Spotlight, or `open` is its own responsible
  process and needs its own grant.
- There is no supported way to reset an app's Local Network decision on
  macOS. `tccutil` does not cover this service.

#### The Electron UUID collision (never prompted, always denied)

electron-builder ships Electron's prebuilt main executable unchanged, only
renamed. It therefore carries the same Mach-O build UUID as the
`node_modules/electron` dev bundle on the same machine. When the packaged
app touches the local network, macOS looks the process up by executable
UUID, finds the dev bundle's existing "Electron" rule, and decides no prompt
is needed. But that grant is tied to Electron's signing identity, not the
packaged app's, so the kernel still refuses the connection. The symptom is
EHOSTUNREACH on every attempt with no prompt ever shown, while the same
binary launched from a terminal works. The system log shows the mismatch:

```
LocalNetwork: found bundle id de.t7n.apps.mqtt-explorer by PID
LocalNetwork: found bundle id com.github.Electron by UUID 4C4C44EF-...
nehelper: Local network allowed by preference for Electron (com.github.Electron)
```

Changing the bundle ID does not help, because the UUID lookup runs after
the bundle-ID lookup and overrides it.

**Fix:** package against a different Electron patch release than the one in
`devDependencies`, so the packaged binary gets its own UUID. Add the
override to the Step 2 command:

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false ./node_modules/.bin/electron-builder \
  --projectDir build/clean --mac dir --arm64 --publish never \
  -c.electronVersion=39.2.6
```

electron-builder downloads that release into its cache on first use. Then
re-sign as in Step 3. Confirm the UUIDs differ:

```bash
dwarfdump --uuid node_modules/electron/dist/Electron.app/Contents/MacOS/Electron "build/clean/build/mac-arm64/MQTT Explorer.app/Contents/MacOS/MQTT Explorer"
```

On first launch from Finder, macOS now shows the Local Network prompt for
MQTT Explorer. Allow it, and the app appears in
System Settings → Privacy & Security → Local Network.

If the dev Electron version in `package.json` is later bumped to the version
used here, pick a different patch release again.

#### Other checks

- If MQTT Explorer is listed in the Local Network pane and switched off,
  switch it on and relaunch.
- As a last-resort workaround, launching the binary directly from Terminal
  is always allowed:

  ```bash
  "/Applications/MQTT Explorer.app/Contents/MacOS/MQTT Explorer" &
  ```

Other causes: the broker host is off or has a different IP, or it sits on a
different VLAN. Also double-check the port. Standard MQTT ports are `1883`
(plain) and `8883` (TLS).

### `Connection refused: Not authorized`

The broker rejected the username or password. It returns CONNACK code 5
(MQTT 3.1.1) or 135 (MQTT 5), and the UI shows this text.

### `Subscribe error: ...`

The broker's ACL denied one of the subscriptions. The UI shows the error and
disconnects, so one denied topic in the subscription list takes down the
session. Publishes denied by an ACL under MQTT 3.1.1 are dropped silently with
no feedback.

### The app launches from the build folder but not from `/Applications`

Re-run Step 3 against the copy in `/Applications`, or recopy a bundle that was
re-signed before copying.

### Same version string as the old app

A local build carries whatever version is in `package.json`, which may match
the installed release exactly. To tell them apart, check the bundle's
modification date in Finder, or compare `git log -1` in the tree you built
from.
