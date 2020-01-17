# [MQTT Explorer](https://mqtt-explorer.com)

[![Downloads](https://img.shields.io/github/release/thomasnordquist/mqtt-explorer.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Downloads](https://img.shields.io/github/downloads/thomasnordquist/mqtt-explorer/total.svg)](https://travis-ci.org/thomasnordquist/MQTT-Explorer/releases)
[![Build_Status](https://travis-ci.org/thomasnordquist/MQTT-Explorer.svg?branch=master)](https://travis-ci.org/thomasnordquist/MQTT-Explorer)
[![Build status](https://ci.appveyor.com/api/projects/status/c35tkm29rm4m5364/branch/master?svg=true)](https://ci.appveyor.com/project/thomasnordquist/mqtt-explorer/branch/master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/47b26e03fce543ceac7914214482334a)](https://app.codacy.com/app/thomasnordquist/MQTT-Explorer?utm_source=github.com&utm_medium=referral&utm_content=thomasnordquist/MQTT-Explorer&utm_campaign=Badge_Grade_Dashboard)

|   |   |   |
|:---:|:---:|:---:|
|[![screen_composite](https://mqtt-explorer.com/img/screen-composite_small.png)](https://mqtt-explorer.com/img/screen-composite.png)|[![screen2_small](https://mqtt-explorer.com/img/screen2_small.png)](https://mqtt-explorer.com/img/screen2.png)|[![screen3_small](https://mqtt-explorer.com/img/screen3_small.png)](https://mqtt-explorer.com/img/screen3.png)|

# The App has moved to [mqtt-explorer.com](https://mqtt-explorer.com)
MQTT Explorer is a comprehensive and easy-to-use MQTT Client.  
Downloads can be found at the link above.

This page is dedicated to its development.
Pull-Requests and error reports are welcome.

## Run from sources

```bash
npm install -g yarn
yarn
yarn build
yarn start
```

## Develop

Launch Application
```bash
npm install -g yarn
yarn
yarn dev
```

The `app` directory contains all the rendering logic, the `backend` directory currently contains the models, tests, connection management, `src` contains all the electron bindings. [mqttjs](https://github.com/mqttjs/MQTT.js) is used to facilitate communication to MQTT brokers.

## Automated Tests

To achieve a reliable product automated tests run regularly on travis.

- Data model
- MQTT integration
- UI-Tests (The demo is a recorded ui test)

## Run UI-tests

A [mosquitto](https://mosquitto.org/) MQTT broker is required to run the ui-tests.

Run tests with

```bash
# Run chromedriver in a separate terminal session
./node_modules/.bin/chromedriver --url-base=wd/hub --port=9515 --verbose
```

Compile and execute tests

```bash
npm run build
node dist/src/spec/webdriverio.js
```

## Write docs

```
git clone https://github.com/thomasnordquist/MQTT-Explorer.git mqtt-explorer-pages
cd mqtt-explorer-pages
git checkout gh-pages
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

![CC-BY-ND 4.0](https://img.shields.io/badge/License-CC%20BY--ND%204.0-blue.svg)  
[CC-BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/)

The license is a little restrictive to distributing derived work, this may change in the future if the interest arises or more people work on this project.
