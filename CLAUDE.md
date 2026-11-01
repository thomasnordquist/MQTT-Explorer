# CLAUDE.md

MQTT Explorer: an Electron + React MQTT client. It also runs as a browser app backed by a Node server (`src/server.ts`).

## Layout

- `src/` – Electron main process and the Node server entry points (`electron.ts`, `server.ts`), compiled by root `tsc` into `dist/`.
- `app/` – React/Redux renderer (own `package.json`, webpack configs). `app/src/{components,reducers,actions,...}`.
- `backend/` – MQTT data sources, the message model and config storage, shared by the Electron and server builds (own `package.json`).
- `scripts/` – packaging, notarization, UI-test and video helpers.
- `res/` – icons and macOS entitlements/provisioning profiles.
- Feature docs live at the repo root (`BROWSER_MODE.md`, `LLM_INTEGRATION.md`, `DOCKER.md`, `CI_CD.md`, `TESTING_WITH_API.md`, ...).
- `Readme.md` is the upstream README (macOS is case-insensitive, so `README.md` is the same file). Don't overwrite it.

## Setup

Requires Node >= 20 and Yarn 1 (`npm install -g yarn`). `yarn` at the root also installs `app/` via the `install` script.

## Common commands

- `yarn build` – `tsc` plus the webpack build of `app/`.
- `yarn start` – run the built Electron app. `yarn dev` – dev mode (webpack watch plus Electron).
- `yarn dev:server` / `yarn build:server` / `yarn start:server` – browser/server mode.
- `yarn test:app`, `yarn test:backend` – unit tests. `yarn test:ui` – Playwright UI tests (needs a broker).
- `yarn lint` (prettier, eslint, cspell). `yarn lint:fix` fixes prettier and eslint.

## Building the macOS app locally

Do not use `yarn package mac` for local builds: it targets both architectures, signs with the maintainer's identity and publishes.

Use `scripts/build-mac-local.sh` (arm64, `--skip-build` to only re-sign). It runs electron-builder with `--mac dir --arm64 --publish never`, then ad-hoc re-signs the bundle with `disable-library-validation`. Without the re-sign, the app aborts at launch with a dyld "different Team IDs" error on Electron Framework.

Output: `build/mac-arm64/MQTT Explorer.app` (local-only, fails Gatekeeper on other Macs). Notarization is skipped automatically when `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD` and `APPLE_TEAM_ID` are unset.

## Gotchas

- `/Applications/MQTT Explorer.app` may hold a root-owned official release. Don't overwrite it without asking.
- Webpack prints "export 'Message' ... was not found" warnings from `backend/src/Model/index.ts` (type-only re-exports). They are harmless.
- `build/` and `dist/` are gitignored build output.
