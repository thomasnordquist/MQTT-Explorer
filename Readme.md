# [MQTT Explorer](https://mqtt-explorer.com)

[![Downloads](https://img.shields.io/github/release/thomasnordquist/mqtt-explorer.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Downloads](https://img.shields.io/github/downloads/thomasnordquist/mqtt-explorer/total.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Build_Status](https://travis-ci.org/thomasnordquist/MQTT-Explorer.svg?branch=master)](https://travis-ci.org/thomasnordquist/MQTT-Explorer)
[![Build status](https://ci.appveyor.com/api/projects/status/c35tkm29rm4m5364/branch/master?svg=true)](https://ci.appveyor.com/project/thomasnordquist/mqtt-explorer/branch/master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/47b26e03fce543ceac7914214482334a)](https://app.codacy.com/app/thomasnordquist/MQTT-Explorer?utm_source=github.com&utm_medium=referral&utm_content=thomasnordquist/MQTT-Explorer&utm_campaign=Badge_Grade_Dashboard)

|                                                                                                                                     |                                                                                                                |                                                                                                                |
| :---------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------: |
| [![screen_composite](https://mqtt-explorer.com/img/screen-composite_small.png)](https://mqtt-explorer.com/img/screen-composite.png) | [![screen2_small](https://mqtt-explorer.com/img/screen2_small.png)](https://mqtt-explorer.com/img/screen2.png) | [![screen3_small](https://mqtt-explorer.com/img/screen3_small.png)](https://mqtt-explorer.com/img/screen3.png) |

# The App has moved to [mqtt-explorer.com](https://mqtt-explorer.com)

MQTT Explorer is a comprehensive and easy-to-use MQTT Client.  
Downloads can be found at the link above.

This page is dedicated to its development.
Pull-Requests and error reports are welcome.

## Quick Start with GitHub Codespaces

The fastest way to start developing is with GitHub Codespaces:

1. Click the green "Code" button above
2. Select "Codespaces" tab
3. Click "Create codespace on [branch]"
4. Wait for the environment to set up (includes Node.js and MQTT broker)
5. Run `yarn dev:server` to start development

The devcontainer includes a pre-configured MQTT broker and all development tools. See [.devcontainer/README.md](.devcontainer/README.md) for details.

## Run from sources

### Desktop Application (Electron)

```bash
npm install -g yarn
yarn
yarn build
yarn start
```

### Browser Mode (Web Application)

MQTT Explorer can also run as a web application served by a Node.js server:

```bash
npm install -g yarn
yarn
yarn build:server
yarn start:server
```

Then open your browser to `http://localhost:3000`. For more details, see [BROWSER_MODE.md](BROWSER_MODE.md).

## Develop

### Desktop Application

Launch Application

```bash
npm install -g yarn
yarn
yarn dev
```

### Browser Mode

Launch in development mode with hot reload:

```bash
npm install -g yarn
yarn
yarn dev:server
```

The `app` directory contains all the rendering logic, the `backend` directory currently contains the models, tests, connection management, `src` contains all the electron bindings. [mqttjs](https://github.com/mqttjs/MQTT.js) is used to facilitate communication to MQTT brokers.

## Automated Tests

To achieve a reliable product automated tests run regularly on CI.

- **Data model tests**: `yarn test:backend`
- **App tests**: `yarn test:app`
- **UI test suite**: `yarn test:ui` (independent, deterministic tests)
- **Demo video**: `yarn ui-test` (UI test recording for documentation)

### Run UI Test Suite

The UI test suite validates core functionality through automated browser tests. Each test is independent and deterministic.

```bash
# Run with automated setup (recommended)
./scripts/runUiTests.sh

# Or run directly (requires manual MQTT broker setup)
yarn build
yarn test:ui
```

See [docs/UI-TEST-SUITE.md](docs/UI-TEST-SUITE.md) for more details.

### Run Demo Video Generation

A [mosquitto](https://mosquitto.org/) MQTT broker is required to generate the demo video.

```bash
yarn build
yarn ui-test
```

## Create a release

Create a PR to `release` branch.
There needs to be a "feat: some new feature" or "fix: some bugfix" commit for a new release to be created

## Create a beta release

Create a PR to `beta` branch. A "feat" or "fix" commit is necessary to create a new version.

## Write docs

```
git clone --single-branch -b gh-pages https://github.com/thomasnordquist/MQTT-Explorer.git mqtt-explorer-pages
cd mqtt-explorer-pages
bundle install
bundle exec jekyll serve --incremental
```

Readme file: `Readme.tpl.md`

Preview is available at
http://localhost:4000/Readme.tpl

## Update docs

```
npm install
./updateReadme.ts
```

The readme will be generated from the docs.

## License

![CC-BY-Nc 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-blue.svg)  
[CC-BY-Nc 4.0](https://creativecommons.org/licenses/by-nC/4.0/)

The license allows for anyone to adapt, share, and redistribute the material, as long as it is non-commercial.
